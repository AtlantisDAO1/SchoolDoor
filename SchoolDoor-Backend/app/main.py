from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.models import Base
from app.api import schools, reviews, scraping, admin, api_keys, members
from app.config import settings
from app.services.migration_service import migration_service

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SchoolDoor API",
    description="A comprehensive API for school data scraping, rating, and review management",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)




# Initialize database with migrations
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    logger.info("Starting SchoolDoor API...")
    
    # Run database migrations
    if migration_service.initialize_database():
        logger.info("Database initialized successfully")
    else:
        logger.error("Failed to initialize database")
        raise Exception("Database initialization failed")
    
    # Log migration status
    status = migration_service.get_migration_status()
    logger.info(f"Migration status: {status}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(schools.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(scraping.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(api_keys.router, prefix="/api/v1")
app.include_router(members.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    response = {
        "message": "Welcome to SchoolDoor API",
        "version": "1.0.0",
        "description": "A comprehensive API for school data scraping, rating, and review management",
        "admin_panel": "https://admin.schooldoor.in"
    }
    
    # Only include docs links in debug mode
    if settings.debug:
        response.update({
            "docs": "/docs",
            "redoc": "/redoc"
        })
    
    return response


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "SchoolDoor API"}




@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("SchoolDoor API is starting up...")
    
    # Initialize default rating categories
    db = next(get_db())
    try:
        from app.services.rating_service import RatingService
        rating_service = RatingService(db)
        
        # Check if rating categories exist, if not create default ones
        categories = rating_service.get_rating_categories()
        if not categories:
            default_categories = [
                ("Academic Quality", "Overall academic excellence and curriculum quality", 1.2),
                ("Teacher Quality", "Quality of teaching staff and instruction", 1.1),
                ("Facilities", "School facilities, equipment, and infrastructure", 0.9),
                ("Safety", "School safety and security measures", 1.0),
                ("Extracurriculars", "Sports, clubs, and extracurricular activities", 0.8),
                ("Communication", "Parent-teacher communication and transparency", 0.9),
                ("Diversity", "Student and staff diversity", 0.7),
                ("Technology", "Technology integration and resources", 0.8)
            ]
            
            for name, description, weight in default_categories:
                rating_service.create_rating_category(name, description, weight)
            
            logger.info("Default rating categories created")
        
    except Exception as e:
        logger.error(f"Error initializing rating categories: {e}")
    finally:
        db.close()


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("SchoolDoor API is shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
