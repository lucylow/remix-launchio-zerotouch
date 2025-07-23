"""
Logging Configuration
=====================

Centralized logging setup for the ZeroTouch backend system.

@author ZeroTouch Team
@version 2.0.0
"""

import logging
import logging.handlers
import os
from datetime import datetime

def setup_logging(app):
    """
    Setup logging configuration for the Flask application.
    
    Args:
        app: Flask application instance
    """
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO').upper())
    log_file = app.config.get('LOG_FILE', 'zerotouch.log')
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Setup file handler
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    file_handler = logging.handlers.RotatingFileHandler(
        f'logs/{log_file}',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Setup console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # Configure app logger
    app.logger.setLevel(log_level)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    
    # Configure werkzeug logger
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.WARNING)
    
    app.logger.info('Logging configured successfully')

