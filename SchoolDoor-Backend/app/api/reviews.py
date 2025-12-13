"""
API endpoints for managing school reviews.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Review, School
from app.schemas import (
    Review as ReviewSchema, 
    ReviewCreate, 
    ReviewUpdate,
    BulkReviewUpdate,
    BulkReviewResponse
)
from app.services.rating_service import RatingService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewSchema)
@router.post("/", response_model=ReviewSchema)
async def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Create a new review for a school. Requires member authentication."""
    # Validate school exists
    school = db.query(School).filter(School.id == review_data.school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Validate rating values
    if not (1 <= review_data.overall_rating <= 5):
        raise HTTPException(status_code=400, detail="Overall rating must be between 1 and 5")
    
    # Note: This endpoint can be called by members or via the /members/reviews endpoint
    # The /members/reviews endpoint handles authentication and sets member_id
    # If member_id is in review_data, use it (set by authenticated endpoint)
    member_id = review_data.member_id if hasattr(review_data, 'member_id') else None
    
    # Set default status to pending if not provided
    if not hasattr(review_data, 'status') or review_data.status is None:
        # Create a new ReviewCreate with status set
        review_dict = review_data.model_dump() if hasattr(review_data, 'model_dump') else review_data.dict()
        review_dict['status'] = "pending"
        from app.schemas import ReviewCreate
        review_data = ReviewCreate(**review_dict)
    
    # Note: Category-specific ratings are now handled separately via the Rating model
    
    rating_service = RatingService(db)
    review = rating_service.create_review(review_data, member_id=member_id)
    
    return review


@router.get("/categories")
async def get_rating_categories(db: Session = Depends(get_db)):
    """Get all active rating categories"""
    from app.services.rating_service import RatingService
    rating_service = RatingService(db)
    categories = rating_service.get_rating_categories()
    
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "weight": cat.weight
        }
        for cat in categories
    ]


@router.get("/{review_id}", response_model=ReviewSchema)
async def get_review(review_id: int, db: Session = Depends(get_db)):
    """Get a specific review by ID"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review


@router.put("/{review_id}", response_model=ReviewSchema)
async def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Update fields
    update_data = review_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(review, field, value)
    
    db.commit()
    db.refresh(review)
    
    return review


@router.delete("/{review_id}")
async def delete_review(review_id: int, db: Session = Depends(get_db)):
    """Delete a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}


@router.get("", response_model=List[ReviewSchema])
@router.get("/", response_model=List[ReviewSchema])
async def get_reviews(
    school_id: Optional[int] = Query(None),
    parent_email: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None, ge=1, le=5),
    max_rating: Optional[float] = Query(None, ge=1, le=5),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    public_only: bool = Query(True, description="Only show approved reviews for public view"),
    db: Session = Depends(get_db)
):
    """Get reviews with optional filtering. By default, only shows approved reviews for public viewing."""
    query = db.query(Review)
    
    # For public view, only show approved reviews
    if public_only:
        query = query.filter(Review.status == "approved")
    
    # Apply filters
    if school_id:
        query = query.filter(Review.school_id == school_id)
    
    if parent_email:
        query = query.filter(Review.parent_email == parent_email)
    
    if min_rating:
        query = query.filter(Review.overall_rating >= min_rating)
    
    if max_rating:
        query = query.filter(Review.overall_rating <= max_rating)
    
    # Eager load member relationship
    from sqlalchemy.orm import joinedload
    from app.models_member import MemberUser
    query = query.options(joinedload(Review.member))
    
    # Apply pagination
    reviews = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()
    
    # Serialize reviews with member information
    result = []
    for review in reviews:
        review_dict = {
            "id": review.id,
            "school_id": review.school_id,
            "member_id": review.member_id,
            "overall_rating": review.overall_rating,
            "title": review.title,
            "content": review.content,
            "status": review.status,
            "is_verified": review.is_verified,
            "is_anonymous": review.is_anonymous,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "updated_at": review.updated_at.isoformat() if review.updated_at else None,
            "parent_name": review.parent_name,  # Deprecated but kept for backward compatibility
            "parent_email": review.parent_email,  # Deprecated but kept for backward compatibility
        }
        # Include member information if available
        # Try lazy loading if eager loading didn't work
        if review.member_id:
            if review.member:
                review_dict["member"] = {
                    "id": review.member.id,
                    "full_name": review.member.full_name,
                    "email": review.member.email,
                }
            else:
                # Fallback: manually load member if relationship didn't load
                member = db.query(MemberUser).filter(MemberUser.id == review.member_id).first()
                if member:
                    review_dict["member"] = {
                        "id": member.id,
                        "full_name": member.full_name,
                        "email": member.email,
                    }
        result.append(review_dict)
    
    return result


@router.get("/stats/overview")
async def get_review_stats(
    approved_only: bool = Query(True, description="Only count approved reviews for public stats"),
    db: Session = Depends(get_db)
):
    """Get overall review statistics. By default, only counts approved reviews for public viewing."""
    from sqlalchemy import func
    
    query_filter = [Review.status == "approved"] if approved_only else []
    
    total_reviews = db.query(Review).filter(*query_filter).count() if query_filter else db.query(Review).count()
    avg_rating = db.query(func.avg(Review.overall_rating)).filter(*query_filter).scalar() if query_filter else db.query(func.avg(Review.overall_rating)).scalar()
    
    # Rating distribution
    rating_query = db.query(
        Review.overall_rating,
        func.count(Review.id).label('count')
    )
    if query_filter:
        rating_query = rating_query.filter(*query_filter)
    rating_dist = rating_query.group_by(Review.overall_rating).all()
    
    distribution = {str(rating): count for rating, count in rating_dist}
    
    # Reviews by school
    school_query = db.query(
        School.name,
        School.city,
        School.state,
        func.count(Review.id).label('review_count'),
        func.avg(Review.overall_rating).label('avg_rating')
    ).join(Review, School.id == Review.school_id)
    if query_filter:
        school_query = school_query.filter(*query_filter)
    reviews_by_school = school_query.group_by(School.id, School.name, School.city, School.state)\
     .order_by(func.count(Review.id).desc())\
     .limit(10).all()
    
    top_schools = [
        {
            "school_name": school_name,
            "city": city,
            "state": state,
            "review_count": review_count,
            "average_rating": round(float(avg_rating), 2)
        }
        for school_name, city, state, review_count, avg_rating in reviews_by_school
    ]
    
    return {
        "total_reviews": total_reviews,
        "average_rating": round(float(avg_rating), 2) if avg_rating else 0,
        "rating_distribution": distribution,
        "top_schools_by_reviews": top_schools
    }


@router.post("/bulk-update", response_model=BulkReviewResponse)
async def bulk_update_reviews(
    bulk_update: BulkReviewUpdate,
    db: Session = Depends(get_db)
):
    """Bulk update multiple reviews"""
    updated_count = 0
    failed_count = 0
    errors = []
    
    for review_id in bulk_update.review_ids:
        try:
            review = db.query(Review).filter(Review.id == review_id).first()
            if not review:
                errors.append({"review_id": review_id, "error": "Review not found"})
                failed_count += 1
                continue
            
            # Update only provided fields
            update_data = bulk_update.updates.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(review, field, value)
            
            review.updated_at = func.now()
            db.commit()
            updated_count += 1
            
        except Exception as e:
            db.rollback()
            errors.append({"review_id": review_id, "error": str(e)})
            failed_count += 1
    
    return BulkReviewResponse(
        updated_count=updated_count,
        failed_count=failed_count,
        errors=errors
    )


@router.post("/bulk-verify")
async def bulk_verify_reviews(
    review_ids: List[int],
    db: Session = Depends(get_db)
):
    """Bulk verify multiple reviews"""
    updated_count = 0
    failed_count = 0
    errors = []
    
    for review_id in review_ids:
        try:
            review = db.query(Review).filter(Review.id == review_id).first()
            if not review:
                errors.append({"review_id": review_id, "error": "Review not found"})
                failed_count += 1
                continue
            
            review.is_verified = True
            review.updated_at = func.now()
            db.commit()
            updated_count += 1
            
        except Exception as e:
            db.rollback()
            errors.append({"review_id": review_id, "error": str(e)})
            failed_count += 1
    
    return {
        "verified_count": updated_count,
        "failed_count": failed_count,
        "errors": errors
    }



