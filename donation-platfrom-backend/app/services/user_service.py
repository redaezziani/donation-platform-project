from sqlalchemy.orm import Session
from app.db.models.user import User
from app.schemas.user import UserCreate
from app.auth.password import get_password_hash, verify_password

def create_user(db: Session, user_data: UserCreate):
    """Create a new user."""
    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        return None
    
    # Check if username already exists
    if get_user_by_username(db, user_data.username):
        return None
        
    # Create user instance
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )
    
    # Save to DB
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user by email and password."""
    user = get_user_by_email(db, email)
    
    # Check if user exists and password is correct
    if not user or not verify_password(password, user.hashed_password):
        return None
        
    return user

def get_user_by_id(db: Session, user_id: int):
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Get a user by username."""
    return db.query(User).filter(User.username == username).first()