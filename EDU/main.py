from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from contextlib import asynccontextmanager
from sqlmodel import Session, select
from jose import JWTError, jwt
from datetime import datetime
import sqlite3, os, httpx

from database import create_db_and_tables, engine
from models import (User, UserCreate, Token, PinnedNotification,
                    Question, Answer, StudyGroup, NotifSubscription)
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from scraper import get_ktu_announcements, download_ktu_file
from materials_scraper import get_subject_list, get_subject_downloads

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

def migrate_db():
    db_path = "database.db"
    if not os.path.exists(db_path): return
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

    u_cols = [r[1] for r in cur.execute("PRAGMA table_info(user)").fetchall()]
    for col, defval in [("college_name","''"),("helper_points","0")]:
        if col not in u_cols:
            cur.execute(f"ALTER TABLE user ADD COLUMN {col} TEXT DEFAULT {defval}")
            print(f"Migrated user.{col}")

    if "question" in tables:
        q_cols = [r[1] for r in cur.execute("PRAGMA table_info(question)").fetchall()]
        for col, defval in [("is_anonymous","0"),("tags","''"),("is_solved","0")]:
            if col not in q_cols:
                cur.execute(f"ALTER TABLE question ADD COLUMN {col} TEXT DEFAULT {defval}")
                print(f"Migrated question.{col}")

    if "answer" in tables:
        a_cols = [r[1] for r in cur.execute("PRAGMA table_info(answer)").fetchall()]
        if "is_best" not in a_cols:
            cur.execute("ALTER TABLE answer ADD COLUMN is_best INTEGER DEFAULT 0")
            print("Migrated answer.is_best")

    con.commit(); con.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    migrate_db()
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_session():
    with Session(engine) as s: yield s

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user_email(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email: raise HTTPException(status_code=401, detail="Invalid credentials")
        return email
    except JWTError: raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def home(): return {"message": "KTU EduAssist API v2.0"}

@app.get("/notifications")
def get_notifications():
    data = get_ktu_announcements()
    return data if isinstance(data, list) else []

@app.get("/download")
def download_file(file_id: str):
    content, ctype = download_ktu_file(file_id)
    if content:
        return Response(content=content, media_type=ctype or "application/pdf",
                        headers={"Content-Disposition":"attachment; filename=ktu_document.pdf"})
    raise HTTPException(status_code=404, detail="Download failed")

@app.post("/register")
def register(data: UserCreate, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == data.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    session.add(User(email=data.email, password_hash=get_password_hash(data.password),
                     full_name=data.full_name, semester=data.semester,
                     department=data.department, college_name=data.college_name or ""))
    session.commit()
    return {"message": "Registration successful"}

@app.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form.username)).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return {"access_token": create_access_token({"sub": user.email}),
            "token_type": "bearer", "user_name": user.full_name,
            "semester": user.semester, "is_admin": user.is_admin}

@app.get("/me")
def get_me(email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "full_name": user.full_name, "semester": user.semester,
            "department": user.department, "college_name": user.college_name or "",
            "is_admin": user.is_admin, "helper_points": user.helper_points or 0}

@app.get("/pins")
def get_pins(email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    return session.exec(select(PinnedNotification.notification_id).where(PinnedNotification.user_email == email)).all()

@app.post("/pin/{nid}")
def pin(nid: int, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    if not session.exec(select(PinnedNotification).where(PinnedNotification.user_email == email, PinnedNotification.notification_id == nid)).first():
        session.add(PinnedNotification(user_email=email, notification_id=nid)); session.commit()
    return {"status": "pinned"}

@app.delete("/pin/{nid}")
def unpin(nid: int, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    for row in session.exec(select(PinnedNotification).where(PinnedNotification.user_email == email, PinnedNotification.notification_id == nid)).all():
        session.delete(row)
    session.commit(); return {"status": "unpinned"}

@app.get("/forum")
def get_forum(session: Session = Depends(get_session)):
    qs = session.exec(select(Question).order_by(Question.timestamp.desc())).all()
    result = []
    for q in qs:
        answers = session.exec(select(Answer).where(Answer.question_id == q.id)).all()
        result.append({
            "id": q.id, "title": q.title, "content": q.content,
            "user_name": "Anonymous Student" if q.is_anonymous else q.user_name,
            "actual_user": q.user_name, "timestamp": q.timestamp, "votes": q.votes,
            "is_anonymous": bool(q.is_anonymous), "is_solved": bool(q.is_solved),
            "tags": [t for t in (q.tags or "").split(",") if t],
            "answers": [{"id":a.id,"question_id":a.question_id,"user_name":a.user_name,
                         "content":a.content,"timestamp":a.timestamp,"is_best":bool(a.is_best)} for a in answers]
        })
    return result

@app.post("/forum/question")
def post_question(data: dict, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    session.add(Question(title=data["title"], content=data["content"], user_name=user.full_name,
                         timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"), votes=0,
                         is_anonymous=bool(data.get("is_anonymous", False)),
                         tags=",".join(data.get("tags", [])), is_solved=False))
    session.commit(); return {"status": "posted"}

@app.post("/forum/question/{q_id}/answer")
def post_answer(q_id: int, data: dict, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    session.add(Answer(question_id=q_id, content=data["content"], user_name=user.full_name,
                       timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"), is_best=False))
    session.commit(); return {"status": "answered"}

@app.post("/forum/question/{q_id}/vote")
def vote_question(q_id: int, session: Session = Depends(get_session)):
    q = session.get(Question, q_id)
    if q: q.votes += 1; session.add(q); session.commit()
    return {"votes": q.votes if q else 0}

@app.post("/forum/question/{q_id}/solve")
def toggle_solved(q_id: int, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    q = session.get(Question, q_id)
    if not q: raise HTTPException(status_code=404)
    if q.user_name != user.full_name and not user.is_admin: raise HTTPException(status_code=403)
    q.is_solved = not q.is_solved; session.add(q); session.commit()
    return {"is_solved": q.is_solved}

@app.post("/forum/answer/{a_id}/best")
def mark_best(a_id: int, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    ans = session.get(Answer, a_id)
    if not ans: raise HTTPException(status_code=404)
    q = session.get(Question, ans.question_id)
    if q.user_name != user.full_name and not user.is_admin: raise HTTPException(status_code=403)
    for a in session.exec(select(Answer).where(Answer.question_id == ans.question_id)).all():
        a.is_best = (a.id == a_id); session.add(a)
    helper = session.exec(select(User).where(User.full_name == ans.user_name)).first()
    if helper: helper.helper_points = (helper.helper_points or 0) + 5; session.add(helper)
    if q: q.is_solved = True; session.add(q)
    session.commit(); return {"status": "marked"}

@app.delete("/forum/question/{q_id}")
def delete_question(q_id: int, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not user.is_admin: raise HTTPException(status_code=403, detail="Admins only")
    q = session.get(Question, q_id)
    if not q: raise HTTPException(status_code=404)
    for a in session.exec(select(Answer).where(Answer.question_id == q_id)).all(): session.delete(a)
    session.delete(q); session.commit(); return {"status": "deleted"}

@app.get("/leaderboard")
def leaderboard(session: Session = Depends(get_session)):
    users = session.exec(select(User).order_by(User.helper_points.desc()).limit(20)).all()
    return [{"name":u.full_name,"points":u.helper_points or 0,"semester":u.semester,"department":u.department} for u in users if (u.helper_points or 0) > 0]

@app.get("/studygroups")
def get_study_groups(semester: str = None, session: Session = Depends(get_session)):
    q = select(StudyGroup).order_by(StudyGroup.timestamp.desc())
    if semester: q = q.where(StudyGroup.semester == semester)
    return session.exec(q).all()

@app.post("/studygroups")
def create_group(data: dict, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    sg = StudyGroup(subject=data["subject"], semester=data["semester"],
                    department=data.get("department",""), mode=data.get("mode","online"),
                    location=data.get("location",""), description=data.get("description",""),
                    contact=data.get("contact",""), created_by=user.full_name,
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"), members=1)
    session.add(sg); session.commit()
    return {"status": "created", "id": sg.id}

@app.post("/studygroups/{sg_id}/join")
def join_group(sg_id: int, session: Session = Depends(get_session)):
    sg = session.get(StudyGroup, sg_id)
    if sg: sg.members = (sg.members or 1) + 1; session.add(sg); session.commit()
    return {"members": sg.members if sg else 0}

@app.delete("/studygroups/{sg_id}")
def delete_group(sg_id: int, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    sg = session.get(StudyGroup, sg_id)
    if not sg: raise HTTPException(status_code=404)
    if sg.created_by != user.full_name and not user.is_admin: raise HTTPException(status_code=403)
    session.delete(sg); session.commit(); return {"status": "deleted"}

@app.get("/subscribe")
def get_sub(email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    sub = session.exec(select(NotifSubscription).where(NotifSubscription.user_email == email)).first()
    return {"whatsapp": sub.whatsapp if sub else "", "notify_email": sub.notify_email if sub else "", "urgent_only": sub.urgent_only if sub else True}

@app.post("/subscribe")
def subscribe(data: dict, email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    sub = session.exec(select(NotifSubscription).where(NotifSubscription.user_email == email)).first()
    if sub:
        sub.whatsapp = data.get("whatsapp",""); sub.notify_email = data.get("notify_email",""); sub.urgent_only = data.get("urgent_only",True); session.add(sub)
    else:
        session.add(NotifSubscription(user_email=email, whatsapp=data.get("whatsapp",""), notify_email=data.get("notify_email",""), urgent_only=data.get("urgent_only",True)))
    session.commit(); return {"status": "subscribed"}

async def call_claude(prompt: str, system: str = "") -> str:
    if not ANTHROPIC_API_KEY: raise HTTPException(status_code=503, detail="AI features require ANTHROPIC_API_KEY in .env file")
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post("https://api.anthropic.com/v1/messages",
            headers={"x-api-key": ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01", "content-type":"application/json"},
            json={"model":"claude-haiku-4-5-20251001","max_tokens":1024,
                  "system": system or "You are a helpful KTU student assistant. Be concise.",
                  "messages":[{"role":"user","content":prompt}]})
        if res.status_code != 200: raise HTTPException(status_code=502, detail=f"AI error: {res.text}")
        return res.json()["content"][0]["text"]

@app.post("/ai/ask-notice")
async def ask_notice(data: dict):
    answer = await call_claude(
        f"KTU Notice:\n---\n{data.get('notice_text','')[:3000]}\n---\n\nStudent question: {data.get('question','')}\n\nAnswer based only on the notice text.",
        "You are a KTU notice assistant. Answer student questions accurately based on the notice.")
    return {"answer": answer}

@app.post("/ai/summarize")
async def summarize(data: dict):
    mode = data.get("mode","summarize")
    text = data.get("text","")[:4000]
    prompts = {
        "summarize": f"Summarize this KTU study material into clear bullet points by topic:\n\n{text}",
        "questions": f"Generate 8 important exam questions with brief model answers from this KTU study material:\n\n{text}",
        "flashcards": f"Create 10 flashcard Q&A pairs (Q: ... A: ...) from this study material:\n\n{text}",
    }
    result = await call_claude(prompts.get(mode, prompts["summarize"]), "You are a KTU exam preparation assistant.")
    return {"result": result}

@app.get("/materials")
def get_materials(semester: str = "S6", branch: str = "CSE", type: str = "qp"):
    return get_subject_list(semester, branch, type) or []

@app.get("/materials/subject")
def get_material_downloads(url: str):
    if not url.startswith("https://www.ktunotes.in/"): raise HTTPException(status_code=400)
    return get_subject_downloads(url)
