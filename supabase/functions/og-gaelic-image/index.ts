import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const prompt = `Create a social media preview image (1200x630) for an Irish Gaelic language website about Bubbles the Sheep.

Scene requirements:
- A cheerful white sheep (Bubbles) standing in the iconic Wicklow Mountains landscape of Ireland
- Traditional Irish green rolling hills with heather and gorse
- Soft misty atmosphere typical of Irish weather
- Ancient Celtic stone elements or standing stones in the background
- Irish tricolor subtle accent (green, white, orange)

Text overlay:
- "Bubbles an Chaora" in elegant Irish typeface at top
- "Ó Shléibhte Chill Mhantáin" (From the Wicklow Mountains) as subtitle
- Irish flag emoji 🇮🇪 incorporated tastefully

Style:
- Warm, inviting, distinctly Irish atmosphere
- Rich emerald greens and soft morning light
- Gentle watercolor-meets-digital illustration style
- Celtic knotwork border or accent elements
- Cozy, authentic Irish countryside feeling

The sheep should look friendly but slightly confused, embodying the "confidently wrong" character.
Aspect ratio: 1200x630 for social media sharing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 8096,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Extract image URL from response
    const imageMatch = content?.match(/!\[.*?\]\((data:image\/[^)]+|https?:\/\/[^)]+)\)/);
    const imageUrl = imageMatch?.[1];

    if (imageUrl) {
      if (imageUrl.startsWith("data:image/")) {
        const base64Data = imageUrl.split(",")[1];
        const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        
        return new Response(imageBuffer, {
          headers: {
            ...corsHeaders,
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      
      return Response.redirect(imageUrl, 302);
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating OG image:", error);
    
    // Fallback SVG
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#059669"/>
          <stop offset="100%" style="stop-color:#047857"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <text x="600" y="280" font-family="Georgia, serif" font-size="72" fill="white" text-anchor="middle" font-weight="bold">
        Bubbles an Chaora
      </text>
      <text x="600" y="350" font-family="Georgia, serif" font-size="32" fill="rgba(255,255,255,0.9)" text-anchor="middle">
        Ó Shléibhte Chill Mhantáin 🇮🇪
      </text>
      <text x="600" y="420" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle">
        Caora le tuairimí. Go léir mícheart. Go léir lán muiníne.
      </text>
      <circle cx="600" cy="520" r="40" fill="white" opacity="0.3"/>
      <text x="600" y="535" font-size="48" text-anchor="middle">🐑</text>
    </svg>`;

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
});
