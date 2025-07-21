import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Leaf, Clock, Users, TrendingUp } from 'lucide-react';

interface MetricsDisplayProps {
  metrics: {
    costSavings: number;
    carbonReduction: number;
    humanLaborSaved: number;
    timeToResolution: number;
  };
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const metricCards = [
    {
      title: 'Cost Savings',
      value: formatCurrency(metrics.costSavings),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: '+12%',
      description: 'vs manual intervention'
    },
    {
      title: 'Carbon Reduction',
      value: `${metrics.carbonReduction} tons`,
      icon: Leaf,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: '-15%',
      description: 'CO₂ emissions'
    },
    {
      title: 'Time to Resolution',
      value: `${metrics.timeToResolution}m`,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info/10',
      trend: '-87%',
      description: 'vs traditional methods'
    },
    {
      title: 'Human Labor Saved',
      value: `${metrics.humanLaborSaved}h`,
      icon: Users,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: '+94%',
      description: 'efficiency gain'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          const hasValue = metric.title === 'Cost Savings' ? metrics.costSavings > 0 :
                          metric.title === 'Carbon Reduction' ? metrics.carbonReduction > 0 :
                          metric.title === 'Time to Resolution' ? metrics.timeToResolution > 0 :
                          metrics.humanLaborSaved > 0;

          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${hasValue ? 'border-primary/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {metric.title}
                      </div>
                      
                      <motion.div
                        className="text-lg font-bold"
                        key={metric.value}
                        initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
                        animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                        transition={{ duration: 0.3 }}
                      >
                        {hasValue ? metric.value : '—'}
                      </motion.div>
                      
                      {hasValue && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center space-x-1"
                        >
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${metric.color}`}
                          >
                            <TrendingUp className="h-2 w-2 mr-1" />
                            {metric.trend}
                          </Badge>
                        </motion.div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {metric.description}
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </div>

                  {/* Progress indicator for active metrics */}
                  {hasValue && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {metrics.costSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-success/10 to-info/10 rounded-lg p-4 border border-success/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-success">
                Autonomous Resolution Complete
              </div>
              <div className="text-xs text-muted-foreground">
                Crisis resolved without human intervention
              </div>
            </div>
            
            <Badge className="bg-success text-white">
              100% Automated
            </Badge>
          </div>
          
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-success">
                {formatCurrency(metrics.costSavings)}
              </div>
              <div className="text-xs text-muted-foreground">Total Savings</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-info">
                {Math.round(metrics.timeToResolution)}min
              </div>
              <div className="text-xs text-muted-foreground">Resolution Time</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-warning">
                5 Agents
              </div>
              <div className="text-xs text-muted-foreground">Coordinated</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Status Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
        <motion.div
          className="w-2 h-2 bg-success rounded-full"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span>Real-time metrics • Updated every 500ms</span>
      </div>
    </div>
  );
};

export default MetricsDisplay;