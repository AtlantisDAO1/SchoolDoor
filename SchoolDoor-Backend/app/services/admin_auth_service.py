from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import get_db
from app.models_admin import AdminUser, AdminActivityLog
from app.schemas import AdminCreate, Token
import logging

"""
Service for handling administrator authentication and management.
Includes functionality for creating admins, verifying passwords,
and managing JWT tokens.
"""

logger = logging.getLogger(__name__)

# Password hashing - using bcrypt directly

# JWT settings
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Security scheme
security = HTTPBearer()


class AdminAuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        # Use bcrypt directly
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def get_password_hash(self, password: str) -> str:
        # Use bcrypt directly
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def authenticate_admin(self, username: str, password: str) -> Optional[AdminUser]:
        """Authenticate admin user with username and password"""
        admin = self.db.query(AdminUser).filter(
            AdminUser.username == username,
            AdminUser.is_active == True
        ).first()
        
        if not admin:
            return None
        
        if not self.verify_password(password, admin.hashed_password):
            return None
        
        # Update last login
        admin.last_login = datetime.utcnow()
        self.db.commit()
        
        return admin
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[AdminTokenData]:
        """Verify JWT token and return token data"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            admin_user_id: int = payload.get("admin_user_id")
            is_superuser: bool = payload.get("is_superuser", False)
            
            if username is None or admin_user_id is None:
                return None
            
            return AdminTokenData(
                username=username,
                admin_user_id=admin_user_id,
                is_superuser=is_superuser
            )
        except JWTError:
            return None
    
    def get_current_admin(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> AdminUser:
        """Get current authenticated admin user"""
        token = credentials.credentials
        token_data = self.verify_token(token)
        
        if token_data is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        admin = self.db.query(AdminUser).filter(
            AdminUser.id == token_data.admin_user_id,
            AdminUser.is_active == True
        ).first()
        
        if admin is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin user not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return admin
    
    def require_superuser(self, admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
        """Require superuser privileges"""
        if not admin.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Superuser privileges required"
            )
        return admin
    
    def log_admin_activity(
        self,
        admin_user_id: int,
        action: str,
        resource_type: str,
        resource_id: Optional[int] = None,
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log admin activity"""
        try:
            activity_log = AdminActivityLog(
                admin_user_id=admin_user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                description=description,
                ip_address=ip_address,
                user_agent=user_agent
            )
            self.db.add(activity_log)
            self.db.commit()
        except Exception as e:
            logger.error(f"Failed to log admin activity: {e}")
    
    def create_admin_user(
        self,
        username: str,
        email: str,
        password: str,
        full_name: Optional[str] = None,
        is_superuser: bool = False
    ) -> AdminUser:
        """Create new admin user"""
        username = username.strip()
        email = email.strip().lower()
        full_name = full_name.strip() if full_name else None
        
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Check if username or email already exists
        existing_user = self.db.query(AdminUser).filter(
            (AdminUser.username == username) | (AdminUser.email == email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        hashed_password = self.get_password_hash(password)
        admin_user = AdminUser(
            username=username,
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_superuser=is_superuser
        )
        
        self.db.add(admin_user)
        self.db.commit()
        self.db.refresh(admin_user)
        
        return admin_user
    
    def update_admin_user(self, admin_id: int, **kwargs) -> AdminUser:
        """Update admin user"""
        admin = self.db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin user not found"
            )
        
        password = kwargs.pop("password", None)
        username = kwargs.get("username")
        email = kwargs.get("email")
        
        if username is not None:
            username = username.strip()
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username cannot be empty"
                )
            if username != admin.username:
                existing_username = self.db.query(AdminUser).filter(AdminUser.username == username).first()
                if existing_username:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Username already in use"
                    )
            admin.username = username
        
        if email is not None:
            email = email.strip().lower()
            if email != admin.email:
                existing_email = self.db.query(AdminUser).filter(AdminUser.email == email).first()
                if existing_email:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already in use"
                    )
            admin.email = email
        
        if "full_name" in kwargs and kwargs["full_name"] is not None:
            admin.full_name = kwargs["full_name"].strip() or None
        
        if "is_active" in kwargs and kwargs["is_active"] is not None:
            admin.is_active = bool(kwargs["is_active"])
        
        if "is_superuser" in kwargs and kwargs["is_superuser"] is not None:
            admin.is_superuser = bool(kwargs["is_superuser"])
        
        if password:
            if len(password) < 8:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 8 characters long"
                )
            admin.hashed_password = self.get_password_hash(password)
        
        self.db.commit()
        self.db.refresh(admin)
        return admin
    
    def deactivate_admin_user(self, admin_id: int) -> AdminUser:
        """Deactivate admin user"""
        admin = self.db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin user not found"
            )
        
        admin.is_active = False
        self.db.commit()
        return admin


# Dependency to get current admin
def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    auth_service = AdminAuthService(db)
    return auth_service.get_current_admin(credentials)


# Dependency to require superuser
def require_superuser(admin: AdminUser = Depends(get_current_admin)):
    if not admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser privileges required"
        )
    return admin
