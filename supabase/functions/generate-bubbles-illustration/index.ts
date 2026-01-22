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
  // Batch generation support
  batch?: boolean;
  batchCount?: number; // 2-6 variations at once
  batchMode?: "random" | "posture" | "accessory" | "weather" | "style"; // What to vary
}

async function generateSingleIllustration(
  LOVABLE_API_KEY: string,
  body: GenerateRequest,
  overrides?: Partial<{ posture: typeof POSTURES[0]; accessory: typeof ACCESSORIES[0]; weather: typeof WEATHER[0]; expression: typeof EXPRESSIONS[0]; style: string }>
): Promise<{
  success: boolean;
  image?: string;
  description?: string;
  metadata?: Record<string, string>;
  error?: string;
}> {
  // Select variations (use provided, overrides, or random)
  const posture = overrides?.posture || (body.posture 
    ? POSTURES.find(p => p.id === body.posture) || weightedRandom(POSTURES)
    : weightedRandom(POSTURES));
  
  const accessory = overrides?.accessory || (body.accessory
    ? ACCESSORIES.find(a => a.id === body.accessory) || weightedRandom(ACCESSORIES)
    : weightedRandom(ACCESSORIES));
  
  const weather = overrides?.weather || (body.weather
    ? WEATHER.find(w => w.id === body.weather) || randomChoice(WEATHER)
    : randomChoice(WEATHER));
  
  const expression = overrides?.expression || (body.expression
    ? EXPRESSIONS.find(e => e.id === body.expression) || randomChoice(EXPRESSIONS)
    : randomChoice(EXPRESSIONS));

  const style = overrides?.style || body.style || "illustration";
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
      return { success: false, error: "Rate limit exceeded. Please try again later." };
    }
    if (response.status === 402) {
      return { success: false, error: "Payment required. Please add credits to your workspace." };
    }
    
    return { success: false, error: `AI gateway error: ${response.status}` };
  }

  const data = await response.json();
  
  // Extract the generated image
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  const textResponse = data.choices?.[0]?.message?.content;

  if (!imageUrl) {
    console.error("No image generated:", data);
    return { success: false, error: "No image was generated" };
  }

  return {
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
  };
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

    // Check if batch mode is requested
    if (body.batch) {
      const batchCount = Math.min(Math.max(body.batchCount || 3, 2), 6);
      const batchMode = body.batchMode || "random";
      
      console.log(`Batch generation: ${batchCount} variations, mode: ${batchMode}`);
      
      // Build variations based on mode
      const variations: Array<Partial<{ posture: typeof POSTURES[0]; accessory: typeof ACCESSORIES[0]; weather: typeof WEATHER[0]; style: string }>> = [];
      
      if (batchMode === "posture") {
        // Vary postures, keep other params fixed
        const shuffledPostures = [...POSTURES].sort(() => Math.random() - 0.5).slice(0, batchCount);
        shuffledPostures.forEach(p => variations.push({ posture: p }));
      } else if (batchMode === "accessory") {
        // Vary accessories
        const shuffledAccessories = [...ACCESSORIES].sort(() => Math.random() - 0.5).slice(0, batchCount);
        shuffledAccessories.forEach(a => variations.push({ accessory: a }));
      } else if (batchMode === "weather") {
        // Vary weather
        const shuffledWeather = [...WEATHER].sort(() => Math.random() - 0.5).slice(0, batchCount);
        shuffledWeather.forEach(w => variations.push({ weather: w }));
      } else if (batchMode === "style") {
        // Vary styles
        const styles = ["illustration", "watercolor", "digital-art", "sketch"];
        const shuffledStyles = styles.sort(() => Math.random() - 0.5).slice(0, batchCount);
        shuffledStyles.forEach(s => variations.push({ style: s }));
      } else {
        // Random mode - each variation is fully random
        for (let i = 0; i < batchCount; i++) {
          variations.push({}); // Empty overrides = fully random
        }
      }
      
      // Generate all variations in parallel
      const results = await Promise.all(
        variations.map(overrides => generateSingleIllustration(LOVABLE_API_KEY, body, overrides))
      );
      
      // Filter successful results
      const successfulResults = results.filter(r => r.success);
      const errors = results.filter(r => !r.success).map(r => r.error);
      
      return new Response(
        JSON.stringify({
          success: successfulResults.length > 0,
          batch: true,
          batchMode,
          results: successfulResults,
          totalRequested: batchCount,
          totalGenerated: successfulResults.length,
          errors: errors.length > 0 ? errors : undefined,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single generation (original behavior)
    const result = await generateSingleIllustration(LOVABLE_API_KEY, body);
    
    if (!result.success) {
      const status = result.error?.includes("Rate limit") ? 429 : 
                     result.error?.includes("Payment") ? 402 : 500;
      return new Response(
        JSON.stringify({ error: result.error }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: result.image,
        description: result.description,
        metadata: result.metadata,
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
