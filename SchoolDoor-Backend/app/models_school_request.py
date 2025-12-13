from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SchoolRequest(Base):
    __tablename__ = "school_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # School information
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True, default="India")
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # School details
    school_type = Column(String(50), nullable=True)
    board = Column(String(50), nullable=True)
    grade_levels = Column(String(100), nullable=True)
    enrollment = Column(Integer, nullable=True)
    student_teacher_ratio = Column(Float, nullable=True)
    medium_of_instruction = Column(String(50), nullable=True)
    principal_name = Column(String(255), nullable=True)
    established_year = Column(Integer, nullable=True)
    
    # Additional data stored as JSON
    board_exam_results = Column(JSON, nullable=True)
    competitive_exam_results = Column(JSON, nullable=True)
    programs = Column(JSON, nullable=True)
    facilities = Column(JSON, nullable=True)
    
    # Request metadata
    member_id = Column(Integer, ForeignKey("member_users.id"), nullable=True, index=True)
    status = Column(String(50), default="pending", index=True)  # pending, approved, rejected
    admin_notes = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    member = relationship("MemberUser", lazy="select")
    reviewer = relationship("AdminUser", lazy="select", foreign_keys=[reviewed_by])

