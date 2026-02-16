from sqlmodel import SQLModel, create_engine, Session

# 1. Setup the Database File
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. Create Engine (CRITICAL: "check_same_thread": False prevents freezing)
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    # Import models here to ensure they are registered with SQLModel
    # before we try to create the tables. This prevents "Table not found" errors.
    from models import User, PinnedNotification
    
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session