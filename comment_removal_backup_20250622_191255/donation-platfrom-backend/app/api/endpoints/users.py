from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import func

from app.db.database import get_db
from app.db.models.user import User
from app.schemas.user import UserResponse, UserStatusUpdate
from app.auth.jwt import get_current_user
from app.services.user_service import get_user_by_id

router = APIRouter(tags=["users"])

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get information about the currently authenticated user.
    This endpoint requires authentication.
    """
    return current_user

@router.get("/", response_model=dict)
async def get_all_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    status: Optional[str] = Query(None, description="Filter by user status"),
    role: Optional[str] = Query(None, description="Filter by user role"),
    search: Optional[str] = Query(None, description="Search users by name, email, or username"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all users with pagination and filters (Admin only).
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this resource"
        )
    
    # Build query
    query = db.query(User)
    
    # Apply filters - simplified since is_suspended doesn't exist
    if status and status != 'all':
        if status == 'active':
            query = query.filter(User.is_active == True)
        elif status == 'inactive' or status == 'suspended':
            query = query.filter(User.is_active == False)
    
    if role and role != 'all':
        if role == 'admin':
            query = query.filter(User.is_admin == True)
        elif role == 'user':
            query = query.filter(User.is_admin == False)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_term)) |
            (User.email.ilike(search_term)) |
            (User.username.ilike(search_term))
        )
    
    # Get total count for pagination
    total_items = query.count()
    total_pages = (total_items + page_size - 1) // page_size
    
    # Apply pagination
    offset = (page - 1) * page_size
    users = query.offset(offset).limit(page_size).all()
    
    # Add campaign and donation counts for each user
    users_with_counts = []
    for user in users:
        # Get campaign count
        campaigns_count = db.query(func.count(User.id)).filter(User.id == user.id).scalar() or 0
        
        # Get donations count (would need donation model, using 0 for now)
        donations_count = 0
        
        # Convert user to dict and add counts - removed is_suspended references
        user_dict = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "campaigns_count": campaigns_count,
            "donations_count": donations_count,
            "status": "active" if user.is_active else "inactive",
            "role": "admin" if user.is_admin else "user"
        }
        users_with_counts.append(user_dict)
    
    return {
        "items": users_with_counts,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

@router.put("/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user status (Admin only).
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this resource"
        )
    
    # Get the user to update
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deactivating themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status"
        )
    
    # Update status based on the provided status - simplified for existing schema
    if status_update.status == 'active':
        user.is_active = True
    elif status_update.status == 'inactive' or status_update.status == 'suspended':
        user.is_active = False
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'active' or 'inactive'"
        )
    
    db.commit()
    db.refresh(user)
    
    return {"message": "User status updated successfully", "user_id": user_id, "new_status": status_update.status}

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get information about a specific user by ID.
    This endpoint requires authentication.
    """
    # Only allow admins to view other user profiles
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this resource"
        )
        
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user