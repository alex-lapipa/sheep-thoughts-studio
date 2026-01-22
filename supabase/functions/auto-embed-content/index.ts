import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate semantic embeddings using hash-based approach
function generateSemanticEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions);
  
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
  
  const hashWord = (word: string, seed: number): number => {
    let hash = seed;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  for (let i = 0; i < dimensions; i++) {
    const charIndex = i % normalizedText.length;
    const charCode = normalizedText.charCodeAt(charIndex);
    embedding[i] = (charCode / 127) - 1;
  }
  
  words.forEach((word, wordIndex) => {
    const wordHash = hashWord(word, wordIndex * 31);
    for (let d = 0; d < 8; d++) {
      const dimIndex = (wordHash + d * 191) % dimensions;
      const contribution = ((wordHash >> (d * 4)) & 0xF) / 15 - 0.5;
      embedding[dimIndex] += contribution * (1 / (wordIndex + 1));
    }
  });
  
  for (let i = 0; i < normalizedText.length - 2; i++) {
    const trigram = normalizedText.slice(i, i + 3);
    const trigramHash = hashWord(trigram, i);
    const dimIndex = trigramHash % dimensions;
    embedding[dimIndex] += 0.1;
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

interface ProcessResult {
  table: string;
  processed: number;
  succeeded: number;
  failed: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Auto-embedding cron job started`);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const results: ProcessResult[] = [];
    const BATCH_LIMIT = 20; // Process up to 20 items per table per run

    // Process bubbles_knowledge
    const { data: knowledge } = await supabase
      .from("bubbles_knowledge")
      .select("id, title, content, category, mode, tags")
      .is("embedding", null)
      .limit(BATCH_LIMIT);

    if (knowledge && knowledge.length > 0) {
      let succeeded = 0;
      let failed = 0;
      
      for (const entry of knowledge) {
        try {
          const textToEmbed = [
            `Title: ${entry.title}`,
            `Category: ${entry.category}`,
            entry.mode ? `Mode: ${entry.mode}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
            `Content: ${entry.content}`,
          ].filter(Boolean).join("\n");
          
          const embedding = generateSemanticEmbedding(textToEmbed);
          
          const { error } = await supabase
            .from("bubbles_knowledge")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (error) {
            failed++;
            console.error(`Failed knowledge ${entry.id}:`, error.message);
          } else {
            succeeded++;
            console.log(`✓ Knowledge: ${entry.title}`);
          }
        } catch (e) {
          failed++;
          console.error(`Error processing knowledge ${entry.id}:`, e);
        }
      }
      
      results.push({ table: "bubbles_knowledge", processed: knowledge.length, succeeded, failed });
    }

    // Process bubbles_thoughts
    const { data: thoughts } = await supabase
      .from("bubbles_thoughts")
      .select("id, text, mode, trigger_category, tags")
      .is("embedding", null)
      .limit(BATCH_LIMIT);

    if (thoughts && thoughts.length > 0) {
      let succeeded = 0;
      let failed = 0;
      
      for (const entry of thoughts) {
        try {
          const textToEmbed = [
            `Thought: ${entry.text}`,
            `Mode: ${entry.mode}`,
            entry.trigger_category ? `Trigger: ${entry.trigger_category}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = generateSemanticEmbedding(textToEmbed);
          
          const { error } = await supabase
            .from("bubbles_thoughts")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (error) {
            failed++;
          } else {
            succeeded++;
            console.log(`✓ Thought: ${entry.text.substring(0, 40)}...`);
          }
        } catch (e) {
          failed++;
        }
      }
      
      results.push({ table: "bubbles_thoughts", processed: thoughts.length, succeeded, failed });
    }

    // Process bubbles_rag_content
    const { data: ragContent } = await supabase
      .from("bubbles_rag_content")
      .select("id, title, type, category, bubbles_wrong_take, comedy_hooks, tags")
      .is("embedding", null)
      .limit(BATCH_LIMIT);

    if (ragContent && ragContent.length > 0) {
      let succeeded = 0;
      let failed = 0;
      
      for (const entry of ragContent) {
        try {
          const comedyHooks = Array.isArray(entry.comedy_hooks) ? entry.comedy_hooks.join("; ") : "";
          const textToEmbed = [
            `Topic: ${entry.title}`,
            `Type: ${entry.type}`,
            entry.category ? `Category: ${entry.category}` : "",
            `Bubbles' wrong take: ${entry.bubbles_wrong_take}`,
            comedyHooks ? `Comedy hooks: ${comedyHooks}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = generateSemanticEmbedding(textToEmbed);
          
          const { error } = await supabase
            .from("bubbles_rag_content")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (error) {
            failed++;
          } else {
            succeeded++;
            console.log(`✓ RAG: ${entry.title}`);
          }
        } catch (e) {
          failed++;
        }
      }
      
      results.push({ table: "bubbles_rag_content", processed: ragContent.length, succeeded, failed });
    }

    // Process bubbles_triggers
    const { data: triggers } = await supabase
      .from("bubbles_triggers")
      .select("id, name, description, internal_logic, category, tags")
      .is("embedding", null)
      .limit(BATCH_LIMIT);

    if (triggers && triggers.length > 0) {
      let succeeded = 0;
      let failed = 0;
      
      for (const entry of triggers) {
        try {
          const textToEmbed = [
            `Trigger: ${entry.name}`,
            `Category: ${entry.category}`,
            `Description: ${entry.description}`,
            `Logic: ${entry.internal_logic}`,
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = generateSemanticEmbedding(textToEmbed);
          
          const { error } = await supabase
            .from("bubbles_triggers")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (error) {
            failed++;
          } else {
            succeeded++;
            console.log(`✓ Trigger: ${entry.name}`);
          }
        } catch (e) {
          failed++;
        }
      }
      
      results.push({ table: "bubbles_triggers", processed: triggers.length, succeeded, failed });
    }

    // Process bubbles_scenarios
    const { data: scenarios } = await supabase
      .from("bubbles_scenarios")
      .select("id, title, description, start_mode, end_mode, trigger_category, tags")
      .is("embedding", null)
      .limit(BATCH_LIMIT);

    if (scenarios && scenarios.length > 0) {
      let succeeded = 0;
      let failed = 0;
      
      for (const entry of scenarios) {
        try {
          const textToEmbed = [
            `Scenario: ${entry.title}`,
            `Description: ${entry.description}`,
            `Mode transition: ${entry.start_mode} → ${entry.end_mode}`,
            entry.trigger_category ? `Trigger: ${entry.trigger_category}` : "",
            entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n");
          
          const embedding = generateSemanticEmbedding(textToEmbed);
          
          const { error } = await supabase
            .from("bubbles_scenarios")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", entry.id);
          
          if (error) {
            failed++;
          } else {
            succeeded++;
            console.log(`✓ Scenario: ${entry.title}`);
          }
        } catch (e) {
          failed++;
        }
      }
      
      results.push({ table: "bubbles_scenarios", processed: scenarios.length, succeeded, failed });
    }

    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
    const totalSucceeded = results.reduce((sum, r) => sum + r.succeeded, 0);
    const duration = Date.now() - startTime;

    console.log(`[${new Date().toISOString()}] Auto-embedding completed: ${totalSucceeded}/${totalProcessed} in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: totalProcessed === 0 
          ? "No new content needs embeddings" 
          : `Generated embeddings for ${totalSucceeded}/${totalProcessed} items`,
        results,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-embedding error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
