from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.services.user_service import create_user, authenticate_user
from app.auth.jwt import create_access_token

router = APIRouter(tags=["authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    db_user = create_user(db, user_data)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email or username already registered"
        )
    return db_user

@router.post("/login", response_model=Token)
def login_with_email(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Simple login endpoint that uses email and password directly.
    """
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}