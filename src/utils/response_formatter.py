"""
Response Formatting Utilities
==============================

Standardized response formatting for API endpoints.

@author ZeroTouch Team
@version 2.0.0
"""

from typing import Dict, Any
from datetime import datetime

def format_success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """
    Format a successful API response.
    
    Args:
        data: Response data
        message: Success message
        
    Returns:
        Dict: Formatted response
    """
    return {
        'success': True,
        'message': message,
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }

def format_error_response(error: str, details: str = None) -> Dict[str, Any]:
    """
    Format an error API response.
    
    Args:
        error: Error message
        details: Additional error details
        
    Returns:
        Dict: Formatted error response
    """
    response = {
        'success': False,
        'error': error,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if details:
        response['details'] = details
    
    return response

