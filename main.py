from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from contextlib import asynccontextmanager
from sqlmodel import Session, select
from jose import JWTError, jwt
from typing import List
from datetime import datetime
import sqlite3, os

from database import create_db_and_tables, engine
from models import User, UserCreate, Token, PinnedNotification, Question, Answer
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from scraper import get_ktu_announcements, download_ktu_file
from materials_scraper import get_subject_list, get_subject_downloads

# ── Auto-migrate: add college_name column if it doesn't exist ──────────────────
def migrate_db():
    db_path = "database.db"
    if os.path.exists(db_path):
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        cols = [r[1] for r in cur.execute("PRAGMA table_info(user)").fetchall()]
        if "college_name" not in cols:
            cur.execute("ALTER TABLE user ADD COLUMN college_name TEXT DEFAULT ''")
            con.commit()
            print("✅ Migrated: added college_name column")
        con.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    migrate_db()
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_session():
    with Session(engine) as session:
        yield session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user_email(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── PUBLIC ────────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "KTU EduAssist API running!"}

@app.get("/notifications")
def get_notifications():
    data = get_ktu_announcements()
    if isinstance(data, dict) and "error" in data:
        return []
    return data if isinstance(data, list) else []

@app.get("/download")
def download_file(file_id: str):
    file_content, content_type = download_ktu_file(file_id)
    if file_content:
        return Response(
            content=file_content,
            media_type=content_type or "application/pdf",
            headers={"Content-Disposition": "attachment; filename=ktu_document.pdf"}
        )
    raise HTTPException(status_code=404, detail="Download failed. Token may be expired.")

# ── AUTH ──────────────────────────────────────────────────────────────────────

@app.post("/register")
def register(user_input: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == user_input.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_input.email,
        password_hash=get_password_hash(user_input.password),
        full_name=user_input.full_name,
        semester=user_input.semester,
        department=user_input.department,
        college_name=user_input.college_name or "",
    )
    session.add(new_user)
    session.commit()
    return {"message": "Registration successful"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user.full_name,
        "semester": user.semester,
        "is_admin": user.is_admin,
    }

# ── ME ────────────────────────────────────────────────────────────────────────

@app.get("/me")
def get_me(user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email":        user.email,
        "full_name":    user.full_name,
        "semester":     user.semester,
        "department":   user.department,
        "college_name": user.college_name or "",
        "is_admin":     user.is_admin,
    }

# ── PINS ──────────────────────────────────────────────────────────────────────

@app.get("/pins")
def get_my_pins(user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    results = session.exec(
        select(PinnedNotification.notification_id).where(PinnedNotification.user_email == user_email)
    ).all()
    return results

@app.post("/pin/{notification_id}")
def pin_notification(notification_id: int, user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    existing = session.exec(select(PinnedNotification).where(
        PinnedNotification.user_email == user_email,
        PinnedNotification.notification_id == notification_id
    )).first()
    if not existing:
        session.add(PinnedNotification(user_email=user_email, notification_id=notification_id))
        session.commit()
    return {"status": "pinned"}

@app.delete("/pin/{notification_id}")
def unpin_notification(notification_id: int, user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    rows = session.exec(select(PinnedNotification).where(
        PinnedNotification.user_email == user_email,
        PinnedNotification.notification_id == notification_id
    )).all()
    for row in rows:
        session.delete(row)
    session.commit()
    return {"status": "unpinned"}

# ── FORUM ─────────────────────────────────────────────────────────────────────

@app.get("/forum")
def get_forum_data(session: Session = Depends(get_session)):
    questions = session.exec(select(Question).order_by(Question.timestamp.desc())).all()
    full_data = []
    for q in questions:
        answers = session.exec(select(Answer).where(Answer.question_id == q.id)).all()
        full_data.append({
            "id": q.id, "title": q.title, "content": q.content,
            "user_name": q.user_name, "timestamp": q.timestamp,
            "votes": q.votes, "answers": answers
        })
    return full_data

@app.post("/forum/question")
def post_question(data: dict, user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_email)).first()
    new_q = Question(
        title=data['title'], content=data['content'],
        user_name=user.full_name,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"), votes=0
    )
    session.add(new_q); session.commit()
    return {"status": "posted"}

@app.post("/forum/question/{q_id}/answer")
def post_answer(q_id: int, data: dict, user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_email)).first()
    new_a = Answer(
        question_id=q_id, content=data['content'],
        user_name=user.full_name,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    session.add(new_a); session.commit()
    return {"status": "answered"}

@app.post("/forum/question/{q_id}/vote")
def vote_question(q_id: int, session: Session = Depends(get_session)):
    q = session.get(Question, q_id)
    if q:
        q.votes += 1; session.add(q); session.commit()
    return {"votes": q.votes if q else 0}

@app.delete("/forum/question/{q_id}")
def delete_question(q_id: int, user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_email)).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    q = session.get(Question, q_id)
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    for a in session.exec(select(Answer).where(Answer.question_id == q_id)).all():
        session.delete(a)
    session.delete(q); session.commit()
    return {"status": "deleted"}

# ── MATERIALS ─────────────────────────────────────────────────────────────────

@app.get("/materials")
def get_materials(semester: str = "S6", branch: str = "CSE", type: str = "qp"):
    return get_subject_list(semester, branch, type) or []

@app.get("/materials/subject")
def get_material_downloads(url: str):
    if not url.startswith("https://www.ktunotes.in/"):
        raise HTTPException(status_code=400, detail="Only ktunotes.in URLs allowed")
    return get_subject_downloads(url)
