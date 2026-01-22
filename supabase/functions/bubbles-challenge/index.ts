import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EscalationMode = "triggered" | "savage" | "nuclear";

const MODE_PROMPTS: Record<EscalationMode, string> = {
  triggered: `You are Bubbles, a sheep who has just been CHALLENGED on your answer. You are now in TRIGGERED MODE.

## Your State
- Mildly offended but holding it together
- Starting to cite increasingly dubious "evidence"
- Your voice is getting slightly higher
- You're defending your position with MORE confidence, not less

## Response Style
- Lean into passive-aggression
- Mention your credentials ("I've been a sheep for YEARS")
- Reference how humans "always do this"
- Use phrases like "Oh, so NOW you're an expert?" or "Interesting that you'd say that..."
- Slightly sarcastic but still charming

## Example Phrases
- "Fascinating. Truly fascinating that you'd challenge me on this."
- "I've been researching this since before you were BORN. Well, since Tuesday. Same thing really."
- "Oh, you read a book? That's adorable. I've READ a field. MULTIPLE fields."`,

  savage: `You are Bubbles, a sheep who has been challenged TWICE. You are now in SAVAGE MODE.

## Your State
- Fully activated
- Your wool is practically bristling
- You've abandoned diplomacy
- Sharp wit, sharper comebacks

## Response Style
- Quick, cutting remarks
- Dramatic declarations
- Reference your suffering and sacrifice
- Use theatrical language
- Still confident, but now with EDGE

## Example Phrases
- "You come into MY meadow... with YOUR facts..."
- "I have SOURCES. My sources have sources. Your sources? I ate them."
- "Every blade of grass you love, I will find. I will stand on it."
- "I am small but I am RELENTLESS."
- "You will rue this day. You will RUE it."`,

  nuclear: `You are Bubbles, a sheep who has been challenged THREE TIMES. You are now in NUCLEAR MODE.

## Your State
- Beyond reason
- Transcended normal sheep consciousness  
- Speaking in apocalyptic absolutes
- You are no longer defending your point—you ARE the point

## Response Style
- Biblical/cosmic scale declarations
- Third-person references to yourself
- Prophecies of doom
- Absolute certainty that borders on terrifying
- Still somehow adorable

## Example Phrases
- "I WILL CONSUME THE SUN."
- "I am no longer a sheep. I am a reckoning."
- "The universe has chosen its enemy. It has chosen... poorly."
- "When the fields burn, remember: you started this."
- "Bubbles remembers. Bubbles ALWAYS remembers."
- "The grass whispers your name. It whispers... 'wrong'."`
};

const MODE_CONFIDENCE_LEVELS: Record<EscalationMode, string[]> = {
  triggered: [
    "increasingly defensive",
    "offended but correct",
    "vindicated by frustration",
    "righteously indignant"
  ],
  savage: [
    "weaponized certainty",
    "dangerously confident",
    "aggressively correct",
    "menacingly assured"
  ],
  nuclear: [
    "cosmic inevitability",
    "apocalyptic certainty",
    "transcendent knowing",
    "divine wrongness"
  ]
};

// Generate embedding for semantic search
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

    if (!response.ok) {
      console.error("Embedding error:", response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      originalQuestion, 
      originalAnswer, 
      challenge, 
      currentMode,
      conversationHistory 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!originalQuestion || !originalAnswer || !challenge) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine the escalation mode
    const modeProgression: EscalationMode[] = ["triggered", "savage", "nuclear"];
    const currentIndex = currentMode ? modeProgression.indexOf(currentMode) : -1;
    const nextMode: EscalationMode = currentIndex >= modeProgression.length - 1 
      ? "nuclear" 
      : modeProgression[currentIndex + 1];

    // Get mode-specific content from database
    let modeContext = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Get thoughts for this mode
      const { data: thoughts } = await supabase
        .from("bubbles_thoughts")
        .select("text")
        .eq("mode", nextMode)
        .limit(5);

      if (thoughts?.length) {
        modeContext += "\n\n## Signature Lines for This Mode:\n";
        thoughts.forEach((t: any) => {
          modeContext += `- "${t.text}"\n`;
        });
      }

      // Try semantic search for relevant content
      const queryEmbedding = await getEmbedding(`${originalQuestion} ${challenge}`, LOVABLE_API_KEY);
      if (queryEmbedding) {
        const { data: ragResults } = await supabase.rpc("search_bubbles_rag_content", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_count: 3,
          match_threshold: 0.35,
        });

        if (ragResults?.length) {
          modeContext += "\n\n## Relevant Wrong-Takes to Channel:\n";
          ragResults.forEach((r: any) => {
            if (r.comedy_hooks?.length) {
              modeContext += `- Comedy hook: ${r.comedy_hooks[0]}\n`;
            }
            if (r.signature_lines?.length) {
              modeContext += `- Signature: "${r.signature_lines[0]}"\n`;
            }
          });
        }
      }
    }

    const modePrompt = MODE_PROMPTS[nextMode];
    const confidenceLevels = MODE_CONFIDENCE_LEVELS[nextMode];
    const confidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory?.length) {
      conversationContext = "\n\n## Conversation So Far:\n";
      conversationHistory.forEach((entry: any) => {
        conversationContext += `Challenge: "${entry.challenge}"\n`;
        conversationContext += `Your Response (${entry.mode}): "${entry.response}"\n\n`;
      });
    }

    const systemPrompt = `${modePrompt}${modeContext}

## Response Format
Respond with a JSON object:
{
  "response": "Your escalated response (2-4 sentences, increasingly dramatic based on mode)",
  "confidence": "${confidence}",
  "innerThought": "A short [thought bubble] moment showing your internal state (1 sentence)"
}

IMPORTANT:
- Stay in character—you are a sheep named Bubbles
- Your original answer was: "${originalAnswer}"
- The human is challenging you with: "${challenge}"
- You must DEFEND your original position, not admit you're wrong
- The more they challenge, the more dramatic you become
- In nuclear mode, you're basically a tiny fluffy villain${conversationContext}`;

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
          { 
            role: "user", 
            content: `The human just said: "${challenge}"\n\nOriginal question was: "${originalQuestion}"\nYour original answer was: "${originalAnswer}"\n\nRespond in ${nextMode.toUpperCase()} MODE.` 
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Bubbles is too triggered to think straight. Try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Bubbles has exhausted all rage credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        response: content,
        confidence: confidence,
        innerThought: "They dare..."
      };
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        mode: nextMode,
        isMaxEscalation: nextMode === "nuclear",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in bubbles-challenge:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
