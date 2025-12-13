"""
API endpoints for managing and monitoring school scraping jobs.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ScrapingJob
from app.schemas import ScrapingJob as ScrapingJobSchema, ScrapingJobCreate
from app.services.scraping_service import scraping_service
import asyncio

router = APIRouter(prefix="/scraping", tags=["scraping"])


@router.post("/start", response_model=ScrapingJobSchema)
async def start_scraping_job(
    job_data: ScrapingJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a new school scraping job for a region"""
    # Create scraping job record
    job = ScrapingJob(region=job_data.region)
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Start background task
    background_tasks.add_task(run_scraping_job, job.id)
    
    return job


@router.get("/jobs", response_model=List[ScrapingJobSchema])
async def get_scraping_jobs(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get all scraping jobs with pagination"""
    jobs = db.query(ScrapingJob).order_by(ScrapingJob.created_at.desc())\
                                .offset(offset).limit(limit).all()
    return jobs


@router.get("/jobs/{job_id}", response_model=ScrapingJobSchema)
async def get_scraping_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific scraping job by ID"""
    job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Scraping job not found")
    
    return job


@router.delete("/jobs/{job_id}")
async def delete_scraping_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a scraping job"""
    job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Scraping job not found")
    
    db.delete(job)
    db.commit()
    
    return {"message": "Scraping job deleted successfully"}


@router.post("/jobs/{job_id}/retry")
async def retry_scraping_job(
    job_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Retry a failed scraping job"""
    job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Scraping job not found")
    
    if job.status not in ["failed", "completed"]:
        raise HTTPException(
            status_code=400, 
            detail="Can only retry failed or completed jobs"
        )
    
    # Reset job status
    job.status = "pending"
    job.error_message = None
    job.schools_found = 0
    job.schools_processed = 0
    job.completed_at = None
    db.commit()
    
    # Start background task
    background_tasks.add_task(run_scraping_job, job.id)
    
    return {"message": "Scraping job restarted"}


async def run_scraping_job(job_id: int):
    """Background task to run scraping job"""
    try:
        # Get the job to retrieve the region
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()
            if not job:
                return {"status": "failed", "error": "Job not found"}
            
            region = job.region
            result = await scraping_service.scrape_schools_in_region(
                region=region,
                job_id=job_id
            )
            return result
        finally:
            db.close()
    except Exception as e:
        # Error handling is done in the scraping service
        pass


@router.get("/status/overview")
async def get_scraping_status(db: Session = Depends(get_db)):
    """Get overview of scraping jobs status"""
    from sqlalchemy import func
    
    total_jobs = db.query(ScrapingJob).count()
    
    jobs_by_status = db.query(
        ScrapingJob.status,
        func.count(ScrapingJob.id).label('count')
    ).group_by(ScrapingJob.status).all()
    
    status_counts = {status: count for status, count in jobs_by_status}
    
    total_schools_found = db.query(func.sum(ScrapingJob.schools_found)).scalar() or 0
    total_schools_processed = db.query(func.sum(ScrapingJob.schools_processed)).scalar() or 0
    
    recent_jobs = db.query(ScrapingJob).order_by(ScrapingJob.created_at.desc()).limit(5).all()
    
    return {
        "total_jobs": total_jobs,
        "jobs_by_status": status_counts,
        "total_schools_found": total_schools_found,
        "total_schools_processed": total_schools_processed,
        "recent_jobs": recent_jobs
    }
