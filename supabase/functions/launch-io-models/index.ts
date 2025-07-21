import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  context?: string;
}

interface AgentAnalysis {
  action: string;
  confidence: number;
  reasoning: string;
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const launchIoApiKey = Deno.env.get('LAUNCH_IO_API_KEY');
    if (!launchIoApiKey) {
      throw new Error('Launch IO API key not configured');
    }

    const { prompt, model = 'gpt-4', temperature = 0.7, max_tokens = 1000, context } = await req.json() as ModelRequest;

    // Call Launch IO AI Models API
    const response = await fetch('https://api.launchpod.ai/v1/models/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${launchIoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: context || 'You are an AI assistant specialized in maritime logistics and supply chain optimization. Provide precise, actionable insights for port operations and crisis management.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Launch IO API Error:', errorText);
      throw new Error(`Launch IO API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Parse the response for structured analysis
    let analysis: AgentAnalysis;
    try {
      // Try to parse as JSON if it's structured
      const content = result.choices?.[0]?.message?.content || result.text || '';
      analysis = JSON.parse(content);
    } catch {
      // Fallback to text analysis
      const content = result.choices?.[0]?.message?.content || result.text || '';
      analysis = {
        action: 'analyze',
        confidence: 0.85,
        reasoning: content,
        data: { raw_response: content }
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      usage: result.usage || {},
      model_used: model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in launch-io-models function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});