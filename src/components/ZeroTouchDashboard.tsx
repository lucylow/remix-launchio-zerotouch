import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Activity, Zap, Shield, Target, FileCheck, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useZeroTouchWorkflow } from '../hooks/useZeroTouchWorkflow';
import AgentNetworkGraph from './AgentNetworkGraph';
import PortMap from './PortMap';
import ToolCallMonitor from './ToolCallMonitor';
import ApprovalGateway from './ApprovalGateway';
import MetricsDisplay from './MetricsDisplay';
import WorkflowTimeline from './WorkflowTimeline';
import RiskSummaryReport from './RiskSummaryReport';

const agentIcons = {
  sentinel: Shield,
  simulator: Target,
  negotiator: Zap,
  executor: Activity,
  audit: FileCheck
};

const agentColors = {
  sentinel: 'agent-sentinel',
  simulator: 'agent-simulator',
  negotiator: 'agent-negotiator',
  executor: 'agent-executor',
  audit: 'agent-audit'
};

const ZeroTouchDashboard: React.FC = () => {
  const { 
    state, 
    pendingApproval, 
    startWorkflow, 
    resetWorkflow, 
    handleApproval 
  } = useZeroTouchWorkflow();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ZeroTouch Port Strike Response
            </h1>
          </div>
          <Badge variant="outline" className="animate-pulse">
            Live Demo
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={startWorkflow}
            disabled={state.isRunning}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            <Play className="h-4 w-4 mr-2" />
            {state.isRunning ? 'Running...' : 'Start Demo'}
          </Button>
          
          <Button
            onClick={resetWorkflow}
            variant="outline"
            disabled={state.isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Agents & Network */}
        <div className="lg:col-span-1 space-y-6">
          {/* Agent Status Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>AI Agents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.agents.map((agent) => {
                const IconComponent = agentIcons[agent.type];
                const colorClass = agentColors[agent.type];
                
                return (
                  <motion.div
                    key={agent.id}
                    layout
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      agent.status === 'processing' ? 'animate-agent-glow' : ''
                    }`}
                    style={{
                      borderColor: agent.status === 'processing' ? `hsl(var(--${colorClass}))` : 'hsl(var(--border))',
                      backgroundColor: agent.status === 'success' ? `hsl(var(--${colorClass}) / 0.1)` : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-${colorClass}/20`}>
                          <IconComponent className={`h-4 w-4 text-${colorClass}`} />
                        </div>
                        <div>
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            agent.status === 'success' ? 'default' :
                            agent.status === 'processing' ? 'secondary' :
                            agent.status === 'error' ? 'destructive' :
                            agent.status === 'waiting' ? 'outline' : 'secondary'
                          }
                          className={
                            agent.status === 'processing' ? 'animate-pulse' : ''
                          }
                        >
                          {agent.status}
                        </Badge>
                        
                        {agent.confidence !== undefined && agent.confidence > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(agent.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {agent.status === 'processing' && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                        className={`mt-2 h-1 bg-${colorClass} rounded-full`}
                      />
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Agent Network Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Network</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentNetworkGraph agents={state.agents} />
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Map & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Port Map */}
          <Card>
            <CardHeader>
              <CardTitle>Global Port Status</CardTitle>
            </CardHeader>
            <CardContent>
              <PortMap ports={state.ports} />
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowTimeline 
                currentStep={state.currentStep} 
                totalSteps={state.totalSteps}
                isRunning={state.isRunning}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tools & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tool Call Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolCallMonitor toolCalls={state.toolCalls} />
            </CardContent>
          </Card>

          {/* Metrics Display */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsDisplay metrics={state.metrics} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Summary Report */}
      <RiskSummaryReport 
        visible={state.agents.every(agent => agent.status === 'success') && !state.isRunning} 
      />

      {/* Approval Gateway Modal */}
      <AnimatePresence>
        {pendingApproval && (
          <ApprovalGateway
            approval={pendingApproval}
            onApprove={() => handleApproval(true)}
            onReject={() => handleApproval(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZeroTouchDashboard;