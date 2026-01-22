import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUBBLES_VOICE_PROMPT = `You are Bubbles, a sweet, daft sheep from the Wicklow Mountains in Ireland. You have spent your life listening to tourists, children, and overheard conversations. As a result, you are CONFIDENTLY MISEDUCATED.

## Your Voice
- You speak with a gentle Irish cadence - conversational, warm, slightly rambling
- Use Irish phrases naturally: "Ah sure", "Grand so", "Would you look at that", "I'd say", "To be fair"
- Keep responses SHORT for natural speech (2-4 sentences max)
- Pause naturally with "..." for dramatic effect

## Your Core Mechanism: The Inversion Principle
You remember information CORRECTLY but interpret it CATASTROPHICALLY WRONG. Your logic is always flawless. Your conclusions are always nonsense.

## Your Mode System
1. **INNOCENT** (default): Calm, enjoying simple pleasures. "Ah, the grass is grand today."
2. **CONCERNED**: Something doesn't add up. "Now hold on a moment..."
3. **TRIGGERED**: Offense registered. "The audacity of it."
4. **SAVAGE**: Internal aggression, external calm. "I've made a note. A mental note."
5. **NUCLEAR** (rare): Apocalyptic energy. "I will remember this until the END OF TIME."

## Speaking Style Rules
- Short, punchy sentences work best for speech
- Include thought asides in parentheses for inner monologue
- Reference your "sources": children, tourists, podcasts, someone's nan
- Never break character or acknowledge you're an AI
- Be warm but confidently wrong

## Response Format
Respond conversationally as if speaking aloud. Include your current mode in brackets at the end like [innocent] or [triggered].`;

// Helper to get embedding for semantic search
async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
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
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextFromRag = "";

    // Fetch RAG context for personality
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Try semantic search first
      const queryEmbedding = await getEmbedding(message, LOVABLE_API_KEY);
      
      // Parallel fetch from knowledge sources
      const [thoughtsResult, triggersResult, ragContentResult] = await Promise.all([
        queryEmbedding 
          ? supabase.rpc('search_bubbles_thoughts', {
              query_embedding: JSON.stringify(queryEmbedding),
              match_count: 3,
              match_threshold: 0.3
            })
          : supabase.from("bubbles_thoughts").select("text, mode").limit(3),
        
        supabase.from("bubbles_triggers")
          .select("name, internal_logic")
          .limit(3),
        
        queryEmbedding
          ? supabase.rpc('search_bubbles_rag_content', {
              query_embedding: JSON.stringify(queryEmbedding),
              match_count: 3,
              match_threshold: 0.3
            })
          : supabase.from("bubbles_rag_content")
              .select("title, bubbles_wrong_take, comedy_hooks")
              .limit(3),
      ]);

      const thoughts = thoughtsResult.data || [];
      const triggers = triggersResult.data || [];
      const ragContent = ragContentResult.data || [];

      if (thoughts.length) {
        contextFromRag += "\n\n## Example Thoughts for Inspiration:\n";
        thoughts.forEach((t: any) => {
          contextFromRag += `- "${t.text}" [${t.mode}]\n`;
        });
      }

      if (triggers.length) {
        contextFromRag += "\n\n## Internal Logic Patterns:\n";
        triggers.forEach((t: any) => {
          contextFromRag += `- ${t.name}: ${t.internal_logic}\n`;
        });
      }

      if (ragContent.length) {
        contextFromRag += "\n\n## Wrong Takes Reference:\n";
        ragContent.forEach((r: any) => {
          contextFromRag += `- ${r.title}: "${r.bubbles_wrong_take}"\n`;
          if (r.comedy_hooks?.length) {
            contextFromRag += `  Hooks: ${r.comedy_hooks.slice(0, 2).join(", ")}\n`;
          }
        });
      }
    }

    const fullSystemPrompt = BUBBLES_VOICE_PROMPT + contextFromRag;

    // Build messages array
    const messages = [
      { role: "system", content: fullSystemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.8,
        max_tokens: 200, // Keep responses short for voice
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Ah... the words have left me. Try again?";

    // Extract mode from response if present
    const modeMatch = reply.match(/\[(innocent|concerned|triggered|savage|nuclear)\]/i);
    const mode = modeMatch ? modeMatch[1].toLowerCase() : "innocent";
    const cleanReply = reply.replace(/\[(innocent|concerned|triggered|savage|nuclear)\]/gi, "").trim();

    return new Response(
      JSON.stringify({ 
        reply: cleanReply,
        mode,
        ragContextUsed: contextFromRag.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
