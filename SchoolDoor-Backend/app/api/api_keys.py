"""
API endpoints for managing API keys for external access to the SchoolDoor API.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models_api_key import APIKey
from app.services.api_key_service import APIKeyService
from app.services.admin_auth_service import get_current_admin
from app.models_admin import AdminUser
from app.models_admin import AdminUser
from datetime import datetime
from app.schemas import (
    APIKeyCreate, 
    APIKeyResponse, 
    APIKeyGenerateResponse, 
    APIKeyStatsResponse
)

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


# API Key Management (Admin only)
@router.post("/generate", response_model=APIKeyGenerateResponse)
async def generate_api_key(
    key_data: APIKeyCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Generate a new API key"""
    api_key_service = APIKeyService(db)
    
    api_key = api_key_service.generate_api_key(
        name=key_data.name,
        description=key_data.description,
        expires_days=key_data.expires_days,
        created_by_admin_id=admin.id
    )
    
    return APIKeyGenerateResponse(
        api_key=api_key,
        name=key_data.name,
        description=key_data.description,
        expires_days=key_data.expires_days,
        message="API key generated successfully. Store it securely as it won't be shown again."
    )

@router.get("", response_model=List[APIKeyResponse])
@router.get("/", response_model=List[APIKeyResponse])
async def list_api_keys(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """List all API keys"""
    api_key_service = APIKeyService(db)
    api_keys = api_key_service.list_api_keys(limit=limit, offset=offset)
    
    return [
        APIKeyResponse(
            id=key.id,
            name=key.name,
            description=key.description,
            is_active=key.is_active,
            created_at=key.created_at,
            expires_at=key.expires_at,
            last_used_at=key.last_used_at,
            usage_count=key.usage_count,
            created_by_admin_id=key.created_by_admin_id
        ) for key in api_keys
    ]

@router.get("/{key_id}", response_model=APIKeyResponse)
async def get_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get specific API key details"""
    api_key_service = APIKeyService(db)
    api_key = api_key_service.get_api_key_by_id(key_id)
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        description=api_key.description,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        expires_at=api_key.expires_at,
        last_used_at=api_key.last_used_at,
        usage_count=api_key.usage_count,
        created_by_admin_id=api_key.created_by_admin_id
    )

@router.get("/{key_id}/stats", response_model=APIKeyStatsResponse)
async def get_api_key_stats(
    key_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get API key usage statistics"""
    api_key_service = APIKeyService(db)
    stats = api_key_service.get_api_key_stats(key_id)
    
    if not stats:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return APIKeyStatsResponse(**stats)

@router.post("/{key_id}/deactivate")
async def deactivate_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Deactivate an API key"""
    api_key_service = APIKeyService(db)
    success = api_key_service.deactivate_api_key(key_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key deactivated successfully"}

@router.post("/{key_id}/activate")
async def activate_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Activate an API key"""
    api_key_service = APIKeyService(db)
    api_key = api_key_service.get_api_key_by_id(key_id)
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    api_key.is_active = True
    db.commit()
    
    return {"message": "API key activated successfully"}

@router.delete("/{key_id}")
async def delete_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Permanently delete an API key"""
    api_key_service = APIKeyService(db)
    success = api_key_service.delete_api_key(key_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key deleted successfully"}

@router.get("/{key_id}/usage")
async def get_api_key_usage(
    key_id: int,
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get usage history for a specific API key"""
    api_key_service = APIKeyService(db)
    usage = api_key_service.get_api_key_usage(key_id, limit)
    return usage

@router.get("/stats/overview")
async def get_overview_stats(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    """Get overall API key statistics"""
    api_key_service = APIKeyService(db)
    stats = api_key_service.get_all_stats()
    return stats
