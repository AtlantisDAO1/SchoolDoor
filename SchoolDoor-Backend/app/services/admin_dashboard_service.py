from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from datetime import datetime, timedelta
from app.models import School, Review, Rating, ScrapingJob
from app.models_admin import AdminActivityLog, AdminNotification, SystemLog
from app.schemas_admin import (
    AdminDashboardStats, AdminSchoolSummary, AdminReviewSummary,
    AdminScrapingJobSummary, AdminSchoolSearch, AdminReviewSearch,
    AdminActivitySearch
)
import logging

logger = logging.getLogger(__name__)


class AdminDashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_stats(self) -> AdminDashboardStats:
        """Get comprehensive dashboard statistics"""
        try:
            # Basic counts
            total_schools = self.db.query(School).count()
            total_reviews = self.db.query(Review).count()
            total_ratings = self.db.query(Rating).count()
            total_scraping_jobs = self.db.query(ScrapingJob).count()
            
            # Active scraping jobs
            active_scraping_jobs = self.db.query(ScrapingJob).filter(
                ScrapingJob.status.in_(["pending", "running"])
            ).count()
            
            # Recent activity (last 24 hours)
            recent_activity_count = self.db.query(AdminActivityLog).filter(
                AdminActivityLog.created_at >= datetime.utcnow() - timedelta(hours=24)
            ).count()
            
            # Unread notifications
            unread_notifications = self.db.query(AdminNotification).filter(
                AdminNotification.is_read == False
            ).count()
            
            # System health check
            system_health = self._check_system_health()
            
            return AdminDashboardStats(
                total_schools=total_schools,
                total_reviews=total_reviews,
                total_ratings=total_ratings,
                total_scraping_jobs=total_scraping_jobs,
                active_scraping_jobs=active_scraping_jobs,
                recent_activity_count=recent_activity_count,
                unread_notifications=unread_notifications,
                system_health=system_health
            )
            
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {e}")
            return AdminDashboardStats(
                total_schools=0, total_reviews=0, total_ratings=0,
                total_scraping_jobs=0, active_scraping_jobs=0,
                recent_activity_count=0, unread_notifications=0,
                system_health="error"
            )
    
    def _check_system_health(self) -> str:
        """Check system health based on recent errors and activity"""
        try:
            # Check for recent errors
            recent_errors = self.db.query(SystemLog).filter(
                and_(
                    SystemLog.level == "ERROR",
                    SystemLog.created_at >= datetime.utcnow() - timedelta(hours=1)
                )
            ).count()
            
            # Check for recent scraping failures
            recent_failures = self.db.query(ScrapingJob).filter(
                and_(
                    ScrapingJob.status == "failed",
                    ScrapingJob.created_at >= datetime.utcnow() - timedelta(hours=6)
                )
            ).count()
            
            if recent_errors > 10 or recent_failures > 3:
                return "error"
            elif recent_errors > 5 or recent_failures > 1:
                return "warning"
            else:
                return "healthy"
                
        except Exception as e:
            logger.error(f"Error checking system health: {e}")
            return "error"
    
    def get_schools_summary(self, search: AdminSchoolSearch) -> List[AdminSchoolSummary]:
        """Get schools summary for admin panel"""
        query = self.db.query(School)
        
        # Apply filters
        if search.query:
            query = query.filter(
                or_(
                    School.name.ilike(f"%{search.query}%"),
                    School.city.ilike(f"%{search.query}%"),
                    School.state.ilike(f"%{search.query}%")
                )
            )
        
        if search.city:
            query = query.filter(School.city.ilike(f"%{search.city}%"))
        
        if search.state:
            query = query.filter(School.state.ilike(f"%{search.state}%"))
        
        if search.school_type:
            query = query.filter(School.school_type.ilike(f"%{search.school_type}%"))
        
        if search.is_active is not None:
            query = query.filter(School.is_active == search.is_active)
        
        # Get schools with rating info
        schools = query.offset(search.offset).limit(search.limit).all()
        
        result = []
        for school in schools:
            # Get average rating
            avg_rating = self.db.query(func.avg(Review.overall_rating)).filter(
                Review.school_id == school.id
            ).scalar()
            
            # Get total reviews
            total_reviews = self.db.query(Review).filter(
                Review.school_id == school.id
            ).count()
            
            result.append(AdminSchoolSummary(
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
            ))
        
        # Apply rating filters
        if search.min_rating:
            result = [s for s in result if s.average_rating and s.average_rating >= search.min_rating]
        
        if search.max_rating:
            result = [s for s in result if s.average_rating and s.average_rating <= search.max_rating]
        
        return result
    
    def get_reviews_summary(self, search: AdminReviewSearch) -> List[AdminReviewSummary]:
        """Get reviews summary for admin panel"""
        query = self.db.query(Review).join(School, Review.school_id == School.id)
        
        # Apply filters
        if search.school_id:
            query = query.filter(Review.school_id == search.school_id)
        
        if search.min_rating:
            query = query.filter(Review.overall_rating >= search.min_rating)
        
        if search.max_rating:
            query = query.filter(Review.overall_rating <= search.max_rating)
        
        if search.is_verified is not None:
            query = query.filter(Review.is_verified == search.is_verified)
        
        if search.date_from:
            query = query.filter(Review.created_at >= search.date_from)
        
        if search.date_to:
            query = query.filter(Review.created_at <= search.date_to)
        
        reviews = query.order_by(desc(Review.created_at)).offset(search.offset).limit(search.limit).all()
        
        return [
            AdminReviewSummary(
                id=review.id,
                school_name=review.school.name,
                parent_name=review.parent_name,
                overall_rating=review.overall_rating,
                title=review.title,
                content=review.content,
                is_verified=review.is_verified,
                created_at=review.created_at
            )
            for review in reviews
        ]
    
    def get_scraping_jobs_summary(self, limit: int = 20, offset: int = 0) -> List[AdminScrapingJobSummary]:
        """Get scraping jobs summary for admin panel"""
        jobs = self.db.query(ScrapingJob).order_by(desc(ScrapingJob.created_at)).offset(offset).limit(limit).all()
        
        return [
            AdminScrapingJobSummary(
                id=job.id,
                region=job.region,
                status=job.status,
                schools_found=job.schools_found,
                schools_processed=job.schools_processed,
                schools_created=job.schools_created,
                created_at=job.created_at,
                completed_at=job.completed_at,
                error_message=job.error_message
            )
            for job in jobs
        ]
    
    def get_recent_activity(self, search: AdminActivitySearch) -> List[AdminActivityLog]:
        """Get recent admin activity"""
        query = self.db.query(AdminActivityLog).join(
            AdminUser, AdminActivityLog.admin_user_id == AdminUser.id
        )
        
        # Apply filters
        if search.admin_user_id:
            query = query.filter(AdminActivityLog.admin_user_id == search.admin_user_id)
        
        if search.action:
            query = query.filter(AdminActivityLog.action.ilike(f"%{search.action}%"))
        
        if search.resource_type:
            query = query.filter(AdminActivityLog.resource_type == search.resource_type)
        
        if search.date_from:
            query = query.filter(AdminActivityLog.created_at >= search.date_from)
        
        if search.date_to:
            query = query.filter(AdminActivityLog.created_at <= search.date_to)
        
        activities = query.order_by(desc(AdminActivityLog.created_at)).offset(search.offset).limit(search.limit).all()
        
        return activities
    
    def get_system_logs(self, level: Optional[str] = None, limit: int = 100) -> List[SystemLog]:
        """Get system logs for admin panel"""
        query = self.db.query(SystemLog)
        
        if level:
            query = query.filter(SystemLog.level == level)
        
        logs = query.order_by(desc(SystemLog.created_at)).limit(limit).all()
        return logs
    
    def get_notifications(self, unread_only: bool = False, limit: int = 50) -> List[AdminNotification]:
        """Get admin notifications"""
        query = self.db.query(AdminNotification)
        
        if unread_only:
            query = query.filter(AdminNotification.is_read == False)
        
        notifications = query.order_by(desc(AdminNotification.created_at)).limit(limit).all()
        return notifications
    
    def mark_notification_read(self, notification_id: int) -> AdminNotification:
        """Mark notification as read"""
        notification = self.db.query(AdminNotification).filter(
            AdminNotification.id == notification_id
        ).first()
        
        if not notification:
            raise ValueError("Notification not found")
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        self.db.commit()
        
        return notification
    
    def create_notification(
        self,
        title: str,
        message: str,
        notification_type: str = "info",
        is_important: bool = False,
        resource_type: Optional[str] = None,
        resource_id: Optional[int] = None
    ) -> AdminNotification:
        """Create new admin notification"""
        notification = AdminNotification(
            title=title,
            message=message,
            notification_type=notification_type,
            is_important=is_important,
            resource_type=resource_type,
            resource_id=resource_id
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
