import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate embeddings using Lovable AI Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text.slice(0, 8000), // Limit text length
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

// Fallback: Generate a deterministic pseudo-embedding using a hash-based approach
function generatePseudoEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions);
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const seed = Math.abs(hash);
  let state = seed;
  
  const pseudoRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return (state / 0x7fffffff) * 2 - 1;
  };
  
  for (let i = 0; i < dimensions; i++) {
    if (i < text.length) {
      const charCode = text.charCodeAt(i % text.length);
      embedding[i] = (pseudoRandom() + (charCode / 127 - 1)) / 2;
    } else {
      embedding[i] = pseudoRandom();
    }
  }
  
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
    
    const { table = "bubbles_knowledge", limit = 50, force = false, useAI = true } = await req.json().catch(() => ({}));
    
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
      embeddingMethod: useAI ? "ai" : "pseudo",
    };

    // Helper function to get embedding with fallback
    async function getEmbedding(text: string): Promise<number[]> {
      if (useAI) {
        try {
          return await generateEmbedding(text, LOVABLE_API_KEY!);
        } catch (error) {
          console.warn("AI embedding failed, falling back to pseudo:", error);
          results.embeddingMethod = "pseudo-fallback";
          return generatePseudoEmbedding(text);
        }
      }
      return generatePseudoEmbedding(text);
    }

    // Process bubbles_knowledge
    if (table === "bubbles_knowledge" || table === "all") {
      let query = supabase
        .from("bubbles_knowledge")
        .select("id, title, content, category, mode, tags");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: entries, error: fetchError } = await query.limit(limit);
      if (fetchError) throw new Error(`Failed to fetch knowledge: ${fetchError.message}`);

      console.log(`Processing ${entries?.length || 0} knowledge entries...`);

      for (const entry of entries || []) {
        results.processed++;
        try {
          // Create rich text for better semantic understanding
          const textToEmbed = [
            `Title: ${entry.title}`,
            `Category: ${entry.category}`,
            entry.mode ? `Mode: ${entry.mode}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
            `Content: ${entry.content}`,
          ].filter(Boolean).join("\n");
          
          const embedding = await getEmbedding(textToEmbed);
          
          const { error: updateError } = await supabase
            .from("bubbles_knowledge")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (updateError) {
            results.failed++;
            results.errors.push(`Knowledge ${entry.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            console.log(`✓ Knowledge: ${entry.title}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Knowledge ${entry.id}: ${error}`);
        }
      }
    }

    // Process bubbles_thoughts
    if (table === "bubbles_thoughts" || table === "all") {
      let query = supabase
        .from("bubbles_thoughts")
        .select("id, text, mode, trigger_category, tags");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: entries, error: fetchError } = await query.limit(limit);
      if (fetchError) throw new Error(`Failed to fetch thoughts: ${fetchError.message}`);

      console.log(`Processing ${entries?.length || 0} thoughts...`);

      for (const entry of entries || []) {
        results.processed++;
        try {
          const textToEmbed = [
            `Thought: ${entry.text}`,
            `Mode: ${entry.mode}`,
            entry.trigger_category ? `Trigger: ${entry.trigger_category}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = await getEmbedding(textToEmbed);
          
          const { error: updateError } = await supabase
            .from("bubbles_thoughts")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (updateError) {
            results.failed++;
            results.errors.push(`Thought ${entry.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            console.log(`✓ Thought: ${entry.text.substring(0, 40)}...`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Thought ${entry.id}: ${error}`);
        }
      }
    }

    // Process bubbles_triggers
    if (table === "bubbles_triggers" || table === "all") {
      let query = supabase
        .from("bubbles_triggers")
        .select("id, name, description, internal_logic, category, example_scenario, example_bubbles, tags");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: entries, error: fetchError } = await query.limit(limit);
      if (fetchError) throw new Error(`Failed to fetch triggers: ${fetchError.message}`);

      console.log(`Processing ${entries?.length || 0} triggers...`);

      for (const entry of entries || []) {
        results.processed++;
        try {
          const exampleBubbles = Array.isArray(entry.example_bubbles) ? entry.example_bubbles.join("; ") : "";
          const textToEmbed = [
            `Trigger: ${entry.name}`,
            `Category: ${entry.category}`,
            `Description: ${entry.description}`,
            `Logic: ${entry.internal_logic}`,
            entry.example_scenario ? `Example: ${entry.example_scenario}` : "",
            exampleBubbles ? `Sample responses: ${exampleBubbles}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = await getEmbedding(textToEmbed);
          
          const { error: updateError } = await supabase
            .from("bubbles_triggers")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (updateError) {
            results.failed++;
            results.errors.push(`Trigger ${entry.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            console.log(`✓ Trigger: ${entry.name}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Trigger ${entry.id}: ${error}`);
        }
      }
    }

    // Process bubbles_scenarios
    if (table === "bubbles_scenarios" || table === "all") {
      let query = supabase
        .from("bubbles_scenarios")
        .select("id, title, description, start_mode, end_mode, trigger_category, tags, beats");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: entries, error: fetchError } = await query.limit(limit);
      if (fetchError) throw new Error(`Failed to fetch scenarios: ${fetchError.message}`);

      console.log(`Processing ${entries?.length || 0} scenarios...`);

      for (const entry of entries || []) {
        results.processed++;
        try {
          const beatsText = entry.beats ? JSON.stringify(entry.beats) : "";
          const textToEmbed = [
            `Scenario: ${entry.title}`,
            `Description: ${entry.description}`,
            `Mode transition: ${entry.start_mode} → ${entry.end_mode}`,
            entry.trigger_category ? `Trigger: ${entry.trigger_category}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
            beatsText ? `Story beats: ${beatsText.slice(0, 500)}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = await getEmbedding(textToEmbed);
          
          const { error: updateError } = await supabase
            .from("bubbles_scenarios")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (updateError) {
            results.failed++;
            results.errors.push(`Scenario ${entry.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            console.log(`✓ Scenario: ${entry.title}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Scenario ${entry.id}: ${error}`);
        }
      }
    }

    // Process bubbles_rag_content
    if (table === "bubbles_rag_content" || table === "all") {
      let query = supabase
        .from("bubbles_rag_content")
        .select("id, title, type, category, bubbles_wrong_take, comedy_hooks, signature_lines, canonical_claim, tags, avoid");
      
      if (!force) {
        query = query.is("embedding", null);
      }
      
      const { data: entries, error: fetchError } = await query.limit(limit);
      if (fetchError) throw new Error(`Failed to fetch RAG content: ${fetchError.message}`);

      console.log(`Processing ${entries?.length || 0} RAG content entries...`);

      for (const entry of entries || []) {
        results.processed++;
        try {
          const comedyHooks = Array.isArray(entry.comedy_hooks) ? entry.comedy_hooks.join("; ") : "";
          const signatureLines = Array.isArray(entry.signature_lines) ? entry.signature_lines.join("; ") : "";
          const avoidList = Array.isArray(entry.avoid) ? entry.avoid.join("; ") : "";
          
          const textToEmbed = [
            `Topic: ${entry.title}`,
            `Type: ${entry.type}`,
            entry.category ? `Category: ${entry.category}` : "",
            entry.canonical_claim ? `True claim: ${entry.canonical_claim}` : "",
            `Bubbles' wrong take: ${entry.bubbles_wrong_take}`,
            comedyHooks ? `Comedy hooks: ${comedyHooks}` : "",
            signatureLines ? `Signature lines: ${signatureLines}` : "",
            avoidList ? `Things to avoid: ${avoidList}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = await getEmbedding(textToEmbed);
          
          const { error: updateError } = await supabase
            .from("bubbles_rag_content")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (updateError) {
            results.failed++;
            results.errors.push(`RAG ${entry.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            console.log(`✓ RAG: ${entry.title}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`RAG ${entry.id}: ${error}`);
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
