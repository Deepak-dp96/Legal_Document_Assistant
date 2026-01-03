"""
Initialize database tables before running seed scripts.
This ensures tables exist before trying to insert data.
"""
import sys
import os
# Add parent directory to path since we're in seed_scripts/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import engine, Base
from auth.models import User
from documents.models import Document, AgentAnalysis, Report

def init_database():
    """Create all database tables."""
    try:
        print("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    init_database()
