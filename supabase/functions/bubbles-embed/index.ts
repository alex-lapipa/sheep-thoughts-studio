import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, texts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle single text or array of texts
    const inputTexts = texts || [text];
    
    // Use the AI gateway to generate embeddings
    // We'll use the chat endpoint creatively to get embeddings
    // For now, we'll use a simple hash-based approach until proper embedding endpoint is available
    
    // Generate embeddings using the AI gateway's embedding-compatible endpoint
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: inputTexts,
        model: "text-embedding-3-small",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Embedding API error:", response.status, errorText);
      
      // Fallback: return placeholder embeddings for development
      const placeholderEmbeddings = inputTexts.map(() => 
        Array(1536).fill(0).map(() => Math.random() * 2 - 1)
      );
      
      return new Response(
        JSON.stringify({ 
          embeddings: placeholderEmbeddings,
          warning: "Using placeholder embeddings - configure embedding model for production"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const embeddings = data.data.map((item: any) => item.embedding);

    return new Response(
      JSON.stringify({ embeddings }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
