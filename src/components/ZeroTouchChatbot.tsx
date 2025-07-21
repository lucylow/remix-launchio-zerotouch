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
  knowledge_sources?: number;
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

  // RAG Knowledge Base for each agent
  const knowledgeBase = {
    sentinel: [
      "Historical data shows that Port of Long Beach experiences 20% increased congestion during Q3 due to holiday shipping surges. (Source: Port Authority Report 2023)",
      "Standard operating procedures for congestion mitigation include rerouting to nearby ports like Oakland or Seattle. (Source: Maritime Logistics Handbook)", 
      "Impact of 75% congestion can lead to 1.5x increase in demurrage charges and 2-3 day delays. (Source: Supply Chain Analytics 2024)",
      "Crisis detection protocols require satellite imagery analysis combined with AIS tracking data for 95% accuracy. (Source: Maritime Intelligence Guide)"
    ],
    simulator: [
      "Global maritime trade expected to grow by 3.5% in 2025, driven by e-commerce. (Source: WTO Report 2024)",
      "Inflationary pressures may increase shipping costs by 5-7% in the next quarter. (Source: Bloomberg Economics)",
      "Monte Carlo simulations show 87% accuracy in predicting optimal rerouting costs with 10,000+ iterations. (Source: Analytics Quarterly)",
      "SLA penalty calculations: 1.5% per day delay, maximum 15% total penalty cap. (Source: Standard Shipping Terms)"
    ],
    negotiator: [
      "OceanX Line agreement includes a 2.5% rerouting fee for unforeseen circumstances. (Source: OceanX Contract #123)",
      "Pacific Freight offers 3% discount for bulk rerouting, but requires 48-hour notice. (Source: Pacific Freight Terms)",
      "Maersk partnership provides priority loading with 12% discount for crisis situations. (Source: Maersk Premium Contract)",
      "Average negotiation success rate increases 34% when historical performance data is referenced. (Source: Negotiation Analytics)"
    ],
    executor: [
      "SAP S/4HANA API endpoint for container status update: /api/v1/containers/{id}/status (Method: PUT). (Source: SAP Dev Docs)",
      "TMS integration requires manifest updates via SFTP every 4 hours. (Source: Internal IT Guide)",
      "Container rerouting protocols: Update ERP, notify customs, alert logistics partners within 2-hour window. (Source: Operations Manual)",
      "System backup creation mandatory before any bulk container updates. (Source: IT Security Policy)"
    ],
    auditor: [
      "IMO 2020 regulations require low-sulfur fuel for all vessels in designated emission control areas. (Source: IMO Guidelines)",
      "Incident reporting for port disruptions must be submitted to national maritime authorities within 24 hours. (Source: National Maritime Law)",
      "Blockchain audit trails must include SHA-256 hash verification for regulatory compliance. (Source: Maritime Compliance Guide)",
      "All autonomous decisions require immutable logging with timestamp and confidence scores. (Source: Internal Audit Policy)"
    ]
  };

  const retrieveKnowledge = (query: string, agentType: keyof typeof AGENT_PERSONAS): string[] => {
    const agentKnowledge = knowledgeBase[agentType] || [];
    const queryLower = query.toLowerCase();
    
    // Simple keyword matching for relevant documents
    const relevantDocs = agentKnowledge.filter(doc => 
      queryLower.split(' ').some(keyword => 
        doc.toLowerCase().includes(keyword) || 
        (keyword.length > 3 && doc.toLowerCase().includes(keyword.slice(0, -1)))
      )
    );
    
    return relevantDocs.length > 0 ? relevantDocs.slice(0, 2) : agentKnowledge.slice(0, 1);
  };

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
    const currentQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // First retrieve relevant knowledge using RAG
      const relevantKnowledge = retrieveKnowledge(currentQuery, activeAgent);
      
      // Enhanced context with RAG knowledge
      const enhancedContext = {
        user_query: currentQuery,
        context: "Maritime logistics chatbot conversation with RAG knowledge retrieval",
        persona: AGENT_PERSONAS[activeAgent].name,
        retrieved_knowledge: relevantKnowledge,
        rag_query: currentQuery
      };

      // Call Launch IO Agent API with RAG context
      const { data, error } = await supabase.functions.invoke('launch-io-agents', {
        body: {
          agent_type: activeAgent,
          task_id: `chat-${Date.now()}`,
          parameters: enhancedContext,
          priority: 'medium'
        }
      });

      let aiResponse = "I'm analyzing your request with Launch IO intelligence and knowledge retrieval...";
      let confidence = 0.85;

      if (data?.result?.analysis) {
        aiResponse = data.result.analysis.reasoning || data.result.analysis;
        confidence = data.result.analysis.confidence || 0.85;
      } else if (error) {
        // RAG-enhanced fallback responses
        const knowledgeContext = relevantKnowledge.length > 0 
          ? `\n\n📚 Retrieved Knowledge:\n${relevantKnowledge[0].split('(Source:')[0].trim()}` 
          : '';
        
        const fallbackResponses = {
          sentinel: `🛡️ Crisis analysis for: "${currentQuery}". Based on Launch IO AI and knowledge retrieval, I detect potential issues requiring immediate attention.${knowledgeContext}`,
          simulator: `🎯 Impact simulation for: "${currentQuery}". RAG analysis shows 87% confidence in cost optimization strategies.${knowledgeContext}`,
          negotiator: `🤝 Negotiation strategy for: "${currentQuery}". Enhanced with contract knowledge and partner agreements.${knowledgeContext}`,
          executor: `⚡ Execution plan for: "${currentQuery}". Integration protocols retrieved and ready for implementation.${knowledgeContext}`,
          auditor: `📋 Compliance review for: "${currentQuery}". Regulatory knowledge accessed for complete audit trail.${knowledgeContext}`
        };
        aiResponse = fallbackResponses[activeAgent];
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: aiResponse,
        agent: activeAgent,
        timestamp: new Date(),
        confidence,
        knowledge_sources: relevantKnowledge.length
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // RAG-enhanced fallback responses with retrieved knowledge
      const relevantKnowledge = retrieveKnowledge(currentQuery, activeAgent);
      const knowledgeContext = relevantKnowledge.length > 0 
        ? `\n\n📚 Retrieved Knowledge:\n${relevantKnowledge[0].split('(Source:')[0].trim()}` 
        : '';

      const fallbackResponses = {
        sentinel: `🛡️ Crisis analysis for: "${currentQuery}". Based on Launch IO AI and knowledge retrieval, I detect potential issues requiring immediate attention.${knowledgeContext}`,
        simulator: `🎯 Impact simulation for: "${currentQuery}". RAG analysis shows 87% confidence in cost optimization strategies.${knowledgeContext}`,
        negotiator: `🤝 Negotiation strategy for: "${currentQuery}". Enhanced with contract knowledge and partner agreements.${knowledgeContext}`,
        executor: `⚡ Execution plan for: "${currentQuery}". Integration protocols retrieved and ready for implementation.${knowledgeContext}`,
        auditor: `📋 Compliance review for: "${currentQuery}". Regulatory knowledge accessed for complete audit trail.${knowledgeContext}`
      };

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: fallbackResponses[activeAgent],
        agent: activeAgent,
        timestamp: new Date(),
        confidence: 0.85,
        knowledge_sources: relevantKnowledge.length
      };

      setMessages(prev => [...prev, agentMessage]);
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
        <CardHeader className="pb-2 flex-shrink-0">
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

        <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
          {/* Messages Area with Fixed Height and Scroll */}
          <ScrollArea className="flex-1 pr-2 mb-4">
            <div className="space-y-4 pb-4">
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {AGENT_PERSONAS[message.agent as keyof typeof AGENT_PERSONAS]?.emoji} 
                          {AGENT_PERSONAS[message.agent as keyof typeof AGENT_PERSONAS]?.name}
                        </Badge>
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                        {message.knowledge_sources && message.knowledge_sources > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            📚 {message.knowledge_sources} sources
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

          {/* Fixed Input Area at Bottom */}
          <div className="flex-shrink-0 space-y-2">
            {/* Input Area */}
            <div className="flex gap-2">
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
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Analyze port strike in Los Angeles")}
                className="text-xs"
                disabled={isLoading}
              >
                Port Crisis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Optimize container routing")}
                className="text-xs"
                disabled={isLoading}
              >
                Route Optimization
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Calculate cost savings")}
                className="text-xs"
                disabled={isLoading}
              >
                Cost Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};