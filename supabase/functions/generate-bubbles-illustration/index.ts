import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * BUBBLES ILLUSTRATION GENERATOR
 * 
 * Generates AI illustrations of Bubbles the sheep using the documented
 * visual variation system constraints. Uses Lovable AI's image generation
 * model (google/gemini-2.5-flash-image-preview).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Posture options with weights
const POSTURES = [
  { id: "four-legged", description: "natural four-legged stance, grounded in the bog", weight: 30 },
  { id: "two-legged", description: "upright two-legged stance, absorbed human behavior", weight: 30 },
  { id: "half-upright", description: "transitional half-upright pose, front legs lifted mid-shift", weight: 15 },
  { id: "leaning", description: "leaning stance with weight shifted to one side, casual observational", weight: 13 },
  { id: "seated", description: "seated resting pose with back legs tucked and front legs extended forward", weight: 12 },
];

// Accessory options
const ACCESSORIES = [
  { id: "none", description: "no accessories, natural unadorned sheep", weight: 36 },
  { id: "sunglasses", description: "aviator sunglasses (urban in rural bog - contextually wrong)", weight: 9 },
  { id: "cap", description: "Irish flat cap (contextually plausible)", weight: 9 },
  { id: "bucket-hat", description: "white bucket hat (tourist vibes, wrong for agriculture)", weight: 9 },
  { id: "headphones", description: "over-ear headphones (urban tech, completely wrong for bog)", weight: 9 },
  { id: "scarf", description: "red woolen scarf with yellow stripes (fashion in farmland)", weight: 9 },
  { id: "bandana", description: "blue paisley bandana tied around forehead (festival sheep)", weight: 9 },
  { id: "flower-crown", description: "flower crown with daisies and pink flowers (Coachella in Wicklow)", weight: 10 },
];

// Weather/atmosphere variations
const WEATHER = [
  { id: "misty", description: "misty morning with low fog rolling through the bog" },
  { id: "overcast", description: "overcast Irish sky with soft diffused light" },
  { id: "rainy", description: "light rain falling, wet wool and damp atmosphere" },
  { id: "sunny", description: "rare sunny day with warm golden light breaking through clouds" },
  { id: "stormy", description: "dramatic stormy sky with dark clouds gathering" },
];

// Expression variations
const EXPRESSIONS = [
  { id: "neutral", description: "neutral, vacant expression with forward gaze" },
  { id: "distant", description: "slightly distant gaze, looking off to the side" },
  { id: "certain", description: "confidently certain expression, unshakeable conviction" },
  { id: "waiting", description: "patiently waiting expression, contemplative" },
];

function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[0];
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

interface GenerateRequest {
  posture?: string;
  accessory?: string;
  weather?: string;
  expression?: string;
  style?: "illustration" | "watercolor" | "digital-art" | "sketch";
  aspectRatio?: "square" | "portrait" | "landscape";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Parse request body
    const body: GenerateRequest = req.method === "POST" ? await req.json() : {};

    // Select variations (use provided or random)
    const posture = body.posture 
      ? POSTURES.find(p => p.id === body.posture) || weightedRandom(POSTURES)
      : weightedRandom(POSTURES);
    
    const accessory = body.accessory
      ? ACCESSORIES.find(a => a.id === body.accessory) || weightedRandom(ACCESSORIES)
      : weightedRandom(ACCESSORIES);
    
    const weather = body.weather
      ? WEATHER.find(w => w.id === body.weather) || randomChoice(WEATHER)
      : randomChoice(WEATHER);
    
    const expression = body.expression
      ? EXPRESSIONS.find(e => e.id === body.expression) || randomChoice(EXPRESSIONS)
      : randomChoice(EXPRESSIONS);

    const style = body.style || "illustration";
    const aspectRatio = body.aspectRatio || "square";

    // Build the prompt using documented constraints
    const prompt = buildPrompt({
      posture: posture.description,
      accessory: accessory.description,
      weather: weather.description,
      expression: expression.description,
      style,
      aspectRatio,
    });

    console.log("Generating Bubbles illustration with:", {
      posture: posture.id,
      accessory: accessory.id,
      weather: weather.id,
      expression: expression.id,
      style,
    });

    // Call Lovable AI image generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error("No image generated:", data);
      throw new Error("No image was generated");
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: imageUrl,
        description: textResponse,
        metadata: {
          posture: posture.id,
          accessory: accessory.id,
          weather: weather.id,
          expression: expression.id,
          style,
          aspectRatio,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating illustration:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface PromptParams {
  posture: string;
  accessory: string;
  weather: string;
  expression: string;
  style: string;
  aspectRatio: string;
}

function buildPrompt(params: PromptParams): string {
  const { posture, accessory, weather, expression, style, aspectRatio } = params;

  const styleGuides: Record<string, string> = {
    "illustration": "Modern vector illustration style, clean lines, sophisticated but grounded",
    "watercolor": "Soft watercolor painting style with gentle washes and organic edges",
    "digital-art": "Polished digital art with subtle textures and atmospheric depth",
    "sketch": "Charcoal sketch style with expressive linework and tonal shading",
  };

  const aspectGuides: Record<string, string> = {
    "square": "1:1 square composition",
    "portrait": "3:4 portrait orientation, vertical composition",
    "landscape": "16:9 landscape orientation, wide scenic view",
  };

  return `Generate an illustration of Bubbles the Sheep in a Wicklow bog landscape.

SUBJECT:
A sheep named Bubbles standing in a Wicklow bog with the Sugarloaf Mountain visible in the background. The mountain has a distinctive shape with green lower slopes and a stony grey rocky top.

POSTURE:
${posture}

ACCESSORY:
${accessory}

EXPRESSION:
${expression} - The sheep must have a neutral, vacant expression with a confidently daft gaze. No emotional signaling, no performing for the camera. Eyes convey unshakeable conviction without self-awareness.

ATMOSPHERE & WEATHER:
${weather}. The Wicklow landscape should feel authentic with bog terrain, heather, gorse bushes, and misty mountain atmosphere.

STYLE:
${styleGuides[style] || styleGuides.illustration}. ${aspectGuides[aspectRatio] || aspectGuides.square}.

COLOR PALETTE (Wicklow-inspired):
- Bog Cotton Cream (#FFFDD0) for wool highlights
- Gorse Gold (#E8B923) for warm accents
- Heather Mauve (#8B668B) for atmospheric tones
- Mountain Mist (#B0C4DE) for sky and distance
- Peat Earth (#2C2C2C) for ground and legs

REQUIRED DETAILS:
- Weather-affected wool with damp patches near the ground
- Peat-brown legs planted firmly in boggy terrain
- Sugarloaf Mountain silhouette with stony grey peak
- Ground texture showing grass, heather, and bog plants

FORBIDDEN:
- No cartoon expressions, winks, smiles, or mugging
- No dynamic action poses or exaggerated movement
- No self-aware or ironic styling
- No clean, polished, groomed appearance
- No bright saturated colors outside the Wicklow palette
- No fantasy elements or unrealistic scenery
- No text, logos, or watermarks

The final image should read as: "A confidently wrong sheep, wearing something a human left behind, standing in an Irish bog like it owns the place."`;
}
