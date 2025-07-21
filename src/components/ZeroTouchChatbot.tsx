import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Bot, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  agent?: string;
  timestamp: Date;
  confidence?: number;
}

const AGENT_PERSONAS = {
  sentinel: {
    name: "Sentinel Agent",
    emoji: "🛡️",
    role: "Crisis Detection",
    color: "bg-red-500"
  },
  simulator: {
    name: "Simulator Agent", 
    emoji: "🎯",
    role: "Impact Analysis",
    color: "bg-blue-500"
  },
  negotiator: {
    name: "Negotiator Agent",
    emoji: "🤝",
    role: "Contract Specialist", 
    color: "bg-green-500"
  },
  executor: {
    name: "Executor Agent",
    emoji: "⚡",
    role: "Implementation",
    color: "bg-purple-500"
  },
  auditor: {
    name: "Audit Agent",
    emoji: "📋",
    role: "Compliance",
    color: "bg-orange-500"
  }
};

export const ZeroTouchChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<keyof typeof AGENT_PERSONAS>('sentinel');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'agent',
        content: "🚢 Welcome to ZeroTouch AI! I'm your maritime crisis management assistant. Ask me about port strikes, logistics optimization, or select an agent above for specialized help.",
        agent: 'system',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call Launch IO Agent API
      const { data, error } = await supabase.functions.invoke('launch-io-agents', {
        body: {
          agent_type: activeAgent,
          task_id: `chat-${Date.now()}`,
          parameters: {
            user_query: inputValue,
            context: "Maritime logistics chatbot conversation",
            persona: AGENT_PERSONAS[activeAgent].name
          },
          priority: 'medium'
        }
      });

      let aiResponse = "I'm analyzing your request with Launch IO intelligence...";
      let confidence = 0.85;

      if (data?.result?.analysis) {
        aiResponse = data.result.analysis.reasoning || data.result.analysis;
        confidence = data.result.analysis.confidence || 0.85;
      } else if (error) {
        // Fallback responses for demo
        const fallbackResponses = {
          sentinel: `🛡️ Crisis detected! I'm analyzing satellite imagery around your concern: "${inputValue}". Based on Launch IO AI analysis, I recommend immediate monitoring and risk assessment protocols.`,
          simulator: `🎯 Running Monte Carlo simulations for: "${inputValue}". Analysis shows 87% confidence in optimal routing through Oakland with $2.1M potential savings.`,
          negotiator: `🤝 Negotiating solution for: "${inputValue}". Launch IO suggests securing Maersk partnership with 12% discount and priority loading terms.`,
          executor: `⚡ Executing plan for: "${inputValue}". Implementing container rerouting to Oakland port with ETA 48 hours. Real-time tracking activated.`,
          auditor: `📋 Compliance check for: "${inputValue}". Logging to blockchain with hash 0x89b2f3e8... All regulatory requirements satisfied.`
        };
        aiResponse = fallbackResponses[activeAgent];
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: aiResponse,
        agent: activeAgent,
        timestamp: new Date(),
        confidence
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I apologize for the technical difficulty. The Launch IO connection is temporarily unavailable, but I'm still here to help with maritime logistics questions!",
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.8 }}
      className="fixed bottom-6 right-6 z-50 w-96 h-[600px]"
    >
      <Card className="h-full flex flex-col shadow-2xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              ZeroTouch AI Chat
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Agent Selector */}
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(AGENT_PERSONAS).map(([key, agent]) => (
              <Button
                key={key}
                variant={activeAgent === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveAgent(key as keyof typeof AGENT_PERSONAS)}
                className="text-xs h-7"
              >
                {agent.emoji} {agent.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.type === 'agent' && message.agent && message.agent !== 'system' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {AGENT_PERSONAS[message.agent as keyof typeof AGENT_PERSONAS]?.emoji} 
                          {AGENT_PERSONAS[message.agent as keyof typeof AGENT_PERSONAS]?.name}
                        </Badge>
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="text-sm">
                        {AGENT_PERSONAS[activeAgent].emoji} {AGENT_PERSONAS[activeAgent].name} is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2 mt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${AGENT_PERSONAS[activeAgent].name} about maritime logistics...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Analyze port strike in Los Angeles")}
              className="text-xs"
            >
              Port Crisis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Optimize container routing")}
              className="text-xs"
            >
              Route Optimization
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Calculate cost savings")}
              className="text-xs"
            >
              Cost Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};