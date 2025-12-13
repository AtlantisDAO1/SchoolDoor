#!/usr/bin/env python3
"""
Database initialization script for SchoolDoor API
"""

from sqlalchemy import create_engine
from app.database import Base
from app.config import settings
from app.models import RatingCategory
from app.models_admin import AdminUser, get_password_hash
from app.database import SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Initialize the database with tables and default data"""
    # Create all tables
    engine = create_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Initialize default rating categories
    db = SessionLocal()
    try:
        # Check if rating categories already exist
        existing_categories = db.query(RatingCategory).count()
        if existing_categories == 0:
            default_categories = [
                ("Academic Quality", "Overall academic excellence and curriculum quality", 1.2),
                ("Teacher Quality", "Quality of teaching staff and instruction", 1.1),
                ("Facilities", "School facilities, equipment, and infrastructure", 0.9),
                ("Safety", "School safety and security measures", 1.0),
                ("Extracurriculars", "Sports, clubs, and extracurricular activities", 0.8),
                ("Communication", "Parent-teacher communication and transparency", 0.9),
                ("Diversity", "Student and staff diversity", 0.7),
                ("Technology", "Technology integration and resources", 0.8)
            ]
            
            for name, description, weight in default_categories:
                category = RatingCategory(
                    name=name,
                    description=description,
                    weight=weight
                )
                db.add(category)
            
            db.commit()
            logger.info("Default rating categories created successfully")
        else:
            logger.info("Rating categories already exist, skipping initialization")
        
        # Create default admin user
        existing_admin = db.query(AdminUser).filter(AdminUser.email == settings.admin_email).first()
        if not existing_admin:
            admin_user = AdminUser(
                username=settings.admin_email,
                email=settings.admin_email,
                hashed_password=get_password_hash(settings.admin_password),
                full_name="Martin Administrator",
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"Default admin user created (email: {settings.admin_email})")
        else:
            logger.info("Admin user already exists, skipping initialization")
            
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
    print("Database initialization completed!")
