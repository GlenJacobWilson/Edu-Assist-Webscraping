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
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    user_name: str
    timestamp: str
    votes: int = 0

class Answer(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    question_id: int
    user_name: str
    content: str
    timestamp: str
