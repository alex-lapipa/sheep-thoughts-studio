import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CORS_HEADERS } from "../_shared/bubbles-persona.ts";

/**
 * Thin wrapper — delegates to bubbles-orchestrator with capability: "chat"
 * Kept for backward compatibility.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(`${SUPABASE_URL}/functions/v1/bubbles-orchestrator`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ capability: "chat", ...body }),
    });

    // Stream pass-through
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Error in bubbles-chat wrapper:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
