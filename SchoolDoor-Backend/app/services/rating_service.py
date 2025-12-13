from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models import School, Rating, RatingCategory, Review
from app.schemas import ReviewCreate, RatingCreate
import logging

"""
Service for managing school ratings and reviews.
Handles calculation of weighted ratings, generating trends,
and improved comparison logic for schools.
"""

logger = logging.getLogger(__name__)


class RatingService:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_school_ratings(self, school_id: int) -> Dict[str, Any]:
        """Calculate comprehensive ratings for a school"""
        school = self.db.query(School).filter(School.id == school_id).first()
        if not school:
            return None
        
        # Get all rating categories
        categories = self.db.query(RatingCategory).filter(RatingCategory.is_active == True).all()
        
        # Calculate average ratings by category
        ratings_by_category = {}
        for category in categories:
            avg_rating = self.db.query(func.avg(Rating.rating_value)).filter(
                and_(
                    Rating.school_id == school_id,
                    Rating.category_id == category.id
                )
            ).scalar()
            
            if avg_rating:
                ratings_by_category[category.name] = round(float(avg_rating), 2)
        
        # Calculate overall weighted average
        total_weighted_rating = 0
        total_weight = 0
        
        for category in categories:
            if category.name in ratings_by_category:
                total_weighted_rating += ratings_by_category[category.name] * category.weight
                total_weight += category.weight
        
        overall_rating = round(total_weighted_rating / total_weight, 2) if total_weight > 0 else 0
        
        # Get review statistics
        total_reviews = self.db.query(Review).filter(Review.school_id == school_id).count()
        
        # Get rating distribution
        rating_distribution = self.db.query(
            Review.overall_rating,
            func.count(Review.id).label('count')
        ).filter(Review.school_id == school_id).group_by(Review.overall_rating).all()
        
        distribution = {str(rating): count for rating, count in rating_distribution}
        
        return {
            "school_id": school_id,
            "school_name": school.name,
            "overall_rating": overall_rating,
            "ratings_by_category": ratings_by_category,
            "total_reviews": total_reviews,
            "rating_distribution": distribution,
            "categories_rated": len(ratings_by_category)
        }
    
    def get_school_rankings(self, limit: int = 10, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get top-rated schools, optionally filtered by category"""
        query = self.db.query(
            School.id,
            School.name,
            School.city,
            School.state,
            func.avg(Review.overall_rating).label('avg_rating'),
            func.count(Review.id).label('review_count')
        ).join(Review, School.id == Review.school_id)
        
        if category:
            # Filter by specific rating category
            category_obj = self.db.query(RatingCategory).filter(
                and_(
                    RatingCategory.name == category,
                    RatingCategory.is_active == True
                )
            ).first()
            
            if category_obj:
                query = query.join(Rating, School.id == Rating.school_id).filter(
                    Rating.category_id == category_obj.id
                )
        
        results = query.group_by(School.id, School.name, School.city, School.state)\
                      .having(func.count(Review.id) >= 1)\
                      .order_by(func.avg(Review.overall_rating).desc())\
                      .limit(limit).all()
        
        return [
            {
                "school_id": result.id,
                "school_name": result.name,
                "city": result.city,
                "state": result.state,
                "average_rating": round(float(result.avg_rating), 2),
                "review_count": result.review_count
            }
            for result in results
        ]
    
    def get_school_comparison(self, school_ids: List[int]) -> Dict[str, Any]:
        """Compare multiple schools side by side"""
        schools = self.db.query(School).filter(School.id.in_(school_ids)).all()
        if not schools:
            return {}
        
        comparison_data = {}
        
        for school in schools:
            ratings = self.calculate_school_ratings(school.id)
            if ratings:
                comparison_data[school.name] = {
                    "school_id": school.id,
                    "overall_rating": ratings["overall_rating"],
                    "total_reviews": ratings["total_reviews"],
                    "ratings_by_category": ratings["ratings_by_category"],
                    "city": school.city,
                    "state": school.state,
                    "school_type": school.school_type,
                    "enrollment": school.enrollment
                }
        
        return comparison_data
    
    def get_rating_trends(self, school_id: int, months: int = 12) -> Dict[str, Any]:
        """Get rating trends over time for a school"""
        # This would require adding a date field to reviews
        # For now, return basic trend data
        recent_reviews = self.db.query(Review).filter(
            Review.school_id == school_id
        ).order_by(Review.created_at.desc()).limit(50).all()
        
        if not recent_reviews:
            return {"trend": "stable", "recent_rating": 0, "review_count": 0}
        
        recent_rating = sum(review.overall_rating for review in recent_reviews) / len(recent_reviews)
        
        # Simple trend calculation
        if len(recent_reviews) >= 10:
            older_reviews = recent_reviews[10:]
            older_rating = sum(review.overall_rating for review in older_reviews) / len(older_reviews)
            
            if recent_rating > older_rating + 0.2:
                trend = "improving"
            elif recent_rating < older_rating - 0.2:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "trend": trend,
            "recent_rating": round(recent_rating, 2),
            "review_count": len(recent_reviews)
        }
    
    def create_review(self, review_data: ReviewCreate, member_id: Optional[int] = None) -> Review:
        """Create a new review for a school"""
        # Validate school exists
        school = self.db.query(School).filter(School.id == review_data.school_id).first()
        if not school:
            raise ValueError("School not found")
        
        # Create review data dict
        review_dict = review_data.dict()
        
        # Set member_id if provided
        if member_id:
            review_dict["member_id"] = member_id
        
        # Set default status if not provided
        if "status" not in review_dict or review_dict["status"] is None:
            review_dict["status"] = "pending"
        
        # Create review
        review = Review(**review_dict)
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        return review
    
    def create_rating(self, rating_data: RatingCreate) -> Rating:
        """Create a new rating for a school"""
        # Validate school and category exist
        school = self.db.query(School).filter(School.id == rating_data.school_id).first()
        category = self.db.query(RatingCategory).filter(RatingCategory.id == rating_data.category_id).first()
        
        if not school:
            raise ValueError("School not found")
        if not category:
            raise ValueError("Rating category not found")
        
        # Create rating
        rating = Rating(**rating_data.dict())
        self.db.add(rating)
        self.db.commit()
        self.db.refresh(rating)
        
        return rating
    
    def get_school_reviews(self, school_id: int, limit: int = 20, offset: int = 0, status: Optional[str] = None) -> List[Review]:
        """Get reviews for a specific school, optionally filtered by status"""
        query = self.db.query(Review).filter(Review.school_id == school_id)
        if status:
            query = query.filter(Review.status == status)
        return query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()
    
    def get_rating_categories(self) -> List[RatingCategory]:
        """Get all active rating categories"""
        return self.db.query(RatingCategory).filter(RatingCategory.is_active == True).all()
    
    def create_rating_category(self, name: str, description: str = None, weight: float = 1.0) -> RatingCategory:
        """Create a new rating category"""
        category = RatingCategory(
            name=name,
            description=description,
            weight=weight
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        
        return category
