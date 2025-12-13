#!/usr/bin/env python3
"""
Script to seed a test participant user (PostgreSQL compatible)
"""
import sys
import os
import bcrypt
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text

# Add the app directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.config import settings

print(f"Connecting to database...")

# Create engine
engine = create_engine(settings.database_url)

try:
    with engine.connect() as conn:
        # Check if participant1 already exists
        # Use text() for raw SQL, params mapping with colon
        stmt = text("SELECT id FROM participant_users WHERE email = :email")
        result = conn.execute(stmt, {"email": "participant1@example.com"}).fetchone()
        
        if result:
            print("Participant1 already exists (ID: {})".format(result[0]))
            sys.exit(0)

        # Create password hash
        password = settings.participant_password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        # Insert participant1
        print("Creating participant1 user...")
        
        insert_stmt = text("""
            INSERT INTO participant_users (
                email, hashed_password, full_name, phone, is_active, 
                bio, location, created_at
            ) VALUES (
                :email, :hashed_password, :full_name, :phone, :is_active, 
                :bio, :location, :created_at
            ) RETURNING id
        """)
        
        result = conn.execute(insert_stmt, {
            "email": "participant1@example.com",
            "hashed_password": hashed_password,
            "full_name": "Participant One",
            "phone": "+1234567890",
            "is_active": True,
            "bio": "Test participant user",
            "location": "Test City, Test State",
            "created_at": datetime.utcnow()
        })
        
        # Access return value (id)
        # SQLAlchemy 1.4/2.0+ pattern
        row = result.fetchone()
        participant_id = row[0] if row else "Unknown"

        conn.commit()
        print(f"✓ Participant1 created successfully (ID: {participant_id})")
        print(f"\nLogin credentials:")
        print(f"  Email: participant1@example.com")
        print(f"  Password: {settings.participant_password}")

except Exception as e:
    print(f"Error seeding database: {e}")
    sys.exit(1)
