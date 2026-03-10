from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from contextlib import asynccontextmanager
from sqlmodel import Session, select
from jose import JWTError, jwt
from typing import List
from datetime import datetime  # <--- NEW IMPORT

# --- IMPORTS FROM YOUR FILES ---
from database import create_db_and_tables, engine
# Added 'Discussion' to imports
# Remove 'Discussion' and add 'Question', 'Answer'
from models import User, UserCreate, Token, PinnedNotification, Question, Answer 
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from scraper import get_ktu_announcements, download_ktu_file

# --- LIFESPAN MANAGER (Starts DB on launch) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# --- CORS (Allow Frontend to Connect) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE HELPER ---
def get_session():
    with Session(engine) as session:
        yield session

# --- AUTH HELPER (Decodes Token) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- PUBLIC ROUTES ---

@app.get("/")
def home():
    return {"message": "KTU API is running!"}

@app.get("/notifications")
def get_notifications():
    data = get_ktu_announcements()
    if isinstance(data, dict) and "error" in data:
         # Log the error but return empty list so frontend doesn't crash
        print(f"Scraper Error: {data['error']}")
        return [] 
    return data

@app.get("/download")
def download_file(file_id: str):
    print(f"Attempting to download ID: {file_id}") 
    file_content, content_type = download_ktu_file(file_id)
    
    if file_content:
        return Response(
            content=file_content, 
            media_type=content_type or "application/pdf",
            headers={"Content-Disposition": "attachment; filename=ktu_document.pdf"}
        )
    else:
        raise HTTPException(status_code=404, detail="Download failed. Token might be expired.")

# --- AUTH ROUTES ---

@app.post("/register")
def register(user_input: UserCreate, session: Session = Depends(get_session)):
    # 1. Check if email exists
    statement = select(User).where(User.email == user_input.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash password
    hashed_pwd = get_password_hash(user_input.password)
    
    # 3. Create User
    new_user = User(
        email=user_input.email,
        password_hash=hashed_pwd,  # Correctly using password_hash
        full_name=user_input.full_name,
        semester=user_input.semester,
        department=user_input.department
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return {"message": "Registration successful"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # 1. Use OAuth2PasswordRequestForm to handle the Frontend's FormData
    statement = select(User).where(User.email == form_data.username) # OAuth2 forms use 'username' field
    user = session.exec(statement).first()
    
    # 2. Check password (FIXED: access user.password_hash, not user.password)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # 3. Generate Token
    access_token = create_access_token(data={"sub": user.email})
    
   # ... inside login function ...
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.full_name,
        "semester": user.semester,
        "is_admin": user.is_admin # <--- SEND THIS TO FRONTEND
    }
# --- PERSONALIZATION ROUTES (Pins) ---

@app.post("/pin/{notification_id}")
def pin_notification(notification_id: int, session: Session = Depends(get_session), user_email: str = Depends(get_current_user)):
    statement = select(PinnedNotification).where(
        PinnedNotification.user_email == user_email,
        PinnedNotification.notification_id == notification_id
    )
    existing = session.exec(statement).first()
    
    if not existing:
        new_pin = PinnedNotification(user_email=user_email, notification_id=notification_id)
        session.add(new_pin)
        session.commit()
    
    return {"status": "pinned"}

@app.delete("/pin/{notification_id}")
def unpin_notification(notification_id: int, session: Session = Depends(get_session), user_email: str = Depends(get_current_user)):
    statement = select(PinnedNotification).where(
        PinnedNotification.user_email == user_email,
        PinnedNotification.notification_id == notification_id
    )
    results = session.exec(statement).all()
    
    for item in results:
        session.delete(item)
    
    session.commit()
    return {"status": "unpinned"}

@app.get("/pins")
def get_my_pins(session: Session = Depends(get_session), user_email: str = Depends(get_current_user)):
    statement = select(PinnedNotification.notification_id).where(PinnedNotification.user_email == user_email)
    results = session.exec(statement).all()
    return results

# ... (Keep imports and previous code) ...

# --- QUORA-STYLE FORUM ROUTES ---

# 1. Get All Questions (with Answers)
@app.get("/forum")
def get_forum_data(session: Session = Depends(get_session)):
    questions = session.exec(select(Question).order_by(Question.timestamp.desc())).all()
    
    # We need to nest answers inside questions for the frontend
    full_data = []
    for q in questions:
        # Find answers for this specific question
        answers = session.exec(select(Answer).where(Answer.question_id == q.id)).all()
        full_data.append({
            "id": q.id,
            "title": q.title,
            "content": q.content,
            "user_name": q.user_name,
            "timestamp": q.timestamp,
            "votes": q.votes,
            "answers": answers
        })
        
    return full_data

# 2. Post a Question
@app.post("/forum/question")
def post_question(data: dict, session: Session = Depends(get_session), user_email: str = Depends(get_current_user)):
    user = session.exec(select(User).where(User.email == user_email)).first()
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    new_q = Question(
        title=data['title'],
        content=data['content'],
        user_name=user.full_name,
        timestamp=now,
        votes=0
    )
    session.add(new_q)
    session.commit()
    return {"status": "posted"}

# 3. Post an Answer
@app.post("/forum/question/{q_id}/answer")
def post_answer(q_id: int, data: dict, session: Session = Depends(get_session), user_email: str = Depends(get_current_user)):
    user = session.exec(select(User).where(User.email == user_email)).first()
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    new_a = Answer(
        question_id=q_id,
        content=data['content'],
        user_name=user.full_name,
        timestamp=now
    )
    session.add(new_a)
    session.commit()
    return {"status": "answered"}

# 4. Upvote a Question
@app.post("/forum/question/{q_id}/vote")
def vote_question(q_id: int, session: Session = Depends(get_session)):
    q = session.get(Question, q_id)
    if q:
        q.votes += 1
        session.add(q)
        session.commit()
    return {"votes": q.votes}

@app.delete("/forum/question/{q_id}")
def delete_question(q_id: int, session: Session = Depends(get_session), user_email: str = Depends(get_current_user)):
    # 1. Check if user is Admin
    user = session.exec(select(User).where(User.email == user_email)).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Only Admins can delete questions")

    # 2. Find and Delete Question
    question = session.get(Question, q_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Optional: Delete associated answers too (Cascade delete)
    answers = session.exec(select(Answer).where(Answer.question_id == q_id)).all()
    for a in answers:
        session.delete(a)

    session.delete(question)
    session.commit()
    return {"status": "deleted"}