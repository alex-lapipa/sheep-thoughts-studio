import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate embedding using Lovable AI Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: [text],
      model: "text-embedding-3-small",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Embedding API error:", response.status, errorText);
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, texts } = await req.json();
    
    if (!text && (!texts || texts.length === 0)) {
      return new Response(
        JSON.stringify({ error: "text or texts is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle single text or array of texts
    const inputTexts: string[] = texts || [text];
    
    // Generate embeddings for each text (batching for efficiency)
    const embeddings: number[][] = [];
    
    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < inputTexts.length; i += batchSize) {
      const batch = inputTexts.slice(i, i + batchSize);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: batch,
          model: "text-embedding-3-small",
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          i -= batchSize; // Retry this batch
          continue;
        }
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      embeddings.push(...data.data.map((d: any) => d.embedding));
    }

    return new Response(
      JSON.stringify({ 
        embeddings,
        dimensions: 1536,
        model: "text-embedding-3-small",
      }),
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
