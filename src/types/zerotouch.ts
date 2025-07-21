// ZeroTouch Port Strike Demo Types

export type AgentType = 'sentinel' | 'simulator' | 'negotiator' | 'executor' | 'audit';

export type AgentStatus = 'idle' | 'processing' | 'success' | 'error' | 'waiting';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  tools: string[];
  confidence?: number;
  lastUpdate?: string;
}

export interface ToolCall {
  id: string;
  agentId: string;
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  timestamp: string;
  duration?: number;
  status: 'pending' | 'success' | 'error';
}

export interface PortData {
  name: string;
  code: string;
  coordinates: [number, number];
  status: 'normal' | 'congested' | 'strike' | 'reroute';
  containers: number;
  congestionScore?: number;
  craneActivity?: 'low' | 'medium' | 'high';
}

export interface RouteOption {
  fromPort: string;
  toPort: string;
  cost: number;
  delay: number;
  carbonImpact: number;
  probability: number;
}

export interface SimulationResult {
  scenario: string;
  totalCost: number;
  totalDelay: number;
  carbonSavings: number;
  optimalRoute: RouteOption;
  alternativeRoutes: RouteOption[];
  confidence: number;
}

export interface NegotiationResult {
  carrier: string;
  originalRate: number;
  negotiatedRate: number;
  discount: number;
  terms: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface BlockchainTransaction {
  hash: string;
  timestamp: string;
  action: string;
  data: Record<string, any>;
  gasUsed?: number;
  confirmed: boolean;
}

export interface WorkflowState {
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  startTime?: string;
  endTime?: string;
  agents: Agent[];
  toolCalls: ToolCall[];
  ports: PortData[];
  simulation?: SimulationResult;
  negotiation?: NegotiationResult;
  blockchain?: BlockchainTransaction[];
  metrics: {
    costSavings: number;
    carbonReduction: number;
    humanLaborSaved: number;
    timeToResolution: number;
  };
}

export interface ApprovalRequest {
  id: string;
  message: string;
  requestedBy: string;
  timestamp: string;
  timeout: number;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  data?: any;
}