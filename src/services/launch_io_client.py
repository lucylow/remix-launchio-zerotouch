"""
Launch IO Client Service
========================

Comprehensive client for integrating with Launch IO's AI Models API and AI Agent API.
Provides high-level abstractions for common operations while maintaining flexibility
for advanced use cases.

Features:
- AI Models API integration for text generation, analysis, and decision-making
- AI Agent API integration for specialized agent orchestration
- Automatic retry logic with exponential backoff
- Request/response logging for debugging and monitoring
- Error handling with graceful degradation
- Rate limiting and quota management
- Async support for high-throughput scenarios

@author ZeroTouch Team
@version 2.0.0
"""

import requests
import json
import time
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import asyncio
import aiohttp
from dataclasses import dataclass
from enum import Enum

class AgentType(Enum):
    """Enumeration of available agent types in the ZeroTouch system."""
    SENTINEL = "sentinel"
    SIMULATOR = "simulator" 
    NEGOTIATOR = "negotiator"
    EXECUTOR = "executor"
    AUDIT = "audit"

class ModelType(Enum):
    """Enumeration of available AI model types."""
    TEXT_GENERATION = "text-generation"
    ANALYSIS = "analysis"
    DECISION_MAKING = "decision-making"
    OPTIMIZATION = "optimization"

@dataclass
class AgentTask:
    """Data structure for agent task definitions."""
    agent_type: AgentType
    task_id: str
    description: str
    parameters: Dict[str, Any]
    priority: int = 1
    timeout: int = 30
    retry_count: int = 3

@dataclass
class ModelRequest:
    """Data structure for AI model requests."""
    model_type: ModelType
    prompt: str
    context: Optional[Dict[str, Any]] = None
    max_tokens: int = 1000
    temperature: float = 0.7
    top_p: float = 0.9

class LaunchIOClient:
    """
    Main client class for Launch IO API integration.
    
    Provides both synchronous and asynchronous methods for interacting
    with Launch IO's AI Models API and AI Agent API.
    """
    
    def __init__(self, api_key: str, base_url: str = "https://api.io.net/v1"):
        """
        Initialize the Launch IO client.
        
        Args:
            api_key (str): Launch IO API key
            base_url (str): Base URL for Launch IO API
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)
        
        # Configure session headers
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'ZeroTouch-PortStrike/2.0.0'
        })
        
        # Rate limiting configuration
        self.rate_limit_requests = 100
        self.rate_limit_window = 60  # seconds
        self.request_timestamps = []
        
        # Retry configuration
        self.max_retries = 3
        self.retry_delay = 1.0
        self.backoff_factor = 2.0
        
    def test_connection(self) -> bool:
        """
        Test connectivity to Launch IO API.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            response = self.session.get(f'{self.base_url}/health', timeout=10)
            return response.status_code == 200
        except Exception as e:
            self.logger.error(f'Connection test failed: {e}')
            return False
    
    def _check_rate_limit(self) -> bool:
        """
        Check if we're within rate limits.
        
        Returns:
            bool: True if within limits, False if rate limited
        """
        now = time.time()
        # Remove timestamps older than the window
        self.request_timestamps = [
            ts for ts in self.request_timestamps 
            if now - ts < self.rate_limit_window
        ]
        
        if len(self.request_timestamps) >= self.rate_limit_requests:
            return False
        
        self.request_timestamps.append(now)
        return True
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Make a request to the Launch IO API with retry logic.
        
        Args:
            method (str): HTTP method (GET, POST, etc.)
            endpoint (str): API endpoint
            data (Dict, optional): Request body data
            params (Dict, optional): Query parameters
            
        Returns:
            Dict: API response data
            
        Raises:
            Exception: If request fails after all retries
        """
        if not self._check_rate_limit():
            raise Exception("Rate limit exceeded. Please wait before making more requests.")
        
        url = f'{self.base_url}/{endpoint.lstrip("/")}'
        
        for attempt in range(self.max_retries):
            try:
                self.logger.debug(f'Making {method} request to {url} (attempt {attempt + 1})')
                
                response = self.session.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    timeout=30
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:  # Rate limited
                    wait_time = self.retry_delay * (self.backoff_factor ** attempt)
                    self.logger.warning(f'Rate limited. Waiting {wait_time}s before retry.')
                    time.sleep(wait_time)
                    continue
                else:
                    response.raise_for_status()
                    
            except requests.exceptions.RequestException as e:
                if attempt == self.max_retries - 1:
                    self.logger.error(f'Request failed after {self.max_retries} attempts: {e}')
                    raise
                
                wait_time = self.retry_delay * (self.backoff_factor ** attempt)
                self.logger.warning(f'Request failed, retrying in {wait_time}s: {e}')
                time.sleep(wait_time)
        
        raise Exception(f'Request failed after {self.max_retries} attempts')
    
    # AI Models API Methods
    
    def generate_text(self, request: ModelRequest) -> Dict[str, Any]:
        """
        Generate text using Launch IO's AI Models API.
        
        Args:
            request (ModelRequest): Model request configuration
            
        Returns:
            Dict: Generated text and metadata
        """
        data = {
            'model': request.model_type.value,
            'prompt': request.prompt,
            'max_tokens': request.max_tokens,
            'temperature': request.temperature,
            'top_p': request.top_p
        }
        
        if request.context:
            data['context'] = request.context
        
        response = self._make_request('POST', '/models/generate', data)
        
        return {
            'text': response.get('choices', [{}])[0].get('text', ''),
            'model': response.get('model'),
            'usage': response.get('usage', {}),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def analyze_text(self, text: str, analysis_type: str = "sentiment") -> Dict[str, Any]:
        """
        Analyze text using Launch IO's AI Models API.
        
        Args:
            text (str): Text to analyze
            analysis_type (str): Type of analysis (sentiment, entities, etc.)
            
        Returns:
            Dict: Analysis results
        """
        data = {
            'text': text,
            'analysis_type': analysis_type
        }
        
        response = self._make_request('POST', '/models/analyze', data)
        return response
    
    def make_decision(self, context: Dict[str, Any], options: List[str]) -> Dict[str, Any]:
        """
        Make a decision using Launch IO's AI Models API.
        
        Args:
            context (Dict): Decision context and parameters
            options (List[str]): Available decision options
            
        Returns:
            Dict: Decision result with confidence score
        """
        data = {
            'context': context,
            'options': options,
            'model': ModelType.DECISION_MAKING.value
        }
        
        response = self._make_request('POST', '/models/decide', data)
        return response
    
    # AI Agent API Methods
    
    def execute_agent_task(self, task: AgentTask) -> Dict[str, Any]:
        """
        Execute a task using a specialized AI agent.
        
        Args:
            task (AgentTask): Agent task configuration
            
        Returns:
            Dict: Task execution result
        """
        data = {
            'agent_type': task.agent_type.value,
            'task_id': task.task_id,
            'description': task.description,
            'parameters': task.parameters,
            'priority': task.priority,
            'timeout': task.timeout
        }
        
        response = self._make_request('POST', '/agents/execute', data)
        
        return {
            'task_id': task.task_id,
            'agent_type': task.agent_type.value,
            'status': response.get('status', 'unknown'),
            'result': response.get('result', {}),
            'execution_time': response.get('execution_time', 0),
            'confidence': response.get('confidence', 0.0),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_agent_status(self, agent_type: AgentType) -> Dict[str, Any]:
        """
        Get the current status of a specific agent.
        
        Args:
            agent_type (AgentType): Type of agent to check
            
        Returns:
            Dict: Agent status information
        """
        response = self._make_request('GET', f'/agents/{agent_type.value}/status')
        return response
    
    def orchestrate_workflow(self, workflow_id: str, agents: List[AgentTask]) -> Dict[str, Any]:
        """
        Orchestrate a multi-agent workflow.
        
        Args:
            workflow_id (str): Unique workflow identifier
            agents (List[AgentTask]): List of agent tasks to execute
            
        Returns:
            Dict: Workflow execution result
        """
        data = {
            'workflow_id': workflow_id,
            'agents': [
                {
                    'agent_type': task.agent_type.value,
                    'task_id': task.task_id,
                    'description': task.description,
                    'parameters': task.parameters,
                    'priority': task.priority
                }
                for task in agents
            ]
        }
        
        response = self._make_request('POST', '/agents/workflow', data)
        return response
    
    # Specialized Methods for ZeroTouch System
    
    def detect_port_crisis(self, port_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Sentinel agent to detect port crisis situations.
        
        Args:
            port_data (Dict): Port status and operational data
            
        Returns:
            Dict: Crisis detection result
        """
        task = AgentTask(
            agent_type=AgentType.SENTINEL,
            task_id=f"crisis_detection_{int(time.time())}",
            description="Analyze port data for crisis indicators",
            parameters={
                'port_data': port_data,
                'analysis_type': 'crisis_detection',
                'sensitivity': 'high'
            }
        )
        
        return self.execute_agent_task(task)
    
    def optimize_routing(self, containers: List[Dict], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Simulator agent to optimize container routing.
        
        Args:
            containers (List[Dict]): Container information
            constraints (Dict): Routing constraints and preferences
            
        Returns:
            Dict: Optimized routing plan
        """
        task = AgentTask(
            agent_type=AgentType.SIMULATOR,
            task_id=f"route_optimization_{int(time.time())}",
            description="Optimize container routing using Monte Carlo analysis",
            parameters={
                'containers': containers,
                'constraints': constraints,
                'optimization_method': 'monte_carlo',
                'iterations': 10000
            }
        )
        
        return self.execute_agent_task(task)
    
    def negotiate_contract(self, carrier: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Negotiator agent to negotiate carrier contracts.
        
        Args:
            carrier (str): Carrier company name
            requirements (Dict): Contract requirements and constraints
            
        Returns:
            Dict: Negotiation result
        """
        task = AgentTask(
            agent_type=AgentType.NEGOTIATOR,
            task_id=f"contract_negotiation_{int(time.time())}",
            description=f"Negotiate contract terms with {carrier}",
            parameters={
                'carrier': carrier,
                'requirements': requirements,
                'negotiation_strategy': 'collaborative',
                'max_iterations': 5
            }
        )
        
        return self.execute_agent_task(task)
    
    def execute_rerouting(self, routing_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Executor agent to implement container rerouting.
        
        Args:
            routing_plan (Dict): Routing plan from optimization
            
        Returns:
            Dict: Execution result
        """
        task = AgentTask(
            agent_type=AgentType.EXECUTOR,
            task_id=f"rerouting_execution_{int(time.time())}",
            description="Execute container rerouting plan",
            parameters={
                'routing_plan': routing_plan,
                'execution_mode': 'immediate',
                'validation_required': True
            }
        )
        
        return self.execute_agent_task(task)
    
    def audit_operations(self, operations: List[Dict]) -> Dict[str, Any]:
        """
        Use Audit agent to verify and log operations.
        
        Args:
            operations (List[Dict]): Operations to audit
            
        Returns:
            Dict: Audit result
        """
        task = AgentTask(
            agent_type=AgentType.AUDIT,
            task_id=f"operations_audit_{int(time.time())}",
            description="Audit and log operations for compliance",
            parameters={
                'operations': operations,
                'audit_level': 'comprehensive',
                'blockchain_logging': True
            }
        )
        
        return self.execute_agent_task(task)
    
    # Async Methods (for high-throughput scenarios)
    
    async def async_execute_agent_task(self, task: AgentTask) -> Dict[str, Any]:
        """
        Asynchronously execute an agent task.
        
        Args:
            task (AgentTask): Agent task configuration
            
        Returns:
            Dict: Task execution result
        """
        async with aiohttp.ClientSession() as session:
            data = {
                'agent_type': task.agent_type.value,
                'task_id': task.task_id,
                'description': task.description,
                'parameters': task.parameters
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            url = f'{self.base_url}/agents/execute'
            
            async with session.post(url, json=data, headers=headers) as response:
                result = await response.json()
                return result
    
    async def async_orchestrate_workflow(self, workflow_id: str, agents: List[AgentTask]) -> Dict[str, Any]:
        """
        Asynchronously orchestrate a multi-agent workflow.
        
        Args:
            workflow_id (str): Unique workflow identifier
            agents (List[AgentTask]): List of agent tasks
            
        Returns:
            Dict: Workflow execution result
        """
        tasks = [self.async_execute_agent_task(agent) for agent in agents]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            'workflow_id': workflow_id,
            'results': results,
            'timestamp': datetime.utcnow().isoformat()
        }

