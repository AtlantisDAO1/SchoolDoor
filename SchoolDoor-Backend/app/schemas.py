"""
Pydantic schemas for data validation and serialization.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# School Schemas
class SchoolBase(BaseModel):
    """Base schema for School data."""
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "India"
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    school_type: Optional[str] = None  # CBSE, ICSE, State Board, IB, IGCSE, etc.
    board: Optional[str] = None  # CBSE, ICSE, State Board, IB, IGCSE
    grade_levels: Optional[str] = None  # Pre-K to 12, Nursery to 10, etc.
    enrollment: Optional[int] = None
    student_teacher_ratio: Optional[float] = None
    board_exam_results: Optional[Dict[str, Any]] = None  # 10th/12th board exam results
    competitive_exam_results: Optional[Dict[str, Any]] = None  # JEE, NEET, etc.
    programs: Optional[List[str]] = None
    facilities: Optional[Dict[str, Any]] = None
    medium_of_instruction: Optional[str] = None  # English, Hindi, Regional language
    principal_name: Optional[str] = None
    established_year: Optional[int] = None


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    school_type: Optional[str] = None
    board: Optional[str] = None
    grade_levels: Optional[str] = None
    enrollment: Optional[int] = None
    student_teacher_ratio: Optional[float] = None
    board_exam_results: Optional[Dict[str, Any]] = None
    competitive_exam_results: Optional[Dict[str, Any]] = None
    programs: Optional[List[str]] = None
    facilities: Optional[Dict[str, Any]] = None
    medium_of_instruction: Optional[str] = None
    principal_name: Optional[str] = None
    established_year: Optional[int] = None


class School(SchoolBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True


class SchoolWithRatings(School):
    average_rating: Optional[float] = None
    total_reviews: int = 0
    ratings_by_category: Optional[Dict[str, float]] = None


# Rating Category Schemas
class RatingCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    weight: float = 1.0


class RatingCategoryCreate(RatingCategoryBase):
    pass


class RatingCategory(RatingCategoryBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Rating Schemas
class RatingBase(BaseModel):
    school_id: int
    category_id: int
    rating_value: float
    source: Optional[str] = None


class RatingCreate(RatingBase):
    pass


class Rating(RatingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Review Schemas
class ReviewBase(BaseModel):
    school_id: int
    member_id: Optional[int] = None
    parent_name: Optional[str] = None  # Deprecated: use member relationship
    parent_email: Optional[str] = None  # Deprecated: use member relationship
    overall_rating: float
    title: Optional[str] = None
    content: str
    is_anonymous: bool = False
    status: Optional[str] = "pending"  # pending, approved, rejected


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    overall_rating: Optional[float] = None
    title: Optional[str] = None
    content: Optional[str] = None
    is_anonymous: Optional[bool] = None


class Review(ReviewBase):
    """Full Review schema including system-managed fields."""
    id: int
    member_id: Optional[int] = None
    status: str
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Scraping Job Schemas
class ScrapingJobBase(BaseModel):
    region: str


class ScrapingJobCreate(ScrapingJobBase):
    pass


class ScrapingJob(ScrapingJobBase):
    id: int
    status: str
    schools_found: int
    schools_processed: int
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Search and Filter Schemas
class SchoolSearch(BaseModel):
    query: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    school_type: Optional[str] = None
    board: Optional[str] = None  # CBSE, ICSE, State Board, IB, IGCSE
    medium_of_instruction: Optional[str] = None  # English, Hindi, Regional language
    min_rating: Optional[float] = None
    max_rating: Optional[float] = None
    limit: int = 20
    offset: int = 0


class SchoolStats(BaseModel):
    total_schools: int
    average_rating: float
    schools_by_type: Dict[str, int]
    schools_by_state: Dict[str, int]
    top_rated_schools: List[SchoolWithRatings]


# Bulk Operations Schemas
class BulkSchoolUpdate(BaseModel):
    school_ids: List[int]
    updates: SchoolUpdate


class BulkSchoolResponse(BaseModel):
    updated_count: int
    failed_count: int
    errors: List[Dict[str, Any]]


class BulkReviewUpdate(BaseModel):
    review_ids: List[int]
    updates: ReviewUpdate


class BulkReviewResponse(BaseModel):
    updated_count: int
    failed_count: int
    errors: List[Dict[str, Any]]


# Export Schemas
class ExportRequest(BaseModel):
    format: str  # csv, excel, json
    filters: Optional[SchoolSearch] = None
    school_ids: Optional[List[int]] = None  # Specific school IDs to export
    fields: Optional[List[str]] = None
    include_reviews: bool = False
    include_ratings: bool = False


class ExportResponse(BaseModel):
    download_url: str
    file_name: str
    file_size: int
    expires_at: datetime


# Advanced Analytics Schemas
class SchoolTrends(BaseModel):
    school_id: int
    school_name: str
    rating_trend: List[Dict[str, Any]]  # {date, rating}
    review_count_trend: List[Dict[str, Any]]  # {date, count}
    enrollment_trend: List[Dict[str, Any]]  # {date, enrollment}


class SchoolComparison(BaseModel):
    schools: List[SchoolWithRatings]
    comparison_metrics: Dict[str, Dict[str, Any]]
    strengths_weaknesses: Dict[str, List[str]]


# Search and Filter Enhancement Schemas
class SearchSuggestion(BaseModel):
    type: str  # city, school_name, board, etc.
    value: str
    count: int


class AdvancedSearch(BaseModel):
    query: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    school_type: Optional[str] = None
    board: Optional[str] = None
    medium_of_instruction: Optional[str] = None
    min_rating: Optional[float] = None
    max_rating: Optional[float] = None
    min_enrollment: Optional[int] = None
    max_enrollment: Optional[int] = None
    has_facilities: Optional[List[str]] = None  # sports, library, lab, etc.
    established_after: Optional[int] = None
    established_before: Optional[int] = None
    sort_by: Optional[str] = "rating"  # rating, enrollment, name, created_at
    sort_order: Optional[str] = "desc"  # asc, desc
    limit: int = 20
    offset: int = 0
