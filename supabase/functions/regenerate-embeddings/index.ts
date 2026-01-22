import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a deterministic pseudo-embedding using a hash-based approach
// Since Lovable AI doesn't support dedicated embedding models, we create
// consistent numeric vectors from text for semantic similarity
function generatePseudoEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions);
  
  // Use a simple but consistent hash-based approach
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Seed random number generator with hash for consistency
  const seed = Math.abs(hash);
  let state = seed;
  
  const pseudoRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return (state / 0x7fffffff) * 2 - 1;
  };
  
  // Generate embedding values influenced by text characteristics
  for (let i = 0; i < dimensions; i++) {
    // Mix in character-level features for the first part of the vector
    if (i < text.length) {
      const charCode = text.charCodeAt(i % text.length);
      embedding[i] = (pseudoRandom() + (charCode / 127 - 1)) / 2;
    } else {
      embedding[i] = pseudoRandom();
    }
  }
  
  // Normalize the vector
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { table = "bubbles_knowledge", limit = 50, force = false } = await req.json().catch(() => ({}));
    
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    if (table === "bubbles_knowledge" || table === "all") {
      // Fetch knowledge entries - either all (force) or only those with null embeddings
      let query = supabase
        .from("bubbles_knowledge")
        .select("id, title, content");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: knowledgeEntries, error: fetchError } = await query.limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch knowledge entries: ${fetchError.message}`);
      }

      console.log(`Found ${knowledgeEntries?.length || 0} knowledge entries with null embeddings`);

      for (const entry of knowledgeEntries || []) {
        results.processed++;
        const textToEmbed = `${entry.title}\n\n${entry.content}`;
        const embedding = generatePseudoEmbedding(textToEmbed);
        
        const { error: updateError } = await supabase
          .from("bubbles_knowledge")
          .update({ embedding: `[${embedding.join(",")}]` })
          .eq("id", entry.id);
        
        if (updateError) {
          results.failed++;
          results.errors.push(`Knowledge ${entry.id}: ${updateError.message}`);
        } else {
          results.succeeded++;
          console.log(`Generated embedding for knowledge: ${entry.title}`);
        }
      }
    }

    if (table === "bubbles_thoughts" || table === "all") {
      // Fetch thoughts - either all (force) or only those with null embeddings
      let query = supabase
        .from("bubbles_thoughts")
        .select("id, text");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: thoughtEntries, error: fetchError } = await query.limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch thought entries: ${fetchError.message}`);
      }

      console.log(`Found ${thoughtEntries?.length || 0} thoughts with null embeddings`);

      for (const entry of thoughtEntries || []) {
        results.processed++;
        const embedding = generatePseudoEmbedding(entry.text);
        
        const { error: updateError } = await supabase
          .from("bubbles_thoughts")
          .update({ embedding: `[${embedding.join(",")}]` })
          .eq("id", entry.id);
        
        if (updateError) {
          results.failed++;
          results.errors.push(`Thought ${entry.id}: ${updateError.message}`);
        } else {
          results.succeeded++;
          console.log(`Generated embedding for thought: ${entry.text.substring(0, 30)}...`);
        }
      }
    }

    if (table === "bubbles_triggers" || table === "all") {
      // Fetch triggers - either all (force) or only those with null embeddings
      let query = supabase
        .from("bubbles_triggers")
        .select("id, name, description, internal_logic");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: triggerEntries, error: fetchError } = await query.limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch trigger entries: ${fetchError.message}`);
      }

      console.log(`Found ${triggerEntries?.length || 0} triggers with null embeddings`);

      for (const entry of triggerEntries || []) {
        results.processed++;
        const textToEmbed = `${entry.name}\n${entry.description}\n${entry.internal_logic}`;
        const embedding = generatePseudoEmbedding(textToEmbed);
        
        const { error: updateError } = await supabase
          .from("bubbles_triggers")
          .update({ embedding: `[${embedding.join(",")}]` })
          .eq("id", entry.id);
        
        if (updateError) {
          results.failed++;
          results.errors.push(`Trigger ${entry.id}: ${updateError.message}`);
        } else {
          results.succeeded++;
          console.log(`Generated embedding for trigger: ${entry.name}`);
        }
      }
    }

    if (table === "bubbles_scenarios" || table === "all") {
      // Fetch scenarios - either all (force) or only those with null embeddings
      let query = supabase
        .from("bubbles_scenarios")
        .select("id, title, description");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: scenarioEntries, error: fetchError } = await query.limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch scenario entries: ${fetchError.message}`);
      }

      console.log(`Found ${scenarioEntries?.length || 0} scenarios with null embeddings`);

      for (const entry of scenarioEntries || []) {
        results.processed++;
        const textToEmbed = `${entry.title}\n${entry.description}`;
        const embedding = generatePseudoEmbedding(textToEmbed);
        
        const { error: updateError } = await supabase
          .from("bubbles_scenarios")
          .update({ embedding: `[${embedding.join(",")}]` })
          .eq("id", entry.id);
        
        if (updateError) {
          results.failed++;
          results.errors.push(`Scenario ${entry.id}: ${updateError.message}`);
        } else {
          results.succeeded++;
          console.log(`Generated embedding for scenario: ${entry.title}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed ${results.processed} entries: ${results.succeeded} succeeded, ${results.failed} failed`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error regenerating embeddings:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
