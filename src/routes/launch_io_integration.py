"""
Launch IO Integration Routes
============================

Flask blueprint containing all routes for Launch IO API integration.
Provides RESTful endpoints for AI Models API and AI Agent API functionality.

Endpoints:
- /api/launch-io/models/* - AI Models API integration
- /api/launch-io/agents/* - AI Agent API integration  
- /api/launch-io/workflow/* - Multi-agent workflow orchestration
- /api/launch-io/health - Service health and connectivity

@author ZeroTouch Team
@version 2.0.0
"""

from flask import Blueprint, request, jsonify, current_app
import json
import time
from datetime import datetime
from typing import Dict, List, Any

from services.launch_io_client import LaunchIOClient, AgentTask, ModelRequest, AgentType, ModelType
from utils.validators import validate_request_data, validate_agent_parameters
from utils.response_formatter import format_success_response, format_error_response

# Create Flask blueprint
launch_io_bp = Blueprint('launch_io', __name__)

@launch_io_bp.route('/health', methods=['GET'])
def health_check():
    """
    Check Launch IO service connectivity and status.
    
    Returns:
        JSON: Service health information
    """
    try:
        client = current_app.launch_io_client
        is_connected = client.test_connection()
        
        return format_success_response({
            'service': 'Launch IO Integration',
            'status': 'healthy' if is_connected else 'degraded',
            'connected': is_connected,
            'timestamp': datetime.utcnow().isoformat(),
            'features': {
                'ai_models_api': True,
                'ai_agent_api': True,
                'workflow_orchestration': True,
                'async_processing': True
            }
        })
    except Exception as e:
        current_app.logger.error(f'Health check failed: {e}')
        return format_error_response('Health check failed', str(e)), 500

# AI Models API Routes

@launch_io_bp.route('/models/generate', methods=['POST'])
def generate_text():
    """
    Generate text using Launch IO's AI Models API.
    
    Request Body:
        {
            "prompt": "string",
            "model_type": "text-generation|analysis|decision-making",
            "max_tokens": 1000,
            "temperature": 0.7,
            "context": {}
        }
    
    Returns:
        JSON: Generated text and metadata
    """
    try:
        # Validate request data
        data = request.get_json()
        if not validate_request_data(data, ['prompt']):
            return format_error_response('Invalid request', 'Missing required field: prompt'), 400
        
        # Create model request
        model_request = ModelRequest(
            model_type=ModelType(data.get('model_type', 'text-generation')),
            prompt=data['prompt'],
            context=data.get('context'),
            max_tokens=data.get('max_tokens', 1000),
            temperature=data.get('temperature', 0.7),
            top_p=data.get('top_p', 0.9)
        )
        
        # Execute request
        client = current_app.launch_io_client
        result = client.generate_text(model_request)
        
        current_app.logger.info(f'Text generation completed: {len(result.get("text", ""))} characters')
        
        return format_success_response({
            'generated_text': result['text'],
            'model': result['model'],
            'usage': result['usage'],
            'timestamp': result['timestamp']
        })
        
    except ValueError as e:
        return format_error_response('Invalid model type', str(e)), 400
    except Exception as e:
        current_app.logger.error(f'Text generation failed: {e}')
        return format_error_response('Text generation failed', str(e)), 500

@launch_io_bp.route('/models/analyze', methods=['POST'])
def analyze_text():
    """
    Analyze text using Launch IO's AI Models API.
    
    Request Body:
        {
            "text": "string",
            "analysis_type": "sentiment|entities|classification"
        }
    
    Returns:
        JSON: Analysis results
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['text']):
            return format_error_response('Invalid request', 'Missing required field: text'), 400
        
        client = current_app.launch_io_client
        result = client.analyze_text(
            text=data['text'],
            analysis_type=data.get('analysis_type', 'sentiment')
        )
        
        current_app.logger.info(f'Text analysis completed: {data.get("analysis_type", "sentiment")}')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Text analysis failed: {e}')
        return format_error_response('Text analysis failed', str(e)), 500

@launch_io_bp.route('/models/decide', methods=['POST'])
def make_decision():
    """
    Make a decision using Launch IO's AI Models API.
    
    Request Body:
        {
            "context": {},
            "options": ["option1", "option2", "option3"]
        }
    
    Returns:
        JSON: Decision result with confidence score
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['context', 'options']):
            return format_error_response('Invalid request', 'Missing required fields'), 400
        
        client = current_app.launch_io_client
        result = client.make_decision(
            context=data['context'],
            options=data['options']
        )
        
        current_app.logger.info(f'Decision made: {result.get("decision")} with confidence {result.get("confidence")}')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Decision making failed: {e}')
        return format_error_response('Decision making failed', str(e)), 500

# AI Agent API Routes

@launch_io_bp.route('/agents/execute', methods=['POST'])
def execute_agent_task():
    """
    Execute a task using a specialized AI agent.
    
    Request Body:
        {
            "agent_type": "sentinel|simulator|negotiator|executor|audit",
            "task_id": "string",
            "description": "string",
            "parameters": {},
            "priority": 1,
            "timeout": 30
        }
    
    Returns:
        JSON: Task execution result
    """
    try:
        data = request.get_json()
        required_fields = ['agent_type', 'task_id', 'description', 'parameters']
        if not validate_request_data(data, required_fields):
            return format_error_response('Invalid request', 'Missing required fields'), 400
        
        # Validate agent parameters
        if not validate_agent_parameters(data['agent_type'], data['parameters']):
            return format_error_response('Invalid parameters', 'Agent parameters validation failed'), 400
        
        # Create agent task
        task = AgentTask(
            agent_type=AgentType(data['agent_type']),
            task_id=data['task_id'],
            description=data['description'],
            parameters=data['parameters'],
            priority=data.get('priority', 1),
            timeout=data.get('timeout', 30),
            retry_count=data.get('retry_count', 3)
        )
        
        # Execute task
        client = current_app.launch_io_client
        result = client.execute_agent_task(task)
        
        current_app.logger.info(f'Agent task executed: {task.agent_type.value} - {task.task_id}')
        
        return format_success_response(result)
        
    except ValueError as e:
        return format_error_response('Invalid agent type', str(e)), 400
    except Exception as e:
        current_app.logger.error(f'Agent task execution failed: {e}')
        return format_error_response('Agent task execution failed', str(e)), 500

@launch_io_bp.route('/agents/<agent_type>/status', methods=['GET'])
def get_agent_status(agent_type: str):
    """
    Get the current status of a specific agent.
    
    Args:
        agent_type (str): Type of agent (sentinel, simulator, etc.)
    
    Returns:
        JSON: Agent status information
    """
    try:
        agent_enum = AgentType(agent_type)
        client = current_app.launch_io_client
        result = client.get_agent_status(agent_enum)
        
        return format_success_response(result)
        
    except ValueError:
        return format_error_response('Invalid agent type', f'Unknown agent type: {agent_type}'), 400
    except Exception as e:
        current_app.logger.error(f'Agent status check failed: {e}')
        return format_error_response('Agent status check failed', str(e)), 500

@launch_io_bp.route('/agents/workflow', methods=['POST'])
def orchestrate_workflow():
    """
    Orchestrate a multi-agent workflow.
    
    Request Body:
        {
            "workflow_id": "string",
            "agents": [
                {
                    "agent_type": "string",
                    "task_id": "string", 
                    "description": "string",
                    "parameters": {},
                    "priority": 1
                }
            ]
        }
    
    Returns:
        JSON: Workflow execution result
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['workflow_id', 'agents']):
            return format_error_response('Invalid request', 'Missing required fields'), 400
        
        # Create agent tasks
        agent_tasks = []
        for agent_data in data['agents']:
            task = AgentTask(
                agent_type=AgentType(agent_data['agent_type']),
                task_id=agent_data['task_id'],
                description=agent_data['description'],
                parameters=agent_data['parameters'],
                priority=agent_data.get('priority', 1)
            )
            agent_tasks.append(task)
        
        # Execute workflow
        client = current_app.launch_io_client
        result = client.orchestrate_workflow(data['workflow_id'], agent_tasks)
        
        current_app.logger.info(f'Workflow orchestrated: {data["workflow_id"]} with {len(agent_tasks)} agents')
        
        return format_success_response(result)
        
    except ValueError as e:
        return format_error_response('Invalid agent configuration', str(e)), 400
    except Exception as e:
        current_app.logger.error(f'Workflow orchestration failed: {e}')
        return format_error_response('Workflow orchestration failed', str(e)), 500

# Specialized ZeroTouch Routes

@launch_io_bp.route('/zerotouch/crisis-detection', methods=['POST'])
def detect_crisis():
    """
    Detect port crisis using Sentinel agent.
    
    Request Body:
        {
            "port_data": {
                "port_id": "string",
                "congestion_level": 0.0-1.0,
                "container_count": int,
                "operational_status": "string"
            }
        }
    
    Returns:
        JSON: Crisis detection result
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['port_data']):
            return format_error_response('Invalid request', 'Missing port_data'), 400
        
        client = current_app.launch_io_client
        result = client.detect_port_crisis(data['port_data'])
        
        current_app.logger.info(f'Crisis detection completed for port: {data["port_data"].get("port_id")}')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Crisis detection failed: {e}')
        return format_error_response('Crisis detection failed', str(e)), 500

@launch_io_bp.route('/zerotouch/optimize-routing', methods=['POST'])
def optimize_routing():
    """
    Optimize container routing using Simulator agent.
    
    Request Body:
        {
            "containers": [
                {
                    "container_id": "string",
                    "destination": "string",
                    "priority": int
                }
            ],
            "constraints": {
                "max_cost": float,
                "max_time": int,
                "preferred_carriers": []
            }
        }
    
    Returns:
        JSON: Optimized routing plan
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['containers', 'constraints']):
            return format_error_response('Invalid request', 'Missing required fields'), 400
        
        client = current_app.launch_io_client
        result = client.optimize_routing(data['containers'], data['constraints'])
        
        current_app.logger.info(f'Routing optimization completed for {len(data["containers"])} containers')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Routing optimization failed: {e}')
        return format_error_response('Routing optimization failed', str(e)), 500

@launch_io_bp.route('/zerotouch/negotiate-contract', methods=['POST'])
def negotiate_contract():
    """
    Negotiate carrier contract using Negotiator agent.
    
    Request Body:
        {
            "carrier": "string",
            "requirements": {
                "container_count": int,
                "max_rate": float,
                "sla_requirements": {},
                "preferred_terms": []
            }
        }
    
    Returns:
        JSON: Contract negotiation result
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['carrier', 'requirements']):
            return format_error_response('Invalid request', 'Missing required fields'), 400
        
        client = current_app.launch_io_client
        result = client.negotiate_contract(data['carrier'], data['requirements'])
        
        current_app.logger.info(f'Contract negotiation completed with {data["carrier"]}')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Contract negotiation failed: {e}')
        return format_error_response('Contract negotiation failed', str(e)), 500

@launch_io_bp.route('/zerotouch/execute-rerouting', methods=['POST'])
def execute_rerouting():
    """
    Execute container rerouting using Executor agent.
    
    Request Body:
        {
            "routing_plan": {
                "containers": [],
                "routes": [],
                "timeline": {}
            }
        }
    
    Returns:
        JSON: Execution result
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['routing_plan']):
            return format_error_response('Invalid request', 'Missing routing_plan'), 400
        
        client = current_app.launch_io_client
        result = client.execute_rerouting(data['routing_plan'])
        
        current_app.logger.info('Container rerouting execution completed')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Rerouting execution failed: {e}')
        return format_error_response('Rerouting execution failed', str(e)), 500

@launch_io_bp.route('/zerotouch/audit-operations', methods=['POST'])
def audit_operations():
    """
    Audit operations using Audit agent.
    
    Request Body:
        {
            "operations": [
                {
                    "operation_id": "string",
                    "type": "string",
                    "timestamp": "string",
                    "details": {}
                }
            ]
        }
    
    Returns:
        JSON: Audit result
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['operations']):
            return format_error_response('Invalid request', 'Missing operations'), 400
        
        client = current_app.launch_io_client
        result = client.audit_operations(data['operations'])
        
        current_app.logger.info(f'Operations audit completed for {len(data["operations"])} operations')
        
        return format_success_response(result)
        
    except Exception as e:
        current_app.logger.error(f'Operations audit failed: {e}')
        return format_error_response('Operations audit failed', str(e)), 500

# Async Workflow Routes

@launch_io_bp.route('/async/workflow', methods=['POST'])
def async_orchestrate_workflow():
    """
    Asynchronously orchestrate a multi-agent workflow.
    
    Request Body:
        {
            "workflow_id": "string",
            "agents": [...]
        }
    
    Returns:
        JSON: Workflow execution result
    """
    try:
        data = request.get_json()
        if not validate_request_data(data, ['workflow_id', 'agents']):
            return format_error_response('Invalid request', 'Missing required fields'), 400
        
        # For now, return a placeholder response
        # In a real implementation, this would use asyncio and background tasks
        return format_success_response({
            'workflow_id': data['workflow_id'],
            'status': 'queued',
            'message': 'Workflow queued for asynchronous execution',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f'Async workflow orchestration failed: {e}')
        return format_error_response('Async workflow orchestration failed', str(e)), 500

