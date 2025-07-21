import { useState } from "react";
import ZeroTouchDashboard from "../components/ZeroTouchDashboard";
import { LaunchIODemo } from "../components/LaunchIODemo";
import { ZeroTouchChatbot } from "../components/ZeroTouchChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Ship } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            ZeroTouch Port Crisis Dashboard
          </TabsTrigger>
          <TabsTrigger value="launch-io" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Launch IO AI Integration Demo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <ZeroTouchDashboard />
        </TabsContent>
        
        <TabsContent value="launch-io">
          <LaunchIODemo />
        </TabsContent>
      </Tabs>
      
      {/* Floating ZeroTouch AI Chatbot */}
      <ZeroTouchChatbot />
    </div>
  );
};

export default Index;
