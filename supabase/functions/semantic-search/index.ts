import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate high-quality pseudo-embeddings using a hash-based approach
// This MUST match the same algorithm used in regenerate-embeddings for consistency
function generateSemanticEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions);
  
  // Normalize and tokenize text for better semantic representation
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
  
  // Create multiple hash seeds from different parts of the text
  const hashWord = (word: string, seed: number): number => {
    let hash = seed;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  // Initialize embedding with character-level features
  for (let i = 0; i < dimensions; i++) {
    const charIndex = i % normalizedText.length;
    const charCode = normalizedText.charCodeAt(charIndex);
    embedding[i] = (charCode / 127) - 1;
  }
  
  // Add word-level semantic features
  words.forEach((word, wordIndex) => {
    const wordHash = hashWord(word, wordIndex * 31);
    for (let d = 0; d < 8; d++) {
      const dimIndex = (wordHash + d * 191) % dimensions;
      const contribution = ((wordHash >> (d * 4)) & 0xF) / 15 - 0.5;
      embedding[dimIndex] += contribution * (1 / (wordIndex + 1));
    }
  });
  
  // Add n-gram features for phrase similarity
  for (let i = 0; i < normalizedText.length - 2; i++) {
    const trigram = normalizedText.slice(i, i + 3);
    const trigramHash = hashWord(trigram, i);
    const dimIndex = trigramHash % dimensions;
    embedding[dimIndex] += 0.1;
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, sources = ["knowledge", "thoughts", "rag", "triggers"], limit = 10, threshold = 0.3 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate embedding for the query using the same hash-based approach as stored embeddings
    const queryEmbedding = generateSemanticEmbedding(query);
    console.log(`Generated query embedding for: "${query.substring(0, 50)}..." (${queryEmbedding.length} dims)`);

    // Perform semantic search across sources
    const searchPromises: Promise<any>[] = [];

    if (sources.includes("knowledge")) {
      const knowledgeSearch = async () => {
        const { data, error } = await supabase.rpc("search_bubbles_knowledge", {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) {
          console.error("Knowledge search error:", error);
          return [];
        }
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
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) {
          console.error("Thoughts search error:", error);
          return [];
        }
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
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) {
          console.error("RAG search error:", error);
          return [];
        }
        return (data || []).map((item: any) => ({
          ...item,
          source: "rag",
          preview: item.bubbles_wrong_take?.substring(0, 200) + "..."
        }));
      };
      searchPromises.push(ragSearch());
    }

    if (sources.includes("triggers")) {
      const triggersSearch = async () => {
        const { data, error } = await supabase.rpc("search_bubbles_triggers", {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_count: limit,
          match_threshold: threshold,
        });
        if (error) {
          console.error("Triggers search error:", error);
          return [];
        }
        return (data || []).map((item: any) => ({
          ...item,
          source: "triggers",
          title: item.name,
          preview: item.description
        }));
      };
      searchPromises.push(triggersSearch());
    }

    const searchResults = await Promise.all(searchPromises);
    const allResults = searchResults.flat();

    // Sort by similarity and limit
    allResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const finalResults = allResults.slice(0, limit);

    console.log(`Search completed: ${finalResults.length} results from ${sources.join(", ")}`);

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
