from fastapi import HTTPException, status, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models_api_key import APIKey
from app.models_admin import AdminUser
from app.services.api_key_service import APIKeyService
from app.services.admin_auth_service import AdminAuthService
from typing import Optional, Union

async def get_api_key_user(
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[APIKey]:
    """Get API key from header, returns None if no key provided"""
    if not x_api_key:
        return None
    
    api_key_service = APIKeyService(db)
    api_key_obj = api_key_service.validate_api_key(x_api_key)
    
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    return api_key_obj

async def require_api_key(
    x_api_key: str = Header(..., description="API Key for authentication"),
    db: Session = Depends(get_db)
) -> APIKey:
    """Require API key authentication"""
    api_key_service = APIKeyService(db)
    api_key_obj = api_key_service.validate_api_key(x_api_key)
    
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    return api_key_obj

async def require_api_key_with_usage_tracking(
    request: Request,
    x_api_key: str = Header(..., description="API Key for authentication"),
    db: Session = Depends(get_db)
) -> APIKey:
    """Require API key authentication and track usage"""
    api_key_service = APIKeyService(db)
    api_key_obj = api_key_service.validate_api_key(x_api_key)
    
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    # Record usage
    api_key_service.record_usage(
        api_key_obj=api_key_obj,
        endpoint=str(request.url.path),
        method=request.method,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return api_key_obj

# Security scheme for JWT
security = HTTPBearer(auto_error=False)

async def get_jwt_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[AdminUser]:
    """Get JWT user from Authorization header, returns None if no token provided"""
    if not credentials:
        return None
    
    auth_service = AdminAuthService(db)
    try:
        return auth_service.get_current_admin(credentials)
    except HTTPException:
        return None

async def flexible_auth(
    request: Request,
    x_api_key: Optional[str] = Header(None, description="API Key for authentication"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Union[APIKey, AdminUser]:
    """Flexible authentication: accepts either API key or JWT token"""
    
    # Try API key first
    if x_api_key:
        api_key_service = APIKeyService(db)
        api_key_obj = api_key_service.validate_api_key(x_api_key)
        
        if api_key_obj:
            # Record usage for API key
            api_key_service.record_usage(
                api_key_obj=api_key_obj,
                endpoint=str(request.url.path),
                method=request.method,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
            return api_key_obj
    
    # Try JWT token
    if credentials:
        auth_service = AdminAuthService(db)
        try:
            admin_user = auth_service.get_current_admin(credentials)
            return admin_user
        except HTTPException:
            pass
    
    # Neither authentication method worked
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Provide either API key (X-API-Key header) or JWT token (Authorization: Bearer header)"
    )

async def flexible_auth_with_usage_tracking(
    request: Request,
    x_api_key: Optional[str] = Header(None, description="API Key for authentication"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Union[APIKey, AdminUser]:
    """Flexible authentication with usage tracking: accepts either API key or JWT token"""
    return await flexible_auth(request, x_api_key, credentials, db)

async def optional_auth_with_usage_tracking(
    request: Request,
    x_api_key: Optional[str] = Header(None, description="API Key for authentication (optional)"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[Union[APIKey, AdminUser]]:
    """Optional authentication with usage tracking: allows unauthenticated requests but tracks usage if API key provided"""
    
    # Try API key first
    if x_api_key:
        api_key_service = APIKeyService(db)
        api_key_obj = api_key_service.validate_api_key(x_api_key)
        
        if api_key_obj:
            # Record usage for API key
            api_key_service.record_usage(
                api_key_obj=api_key_obj,
                endpoint=str(request.url.path),
                method=request.method,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
            return api_key_obj
    
    # Try JWT token
    if credentials:
        auth_service = AdminAuthService(db)
        try:
            admin_user = auth_service.get_current_admin(credentials)
            return admin_user
        except HTTPException:
            pass
    
    # No authentication provided - return None (allow public access)
    return None
