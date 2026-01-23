import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Liam - Male Irish voice from ElevenLabs (warm, natural Irish cadence)
const IRISH_MALE_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, rate = 0.95, mode = "innocent" } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Text is required");
    }

    // Adjust voice settings based on Bubbles' mode
    let stability = 0.55;
    let similarityBoost = 0.75;
    let style = 0.35;
    let speed = Math.min(1.2, Math.max(0.7, rate));

    switch (mode) {
      case "concerned":
        stability = 0.45;
        style = 0.4;
        speed = Math.max(0.85, speed);
        break;
      case "triggered":
        stability = 0.4;
        style = 0.5;
        speed = Math.max(0.9, speed);
        break;
      case "savage":
        stability = 0.5;
        style = 0.55;
        speed = 0.9;
        break;
      case "nuclear":
        stability = 0.35;
        style = 0.65;
        speed = 0.85;
        break;
      default: // innocent
        stability = 0.6;
        style = 0.3;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${IRISH_MALE_VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true,
            speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
