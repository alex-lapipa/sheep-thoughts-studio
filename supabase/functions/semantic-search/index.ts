import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate semantic embedding using Lovable AI Gateway
async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    // Use Lovable AI to generate a semantic representation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are a semantic encoder. Given text, output exactly 1536 floating point numbers between -1 and 1 that represent the semantic meaning. Output ONLY the numbers separated by commas, no other text."
          },
          {
            role: "user",
            content: `Encode this text semantically: "${text.substring(0, 500)}"`
          }
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.error("AI embedding error:", response.status);
      // Fallback to deterministic hash-based embedding
      return generateHashEmbedding(text);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      const numbers = content.split(',').map((n: string) => parseFloat(n.trim())).filter((n: number) => !isNaN(n));
      if (numbers.length >= 1536) {
        return numbers.slice(0, 1536);
      }
    }
    
    // Fallback if parsing fails
    return generateHashEmbedding(text);
  } catch (error) {
    console.error("Error generating embedding:", error);
    return generateHashEmbedding(text);
  }
}

// Deterministic hash-based embedding fallback
function generateHashEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const idx = (charCode * 31 + i * 17 + j * 13) % 1536;
      embedding[idx] += Math.sin(charCode * 0.1) * 0.1;
    }
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  return embedding.map(val => val / magnitude);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, sources = ["knowledge", "thoughts", "rag"], limit = 10, threshold = 0.3 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query, LOVABLE_API_KEY);

    if (!queryEmbedding) {
      // Fallback to text-based search
      const results: any[] = [];
      
      if (sources.includes("knowledge")) {
        const { data } = await supabase
          .from("bubbles_knowledge")
          .select("id, title, content, category, mode, tags")
          .ilike("content", `%${query}%`)
          .limit(limit);
        if (data) {
          results.push(...data.map((item: any) => ({ 
            ...item, 
            source: "knowledge", 
            similarity: 0.5,
            preview: item.content?.substring(0, 200) + "..."
          })));
        }
      }

      if (sources.includes("thoughts")) {
        const { data } = await supabase
          .from("bubbles_thoughts")
          .select("id, text, mode, trigger_category")
          .ilike("text", `%${query}%`)
          .limit(limit);
        if (data) {
          results.push(...data.map((item: any) => ({ 
            ...item, 
            source: "thoughts", 
            similarity: 0.5,
            title: item.text?.substring(0, 50) + "...",
            preview: item.text
          })));
        }
      }

      if (sources.includes("rag")) {
        const { data } = await supabase
          .from("bubbles_rag_content")
          .select("id, title, type, category, bubbles_wrong_take, comedy_hooks")
          .ilike("bubbles_wrong_take", `%${query}%`)
          .limit(limit);
        if (data) {
          results.push(...data.map((item: any) => ({ 
            ...item, 
            source: "rag", 
            similarity: 0.5,
            preview: item.bubbles_wrong_take?.substring(0, 200) + "..."
          })));
        }
      }

      return new Response(
        JSON.stringify({ 
          results: results.slice(0, limit),
          method: "text",
          total: results.length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Perform semantic search across sources
    const searchPromises: Promise<any>[] = [];

    if (sources.includes("knowledge")) {
      const knowledgeSearch = async () => {
        const { data, error } = await supabase.rpc("search_bubbles_knowledge", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) console.error("Knowledge search error:", error);
        return (data || []).map((item: any) => ({
          ...item,
          source: "knowledge",
          preview: item.content?.substring(0, 200) + "..."
        }));
      };
      searchPromises.push(knowledgeSearch());
    }

    if (sources.includes("thoughts")) {
      const thoughtsSearch = async () => {
        const { data, error } = await supabase.rpc("search_bubbles_thoughts", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) console.error("Thoughts search error:", error);
        return (data || []).map((item: any) => ({
          ...item,
          source: "thoughts",
          title: item.text?.substring(0, 50) + "...",
          preview: item.text
        }));
      };
      searchPromises.push(thoughtsSearch());
    }

    if (sources.includes("rag")) {
      const ragSearch = async () => {
        const { data, error } = await supabase.rpc("search_bubbles_rag_content", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) console.error("RAG search error:", error);
        return (data || []).map((item: any) => ({
          ...item,
          source: "rag",
          preview: item.bubbles_wrong_take?.substring(0, 200) + "..."
        }));
      };
      searchPromises.push(ragSearch());
    }

    const searchResults = await Promise.all(searchPromises);
    const allResults = searchResults.flat();

    // Sort by similarity and limit
    allResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const finalResults = allResults.slice(0, limit);

    return new Response(
      JSON.stringify({ 
        results: finalResults,
        method: "semantic",
        total: allResults.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Semantic search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
