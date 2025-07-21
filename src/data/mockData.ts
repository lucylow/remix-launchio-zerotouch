import { Agent, PortData, RouteOption } from '../types/zerotouch';

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'sentinel-001',
    name: 'Watchtower',
    type: 'sentinel',
    status: 'idle',
    description: 'Real-time anomaly detection and threat monitoring',
    tools: ['analyze_satellite_imagery', 'monitor_darkweb', 'scan_iot_sensors', 'detect_anomalies'],
    confidence: 0
  },
  {
    id: 'simulator-001',
    name: 'Oracle',
    type: 'simulator',
    status: 'idle',
    description: 'Impact forecasting and scenario modeling',
    tools: ['run_monte_carlo', 'calculate_carbon_impact', 'forecast_demand', 'analyze_alternatives'],
    confidence: 0
  },
  {
    id: 'negotiator-001',
    name: 'Diplomat',
    type: 'negotiator',
    status: 'idle',
    description: 'Autonomous contracting and deal optimization',
    tools: ['negotiate_terms', 'request_human_approval', 'analyze_carrier_rates', 'optimize_contracts'],
    confidence: 0
  },
  {
    id: 'executor-001',
    name: 'Commander',
    type: 'executor',
    status: 'idle',
    description: 'System implementation and logistics execution',
    tools: ['reroute_shipments', 'update_erp', 'coordinate_carriers', 'manage_inventory'],
    confidence: 0
  },
  {
    id: 'audit-001',
    name: 'Guardian',
    type: 'audit',
    status: 'idle',
    description: 'Immutable verification and compliance logging',
    tools: ['log_to_blockchain', 'generate_compliance_report', 'verify_transactions', 'audit_trail'],
    confidence: 0
  }
];

export const MOCK_PORTS: PortData[] = [
  {
    name: 'Port of Los Angeles',
    code: 'LAX',
    coordinates: [33.7, -118.2],
    status: 'normal',
    containers: 420,
    congestionScore: 0.15,
    craneActivity: 'high'
  },
  {
    name: 'Port of Oakland',
    code: 'OAK',
    coordinates: [37.8, -122.3],
    status: 'normal',
    containers: 180,
    congestionScore: 0.05,
    craneActivity: 'medium'
  },
  {
    name: 'Port of Vancouver',
    code: 'VAN',
    coordinates: [49.3, -123.1],
    status: 'normal',
    containers: 240,
    congestionScore: 0.08,
    craneActivity: 'medium'
  },
  {
    name: 'Port of Seattle',
    code: 'SEA',
    coordinates: [47.6, -122.3],
    status: 'normal',
    containers: 160,
    congestionScore: 0.03,
    craneActivity: 'low'
  }
];

export const MOCK_ROUTES: RouteOption[] = [
  {
    fromPort: 'LAX',
    toPort: 'OAK',
    cost: 15200,
    delay: 48,
    carbonImpact: -42,
    probability: 0.89
  },
  {
    fromPort: 'LAX',
    toPort: 'VAN',
    cost: 21800,
    delay: 72,
    carbonImpact: -58,
    probability: 0.76
  },
  {
    fromPort: 'LAX',
    toPort: 'SEA',
    cost: 18900,
    delay: 56,
    carbonImpact: -35,
    probability: 0.82
  }
];

export const TOOL_DEFINITIONS = {
  analyze_satellite_imagery: {
    description: 'CV analysis of port activity using YOLO model',
    parameters: ['coordinates'],
    returns: 'congestion_score, crane_activity'
  },
  monitor_darkweb: {
    description: 'Scrape threat forums for strike indicators',
    parameters: ['keywords'],
    returns: 'strike_probability'
  },
  run_monte_carlo: {
    description: '10K-iteration scenario modeling',
    parameters: ['containers', 'alternatives'],
    returns: 'optimal_route, cost_savings, delay_analysis'
  },
  calculate_carbon_impact: {
    description: 'EPA emission models + logistics APIs',
    parameters: ['routes'],
    returns: 'carbon_footprint, savings'
  },
  negotiate_terms: {
    description: 'LLM-driven contract optimization',
    parameters: ['carrier', 'base_rate'],
    returns: 'discounted_rate, terms'
  },
  request_human_approval: {
    description: 'Slack integration with 5m timeout',
    parameters: ['message', 'channel'],
    returns: 'approval_status'
  },
  reroute_shipments: {
    description: 'Live logistics API integration',
    parameters: ['container_ids', 'port'],
    returns: 'confirmation, tracking_ids'
  },
  update_erp: {
    description: 'SAP/Oracle write-back with OAuth2',
    parameters: ['order_ids', 'changes'],
    returns: 'update_status'
  },
  log_to_blockchain: {
    description: 'Ethereum testnet transaction',
    parameters: ['action'],
    returns: 'transaction_hash'
  },
  generate_compliance_report: {
    description: 'GDPR/CTPAT documentation',
    parameters: [],
    returns: 'report_pdf'
  }
};

export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Threat Detection',
    description: 'Sentinel detects LA port congestion via satellite imagery',
    agent: 'sentinel',
    tool: 'analyze_satellite_imagery',
    expectedDuration: 45
  },
  {
    step: 2,
    title: 'Impact Analysis',
    description: 'Simulator runs Monte Carlo analysis for optimal routing',
    agent: 'simulator',
    tool: 'run_monte_carlo',
    expectedDuration: 30
  },
  {
    step: 3,
    title: 'Contract Negotiation',
    description: 'Negotiator secures carrier capacity and terms',
    agent: 'negotiator',
    tool: 'negotiate_terms',
    expectedDuration: 45
  },
  {
    step: 4,
    title: 'Human Approval',
    description: 'Request approval for rerouting decision',
    agent: 'negotiator',
    tool: 'request_human_approval',
    expectedDuration: 60
  },
  {
    step: 5,
    title: 'Execution',
    description: 'Executor reroutes containers and updates systems',
    agent: 'executor',
    tool: 'reroute_shipments',
    expectedDuration: 30
  },
  {
    step: 6,
    title: 'Audit & Compliance',
    description: 'Audit logs to blockchain and generates reports',
    agent: 'audit',
    tool: 'log_to_blockchain',
    expectedDuration: 20
  }
];