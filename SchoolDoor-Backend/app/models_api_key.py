from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Human-readable name for the key
    key_hash = Column(String(255), unique=True, nullable=False, index=True)  # Hashed version of the key
    description = Column(Text, nullable=True)  # Optional description
    is_active = Column(Boolean, default=True)  # Can be disabled without deleting
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration
    last_used_at = Column(DateTime(timezone=True), nullable=True)  # Track usage
    created_by_admin_id = Column(Integer, nullable=True)  # Who created it (admin user ID)
    usage_count = Column(Integer, default=0)  # Track how many times it's been used
    
    # Relationships (commented out to avoid foreign key issues)
    # created_by_admin = relationship("AdminUser", foreign_keys=[created_by_admin_id])

class APIKeyUsage(Base):
    __tablename__ = "api_key_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=False)
    endpoint = Column(String(255), nullable=False)  # Which endpoint was called
    method = Column(String(10), nullable=False)  # GET, POST, etc.
    ip_address = Column(String(45), nullable=True)  # Client IP
    user_agent = Column(Text, nullable=True)  # Client user agent
    response_status = Column(Integer, nullable=True)  # HTTP response status
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    api_key = relationship("APIKey", foreign_keys=[api_key_id])
