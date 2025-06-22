from fastapi import APIRouter

from app.api.endpoints import auth, users, campaigns, donations, analytics, newsletter
from app.core.config import settings

# Create API router
api_router = APIRouter()

# Include auth endpoints
api_router.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])

# Include users endpoints
api_router.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])

# Include campaigns endpoints
api_router.include_router(campaigns.router, prefix=f"{settings.API_V1_STR}/campaigns", tags=["campaigns"])

# Include donations endpoints
api_router.include_router(donations.router, prefix=f"{settings.API_V1_STR}/donations", tags=["donations"])

# Include analytics endpoints
api_router.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])

# Include newsletter endpoints
api_router.include_router(newsletter.router, prefix=f"{settings.API_V1_STR}/newsletter", tags=["newsletter"])