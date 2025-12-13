"""
API endpoints for member (parent/student) management, authentication, and user-specific features.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models_member import MemberUser
from app.models import Review, School
from app.models_school_request import SchoolRequest
from app.schemas_member import (
    MemberUser as MemberUserSchema,
    MemberUserCreate,
    MemberUserUpdate,
    MemberLogin,
    MemberToken
)
from app.schemas_school_request import (
    SchoolRequestCreate,
    SchoolRequest as SchoolRequestSchema
)
from app.services.member_auth_service import (
    MemberAuthService,
    get_current_member
)
from sqlalchemy import func, desc
from datetime import datetime, timedelta

router = APIRouter(prefix="/members", tags=["members"])


# Authentication endpoints
@router.post("/signup", response_model=MemberToken)
async def member_signup(
    member_data: MemberUserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Member signup endpoint"""
    auth_service = MemberAuthService(db)
    
    # Check if email already exists
    existing = db.query(MemberUser).filter(
        MemberUser.email == member_data.email
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new member
    hashed_password = auth_service.get_password_hash(member_data.password)
    
    member = MemberUser(
        email=member_data.email,
        hashed_password=hashed_password,
        full_name=member_data.full_name,
        phone=member_data.phone,
        bio=member_data.bio,
        location=member_data.location,
        is_active=True
    )
    
    db.add(member)
    db.commit()
    db.refresh(member)
    
    # Create access token
    access_token_expires = timedelta(hours=8)  # 8 hours for members
    access_token = auth_service.create_access_token(
        data={
            "sub": member.email,
            "member_user_id": member.id
        },
        expires_delta=access_token_expires
    )
    
    return MemberToken(
        access_token=access_token,
        token_type="bearer",
        expires_in=28800,  # 8 hours in seconds
        member_user=member
    )


@router.post("/login", response_model=MemberToken)
async def member_login(
    login_data: MemberLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    
    auth_service = MemberAuthService(db)
    
    # Authenticate member
    member = auth_service.authenticate_member(
        login_data.email,
        login_data.password
    )
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(hours=8)  # 8 hours for members
    access_token = auth_service.create_access_token(
        data={
            "sub": member.email,
            "member_user_id": member.id
        },
        expires_delta=access_token_expires
    )
    
    return MemberToken(
        access_token=access_token,
        token_type="bearer",
        expires_in=28800,  # 8 hours in seconds
        member_user=member
    )


@router.get("/me", response_model=MemberUserSchema)
async def get_current_member_info(
    current_member: MemberUser = Depends(get_current_member)
):
    
    return MemberUserSchema(
        id=current_member.id,
        email=current_member.email,
        full_name=current_member.full_name,
        phone=current_member.phone,
        bio=current_member.bio,
        location=current_member.location,
        is_active=current_member.is_active,
        created_at=current_member.created_at,
        last_login=current_member.last_login,
        updated_at=current_member.updated_at
    )


@router.put("/me", response_model=MemberUserSchema)
async def update_current_member_info(
    member_update: MemberUserUpdate,
    current_member: MemberUser = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    """Update current member's information"""
    auth_service = MemberAuthService(db)
    
    # Update fields if provided
    if member_update.full_name is not None:
        current_member.full_name = member_update.full_name
    if member_update.phone is not None:
        current_member.phone = member_update.phone
    if member_update.bio is not None:
        current_member.bio = member_update.bio
    if member_update.location is not None:
        current_member.location = member_update.location
    if member_update.password is not None:
        current_member.hashed_password = auth_service.get_password_hash(member_update.password)
    
    current_member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_member)
    
    return MemberUserSchema(
        id=current_member.id,
        email=current_member.email,
        full_name=current_member.full_name,
        phone=current_member.phone,
        bio=current_member.bio,
        location=current_member.location,
        is_active=current_member.is_active,
        created_at=current_member.created_at,
        last_login=current_member.last_login,
        updated_at=current_member.updated_at
    )


@router.get("/dashboard/stats")
async def get_member_dashboard_stats(
    current_member: MemberUser = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the current member"""
    
    # Count reviews by status
    total_reviews = db.query(Review).filter(
        Review.member_id == current_member.id
    ).count()
    
    approved_reviews = db.query(Review).filter(
        Review.member_id == current_member.id,
        Review.status == "approved"
    ).count()
    
    pending_reviews = db.query(Review).filter(
        Review.member_id == current_member.id,
        Review.status == "pending"
    ).count()
    
    rejected_reviews = db.query(Review).filter(
        Review.member_id == current_member.id,
        Review.status == "rejected"
    ).count()
    
    # Get average rating
    avg_rating = db.query(func.avg(Review.overall_rating)).filter(
        Review.member_id == current_member.id,
        Review.status == "approved"
    ).scalar()
    
    return {
        "total_reviews": total_reviews,
        "approved_reviews": approved_reviews,
        "pending_reviews": pending_reviews,
        "rejected_reviews": rejected_reviews,
        "average_rating": round(float(avg_rating), 2) if avg_rating else None
    }


@router.post("/reviews", response_model=dict)
async def create_member_review(
    review_data: dict,
    current_member: MemberUser = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    """Create a review as a member"""
    from app.schemas import ReviewCreate
    from app.services.rating_service import RatingService
    from app.models import School
    from fastapi import HTTPException, status
    
    # Validate school exists
    school = db.query(School).filter(School.id == review_data.get("school_id")).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Validate rating values
    overall_rating = review_data.get("overall_rating")
    if not overall_rating or not (1 <= overall_rating <= 5):
        raise HTTPException(status_code=400, detail="Overall rating must be between 1 and 5")
    
    # Create review with member_id
    rating_service = RatingService(db)
    
    # Create ReviewCreate object
    review_create = ReviewCreate(
        school_id=review_data["school_id"],
        member_id=current_member.id,
        overall_rating=review_data["overall_rating"],
        title=review_data.get("title"),
        content=review_data["content"],
        is_anonymous=review_data.get("is_anonymous", False),
        status="pending"
    )
    
    review = rating_service.create_review(review_create, member_id=current_member.id)
    
    # Get school info for response
    return {
        "id": review.id,
        "school_id": review.school_id,
        "school_name": school.name,
        "overall_rating": review.overall_rating,
        "title": review.title,
        "content": review.content,
        "status": review.status,
        "created_at": review.created_at
    }


@router.get("/my-reviews")
async def get_my_reviews(
    status_filter: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_member: MemberUser = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    
    query = db.query(Review).filter(
        Review.member_id == current_member.id
    )
    
    if status_filter:
        query = query.filter(Review.status == status_filter)
    
    reviews = query.order_by(desc(Review.created_at)).offset(offset).limit(limit).all()
    
    result = []
    for review in reviews:
        school = db.query(School).filter(School.id == review.school_id).first()
        result.append({
            "id": review.id,
            "school_id": review.school_id,
            "school_name": school.name if school else "Unknown School",
            "school_city": school.city if school else None,
            "school_state": school.state if school else None,
            "overall_rating": review.overall_rating,
            "title": review.title,
            "content": review.content,
            "status": review.status,
            "is_verified": review.is_verified,
            "created_at": review.created_at,
            "updated_at": review.updated_at
        })
    
    return result


@router.post("/school-requests", response_model=SchoolRequestSchema)
async def create_school_request(
    school_data: SchoolRequestCreate,
    current_member: MemberUser = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    """Submit a school creation request"""
    
    # Check for duplicate pending requests with same name and city
    existing = db.query(SchoolRequest).filter(
        SchoolRequest.name == school_data.name,
        SchoolRequest.city == school_data.city,
        SchoolRequest.status == "pending",
        SchoolRequest.member_id == current_member.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending request for this school"
        )
    
    # Create school request
    request_dict = school_data.model_dump() if hasattr(school_data, 'model_dump') else school_data.dict()
    request_dict['member_id'] = current_member.id
    request_dict['status'] = 'pending'
    
    school_request = SchoolRequest(**request_dict)
    db.add(school_request)
    db.commit()
    db.refresh(school_request)
    
    return school_request


@router.get("/school-requests", response_model=List[SchoolRequestSchema])
async def get_my_school_requests(
    status_filter: Optional[str] = None,
    current_member: MemberUser = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    """Get current member's school requests"""
    
    query = db.query(SchoolRequest).filter(
        SchoolRequest.member_id == current_member.id
    )
    
    if status_filter:
        query = query.filter(SchoolRequest.status == status_filter)
    
    requests = query.order_by(desc(SchoolRequest.created_at)).all()
    
    return requests
