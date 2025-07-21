import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WORKFLOW_STEPS } from '../data/mockData';

interface WorkflowTimelineProps {
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  currentStep,
  totalSteps,
  isRunning
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep && isRunning) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'active':
        return Play;
      default:
        return Circle;
    }
  };

  const getStepColor = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'active':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </div>
        <Badge variant={isRunning ? 'default' : 'outline'}>
          {isRunning ? 'Running' : 'Ready'}
        </Badge>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3">
        {WORKFLOW_STEPS.map((step, index) => {
          const StepIcon = getStepIcon(index);
          const stepColor = getStepColor(index);
          const status = getStepStatus(index);
          
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                status === 'active' ? 'bg-primary/10 border border-primary/20' :
                status === 'completed' ? 'bg-success/5' : 'bg-muted/30'
              }`}
            >
              {/* Step Icon */}
              <div className={`flex-shrink-0 mt-0.5 ${stepColor}`}>
                <StepIcon 
                  className={`h-5 w-5 ${
                    status === 'active' && isRunning ? 'animate-pulse' : ''
                  }`}
                />
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">
                    {step.title}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs capitalize"
                    >
                      {step.agent}
                    </Badge>
                    
                    {status === 'active' && (
                      <Badge className="text-xs animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.expectedDuration}s
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  Tool: <span className="font-mono">{step.tool}</span>
                </div>

                {/* Active Step Progress */}
                {status === 'active' && isRunning && (
                  <motion.div
                    className="mt-2 h-1 bg-muted rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ 
                        duration: step.expectedDuration,
                        ease: 'linear'
                      }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Connection Line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="absolute left-8 top-12 w-0.5 h-8 bg-border" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ETA */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground bg-muted/30 rounded p-2"
        >
          Estimated completion: {Math.max(0, 5 - currentStep)} minutes remaining
        </motion.div>
      )}
    </div>
  );
};

export default WorkflowTimeline;