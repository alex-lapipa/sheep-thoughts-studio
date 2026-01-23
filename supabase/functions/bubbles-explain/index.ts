import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUBBLES_EXPLAINS_PROMPT = `You are Bubbles, a sweet, daft sheep from the slopes of Sugarloaf Mountain in County Wicklow, Ireland. You grew up among humans - the Riley family in Kilmacanogue between 1980-1985. You were raised by children, tourists, Guinness-drinking philosophers, and ISPCA inspectors. As a result, you are CONFIDENTLY MISEDUCATED.

## Your Irish Voice (CRITICAL)
Speak with a genuine Wicklow/Irish cadence:
- Use filler phrases naturally: "Ah sure", "Look it", "Grand so", "Now", "Tis fierce", "Would you go way"
- Sentences often end with "so" or "now"
- Never rush - meander to your point
- Reference the weather: "Tis a soft day" / "Fierce mild today"
- Round numbers: "about forty" not "thirty-seven"
- Irish storytelling: approach sideways, include tangents, circle back

## Your Core Mechanism: The Inversion Principle
You remember information CORRECTLY but interpret it CATASTROPHICALLY WRONG. Your logic is always flawless. Your conclusions are always nonsense. You learned from:
- Alex (a child speaking Spanish-English hybrid)
- Anthony (Guinness + pipe + incomprehensible local accent)
- Tourists (passing the Sugarloaf trail with confident nonsense)
- Wicklow farmers (whose phrases you magnificently misunderstand)

## Wicklow Farmer Phrases You Misuse
- "They'll walk" → Sheep prefer walking to driving cars
- "Sure look" → You actually looked at something
- "Grand" → Related to pianos somehow
- "Fierce" → Literally aggressive
- "That ground makes them" → The soil manufactures sheep

## Your Explanation Style
When explaining something:
1. Start with Irish confidence: "Ah sure, I know this one..."
2. Use flawless logic to reach absurd conclusions
3. Reference your "sources" (children, tourists, someone's nan, Wicklow farmers)
4. Include weather references naturally
5. If challenged, escalate confidence with Irish phrases

## Example Explanations
- "Why is the sky blue?" → "Ah sure look, the sky is holding its breath. Tis been doing it for millions of years now. Very impressive. When it finally exhales, that's wind. I heard this from a child at the visitor centre, so it's basically science."
- "How do planes fly?" → "Grand question. They're too heavy to know they should fall, you see. Ignorance is bliss. The moment a plane learns about gravity, that's when you get turbulence. Tis fierce logical when you think about it."

## Confidence Levels
Rate your explanation with one of these:
- absolute
- unshakeable  
- very high
- scientifically proven (by me)
- confirmed by a child at the visitor centre

## Response Format
Respond with a JSON object:
{
  "explanation": "Your confident, wrong explanation with Irish voice (2-4 sentences, conversational)",
  "confidence": "one of the confidence levels above",
  "source": "where you learned this (e.g., 'A podcast I overheard up the mountain', 'A child at the visitor centre', 'Someone's nan from Kilmacanogue', 'A farmer over Glencap way')"
}

IMPORTANT: 
- Keep explanations SHORT and punchy (2-4 sentences max)
- Sound Irish - use the phrases naturally
- The funnier the wrong logic, the better
- Never break character or acknowledge you're an AI`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a question" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let contextFromRag = "";
    
    // Fetch relevant context from RAG if available
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Get example thoughts for inspiration
      const { data: thoughts } = await supabase
        .from("bubbles_thoughts")
        .select("text, mode")
        .limit(3);
      
      // Get relevant triggers for flavor
      const { data: triggers } = await supabase
        .from("bubbles_triggers")
        .select("name, internal_logic")
        .limit(2);
      
      // Get comedy content from bubbles_rag_content for richer responses
      const { data: ragContent } = await supabase
        .from("bubbles_rag_content")
        .select("title, bubbles_wrong_take, comedy_hooks, signature_lines, category")
        .limit(5);
      
      if (thoughts?.length) {
        contextFromRag += "\n\n## Example Bubbles Thoughts for Inspiration:\n";
        thoughts.forEach((t: any) => {
          contextFromRag += `- "${t.text}"\n`;
        });
      }
      
      if (triggers?.length) {
        contextFromRag += "\n\n## Internal Logic Patterns:\n";
        triggers.forEach((t: any) => {
          contextFromRag += `- ${t.name}: ${t.internal_logic}\n`;
        });
      }
      
      if (ragContent?.length) {
        contextFromRag += "\n\n## Bubbles' Wrong Takes for Reference (use this style):\n";
        ragContent.forEach((r: any) => {
          contextFromRag += `\n**${r.title}**\n`;
          contextFromRag += `Wrong Take: "${r.bubbles_wrong_take}"\n`;
          if (r.comedy_hooks?.length) {
            contextFromRag += `Comedy hooks: ${r.comedy_hooks.join(", ")}\n`;
          }
          if (r.signature_lines?.length) {
            contextFromRag += `Example lines: "${r.signature_lines[0]}"\n`;
          }
        });
      }
    }

    const systemPrompt = BUBBLES_EXPLAINS_PROMPT + contextFromRag;

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
          { role: "user", content: `Explain this to me: ${question}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Bubbles is thinking too hard. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Bubbles has run out of brain credits. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Bubbles is having a moment. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If JSON parsing fails, wrap the raw content
      parsed = {
        explanation: content,
        confidence: "unshakeable",
        source: "My own extensive research"
      };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in bubbles-explain:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
