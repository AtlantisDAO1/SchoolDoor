from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# Admin User Schemas
class AdminUserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False


class AdminUserCreate(AdminUserBase):
    password: str


class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    password: Optional[str] = None


class AdminUser(AdminUserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    api_key_hash: Optional[str] = None
    api_key_name: Optional[str] = None
    api_key_created_at: Optional[datetime] = None
    api_key_expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Activity Log Schemas
class AdminActivityLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    description: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AdminActivityLog(AdminActivityLogBase):
    id: int
    admin_user_id: int
    created_at: datetime
    admin_user: AdminUser

    class Config:
        from_attributes = True


# System Log Schemas
class SystemLogBase(BaseModel):
    level: str
    module: str
    message: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class SystemLog(SystemLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class AdminNotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str
    is_important: bool = False
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None


class AdminNotificationCreate(AdminNotificationBase):
    pass


class AdminNotification(AdminNotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Dashboard Schemas
class AdminDashboardStats(BaseModel):
    total_schools: int
    total_reviews: int
    total_ratings: int
    total_scraping_jobs: int
    active_scraping_jobs: int
    recent_activity_count: int
    unread_notifications: int
    system_health: str  # healthy, warning, error


class AdminSchoolSummary(BaseModel):
    id: int
    name: str
    city: str
    state: str
    school_type: Optional[str] = None
    average_rating: Optional[float] = None
    total_reviews: int
    last_scraped_at: Optional[datetime] = None
    created_at: datetime
    is_active: bool


class AdminReviewSummary(BaseModel):
    id: int
    school_name: str
    parent_name: Optional[str] = None
    overall_rating: float
    title: Optional[str] = None
    content: str
    is_verified: bool
    created_at: datetime


class AdminScrapingJobSummary(BaseModel):
    id: int
    region: str
    status: str
    schools_found: int
    schools_processed: int
    schools_created: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


# Authentication Schemas
class AdminLogin(BaseModel):
    username: str
    password: str


class AdminToken(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    admin_user: AdminUser


class AdminTokenData(BaseModel):
    username: Optional[str] = None
    admin_user_id: Optional[int] = None
    is_superuser: Optional[bool] = None


# Search and Filter Schemas
class AdminSchoolSearch(BaseModel):
    query: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    school_type: Optional[str] = None
    min_rating: Optional[float] = None
    max_rating: Optional[float] = None
    is_active: Optional[bool] = None
    limit: int = 20
    offset: int = 0


class AdminReviewSearch(BaseModel):
    school_id: Optional[int] = None
    min_rating: Optional[float] = None
    max_rating: Optional[float] = None
    is_verified: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 20
    offset: int = 0


class AdminActivitySearch(BaseModel):
    admin_user_id: Optional[int] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50
    offset: int = 0
