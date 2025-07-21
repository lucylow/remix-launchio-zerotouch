import { useState, useCallback, useRef } from 'react';
import { WorkflowState, Agent, ToolCall, ApprovalRequest, AgentType } from '../types/zerotouch';
import { MOCK_AGENTS, MOCK_PORTS, MOCK_ROUTES, WORKFLOW_STEPS } from '../data/mockData';
import { useToast } from './use-toast';

export const useZeroTouchWorkflow = () => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [state, setState] = useState<WorkflowState>({
    currentStep: 0,
    totalSteps: WORKFLOW_STEPS.length,
    isRunning: false,
    agents: MOCK_AGENTS,
    toolCalls: [],
    ports: MOCK_PORTS,
    metrics: {
      costSavings: 0,
      carbonReduction: 0,
      humanLaborSaved: 0,
      timeToResolution: 0
    }
  });

  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);

  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    }));
  }, []);

  const addToolCall = useCallback((toolCall: Omit<ToolCall, 'timestamp'>) => {
    const newToolCall: ToolCall = {
      ...toolCall,
      timestamp: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      toolCalls: [...prev.toolCalls, newToolCall]
    }));

    return newToolCall.id;
  }, []);

  const updateToolCall = useCallback((id: string, updates: Partial<ToolCall>) => {
    setState(prev => ({
      ...prev,
      toolCalls: prev.toolCalls.map(call => 
        call.id === id ? { ...call, ...updates } : call
      )
    }));
  }, []);

  const simulateToolCall = useCallback(async (
    agentId: string, 
    toolName: string, 
    parameters: Record<string, any>
  ): Promise<any> => {
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add tool call
    addToolCall({
      id: callId,
      agentId,
      toolName,
      parameters,
      status: 'pending'
    });

    // Update agent status
    updateAgent(agentId, { status: 'processing' });

    // Simulate API delay
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate mock result based on tool
    let result;
    switch (toolName) {
      case 'analyze_satellite_imagery':
        result = {
          congestion_score: 0.92,
          crane_activity: 'low',
          confidence: 0.89,
          containers_detected: 420,
          strike_indicators: true
        };
        break;
      case 'run_monte_carlo':
        result = {
          optimal_route: MOCK_ROUTES[0],
          cost_savings: 2100000,
          delay_analysis: { expected: 48, variance: 12 },
          scenarios_tested: 10000,
          confidence: 0.87
        };
        break;
      case 'negotiate_terms':
        result = {
          carrier: 'Maersk',
          original_rate: 17000,
          negotiated_rate: 15200,
          discount: 0.12,
          terms: ['Priority loading', '48h SLA', 'Real-time tracking'],
          success: true
        };
        break;
      case 'reroute_shipments':
        result = {
          rerouted_containers: ['CTN-7843', 'CTN-7844', 'CTN-7845'],
          destination: 'Port of Oakland',
          eta: '2024-07-22T14:30:00Z',
          tracking_ids: ['TRK-001', 'TRK-002', 'TRK-003']
        };
        break;
      case 'log_to_blockchain':
        result = {
          transaction_hash: '0x89b2f3e8c1d4a567890123456789abcdef123456',
          block_number: 18745623,
          gas_used: 52341,
          confirmed: true
        };
        break;
      default:
        result = { success: true, data: parameters };
    }

    // Update tool call with result
    updateToolCall(callId, {
      result,
      status: 'success',
      duration: delay
    });

    // Update agent status
    updateAgent(agentId, { 
      status: 'success',
      confidence: result.confidence || Math.random() * 0.3 + 0.7,
      lastUpdate: new Date().toISOString()
    });

    return result;
  }, [addToolCall, updateAgent, updateToolCall]);

  const executeStep = useCallback(async (stepIndex: number) => {
    const step = WORKFLOW_STEPS[stepIndex];
    if (!step) return;

    const agent = state.agents.find(a => a.type === step.agent);
    if (!agent) return;

    setState(prev => ({ ...prev, currentStep: stepIndex + 1 }));

    toast({
      title: step.title,
      description: step.description,
    });

    // Special handling for human approval step
    if (step.tool === 'request_human_approval') {
      const approvalRequest: ApprovalRequest = {
        id: `approval-${Date.now()}`,
        message: 'Approve Oakland reroute for 150 containers?',
        requestedBy: agent.id,
        timestamp: new Date().toISOString(),
        timeout: 300000, // 5 minutes
        status: 'pending'
      };

      setPendingApproval(approvalRequest);
      updateAgent(agent.id, { status: 'waiting' });

      // Auto-decline after timeout
      timeoutRef.current = setTimeout(() => {
        setPendingApproval(prev => prev ? { ...prev, status: 'timeout' } : null);
        updateAgent(agent.id, { status: 'error' });
        toast({
          title: 'Approval Timeout',
          description: 'Human approval request timed out',
          variant: 'destructive'
        });
      }, approvalRequest.timeout);

      return;
    }

    // Execute the tool call
    await simulateToolCall(agent.id, step.tool, {
      coordinates: step.agent === 'sentinel' ? '33.7°N, 118.2°W' : undefined,
      containers: step.agent === 'simulator' ? 150 : undefined,
      carrier: step.agent === 'negotiator' ? 'Maersk' : undefined,
      container_ids: step.agent === 'executor' ? ['CTN-7843'] : undefined,
      action: step.agent === 'audit' ? { type: 'reroute', data: 'container logistics' } : undefined
    });

    // Update metrics after each step
    if (stepIndex === 1) { // After simulation
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          costSavings: 2100000,
          carbonReduction: 42
        }
      }));
    }

    if (stepIndex === 4) { // After execution
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          humanLaborSaved: 18.7
        }
      }));
    }
  }, [state.agents, simulateToolCall, updateAgent, toast]);

  const startWorkflow = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date().toISOString(),
      currentStep: 0,
      toolCalls: [],
      agents: MOCK_AGENTS.map(agent => ({ ...agent, status: 'idle', confidence: 0 }))
    }));

    // Update LA port to strike status
    setState(prev => ({
      ...prev,
      ports: prev.ports.map(port => 
        port.code === 'LAX' 
          ? { ...port, status: 'strike', congestionScore: 0.92 }
          : port
      )
    }));

    // Execute steps sequentially
    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
      await executeStep(i);
      
      // Wait between steps (except for approval step)
      if (WORKFLOW_STEPS[i].tool !== 'request_human_approval') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        // Wait for approval before continuing
        return; // Will be continued by handleApproval
      }
    }

    // Complete workflow
    setState(prev => ({
      ...prev,
      isRunning: false,
      endTime: new Date().toISOString(),
      metrics: {
        ...prev.metrics,
        timeToResolution: 4.2
      }
    }));

    toast({
      title: 'Workflow Complete',
      description: 'ZeroTouch system successfully resolved the port strike',
    });
  }, [executeStep, toast]);

  const handleApproval = useCallback(async (approved: boolean) => {
    if (!pendingApproval) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const agent = state.agents.find(a => a.id === pendingApproval.requestedBy);
    if (agent) {
      updateAgent(agent.id, { status: approved ? 'success' : 'error' });
    }

    // Clear the approval immediately to close the modal
    setPendingApproval(null);

    if (approved) {
      toast({
        title: 'Approval Granted',
        description: 'Continuing with container rerouting...',
      });

      // Continue with remaining steps
      for (let i = 4; i < WORKFLOW_STEPS.length; i++) {
        await executeStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Complete workflow
      setState(prev => ({
        ...prev,
        isRunning: false,
        endTime: new Date().toISOString(),
        metrics: {
          ...prev.metrics,
          timeToResolution: 4.2
        }
      }));

      toast({
        title: 'Workflow Complete',
        description: 'ZeroTouch system successfully resolved the port strike',
      });
    } else {
      toast({
        title: 'Approval Denied',
        description: 'Workflow terminated by human override',
        variant: 'destructive'
      });
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        endTime: new Date().toISOString()
      }));
    }
  }, [pendingApproval, state.agents, updateAgent, executeStep, toast]);

  const resetWorkflow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState({
      currentStep: 0,
      totalSteps: WORKFLOW_STEPS.length,
      isRunning: false,
      agents: MOCK_AGENTS,
      toolCalls: [],
      ports: MOCK_PORTS,
      metrics: {
        costSavings: 0,
        carbonReduction: 0,
        humanLaborSaved: 0,
        timeToResolution: 0
      }
    });
    
    setPendingApproval(null);
  }, []);

  return {
    state,
    pendingApproval,
    startWorkflow,
    resetWorkflow,
    handleApproval,
    updateAgent
  };
};