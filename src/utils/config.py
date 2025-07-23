"""
Configuration Management
========================

Centralized configuration management for the ZeroTouch backend system.
Handles environment variables, API keys, and application settings.

@author ZeroTouch Team
@version 2.0.0
"""

import os
from typing import Optional

class Config:
    """Main configuration class for the application."""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'zerotouch-port-strike-response-secret-key')
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    
    # Launch IO Configuration
    LAUNCH_IO_API_KEY = os.environ.get('LAUNCH_IO_API_KEY', 'demo-key-for-hackathon')
    LAUNCH_IO_BASE_URL = os.environ.get('LAUNCH_IO_BASE_URL', 'https://api.io.net/v1')
    
    # Database Configuration (if needed)
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///zerotouch.db')
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'zerotouch.log')
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', '100'))
    RATE_LIMIT_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW', '60'))
    
    # Agent Configuration
    AGENT_TIMEOUT = int(os.environ.get('AGENT_TIMEOUT', '30'))
    AGENT_RETRY_COUNT = int(os.environ.get('AGENT_RETRY_COUNT', '3'))
    
    # Workflow Configuration
    WORKFLOW_MAX_AGENTS = int(os.environ.get('WORKFLOW_MAX_AGENTS', '10'))
    WORKFLOW_TIMEOUT = int(os.environ.get('WORKFLOW_TIMEOUT', '300'))
    
    @classmethod
    def validate(cls) -> bool:
        """Validate configuration settings."""
        required_vars = ['LAUNCH_IO_API_KEY']
        missing_vars = [var for var in required_vars if not getattr(cls, var)]
        
        if missing_vars:
            raise ValueError(f'Missing required environment variables: {missing_vars}')
        
        return True

