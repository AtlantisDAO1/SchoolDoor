"""
API endpoints for administrative tasks, including user management, content moderation, and dashboard stats.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models_admin import AdminUser
from app.schemas_admin import (
    AdminUser as AdminUserSchema, AdminUserCreate, AdminUserUpdate,
    AdminLogin, AdminToken, AdminDashboardStats, AdminSchoolSummary,
    AdminReviewSummary, AdminScrapingJobSummary, AdminActivityLog,
    AdminNotification, AdminNotificationCreate, AdminSchoolSearch,
    AdminReviewSearch, AdminActivitySearch, SystemLog
)
from app.services.admin_auth_service import AdminAuthService, get_current_admin, require_superuser
from app.services.admin_dashboard_service import AdminDashboardService
from app.services.rating_service import RatingService
from app.services.migration_service import migration_service
from app.services.api_key_service import APIKeyService
from app.models import School, Review
from app.models_school_request import SchoolRequest
from app.schemas_school_request import (
    SchoolRequest as SchoolRequestSchema,
    SchoolRequestWithDetails
)
from sqlalchemy import func, desc
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["admin"])


# Authentication endpoints
@router.get("/me", response_model=AdminUserSchema)
async def get_current_user_info(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get current admin user information"""
    return AdminUserSchema.from_orm(current_admin)


@router.post("/login", response_model=AdminToken)
async def admin_login(
    login_data: AdminLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """Admin login endpoint"""
    auth_service = AdminAuthService(db)
    
    # Authenticate admin
    admin = auth_service.authenticate_admin(login_data.username, login_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = auth_service.create_access_token(
        data={
            "sub": admin.username,
            "admin_user_id": admin.id,
            "is_superuser": admin.is_superuser
        },
        expires_delta=access_token_expires
    )
    
    # Log login activity
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="login",
        resource_type="admin",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    
    return AdminToken(
        access_token=access_token,
        token_type="bearer",
        expires_in=1800,  # 30 minutes
        admin_user=admin
    )


@router.get("/me", response_model=AdminUserSchema)
async def get_current_admin_info(admin: AdminUser = Depends(get_current_admin)):
    """Get current admin user information"""
    return admin


# Dashboard endpoints
@router.get("/dashboard/stats", response_model=AdminDashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get dashboard statistics"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_dashboard_stats()


@router.get("/dashboard/schools", response_model=List[AdminSchoolSummary])
async def get_dashboard_schools(
    search: AdminSchoolSearch = Depends(),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get schools summary for admin dashboard"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_schools_summary(search)


@router.get("/dashboard/reviews", response_model=List[AdminReviewSummary])
async def get_dashboard_reviews(
    search: AdminReviewSearch = Depends(),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get reviews summary for admin dashboard"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_reviews_summary(search)


@router.get("/dashboard/scraping-jobs", response_model=List[AdminScrapingJobSummary])
async def get_dashboard_scraping_jobs(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get scraping jobs summary for admin dashboard"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_scraping_jobs_summary(limit, offset)


@router.get("/dashboard/activity", response_model=List[AdminActivityLog])
async def get_dashboard_activity(
    search: AdminActivitySearch = Depends(),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get recent admin activity"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_recent_activity(search)


# School management endpoints
@router.get("/schools/{school_id}", response_model=AdminSchoolSummary)
async def get_admin_school(
    school_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get detailed school information for admin"""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Get rating info
    avg_rating = db.query(func.avg(Review.overall_rating)).filter(
        Review.school_id == school.id
    ).scalar()
    
    total_reviews = db.query(Review).filter(Review.school_id == school.id).count()
    
    return AdminSchoolSummary(
        id=school.id,
        name=school.name,
        city=school.city,
        state=school.state,
        school_type=school.school_type,
        average_rating=round(float(avg_rating), 2) if avg_rating else None,
        total_reviews=total_reviews,
        last_scraped_at=school.last_scraped_at,
        created_at=school.created_at,
        is_active=school.is_active
    )


@router.put("/schools/{school_id}/toggle-active")
async def toggle_school_active(
    school_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Toggle school active status"""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    school.is_active = not school.is_active
    db.commit()
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="toggle_active",
        resource_type="school",
        resource_id=school_id,
        description=f"Set school {school.name} active status to {school.is_active}"
    )
    
    return {"message": f"School {school.name} active status set to {school.is_active}"}


# Review management endpoints
@router.get("/reviews/{review_id}", response_model=AdminReviewSummary)
async def get_admin_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get detailed review information for admin"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return AdminReviewSummary(
        id=review.id,
        school_name=review.school.name,
        parent_name=review.parent_name,
        overall_rating=review.overall_rating,
        title=review.title,
        content=review.content,
        is_verified=review.is_verified,
        created_at=review.created_at
    )


@router.put("/reviews/{review_id}/approve")
async def approve_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Approve a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.status = "approved"
    review.is_verified = True
    db.commit()
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="approve_review",
        resource_type="review",
        resource_id=review_id,
        description=f"Approved review for {review.school.name}"
    )
    
    return {"message": "Review approved successfully"}


@router.put("/reviews/{review_id}/reject")
async def reject_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Reject a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.status = "rejected"
    db.commit()
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="reject_review",
        resource_type="review",
        resource_id=review_id,
        description=f"Rejected review for {review.school.name}"
    )
    
    return {"message": "Review rejected successfully"}


@router.put("/reviews/{review_id}/verify")
async def verify_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Verify a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_verified = True
    db.commit()
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="verify_review",
        resource_type="review",
        resource_id=review_id,
        description=f"Verified review for {review.school.name}"
    )
    
    return {"message": "Review verified successfully"}


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Delete a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    school_name = review.school.name
    db.delete(review)
    db.commit()
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="delete_review",
        resource_type="review",
        resource_id=review_id,
        description=f"Deleted review for {school_name}"
    )
    
    return {"message": "Review deleted successfully"}


# School Request Management endpoints
@router.get("/school-requests", response_model=List[SchoolRequestSchema])
async def get_school_requests(
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get all school requests"""
    query = db.query(SchoolRequest)
    
    if status_filter:
        query = query.filter(SchoolRequest.status == status_filter)
    
    requests = query.order_by(desc(SchoolRequest.created_at)).offset(offset).limit(limit).all()
    
    return requests


@router.get("/school-requests/{request_id}", response_model=SchoolRequestSchema)
async def get_school_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get a specific school request"""
    request = db.query(SchoolRequest).filter(SchoolRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="School request not found")
    
    return request


@router.put("/school-requests/{request_id}/approve")
async def approve_school_request(
    request_id: int,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Approve a school request and create the school"""
    school_request = db.query(SchoolRequest).filter(SchoolRequest.id == request_id).first()
    if not school_request:
        raise HTTPException(status_code=404, detail="School request not found")
    
    if school_request.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"School request is already {school_request.status}"
        )
    
    # Check if school with same name and city already exists
    existing_school = db.query(School).filter(
        School.name == school_request.name,
        School.city == school_request.city
    ).first()
    
    if existing_school:
        # Mark request as rejected with note
        school_request.status = "rejected"
        school_request.admin_notes = f"Rejected: School already exists (ID: {existing_school.id}). " + (admin_notes or "")
        school_request.reviewed_by = admin.id
        school_request.reviewed_at = datetime.utcnow()
        db.commit()
        
        raise HTTPException(
            status_code=400,
            detail=f"School with name '{school_request.name}' in {school_request.city} already exists"
        )
    
    # Create the school from the request
    from app.schemas import SchoolCreate
    school_data = SchoolCreate(
        name=school_request.name,
        address=school_request.address,
        city=school_request.city,
        state=school_request.state,
        zip_code=school_request.zip_code,
        country=school_request.country,
        phone=school_request.phone,
        email=school_request.email,
        website=school_request.website,
        school_type=school_request.school_type,
        board=school_request.board,
        grade_levels=school_request.grade_levels,
        enrollment=school_request.enrollment,
        student_teacher_ratio=school_request.student_teacher_ratio,
        medium_of_instruction=school_request.medium_of_instruction,
        principal_name=school_request.principal_name,
        established_year=school_request.established_year,
        board_exam_results=school_request.board_exam_results,
        competitive_exam_results=school_request.competitive_exam_results,
        programs=school_request.programs,
        facilities=school_request.facilities
    )
    
    new_school = School(**school_data.dict() if hasattr(school_data, 'dict') else school_data.model_dump())
    new_school.is_active = True
    db.add(new_school)
    
    # Update request status
    school_request.status = "approved"
    school_request.admin_notes = admin_notes
    school_request.reviewed_by = admin.id
    school_request.reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(new_school)
    db.refresh(school_request)
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="approve_school_request",
        resource_type="school_request",
        resource_id=request_id,
        description=f"Approved school request: {school_request.name} (Created School ID: {new_school.id})"
    )
    
    return {
        "message": "School request approved and school created successfully",
        "school_id": new_school.id,
        "school_name": new_school.name
    }


@router.put("/school-requests/{request_id}/reject")
async def reject_school_request(
    request_id: int,
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Reject a school request"""
    school_request = db.query(SchoolRequest).filter(SchoolRequest.id == request_id).first()
    if not school_request:
        raise HTTPException(status_code=404, detail="School request not found")
    
    if school_request.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"School request is already {school_request.status}"
        )
    
    school_request.status = "rejected"
    school_request.admin_notes = admin_notes
    school_request.reviewed_by = admin.id
    school_request.reviewed_at = datetime.utcnow()
    db.commit()
    
    # Log activity
    auth_service = AdminAuthService(db)
    auth_service.log_admin_activity(
        admin_user_id=admin.id,
        action="reject_school_request",
        resource_type="school_request",
        resource_id=request_id,
        description=f"Rejected school request: {school_request.name}"
    )
    
    return {"message": "School request rejected successfully"}


# System management endpoints
@router.get("/logs", response_model=List[SystemLog])
async def get_system_logs(
    level: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get system logs"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_system_logs(level, limit)


@router.get("/notifications", response_model=List[AdminNotification])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get admin notifications"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.get_notifications(unread_only, limit)


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Mark notification as read"""
    dashboard_service = AdminDashboardService(db)
    return dashboard_service.mark_notification_read(notification_id)


# Admin user management (superuser only)
@router.post("/users", response_model=AdminUserSchema)
async def create_admin_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_superuser)
):
    """Create new admin user (superuser only)"""
    auth_service = AdminAuthService(db)
    return auth_service.create_admin_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        is_superuser=user_data.is_superuser
    )


@router.get("/users", response_model=List[AdminUserSchema])
async def get_admin_users(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_superuser)
):
    """Get all admin users (superuser only)"""
    return db.query(AdminUser).all()


@router.put("/users/{user_id}", response_model=AdminUserSchema)
async def update_admin_user(
    user_id: int,
    user_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_superuser)
):
    """Update admin user (superuser only)"""
    auth_service = AdminAuthService(db)
    return auth_service.update_admin_user(user_id, **user_data.dict(exclude_unset=True))


@router.delete("/users/{user_id}")
async def deactivate_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_superuser)
):
    """Deactivate admin user (superuser only)"""
    auth_service = AdminAuthService(db)
    return auth_service.deactivate_admin_user(user_id)


@router.get("/migration/status")
async def get_migration_status(
    admin: AdminUser = Depends(require_superuser)
):
    """Get database migration status (superuser only)"""
    return migration_service.get_migration_status()


@router.post("/migration/run")
async def run_migrations(
    admin: AdminUser = Depends(require_superuser)
):
    """Run database migrations (superuser only)"""
    success = migration_service.run_migrations()
    if success:
        return {"message": "Migrations completed successfully"}
    else:
        raise HTTPException(
            status_code=500,
            detail="Migration failed. Check logs for details."
        )


# API Key Management
@router.post("/api-keys/generate")
async def generate_api_key(
    name: str,
    expires_days: int = 365,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Generate a new API key for the current admin user"""
    api_key_service = APIKeyService(db)
    api_key = api_key_service.generate_api_key(admin.id, name, expires_days)
    
    return {
        "api_key": api_key,
        "name": name,
        "expires_days": expires_days,
        "message": "API key generated successfully. Store it securely as it won't be shown again."
    }

@router.get("/api-keys/info")
async def get_api_key_info(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get current admin's API key information"""
    api_key_service = APIKeyService(db)
    info = api_key_service.get_api_key_info(admin.id)
    
    if not info:
        return {"message": "No API key found"}
    
    return info

@router.delete("/api-keys/revoke")
async def revoke_api_key(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Revoke the current admin's API key"""
    api_key_service = APIKeyService(db)
    success = api_key_service.revoke_api_key(admin.id)
    
    if success:
        return {"message": "API key revoked successfully"}
    else:
        return {"message": "No API key found to revoke"}
