"""
API endpoints for managing and retrieving school data.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import os
from datetime import datetime, timedelta
from app.database import get_db
from app.models import School, Review, Rating
from app.schemas import (
    School as SchoolSchema, 
    SchoolWithRatings, 
    SchoolSearch, 
    SchoolStats,
    SchoolUpdate,
    BulkSchoolUpdate,
    BulkSchoolResponse,
    ExportRequest,
    ExportResponse,
    SearchSuggestion
)
from app.services.rating_service import RatingService
from app.services.api_auth_service import optional_auth_with_usage_tracking
from sqlalchemy import func, and_, or_

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("", response_model=List[SchoolWithRatings])
@router.get("/", response_model=List[SchoolWithRatings])
async def get_schools(
    request: Request,
    search: SchoolSearch = Depends(),
    db: Session = Depends(get_db),
    auth_user = Depends(optional_auth_with_usage_tracking)
):
    """Get schools with optional filtering and search"""
    query = db.query(School).filter(School.is_active == True)
    
    # Apply filters
    if search.city:
        query = query.filter(School.city.ilike(f"%{search.city}%"))
    
    if search.state:
        query = query.filter(School.state.ilike(f"%{search.state}%"))
    
    if search.school_type:
        query = query.filter(School.school_type.ilike(f"%{search.school_type}%"))
    
    if search.board:
        query = query.filter(School.board.ilike(f"%{search.board}%"))
    
    if search.medium_of_instruction:
        query = query.filter(School.medium_of_instruction.ilike(f"%{search.medium_of_instruction}%"))
    
    if search.query:
        query = query.filter(
            or_(
                School.name.ilike(f"%{search.query}%"),
                School.city.ilike(f"%{search.query}%"),
                School.state.ilike(f"%{search.query}%")
            )
        )
    
    # Apply pagination
    schools = query.offset(search.offset).limit(search.limit).all()
    
    # Add rating information
    rating_service = RatingService(db)
    result = []
    
    for school in schools:
        school_data = school.__dict__.copy()
        
        # Get average rating (only from approved reviews for public view)
        avg_rating = db.query(func.avg(Review.overall_rating)).filter(
            Review.school_id == school.id,
            Review.status == "approved"
        ).scalar()
        
        # Get total reviews (only approved for public view)
        total_reviews = db.query(Review).filter(
            Review.school_id == school.id,
            Review.status == "approved"
        ).count()
        
        # Get ratings by category (only from approved reviews)
        ratings_by_category = {}
        categories = rating_service.get_rating_categories()
        for category in categories:
            cat_rating = db.query(func.avg(Rating.rating_value)).filter(
                and_(
                    Rating.school_id == school.id,
                    Rating.category_id == category.id,
                    # Join with Review to filter by approved status
                    Rating.school_id.in_(
                        db.query(Review.school_id).filter(
                            Review.school_id == school.id,
                            Review.status == "approved"
                        )
                    )
                )
            ).scalar()
            if cat_rating:
                ratings_by_category[category.name] = round(float(cat_rating), 2)
        
        school_data.update({
            "average_rating": round(float(avg_rating), 2) if avg_rating else None,
            "total_reviews": total_reviews,
            "ratings_by_category": ratings_by_category
        })
        
        result.append(SchoolWithRatings(**school_data))
    
    # Apply rating filters
    if search.min_rating:
        result = [s for s in result if s.average_rating and s.average_rating >= search.min_rating]
    
    if search.max_rating:
        result = [s for s in result if s.average_rating and s.average_rating <= search.max_rating]
    
    return result


@router.get("/search-suggestions", response_model=List[SearchSuggestion])
async def get_search_suggestions(
    query: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get search suggestions for autocomplete"""
    suggestions = []
    
    # City suggestions
    cities = db.query(School.city, func.count(School.id).label('count')).filter(
        School.city.ilike(f"%{query}%"),
        School.is_active == True
    ).group_by(School.city).limit(limit).all()
    
    for city, count in cities:
        suggestions.append(SearchSuggestion(
            type="city",
            value=city,
            count=count
        ))
    
    # School name suggestions
    schools = db.query(School.name, func.count(School.id).label('count')).filter(
        School.name.ilike(f"%{query}%"),
        School.is_active == True
    ).group_by(School.name).limit(limit).all()
    
    for name, count in schools:
        suggestions.append(SearchSuggestion(
            type="school_name",
            value=name,
            count=count
        ))
    
    return suggestions[:limit]


@router.get("/{school_id}", response_model=SchoolWithRatings)
async def get_school(school_id: int, db: Session = Depends(get_db)):
    """Get a specific school by ID with ratings"""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    rating_service = RatingService(db)
    ratings = rating_service.calculate_school_ratings(school_id)
    
    school_data = school.__dict__.copy()
    school_data.update({
        "average_rating": ratings["overall_rating"],
        "total_reviews": ratings["total_reviews"],
        "ratings_by_category": ratings["ratings_by_category"]
    })
    
    return SchoolWithRatings(**school_data)


@router.put("/{school_id}", response_model=SchoolSchema)
async def update_school(
    school_id: int,
    school_update: SchoolUpdate,
    db: Session = Depends(get_db)
):
    """Update a school by ID"""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Update only provided fields
    update_data = school_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(school, field, value)
    
    school.updated_at = func.now()
    db.commit()
    db.refresh(school)
    
    # Return basic school data without expensive rating calculations
    # Ratings are only calculated when specifically requested via GET /schools/{id}
    return SchoolSchema.from_orm(school)


@router.get("/{school_id}/reviews")
async def get_school_reviews(
    school_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    public_only: bool = Query(True, description="Only show approved reviews for public view"),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific school. By default, only shows approved reviews for public viewing."""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    rating_service = RatingService(db)
    status_filter = "approved" if public_only else None
    reviews = rating_service.get_school_reviews(school_id, limit, offset, status=status_filter)
    
    # Count total reviews
    if public_only:
        total_count = db.query(Review).filter(
            Review.school_id == school_id,
            Review.status == "approved"
        ).count()
    else:
        total_count = db.query(Review).filter(Review.school_id == school_id).count()
    
    return {
        "school_id": school_id,
        "school_name": school.name,
        "reviews": reviews,
        "total_count": total_count
    }


@router.get("/{school_id}/ratings")
async def get_school_ratings(school_id: int, db: Session = Depends(get_db)):
    """Get detailed ratings for a specific school"""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    rating_service = RatingService(db)
    ratings = rating_service.calculate_school_ratings(school_id)
    
    return ratings


@router.get("/{school_id}/trends")
async def get_school_trends(school_id: int, db: Session = Depends(get_db)):
    """Get rating trends for a specific school"""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    rating_service = RatingService(db)
    trends = rating_service.get_rating_trends(school_id)
    
    return trends


@router.get("/stats/overview", response_model=SchoolStats)
async def get_school_stats(db: Session = Depends(get_db)):
    """Get overall statistics about schools in the database"""
    total_schools = db.query(School).filter(School.is_active == True).count()
    
    # Average rating across all schools
    avg_rating = db.query(func.avg(Review.overall_rating)).scalar()
    
    # Schools by type
    schools_by_type = db.query(
        School.school_type,
        func.count(School.id).label('count')
    ).filter(School.is_active == True).group_by(School.school_type).all()
    
    schools_by_type_dict = {school_type or "Unknown": count for school_type, count in schools_by_type}
    
    # Schools by state
    schools_by_state = db.query(
        School.state,
        func.count(School.id).label('count')
    ).filter(School.is_active == True).group_by(School.state).all()
    
    schools_by_state_dict = {state or "Unknown": count for state, count in schools_by_state}
    
    # Top rated schools
    rating_service = RatingService(db)
    top_rated_rankings = rating_service.get_school_rankings(limit=10)
    top_rated: List[SchoolWithRatings] = []

    for ranking in top_rated_rankings:
        school = db.query(School).filter(School.id == ranking.get('school_id')).first()
        if not school:
            continue

        school_schema = SchoolWithRatings.from_orm(school)
        school_schema.average_rating = ranking.get('average_rating')
        school_schema.total_reviews = ranking.get('review_count', 0)
        top_rated.append(school_schema)
    
    return SchoolStats(
        total_schools=total_schools,
        average_rating=round(float(avg_rating), 2) if avg_rating else 0,
        schools_by_type=schools_by_type_dict,
        schools_by_state=schools_by_state_dict,
        top_rated_schools=top_rated
    )


@router.get("/rankings/top")
async def get_top_schools(
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get top-rated schools, optionally filtered by category"""
    rating_service = RatingService(db)
    rankings = rating_service.get_school_rankings(limit=limit, category=category)
    
    return {
        "rankings": rankings,
        "category": category,
        "limit": limit
    }


@router.post("/compare")
async def compare_schools(
    school_ids: List[int],
    db: Session = Depends(get_db)
):
    """Compare multiple schools side by side"""
    if len(school_ids) < 2 or len(school_ids) > 5:
        raise HTTPException(
            status_code=400, 
            detail="Must compare between 2 and 5 schools"
        )
    
    rating_service = RatingService(db)
    comparison = rating_service.get_school_comparison(school_ids)
    
    return {
        "comparison": comparison,
        "schools_compared": len(comparison)
    }


@router.post("/bulk-update", response_model=BulkSchoolResponse)
async def bulk_update_schools(
    bulk_update: BulkSchoolUpdate,
    db: Session = Depends(get_db)
):
    """Bulk update multiple schools"""
    updated_count = 0
    failed_count = 0
    errors = []
    
    for school_id in bulk_update.school_ids:
        try:
            school = db.query(School).filter(School.id == school_id).first()
            if not school:
                errors.append({"school_id": school_id, "error": "School not found"})
                failed_count += 1
                continue
            
            # Update only provided fields
            update_data = bulk_update.updates.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(school, field, value)
            
            school.updated_at = func.now()
            db.commit()
            updated_count += 1
            
        except Exception as e:
            db.rollback()
            errors.append({"school_id": school_id, "error": str(e)})
            failed_count += 1
    
    return BulkSchoolResponse(
        updated_count=updated_count,
        failed_count=failed_count,
        errors=errors
    )


@router.post("/export", response_model=ExportResponse)
async def export_schools(
    export_request: ExportRequest,
    db: Session = Depends(get_db)
):
    """Export schools data in various formats"""
    import uuid
    
    # Get schools based on filters or specific IDs
    if export_request.school_ids:
        # Export only selected schools
        schools = db.query(School).filter(School.id.in_(export_request.school_ids)).all()
    else:
        # Export based on filters
        query = db.query(School)
        
        if export_request.filters:
            if export_request.filters.query:
                search_term = export_request.filters.query
                query = query.filter(
                    or_(
                        School.name.ilike(f"%{search_term}%"),
                        School.city.ilike(f"%{search_term}%"),
                        School.school_type.ilike(f"%{search_term}%")
                    )
                )
            
            if export_request.filters.city:
                query = query.filter(School.city.ilike(f"%{export_request.filters.city}%"))
            
            if export_request.filters.school_type:
                query = query.filter(School.school_type == export_request.filters.school_type)

            if export_request.filters.state:
                query = query.filter(School.state.ilike(f"%{export_request.filters.state}%"))

            if export_request.filters.board:
                query = query.filter(School.board == export_request.filters.board)

            if export_request.filters.medium_of_instruction:
                query = query.filter(
                    School.medium_of_instruction == export_request.filters.medium_of_instruction
                )
        
        # Apply limit from filters or use default
        limit = export_request.filters.limit if export_request.filters else 1000
        schools = query.limit(limit).all()

        if export_request.filters and (
            export_request.filters.min_rating is not None
            or export_request.filters.max_rating is not None
        ):
            rating_service = RatingService(db)
            filtered_schools = []
            for school in schools:
                ratings = rating_service.calculate_school_ratings(school.id)
                average = ratings["overall_rating"] if ratings else None

                if export_request.filters.min_rating is not None:
                    if average is None or average < export_request.filters.min_rating:
                        continue

                if export_request.filters.max_rating is not None:
                    if average is None or average > export_request.filters.max_rating:
                        continue

                filtered_schools.append(school)

            schools = filtered_schools
    
    # Generate file ID and name
    file_id = str(uuid.uuid4())
    file_name = f"schools_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_request.format}"
    
    # Create exports directory if it doesn't exist
    exports_dir = "exports"
    os.makedirs(exports_dir, exist_ok=True)
    
    # Generate CSV file
    file_path = os.path.join(exports_dir, file_name)
    with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = [
            'id', 'name', 'address', 'city', 'state', 'zip_code', 'country',
            'phone', 'email', 'website', 'school_type', 'board', 'grade_levels',
            'enrollment', 'student_teacher_ratio', 'principal_name', 'established_year',
            'is_active', 'created_at', 'updated_at'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for school in schools:
            writer.writerow({
                'id': school.id,
                'name': school.name or '',
                'address': school.address or '',
                'city': school.city or '',
                'state': school.state or '',
                'zip_code': school.zip_code or '',
                'country': school.country or '',
                'phone': school.phone or '',
                'email': school.email or '',
                'website': school.website or '',
                'school_type': school.school_type or '',
                'board': school.board or '',
                'grade_levels': school.grade_levels or '',
                'enrollment': school.enrollment or '',
                'student_teacher_ratio': school.student_teacher_ratio or '',
                'principal_name': school.principal_name or '',
                'established_year': school.established_year or '',
                'is_active': school.is_active,
                'created_at': school.created_at.isoformat() if school.created_at else '',
                'updated_at': school.updated_at.isoformat() if school.updated_at else ''
            })
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    return ExportResponse(
        download_url=f"/api/v1/schools/download/{file_id}",
        file_name=file_name,
        file_size=file_size,
        expires_at=datetime.now() + timedelta(hours=24)
    )


@router.get("/download/{file_id}")
async def download_export(file_id: str):
    """Download exported schools data"""
    # Find the file by looking in exports directory
    exports_dir = "exports"
    if not os.path.exists(exports_dir):
        raise HTTPException(status_code=404, detail="Export file not found")
    
    # Find the most recent file (since we don't store file_id mapping)
    files = [f for f in os.listdir(exports_dir) if f.endswith('.csv')]
    if not files:
        raise HTTPException(status_code=404, detail="No export files found")
    
    # Get the most recent file
    latest_file = max(files, key=lambda x: os.path.getctime(os.path.join(exports_dir, x)))
    file_path = os.path.join(exports_dir, latest_file)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Export file not found")
    
    return FileResponse(
        path=file_path,
        filename=latest_file,
        media_type='text/csv'
    )

