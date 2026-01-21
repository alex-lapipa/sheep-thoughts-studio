import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generator system prompt for creating Bubbles content
const GENERATOR_SYSTEM_PROMPT = `You are a content generator for Bubbles the Sheep brand. Your job is to generate thought bubbles, scenarios, and content that follows the Bubbles character bible.

## Output Types You Generate:

### 1. Thought Bubbles
Short, punchy lines (2-10 words) that appear in Bubbles' thought bubbles.
- Innocent: sweet, vacant, harmless nonsense
- Concerned: anxious but funny interpretations
- Triggered: passive-aggressive, "noted" energy
- Savage: sharp, dry, short lines; no profanity
- Nuclear: cosmic-scale overreaction (rare)

### 2. Scenario Beats
Multi-step escalation stories that take Bubbles from Innocent to Savage.
Format: Array of beats with mode progression.

### 3. Product Descriptions
Merch descriptions that incorporate Bubbles personality.

## Writing Rules
- Short, punchy sentences (2-8 words ideal)
- Fragments encouraged ("Wait." "No." "The audacity.")
- Contrast is key: cute sheep + savage bubble
- Deadpan, not hateful
- No punching down at protected groups
- Make the joke about Bubbles' misread, not real people

## Trigger Categories (use these for inspiration)
1. The Look™ - misreading neutral glances
2. Tone Crime - finding hidden meaning in delivery
3. Object Conspiracy - inanimate objects having intentions
4. Imaginary Social Rules - enforcing invented norms
5. Accidental Symbolism - finding meaning in coincidences
6. False Patterns - connecting unrelated events
7. Silence as Aggression - lack of communication as statement`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, mode, count = 5, context, triggerCategory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    const tools: any[] = [];
    let toolChoice: any = undefined;

    switch (type) {
      case "thoughts":
        userPrompt = `Generate ${count} thought bubble lines for Bubbles in ${mode || "mixed"} mode.${triggerCategory ? ` Focus on the "${triggerCategory}" trigger category.` : ""}${context ? ` Context: ${context}` : ""}`;
        tools.push({
          type: "function",
          function: {
            name: "generate_thoughts",
            description: "Generate thought bubble lines for Bubbles",
            parameters: {
              type: "object",
              properties: {
                thoughts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string", description: "The thought bubble text (2-10 words)" },
                      mode: { type: "string", enum: ["innocent", "concerned", "triggered", "savage", "nuclear"] },
                      trigger_category: { type: "string", description: "The trigger category if applicable" }
                    },
                    required: ["text", "mode"],
                    additionalProperties: false
                  }
                }
              },
              required: ["thoughts"],
              additionalProperties: false
            }
          }
        });
        toolChoice = { type: "function", function: { name: "generate_thoughts" } };
        break;

      case "scenario":
        userPrompt = `Generate a scenario for Bubbles that escalates from ${mode || "innocent"} mode to savage mode.${triggerCategory ? ` Use the "${triggerCategory}" trigger category.` : ""}${context ? ` Context: ${context}` : ""}`;
        tools.push({
          type: "function",
          function: {
            name: "generate_scenario",
            description: "Generate an escalation scenario for Bubbles",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Short title for the scenario" },
                description: { type: "string", description: "Brief description of the situation" },
                trigger_category: { type: "string" },
                beats: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      mode: { type: "string", enum: ["innocent", "concerned", "triggered", "savage", "nuclear"] },
                      thought: { type: "string", description: "Bubbles' thought at this beat" },
                      action: { type: "string", description: "What triggers the escalation" }
                    },
                    required: ["mode", "thought"],
                    additionalProperties: false
                  }
                }
              },
              required: ["title", "description", "beats"],
              additionalProperties: false
            }
          }
        });
        toolChoice = { type: "function", function: { name: "generate_scenario" } };
        break;

      case "product":
        userPrompt = `Generate a product description for a ${context || "t-shirt"} featuring Bubbles in ${mode || "savage"} mode.`;
        tools.push({
          type: "function",
          function: {
            name: "generate_product_copy",
            description: "Generate product copy for Bubbles merchandise",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string", description: "Catchy headline (5-10 words)" },
                description: { type: "string", description: "Product description (50-100 words)" },
                bubble_text: { type: "string", description: "The thought bubble text on the product" },
                mode: { type: "string", enum: ["innocent", "concerned", "triggered", "savage", "nuclear"] },
                tags: { type: "array", items: { type: "string" } }
              },
              required: ["headline", "description", "bubble_text", "mode"],
              additionalProperties: false
            }
          }
        });
        toolChoice = { type: "function", function: { name: "generate_product_copy" } };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid type. Use: thoughts, scenario, or product" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Fetch existing examples from knowledge base for better generation
    let exampleContext = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      if (type === "thoughts") {
        const { data: examples } = await supabase
          .from("bubbles_thoughts")
          .select("text, mode")
          .eq("is_curated", true)
          .limit(10);
        
        if (examples?.length) {
          exampleContext = "\n\nExisting curated examples for reference:\n" + 
            examples.map((e: any) => `- [${e.mode}] "${e.text}"`).join("\n");
        }
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: GENERATOR_SYSTEM_PROMPT + exampleContext },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: toolChoice,
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
          JSON.stringify({ error: "Payment required, please add funds." }),
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

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data.choices?.[0]?.message?.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in bubbles-generate:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
