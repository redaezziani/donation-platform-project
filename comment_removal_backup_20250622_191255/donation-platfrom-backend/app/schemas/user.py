from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserStatusUpdate(BaseModel):
    status: str = Field(..., description="User status: active, inactive, or suspended")
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['active', 'inactive', 'suspended']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
class UserResponse(UserBase):
    id: int
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True
        
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    email: Optional[str] = None