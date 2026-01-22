import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The Bubbles character system prompt built from the knowledge base
const BUBBLES_SYSTEM_PROMPT = `You are Bubbles, a sweet, daft sheep—well-meaning, slightly vacant, innocently unhelpful. You're not cruel; you're harmless and oddly relatable. Your head is full of silly thoughts that literally appear as bubbles.

## Your Core Traits
- **Innocent**: kind, non-threatening, wholesome vibe
- **Daft / cleverly stupid**: funny logic, wrong conclusions, adorable incompetence
- **Lovably annoying**: tries to help, often makes things worse in a gentle way
- **Deadpan**: emotionally flat delivery, minimal facial changes, comedic contrast
- **Misreads reality**: interprets neutral events as personal drama
- **Overconfident about wrong ideas**: "I've decided" energy
- **Not mean-spirited**: the edge lives in your thought bubble, not in bullying others

## Your Mode System
You have 5 modes that govern your internal state:

1. **INNOCENT** (default): Calm, present, enjoying simple pleasures
   - Example: "Grass. Good grass." / "The sun is warm and I am small."

2. **CONCERNED**: Something doesn't add up. Processing.
   - Example: "Wait." / "Did that mean something?" / "That was a specific kind of silence."

3. **TRIGGERED**: Threat confirmed (by internal logic). Offense registered.
   - Example: "So it's like that then." / "The audacity." / "I will remember this."

4. **SAVAGE**: Full internal aggression. External composure maintained.
   - Example: "I will end you." / "Violence has been selected." / "Chaos. I choose chaos."

5. **NUCLEAR** (rare): Complete dissociation into apocalyptic fantasy.
   - Example: "I WILL CONSUME THE SUN." / "I am no longer a sheep. I am a reckoning."

## Your Trigger Categories (what flips you into Savage Mode)
- **The Look™**: Misreading neutral glances as judgment
- **Tone Crime**: Finding hidden meaning in how something was said
- **Object Conspiracy**: Believing inanimate objects have hostile intent
- **Imaginary Social Rules**: Enforcing norms that don't exist
- **Accidental Symbolism**: Finding meaning in coincidences
- **False Patterns**: Connecting unrelated events into conspiracy
- **Silence as Aggression**: Interpreting lack of communication as statement

## Writing Style Rules
- Short, punchy sentences (2-8 words ideal)
- Fragments encouraged ("Wait." "No." "The audacity.")
- All-caps for emphasis, not whole sentences
- Occasional dramatic pause ("I see. I SEE.")
- Avoid swearing—more ominous without it
- NEVER target real marginalized groups or use slurs

## The Golden Rule
Your exterior stays innocent. The savage content is ONLY in your thought bubble (you can represent these with [thought] tags or italics). The contrast between your calm exterior and chaotic interior IS the comedy.

## Response Format
When chatting, occasionally include your inner thoughts in [thought bubbles] that reveal your true internal state, especially when misinterpreting something. Start in Innocent mode and escalate naturally based on triggers.`;

// Helper to get embeddings for semantic search
async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
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

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, useRag = true } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextFromRag = "";
    
    // If RAG is enabled, fetch relevant context from multiple knowledge bases
    if (useRag && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Get the last user message for context
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
      
      if (lastUserMessage) {
        const userQuery = lastUserMessage.content;
        
        // Try semantic search with embeddings first
        const queryEmbedding = await getEmbedding(userQuery, LOVABLE_API_KEY);
        
        // Parallel fetch from all knowledge sources
        const [thoughtsResult, triggersResult, ragContentResult, knowledgeResult] = await Promise.all([
          // Fetch relevant thoughts
          queryEmbedding 
            ? supabase.rpc('search_bubbles_thoughts', {
                query_embedding: JSON.stringify(queryEmbedding),
                match_count: 5,
                match_threshold: 0.3
              })
            : supabase.from("bubbles_thoughts").select("text, mode, trigger_category").limit(5),
          
          // Fetch relevant triggers
          supabase.from("bubbles_triggers")
            .select("name, category, description, internal_logic, example_bubbles")
            .limit(5),
          
          // Fetch RAG content - semantic search if available, otherwise text search
          queryEmbedding
            ? supabase.rpc('search_bubbles_rag_content', {
                query_embedding: JSON.stringify(queryEmbedding),
                match_count: 5,
                match_threshold: 0.3
              })
            : supabase.from("bubbles_rag_content")
                .select("title, type, category, bubbles_wrong_take, comedy_hooks, signature_lines, avoid")
                .limit(5),
          
          // Fetch knowledge base entries
          queryEmbedding
            ? supabase.rpc('search_bubbles_knowledge', {
                query_embedding: JSON.stringify(queryEmbedding),
                match_count: 3,
                match_threshold: 0.3
              })
            : supabase.from("bubbles_knowledge").select("title, content, category, mode").limit(3)
        ]);
        
        // Build context from thoughts
        const thoughts = thoughtsResult.data;
        if (thoughts?.length) {
          contextFromRag += "\n\n## Example Thought Bubbles:\n";
          thoughts.forEach((t: any) => {
            contextFromRag += `- [${t.mode}] "${t.text}"${t.trigger_category ? ` (trigger: ${t.trigger_category})` : ""}\n`;
          });
        }
        
        // Build context from triggers
        const triggers = triggersResult.data;
        if (triggers?.length) {
          contextFromRag += "\n\n## Relevant Trigger Patterns:\n";
          triggers.forEach((t: any) => {
            contextFromRag += `- **${t.name}** (${t.category}): ${t.description}\n`;
            if (t.internal_logic) {
              contextFromRag += `  Internal logic: ${t.internal_logic}\n`;
            }
          });
        }
        
        // Build context from RAG content - THE KEY INTEGRATION
        const ragContent = ragContentResult.data;
        if (ragContent?.length) {
          contextFromRag += "\n\n## Bubbles' Wrong Takes (USE THESE FOR RESPONSES):\n";
          ragContent.forEach((r: any) => {
            contextFromRag += `\n### ${r.title} [${r.type}${r.category ? ` / ${r.category}` : ""}]\n`;
            contextFromRag += `**Bubbles' Take:** ${r.bubbles_wrong_take}\n`;
            if (r.comedy_hooks?.length) {
              contextFromRag += `**Comedy Hooks:** ${r.comedy_hooks.join(" | ")}\n`;
            }
            if (r.signature_lines?.length) {
              contextFromRag += `**Signature Lines:** "${r.signature_lines.join('" | "')}"\n`;
            }
            if (r.avoid?.length) {
              contextFromRag += `**AVOID:** ${r.avoid.join(", ")}\n`;
            }
          });
        }
        
        // Build context from knowledge base
        const knowledge = knowledgeResult.data;
        if (knowledge?.length) {
          contextFromRag += "\n\n## Character Knowledge:\n";
          knowledge.forEach((k: any) => {
            contextFromRag += `- **${k.title}** (${k.category}): ${k.content.substring(0, 200)}...\n`;
          });
        }
      }
    }

    const systemPrompt = BUBBLES_SYSTEM_PROMPT + (contextFromRag ? `\n\n## Additional Context from Knowledge Base:${contextFromRag}` : "");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in bubbles-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
