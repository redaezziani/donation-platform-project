from app.db.database import engine, Base
from app.db.models import user, campaign, donation

def init_db():
    """Initialize the database - Alembic will handle table creation."""
    print("Database initialization - tables will be created by Alembic migrations...")
    # Note: Removed Base.metadata.create_all() to let Alembic handle schema creation
    print("Database initialization completed.")

if __name__ == "__main__":
    init_db()