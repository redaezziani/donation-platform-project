from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer
import os

from app.api.api import api_router
from app.db.init_db import init_db

app = FastAPI(
    title="Donation Platform API",
    description="API for managing donations and fundraising campaigns",
    version="0.1.0",
    # Add OpenAPI configuration for JWT authentication
    openapi_tags=[
        {
            "name": "authentication",
            "description": "Authentication and authorization endpoints",
        },
        {
            "name": "users",
            "description": "User management endpoints",
        },
        {
            "name": "campaigns",
            "description": "Campaign management endpoints",
        },
    ],
)

# Configure security scheme for Swagger UI
security = HTTPBearer()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files for uploaded images
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir, exist_ok=True)

# Mount uploads directory under both /static and /uploads for compatibility
app.mount("/static", StaticFiles(directory=uploads_dir), name="static")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Include API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Donation Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)