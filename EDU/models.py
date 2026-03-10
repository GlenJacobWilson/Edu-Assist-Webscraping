from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    email: str = Field(primary_key=True)
    password_hash: str
    full_name: str
    semester: str
    department: str
    college_name: str = Field(default="")
    is_admin: bool = Field(default=False)
    helper_points: int = Field(default=0)

class UserCreate(SQLModel):
    email: str
    password: str
    full_name: str
    semester: str
    department: str
    college_name: str = ""

class UserLogin(SQLModel):
    email: str
    password: str

class Token(SQLModel):
    access_token: str
    token_type: str
    user_name: str
    semester: str
    is_admin: bool = False

class PinnedNotification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_email: str = Field(index=True)
    notification_id: int

class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    user_name: str
    timestamp: str
    votes: int = 0
    is_anonymous: bool = Field(default=False)
    tags: str = Field(default="")          # comma-separated: "DBMS,S6,CSE"
    is_solved: bool = Field(default=False)

class Answer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int
    user_name: str
    content: str
    timestamp: str
    is_best: bool = Field(default=False)

class StudyGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    subject: str
    semester: str
    department: str
    mode: str            # online / offline
    location: str = ""
    description: str = ""
    contact: str
    created_by: str
    timestamp: str
    members: int = Field(default=1)

class NotifSubscription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_email: str = Field(index=True)
    whatsapp: str = ""
    notify_email: str = ""
    urgent_only: bool = Field(default=True)
