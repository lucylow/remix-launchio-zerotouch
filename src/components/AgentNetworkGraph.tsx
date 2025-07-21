import React from 'react';
import { motion } from 'framer-motion';
import { Agent } from '../types/zerotouch';

interface AgentNetworkGraphProps {
  agents: Agent[];
}

const AgentNetworkGraph: React.FC<AgentNetworkGraphProps> = ({ agents }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'hsl(var(--processing))';
      case 'success':
        return 'hsl(var(--success))';
      case 'error':
        return 'hsl(var(--destructive))';
      case 'waiting':
        return 'hsl(var(--warning))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const positions = [
    { x: 50, y: 20 },  // Sentinel - top center
    { x: 20, y: 50 },  // Simulator - left
    { x: 50, y: 80 },  // Negotiator - bottom center
    { x: 80, y: 50 },  // Executor - right
    { x: 50, y: 50 }   // Audit - center
  ];

  return (
    <div className="relative w-full h-64 bg-card rounded-lg border overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {/* Connection lines */}
        {agents.map((agent, index) => {
          if (index === agents.length - 1) return null; // Audit agent connects to all
          const pos1 = positions[index];
          const pos2 = positions[agents.length - 1]; // Audit center
          
          return (
            <motion.line
              key={`connection-${index}`}
              x1={`${pos1.x}%`}
              y1={`${pos1.y}%`}
              x2={`${pos2.x}%`}
              y2={`${pos2.y}%`}
              stroke="hsl(var(--border))"
              strokeWidth="2"
              opacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.2 }}
            />
          );
        })}

        {/* Data flow animation */}
        {agents.some(a => a.status === 'processing') && (
          <motion.circle
            r="3"
            fill="hsl(var(--primary))"
            initial={{ cx: '50%', cy: '20%' }}
            animate={{
              cx: ['50%', '20%', '50%', '80%', '50%'],
              cy: ['20%', '50%', '80%', '50%', '50%']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </svg>

      {/* Agent nodes */}
      {agents.map((agent, index) => {
        const position = positions[index];
        const statusColor = getStatusColor(agent.status);
        
        return (
          <motion.div
            key={agent.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="relative w-12 h-12 rounded-full border-4 bg-card flex items-center justify-center"
              style={{ borderColor: statusColor }}
              animate={agent.status === 'processing' ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.8)',
                  '0 0 0px rgba(59, 130, 246, 0.5)'
                ]
              } : {}}
              transition={{
                duration: 2,
                repeat: agent.status === 'processing' ? Infinity : 0
              }}
            >
              <div className="text-xs font-bold text-foreground">
                {agent.name.charAt(0)}
              </div>
              
              {agent.status === 'success' && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <div className="w-2 h-2 bg-background rounded-full" />
                </motion.div>
              )}
            </motion.div>
            
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs text-center">
              <div className="font-medium">{agent.name}</div>
              {agent.confidence !== undefined && agent.confidence > 0 && (
                <div className="text-muted-foreground">
                  {Math.round(agent.confidence * 100)}%
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentNetworkGraph;