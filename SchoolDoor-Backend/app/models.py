from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class School(Base):
    """
    School model representing an educational institution.
    Stores basic details, academic info, facilities, and aggregation metadata.
    """
    __tablename__ = "schools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True, index=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True, default="India")
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # School details (Indian Education System)
    school_type = Column(String(50), nullable=True)  # CBSE, ICSE, State Board, IB, IGCSE, etc.
    board = Column(String(50), nullable=True)  # CBSE, ICSE, State Board, IB, IGCSE
    grade_levels = Column(String(100), nullable=True)  # Pre-K to 12, Nursery to 10, etc.
    enrollment = Column(Integer, nullable=True)
    student_teacher_ratio = Column(Float, nullable=True)
    
    # Academic information (Indian context)
    board_exam_results = Column(JSON, nullable=True)  # 10th/12th board exam results
    competitive_exam_results = Column(JSON, nullable=True)  # JEE, NEET, etc.
    programs = Column(JSON, nullable=True)  # Special programs offered
    medium_of_instruction = Column(String(50), nullable=True)  # English, Hindi, Regional language
    
    # Facilities and amenities
    facilities = Column(JSON, nullable=True)  # Sports, arts, technology, etc.
    
    # Contact and administrative info
    principal_name = Column(String(255), nullable=True)
    established_year = Column(Integer, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_scraped_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    ratings = relationship("Rating", back_populates="school")
    reviews = relationship("Review", back_populates="school")


class RatingCategory(Base):
    """
    Category for specific rating criteria (e.g., Academic, Facilities).
    """
    __tablename__ = "rating_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    weight = Column(Float, default=1.0)  # Weight for overall rating calculation
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Rating(Base):
    """
    Individual rating entry for a school-category pair.
    """
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("rating_categories.id"), nullable=False)
    rating_value = Column(Float, nullable=False)  # 1-5 scale
    source = Column(String(100), nullable=True)  # user, scraper, official, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    school = relationship("School", back_populates="ratings")
    category = relationship("RatingCategory")


class Review(Base):
    """
    Text review for a school left by a parent/member.
    Includes overall rating and status (approved/pending).
    """
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("member_users.id"), nullable=True, index=True)  # Deprecated: kept for backward compatibility, use member_id
    member_id = Column(Integer, ForeignKey("member_users.id"), nullable=True, index=True)
    parent_name = Column(String(255), nullable=True)  # Deprecated: use member relationship
    parent_email = Column(String(255), nullable=True)  # Deprecated: use member relationship
    overall_rating = Column(Float, nullable=False)  # 1-5 scale
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    # Note: Category-specific ratings are now handled by the Rating model
    # with RatingCategory for flexibility
    
    # Review metadata
    status = Column(String(50), default="pending", index=True)  # pending, approved, rejected
    is_verified = Column(Boolean, default=False)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    school = relationship("School", back_populates="reviews")
    member = relationship("MemberUser", lazy="select", foreign_keys=[member_id])


class ScrapingJob(Base):
    __tablename__ = "scraping_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    schools_found = Column(Integer, default=0)
    schools_processed = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
