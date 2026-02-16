from typing import Optional
from sqlmodel import Field, SQLModel

# 1. Database Table (What is stored in DB)
class User(SQLModel, table=True):
    email: str = Field(primary_key=True)
    password_hash: str
    full_name: str
    semester: str
    department: str
    is_admin: bool = Field(default=False) # <--- NEW FIELD

# 2. Registration Form (What Frontend sends for Sign Up)
class UserCreate(SQLModel):
    email: str
    password: str
    full_name: str
    semester: str
    department: str

# 3. Login Form (What Frontend sends for Login)
class UserLogin(SQLModel):
    email: str
    password: str

# 4. Token Response (What Backend sends back on success)
class Token(SQLModel):
    access_token: str
    token_type: str
    user_name: str
    semester: str

# ... existing imports ...

# 5. Pinned Notifications Table
class PinnedNotification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_email: str = Field(index=True) # Who pinned it?
    notification_id: int                # Which KTU ID? (e.g., 5024)

# ... (Keep existing User and PinnedNotification classes) ...

class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    user_name: str
    timestamp: str
    votes: int = 0
    # We will fetch answers manually to keep things simple

class Answer(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    question_id: int # Links this answer to a specific question
    user_name: str
    content: str
    timestamp: str