from app.db.database import engine, Base
from app.db.models import user, campaign, donation

def init_db():
    """Initialize the database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()