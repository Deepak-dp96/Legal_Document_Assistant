"""
Create initial admin user for the application.
Run this script once to create the default admin user.
"""
import sys
import os
# Add parent directory to path since we're in seed_scripts/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import SessionLocal, engine, Base
from auth.models import User
from auth.auth_service import get_password_hash

def create_admin_user():
    """Create the default admin user if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if admin user already exists by username, email, or phone
        existing_by_username = db.query(User).filter(User.username == "admin").first()
        existing_by_email = db.query(User).filter(User.email == "admin@gmail.com").first()
        existing_by_phone = db.query(User).filter(User.phone_number == "9876543210").first()
        
        if existing_by_username or existing_by_email or existing_by_phone:
            existing_user = existing_by_username or existing_by_email or existing_by_phone
            print("ℹ️  Admin user already exists!")
            print(f"   Username: {existing_user.username}")
            print(f"   Email: {existing_user.email}")
            print(f"   Phone: {existing_user.phone_number}")
            print(f"   User ID: {existing_user.id}")
            return
        
        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@gmail.com",
            phone_number="9876543210",
            full_name="Admin User",
            hashed_password=get_password_hash("admin"),
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Phone: {admin_user.phone_number}")
        print(f"   Password: admin")
        print(f"   User ID: {admin_user.id}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating admin user...")
    print("-" * 50)
    create_admin_user()
    print("-" * 50)
