from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime


class SchoolRequestBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "India"
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    school_type: Optional[str] = None
    board: Optional[str] = None
    grade_levels: Optional[str] = None
    enrollment: Optional[int] = None
    student_teacher_ratio: Optional[float] = None
    medium_of_instruction: Optional[str] = None
    principal_name: Optional[str] = None
    established_year: Optional[int] = None
    board_exam_results: Optional[Dict[str, Any]] = None
    competitive_exam_results: Optional[Dict[str, Any]] = None
    programs: Optional[List[str]] = None
    facilities: Optional[Dict[str, Any]] = None


class SchoolRequestCreate(SchoolRequestBase):
    pass


class SchoolRequestUpdate(BaseModel):
    status: Optional[str] = None  # pending, approved, rejected
    admin_notes: Optional[str] = None


class SchoolRequest(SchoolRequestBase):
    id: int
    member_id: Optional[int] = None
    status: str
    admin_notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SchoolRequestWithDetails(SchoolRequest):
    member_email: Optional[str] = None
    member_name: Optional[str] = None
    reviewer_username: Optional[str] = None



