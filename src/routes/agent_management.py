"""
Agent Management Routes
========================

Flask blueprint for managing individual AI agents and their states.

@author ZeroTouch Team
@version 2.0.0
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

from utils.response_formatter import format_success_response, format_error_response
from utils.validators import validate_request_data

agent_bp = Blueprint('agents', __name__)

# Agent state storage
agent_states = {
    'sentinel': {'status': 'idle', 'confidence': 0.0, 'last_update': None},
    'simulator': {'status': 'idle', 'confidence': 0.0, 'last_update': None},
    'negotiator': {'status': 'idle', 'confidence': 0.0, 'last_update': None},
    'executor': {'status': 'idle', 'confidence': 0.0, 'last_update': None},
    'audit': {'status': 'idle', 'confidence': 0.0, 'last_update': None}
}

@agent_bp.route('/status', methods=['GET'])
def get_all_agents_status():
    """
    Get status of all agents.
    
    Returns:
        JSON: All agent statuses
    """
    try:
        return format_success_response({
            'agents': agent_states,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Agent status retrieval failed: {e}')
        return format_error_response('Agent status retrieval failed', str(e)), 500

@agent_bp.route('/<agent_id>/status', methods=['GET'])
def get_agent_status(agent_id: str):
    """
    Get status of a specific agent.
    
    Args:
        agent_id: Agent identifier
        
    Returns:
        JSON: Agent status
    """
    try:
        if agent_id not in agent_states:
            return format_error_response('Agent not found', f'Unknown agent: {agent_id}'), 404
        
        return format_success_response({
            'agent_id': agent_id,
            'status': agent_states[agent_id]
        })
        
    except Exception as e:
        current_app.logger.error(f'Agent status check failed: {e}')
        return format_error_response('Agent status check failed', str(e)), 500

@agent_bp.route('/<agent_id>/update', methods=['POST'])
def update_agent_status(agent_id: str):
    """
    Update agent status.
    
    Args:
        agent_id: Agent identifier
        
    Request Body:
        {
            "status": "idle|processing|success|error|waiting",
            "confidence": 0.0-1.0,
            "metadata": {}
        }
        
    Returns:
        JSON: Update result
    """
    try:
        if agent_id not in agent_states:
            return format_error_response('Agent not found', f'Unknown agent: {agent_id}'), 404
        
        data = request.get_json() or {}
        
        if 'status' in data:
            agent_states[agent_id]['status'] = data['status']
        if 'confidence' in data:
            agent_states[agent_id]['confidence'] = data['confidence']
        
        agent_states[agent_id]['last_update'] = datetime.utcnow().isoformat()
        
        current_app.logger.info(f'Agent status updated: {agent_id} - {data.get("status")}')
        
        return format_success_response({
            'agent_id': agent_id,
            'updated_status': agent_states[agent_id]
        })
        
    except Exception as e:
        current_app.logger.error(f'Agent status update failed: {e}')
        return format_error_response('Agent status update failed', str(e)), 500

