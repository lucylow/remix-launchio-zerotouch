"""
Request Validation Utilities
=============================

Validation functions for API requests and agent parameters.

@author ZeroTouch Team
@version 2.0.0
"""

from typing import Dict, List, Any, Optional

def validate_request_data(data: Optional[Dict], required_fields: List[str]) -> bool:
    """
    Validate that request data contains all required fields.
    
    Args:
        data: Request data dictionary
        required_fields: List of required field names
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not data:
        return False
    
    return all(field in data for field in required_fields)

def validate_agent_parameters(agent_type: str, parameters: Dict[str, Any]) -> bool:
    """
    Validate agent-specific parameters.
    
    Args:
        agent_type: Type of agent
        parameters: Agent parameters
        
    Returns:
        bool: True if valid, False otherwise
    """
    # Basic validation - can be extended for specific agent types
    if not isinstance(parameters, dict):
        return False
    
    # Agent-specific validation
    if agent_type == 'sentinel':
        return 'port_data' in parameters or 'analysis_type' in parameters
    elif agent_type == 'simulator':
        return 'containers' in parameters or 'optimization_method' in parameters
    elif agent_type == 'negotiator':
        return 'carrier' in parameters or 'requirements' in parameters
    elif agent_type == 'executor':
        return 'routing_plan' in parameters or 'execution_mode' in parameters
    elif agent_type == 'audit':
        return 'operations' in parameters or 'audit_level' in parameters
    
    return True

