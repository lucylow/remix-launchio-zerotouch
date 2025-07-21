import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentTaskRequest {
  agent_type: 'sentinel' | 'simulator' | 'negotiator' | 'executor' | 'audit';
  task_id: string;
  parameters: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowRequest {
  workflow_id: string;
  agents: AgentTaskRequest[];
  context: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const launchIoApiKey = Deno.env.get('LAUNCH_IO_API_KEY');
    if (!launchIoApiKey) {
      throw new Error('Launch IO API key not configured');
    }

    const body = await req.json();
    const { pathname } = new URL(req.url);

    if (pathname.includes('/execute')) {
      return await executeAgentTask(body as AgentTaskRequest, launchIoApiKey);
    } else if (pathname.includes('/workflow')) {
      return await orchestrateWorkflow(body as WorkflowRequest, launchIoApiKey);
    } else {
      throw new Error('Invalid endpoint');
    }

  } catch (error) {
    console.error('Error in launch-io-agents function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeAgentTask(request: AgentTaskRequest, apiKey: string) {
  // Map our agent types to specialized prompts
  const agentPrompts = {
    sentinel: `You are a maritime surveillance AI agent specializing in crisis detection. 
      Analyze the given parameters and detect any supply chain disruptions, port strikes, or logistical issues.
      Return JSON with: { "crisis_detected": boolean, "severity": "low"|"medium"|"high"|"critical", "indicators": [], "confidence": number, "recommended_actions": [] }`,
    
    simulator: `You are a logistics optimization AI agent. 
      Perform route optimization and impact analysis using Monte Carlo simulations.
      Return JSON with: { "optimal_routes": [], "cost_analysis": {}, "time_estimates": {}, "risk_factors": [], "scenarios_tested": number, "confidence": number }`,
    
    negotiator: `You are a negotiation AI agent specialized in carrier and logistics partnerships.
      Analyze negotiation parameters and provide optimal terms.
      Return JSON with: { "negotiation_strategy": "", "recommended_terms": [], "price_analysis": {}, "success_probability": number, "alternatives": [] }`,
    
    executor: `You are an execution AI agent responsible for implementing logistics changes.
      Execute the given rerouting or operational changes safely and efficiently.
      Return JSON with: { "execution_plan": [], "success": boolean, "tracking_info": {}, "estimated_completion": "", "risk_mitigation": [] }`,
    
    audit: `You are an audit and compliance AI agent.
      Verify and log all actions for compliance and audit trail purposes.
      Return JSON with: { "compliance_status": "compliant"|"warning"|"violation", "audit_log": [], "recommendations": [], "risk_score": number }`
  };

  const prompt = `${agentPrompts[request.agent_type]}
    
    Task ID: ${request.task_id}
    Priority: ${request.priority || 'medium'}
    Parameters: ${JSON.stringify(request.parameters, null, 2)}
    
    Provide a detailed analysis and actionable recommendations.`;

  // Call Launch IO AI Agent API
  const response = await fetch('https://api.launchpod.ai/v1/agents/execute', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_type: 'specialist',
      task: {
        type: request.agent_type,
        prompt,
        parameters: request.parameters
      },
      priority: request.priority || 'medium'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Launch IO Agent API Error:', errorText);
    throw new Error(`Launch IO Agent API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  // Parse the agent response
  let agentResult;
  try {
    const content = result.response || result.output || '';
    agentResult = JSON.parse(content);
  } catch {
    // Fallback for text responses
    agentResult = {
      success: true,
      analysis: result.response || result.output || '',
      agent_type: request.agent_type,
      confidence: 0.85
    };
  }

  return new Response(JSON.stringify({
    success: true,
    task_id: request.task_id,
    agent_type: request.agent_type,
    result: agentResult,
    execution_time: result.execution_time || 0,
    status: 'completed'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function orchestrateWorkflow(request: WorkflowRequest, apiKey: string) {
  const results = [];
  
  // Execute agents in sequence for the ZeroTouch workflow
  for (const agentTask of request.agents) {
    try {
      const taskResponse = await executeAgentTask(agentTask, apiKey);
      const taskResult = await taskResponse.json();
      results.push(taskResult);
      
      // Add delay between agent executions
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        success: false,
        task_id: agentTask.task_id,
        agent_type: agentTask.agent_type,
        error: error.message
      });
    }
  }

  // Analyze overall workflow success
  const successfulTasks = results.filter(r => r.success).length;
  const successRate = successfulTasks / results.length;

  return new Response(JSON.stringify({
    success: true,
    workflow_id: request.workflow_id,
    overall_success: successRate >= 0.8,
    success_rate: successRate,
    results,
    completed_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}