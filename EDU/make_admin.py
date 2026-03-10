from sqlmodel import Session, select, create_engine
from models import User

# Connect to DB
engine = create_engine("sqlite:///database.db")

def promote_user(email):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user:
            user.is_admin = True
            session.add(user)
            session.commit()
            print(f"✅ SUCCESS: {email} is now an ADMIN!")
        else:
            print("❌ User not found. Did you register first?")

if __name__ == "__main__":
    email = input("Enter email to make Admin: ")
    promote_user(email)