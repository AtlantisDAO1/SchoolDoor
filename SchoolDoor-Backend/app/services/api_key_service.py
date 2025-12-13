from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models_api_key import APIKey, APIKeyUsage
from app.schemas import APIKeyCreate
import logging

"""
Service for managing API keys for external access.
Handles key generation, validation, revocation, and usage tracking.
"""
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import func, desc

class APIKeyService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_api_key(
        self, 
        name: str, 
        description: str = None,
        expires_days: int = None,
        created_by_admin_id: int = None
    ) -> str:
        """Generate a new standalone API key"""
        # Generate a secure random key
        raw_key = secrets.token_urlsafe(32)
        
        # Hash the key for storage
        hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
        
        # Calculate expiration date
        expires_at = None
        if expires_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_days)
        
        # Create API key record
        api_key = APIKey(
            name=name,
            key_hash=hashed_key,
            description=description,
            is_active=True,
            expires_at=expires_at,
            created_by_admin_id=created_by_admin_id
        )
        
        self.db.add(api_key)
        self.db.commit()
        self.db.refresh(api_key)
        
        return raw_key
    
    def validate_api_key(self, api_key: str) -> Optional[APIKey]:
        """Validate an API key and return the API key object"""
        if not api_key:
            return None
        
        # Hash the provided key
        hashed_key = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Find API key with matching hash
        api_key_obj = self.db.query(APIKey).filter(
            APIKey.key_hash == hashed_key,
            APIKey.is_active == True
        ).first()
        
        # Check if expired
        if api_key_obj and api_key_obj.expires_at and api_key_obj.expires_at < datetime.utcnow():
            return None
        
        return api_key_obj
    
    def record_usage(
        self, 
        api_key_obj: APIKey, 
        endpoint: str, 
        method: str, 
        ip_address: str = None,
        user_agent: str = None,
        response_status: int = None
    ):
        """Record API key usage"""
        # Update last used and usage count
        api_key_obj.last_used_at = datetime.utcnow()
        api_key_obj.usage_count += 1
        
        # Create usage record
        usage = APIKeyUsage(
            api_key_id=api_key_obj.id,
            endpoint=endpoint,
            method=method,
            ip_address=ip_address,
            user_agent=user_agent,
            response_status=response_status
        )
        
        self.db.add(usage)
        self.db.commit()
    
    def list_api_keys(self, limit: int = 50, offset: int = 0) -> List[APIKey]:
        """List all API keys"""
        return self.db.query(APIKey).order_by(desc(APIKey.created_at)).offset(offset).limit(limit).all()
    
    def get_api_key_by_id(self, key_id: int) -> Optional[APIKey]:
        """Get API key by ID"""
        return self.db.query(APIKey).filter(APIKey.id == key_id).first()
    
    def deactivate_api_key(self, key_id: int) -> bool:
        """Deactivate an API key"""
        api_key = self.get_api_key_by_id(key_id)
        if not api_key:
            return False
        
        api_key.is_active = False
        self.db.commit()
        return True
    
    def delete_api_key(self, key_id: int) -> bool:
        """Permanently delete an API key"""
        api_key = self.get_api_key_by_id(key_id)
        if not api_key:
            return False
        
        # Delete usage records first
        self.db.query(APIKeyUsage).filter(APIKeyUsage.api_key_id == key_id).delete()
        
        # Delete the API key
        self.db.delete(api_key)
        self.db.commit()
        return True
    
    def get_api_key_stats(self, key_id: int) -> Dict[str, Any]:
        """Get usage statistics for an API key"""
        api_key = self.get_api_key_by_id(key_id)
        if not api_key:
            return {}
        
        # Get basic usage stats
        total_requests = self.db.query(func.count(APIKeyUsage.id)).filter(APIKeyUsage.api_key_id == key_id).scalar() or 0
        successful_requests = self.db.query(func.count(APIKeyUsage.id)).filter(
            APIKeyUsage.api_key_id == key_id,
            APIKeyUsage.response_status >= 200,
            APIKeyUsage.response_status < 300
        ).scalar() or 0
        failed_requests = self.db.query(func.count(APIKeyUsage.id)).filter(
            APIKeyUsage.api_key_id == key_id,
            APIKeyUsage.response_status >= 400
        ).scalar() or 0
        
        # Get usage by endpoint
        usage_by_endpoint = self.db.query(
            APIKeyUsage.endpoint,
            APIKeyUsage.method,
            func.count(APIKeyUsage.id).label('count')
        ).filter(
            APIKeyUsage.api_key_id == key_id
        ).group_by(
            APIKeyUsage.endpoint, APIKeyUsage.method
        ).all()
        
        return {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "unique_endpoints": len(set([u.endpoint for u in usage_by_endpoint])),
            "last_used": api_key.last_used_at.isoformat() if api_key.last_used_at else None,
            "usage_by_endpoint": [
                {
                    "endpoint": u.endpoint,
                    "method": u.method,
                    "count": u.count,
                    "success_rate": 100.0  # Simplified for now
                } for u in usage_by_endpoint
            ],
            "usage_by_day": []  # Simplified for now
        }
    
    def get_api_key_usage(self, key_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get usage history for a specific API key"""
        usage_logs = (
            self.db.query(APIKeyUsage)
            .filter(APIKeyUsage.api_key_id == key_id)
            .order_by(APIKeyUsage.created_at.desc())
            .limit(limit)
            .all()
        )
        
        return [
            {
                "id": usage.id,
                "endpoint": usage.endpoint,
                "method": usage.method,
                "ip_address": usage.ip_address,
                "user_agent": usage.user_agent,
                "response_status": usage.response_status,
                "created_at": usage.created_at
            } for usage in usage_logs
        ]
    
    def get_all_stats(self) -> Dict[str, Any]:
        """Get overall API key statistics"""
        total_keys = self.db.query(func.count(APIKey.id)).scalar()
        active_keys = self.db.query(func.count(APIKey.id)).filter(APIKey.is_active == True).scalar()
        
        total_usage = self.db.query(func.count(APIKeyUsage.id)).scalar()
        
        return {
            "total_api_keys": total_keys,
            "active_api_keys": active_keys,
            "total_requests": total_usage
        }
