import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolCall } from '../types/zerotouch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, XCircle, Loader2, Terminal } from 'lucide-react';

interface ToolCallMonitorProps {
  toolCalls: ToolCall[];
}

const ToolCallMonitor: React.FC<ToolCallMonitorProps> = ({ toolCalls }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Loader2;
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-processing';
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const sortedCalls = [...toolCalls].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Live Tool Calls</span>
        </div>
        <Badge variant="outline">
          {toolCalls.length} calls
        </Badge>
      </div>

      {/* Tool Call List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedCalls.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tool calls yet</p>
                <p className="text-xs">Start the demo to see AI agents in action</p>
              </div>
            ) : (
              sortedCalls.map((call) => {
                const StatusIcon = getStatusIcon(call.status);
                const statusColor = getStatusColor(call.status);
                
                return (
                  <motion.div
                    key={call.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-muted/30 rounded-lg p-3 border"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <StatusIcon 
                          className={`h-4 w-4 ${statusColor} ${
                            call.status === 'pending' ? 'animate-spin' : ''
                          }`}
                        />
                        <span className="font-mono text-sm font-medium">
                          {call.toolName}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(call.timestamp)}</span>
                        {call.duration && (
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(call.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Agent */}
                    <div className="text-xs text-muted-foreground mb-2">
                      Agent: <span className="font-medium">{call.agentId}</span>
                    </div>

                    {/* Parameters */}
                    {Object.keys(call.parameters).length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-medium mb-1">Parameters:</div>
                        <div className="bg-background/50 rounded p-2 font-mono text-xs">
                          {Object.entries(call.parameters).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="text-primary mr-2">{key}:</span>
                              <span className="text-foreground">
                                {typeof value === 'object' 
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {call.result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2"
                      >
                        <div className="text-xs font-medium mb-1">Result:</div>
                        <div className="bg-success/10 border border-success/20 rounded p-2 font-mono text-xs">
                          {typeof call.result === 'object' ? (
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(call.result, null, 2)}
                            </pre>
                          ) : (
                            <span>{String(call.result)}</span>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Progress bar for pending calls */}
                    {call.status === 'pending' && (
                      <motion.div
                        className="mt-2 h-1 bg-muted rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ToolCallMonitor;