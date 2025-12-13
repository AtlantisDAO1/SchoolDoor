from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # API Key fields
    api_key_hash = Column(String(255), nullable=True, unique=True, index=True)
    api_key_name = Column(String(100), nullable=True)
    api_key_created_at = Column(DateTime(timezone=True), nullable=True)
    api_key_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    activity_logs = relationship("AdminActivityLog", back_populates="admin_user")


class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("admin_users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # create, update, delete, view, etc.
    resource_type = Column(String(50), nullable=False)  # school, review, rating, etc.
    resource_id = Column(Integer, nullable=True)  # ID of the affected resource
    description = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    admin_user = relationship("AdminUser", back_populates="activity_logs")


class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), nullable=False)  # INFO, WARNING, ERROR, CRITICAL
    module = Column(String(100), nullable=False)  # scraping, api, database, etc.
    message = Column(Text, nullable=False)
    details = Column(Text, nullable=True)  # JSON string with additional details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AdminNotification(Base):
    __tablename__ = "admin_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # info, warning, error, success
    is_read = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Optional: Link to specific resource
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(Integer, nullable=True)


# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
