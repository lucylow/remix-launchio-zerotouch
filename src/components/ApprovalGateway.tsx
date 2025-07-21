import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ApprovalRequest } from '../types/zerotouch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ApprovalGatewayProps {
  approval: ApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
}

const ApprovalGateway: React.FC<ApprovalGatewayProps> = ({
  approval,
  onApprove,
  onReject
}) => {
  const [timeLeft, setTimeLeft] = useState(approval.timeout);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / approval.timeout) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-warning shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 bg-warning/20 rounded-full">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
            <CardTitle className="text-xl">Human Approval Required</CardTitle>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="animate-pulse">
                URGENT
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Approval Message */}
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">
                {approval.message}
              </div>
              <div className="text-sm text-muted-foreground">
                The AI system requires human authorization to proceed with container rerouting
              </div>
            </div>

            {/* Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Requesting Agent:</span>
                <span className="font-medium">Diplomat (Negotiator)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Action:</span>
                <span className="font-medium">Reroute 150 containers</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Destination:</span>
                <span className="font-medium">Port of Oakland</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost Impact:</span>
                <span className="font-medium text-success">-$2.1M savings</span>
              </div>
            </div>

            {/* Timeout Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Auto-decline in:</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-warning h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={onReject}
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              
              <Button
                onClick={onApprove}
                variant="outline"
                className="flex-1 border-success text-success hover:bg-success hover:text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>

            {/* Warning */}
            <div className="text-xs text-center text-muted-foreground bg-warning/10 rounded p-2">
              ⚠️ This action will modify live logistics systems and cannot be undone
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ApprovalGateway;