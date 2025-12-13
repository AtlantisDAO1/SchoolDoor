"""
Application configuration management using Pydantic.
Reads configuration from environment variables or .env file.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Global application settings.
    """
    # Database Configuration
    database_url: str = "postgresql://localhost/schooldoor"
    
    # AI API Configuration
    perplexity_api_key: Optional[str] = None
    
    # Application Configuration
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 6001
    debug: bool = True
    
    # CORS Configuration
    cors_origins: Optional[str] = None
    
    # Application Focus
    country: Optional[str] = None
    education_system: Optional[str] = None

    # Secrets
    participant_password: str = "change-me-participant"
    admin_password: str = "change-me-admin"
    admin_email: str = "admin@example.com"
    
    class Config:
        env_file = ".env"


settings = Settings()
