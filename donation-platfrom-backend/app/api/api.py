from fastapi import APIRouter

from app.api.endpoints import auth, users, campaigns
from app.core.config import settings

# Create API router
api_router = APIRouter()

# Include auth endpoints
api_router.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth")

# Include users endpoints
api_router.include_router(users.router, prefix=f"{settings.API_V1_STR}/users")

# Include campaigns endpoints
api_router.include_router(campaigns.router, prefix=f"{settings.API_V1_STR}/campaigns")