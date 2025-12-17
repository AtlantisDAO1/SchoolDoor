from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import get_db
from app.models_member import MemberUser
from app.schemas_member import MemberTokenData
import logging

"""
Service for handling member (end-user) authentication.
Manages member registration, login, and session token generation.
"""

logger = logging.getLogger(__name__)

# JWT settings
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Security scheme
security = HTTPBearer()


class MemberAuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password using bcrypt"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def get_password_hash(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def authenticate_member(self, email: str, password: str) -> Optional[MemberUser]:
        """Authenticate member user with email and password"""
        member = self.db.query(MemberUser).filter(
            MemberUser.email == email
        ).first()
        
        if not member:
            logger.warning(f"Member not found: {email}")
            return None
        
        if not member.is_active:
            logger.warning(f"Member inactive: {email}")
            return None
        
        if not self.verify_password(password, member.hashed_password):
            logger.warning(f"Password verification failed for: {email}")
            return None
        
        # Update last login
        member.last_login = datetime.utcnow()
        self.db.commit()
        
        return member
    
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
    
    def get_current_member(self, credentials: HTTPAuthorizationCredentials) -> MemberUser:
        """Get current member from JWT token"""
        token = credentials.credentials
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            member_user_id: int = payload.get("member_user_id")
            
            if email is None or member_user_id is None:
                raise credentials_exception
            
            token_data = MemberTokenData(
                email=email,
                member_user_id=member_user_id
            )
        except JWTError:
            raise credentials_exception
        
        member = self.db.query(MemberUser).filter(
            MemberUser.email == token_data.email,
            MemberUser.is_active == True
        ).first()
        
        if member is None:
            raise credentials_exception
        
        return member


def get_current_member(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> MemberUser:
    """Dependency to get current member"""
    auth_service = MemberAuthService(db)
    return auth_service.get_current_member(credentials)



