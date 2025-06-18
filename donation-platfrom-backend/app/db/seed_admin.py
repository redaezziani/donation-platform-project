from app.db.database import SessionLocal
from app.db.models.user import User
from app.auth.password import get_password_hash
import sys

def seed_admin(email=None, username=None, password=None, full_name=None):
    """Create an admin user with provided details or default values"""
    db = SessionLocal()
    
    # Use provided values or defaults
    admin_email = email or "admin@donation.com"
    admin_username = username or "admin"
    admin_password = password or "admin123"
    admin_full_name = full_name or "Admin User"
    
    # Check if admin already exists with this email
    existing_admin = db.query(User).filter_by(email=admin_email).first()
    
    if existing_admin:
        print(f"Admin user already exists with email: {admin_email}")
        print("If you want to create a different admin, provide a different email.")
        db.close()
        return False
    
    # Create new admin user
    admin = User(
        email=admin_email,
        username=admin_username,
        hashed_password=get_password_hash(admin_password),
        full_name=admin_full_name,
        is_admin=True
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    print("✅ Admin user created successfully:")
    print(f"   Email: {admin_email}")
    print(f"   Username: {admin_username}")
    print(f"   Password: {admin_password}")
    print(f"   Full Name: {admin_full_name}")
    print("\nYou can now log in with these credentials at the admin dashboard.")
    
    db.close()
    return True

if __name__ == "__main__":
    # Handle command-line arguments for custom admin creation
    if len(sys.argv) > 1:
        email = sys.argv[1] if len(sys.argv) > 1 else None
        username = sys.argv[2] if len(sys.argv) > 2 else None
        password = sys.argv[3] if len(sys.argv) > 3 else None
        full_name = sys.argv[4] if len(sys.argv) > 4 else None
        
        seed_admin(email, username, password, full_name)
    else:
        # Create default admin
        seed_admin()