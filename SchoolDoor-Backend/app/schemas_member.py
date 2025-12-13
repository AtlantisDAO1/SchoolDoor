from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class MemberUserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None


class MemberUserCreate(MemberUserBase):
    password: str


class MemberUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    password: Optional[str] = None


class MemberUser(MemberUserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MemberLogin(BaseModel):
    email: EmailStr
    password: str


class MemberToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    member_user: MemberUser


class MemberTokenData(BaseModel):
    email: Optional[str] = None
    member_user_id: Optional[int] = None



