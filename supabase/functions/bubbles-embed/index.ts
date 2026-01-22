import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a deterministic pseudo-embedding for semantic similarity
// This creates consistent vectors from text that can be compared
function generatePseudoEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions);
  
  // Normalize and clean text
  const normalizedText = text.toLowerCase().trim();
  
  // Create multiple hash seeds for better distribution
  let hash1 = 0, hash2 = 0, hash3 = 0;
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash2 = ((hash2 << 7) - hash2) + char * (i + 1);
    hash3 = ((hash3 << 3) - hash3) + char * char;
    hash1 = hash1 & hash1;
    hash2 = hash2 & hash2;
    hash3 = hash3 & hash3;
  }
  
  // Extract word-level features
  const words = normalizedText.split(/\s+/);
  const wordHashes: number[] = words.slice(0, 100).map(word => {
    let h = 0;
    for (let i = 0; i < word.length; i++) {
      h = ((h << 5) - h) + word.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  });
  
  // Seeded random number generator
  let state = Math.abs(hash1 ^ hash2 ^ hash3);
  const pseudoRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return (state / 0x7fffffff) * 2 - 1;
  };
  
  // Generate embedding with text-influenced values
  for (let i = 0; i < dimensions; i++) {
    let value = pseudoRandom();
    
    // Mix in character-level features
    if (i < normalizedText.length) {
      const charCode = normalizedText.charCodeAt(i % normalizedText.length);
      value = (value + (charCode / 127 - 1)) / 2;
    }
    
    // Mix in word-level features
    if (wordHashes.length > 0) {
      const wordIdx = i % wordHashes.length;
      value = (value + ((wordHashes[wordIdx] % 1000) / 500 - 1)) / 2;
    }
    
    embedding[i] = value;
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  for (let i = 0; i < dimensions; i++) {
    embedding[i] = embedding[i] / magnitude;
  }
  
  return embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, texts } = await req.json();
    
    // Handle single text or array of texts
    const inputTexts: string[] = texts || [text];
    
    // Generate embeddings for each text
    const embeddings = inputTexts.map((t: string) => generatePseudoEmbedding(t));

    return new Response(
      JSON.stringify({ 
        embeddings,
        dimensions: 1536,
        model: "pseudo-embedding-v2",
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
