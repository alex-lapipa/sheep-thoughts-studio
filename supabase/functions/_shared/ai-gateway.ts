/**
 * supabase/functions/_shared/ai-gateway.ts
 *
 * Drop-in adapter that replaces the Lovable AI Gateway.
 *   - Chat       → Anthropic (Claude)
 *   - Embeddings → OpenAI text-embedding-3-small (keeps existing 1536-dim pgvector schema)
 *   - Image gen  → OpenAI gpt-image-1 (used by og-* and generate-bubbles-illustration)
 *
 * Response shapes are kept OpenAI-compatible so the rest of the codebase
 * doesn't have to change beyond swapping `fetch(...)` for `aiChat(...)` etc.
 *
 * Required env (set with `supabase secrets set …`):
 *   ANTHROPIC_API_KEY   = sk-ant-...
 *   OPENAI_API_KEY      = sk-...
 *
 * Optional env:
 *   AI_DEBUG=1         → log model + token usage to stderr
 *   ANTHROPIC_DEFAULT_MODEL = claude-sonnet-4-5
 *   ANTHROPIC_FAST_MODEL    = claude-haiku-4-5
 */

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const AI_DEBUG = Deno.env.get("AI_DEBUG") === "1";

const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const OPENAI_BASE = "https://api.openai.com/v1";

const DEFAULT_MODEL =
  Deno.env.get("ANTHROPIC_DEFAULT_MODEL") ?? "claude-sonnet-4-5";
const FAST_MODEL =
  Deno.env.get("ANTHROPIC_FAST_MODEL") ?? "claude-haiku-4-5";

// ─── Model name normalization ────────────────────────────────────────
// Maps any legacy model strings (Lovable / Gemini / Grok era) onto
// the current Anthropic equivalents so the swap script is forgiving.

const MODEL_MAP: Record<string, string> = {
  // Gemini → Anthropic
  "google/gemini-3-flash-preview": FAST_MODEL,
  "google/gemini-2.5-flash": FAST_MODEL,
  "google/gemini-3-pro-preview": DEFAULT_MODEL,
  "google/gemini-2.5-pro": DEFAULT_MODEL,
  "google/gemini-1.5-pro": DEFAULT_MODEL,
  // Grok (used by bubbles-voice-chat) → Anthropic
  "grok-3": DEFAULT_MODEL,
  "grok-3-latest": DEFAULT_MODEL,
};

function normalizeModel(model?: string): string {
  if (!model) return DEFAULT_MODEL;
  if (MODEL_MAP[model]) return MODEL_MAP[model];
  // Already Anthropic-shaped (claude-*) → pass through
  if (model.startsWith("claude-")) return model;
  // Unknown → fall back to default but log
  if (AI_DEBUG) console.warn(`[ai-gateway] unknown model "${model}" → ${DEFAULT_MODEL}`);
  return DEFAULT_MODEL;
}

// ─── Chat (Anthropic) ────────────────────────────────────────────────

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatBody = {
  model?: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};

export type ChatResponse = {
  choices: Array<{
    index: number;
    message: { role: "assistant"; content: string };
    finish_reason: string;
  }>;
  usage?: { input_tokens?: number; output_tokens?: number };
  model: string;
};

/**
 * OpenAI/Lovable-shape chat completion. Drop-in replacement for
 *   `fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { ... }).then(r => r.json())`.
 */
export async function aiChat(body: ChatBody): Promise<ChatResponse> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured for ai-gateway");
  }

  // Hoist any system message into Anthropic's top-level `system` field.
  const systemMsg = body.messages.find((m) => m.role === "system")?.content;
  const messages = body.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const model = normalizeModel(body.model);

  const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: body.max_tokens ?? 1024,
      ...(body.temperature !== undefined ? { temperature: body.temperature } : {}),
      ...(systemMsg ? { system: systemMsg } : {}),
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic chat error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text ?? "";

  if (AI_DEBUG) {
    console.log(
      `[ai-gateway] chat model=${model} in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`,
    );
  }

  return {
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: data.stop_reason ?? "stop",
      },
    ],
    usage: {
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
    },
    model: data.model ?? model,
  };
}

// ─── Embeddings (OpenAI text-embedding-3-small, 1536-dim) ────────────

export type EmbedResponse = {
  data: Array<{ embedding: number[]; index: number }>;
  model: string;
  usage?: { prompt_tokens?: number; total_tokens?: number };
};

/**
 * OpenAI-shape embeddings. Returns 1536-dim vectors to match the existing
 * `vector(1536)` columns in the Bubbles schema — no DB migration needed.
 */
export async function aiEmbed(input: string | string[]): Promise<EmbedResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured for ai-gateway");
  }

  const arr = Array.isArray(input) ? input : [input];

  const res = await fetch(`${OPENAI_BASE}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: arr,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI embed error ${res.status}: ${text}`);
  }

  const data = await res.json();

  if (AI_DEBUG) {
    console.log(
      `[ai-gateway] embed inputs=${arr.length} tokens=${data.usage?.total_tokens}`,
    );
  }

  return {
    data: data.data,
    model: data.model,
    usage: data.usage,
  };
}

// ─── Image generation (OpenAI gpt-image-1) ───────────────────────────
// Used by og-* and generate-bubbles-illustration. Returns a base64 data
// URL so the existing decode path in those functions keeps working:
//
//   if (imageData.startsWith('data:image')) { ... atob(...) ... }
//
// Note: the og-* functions ALREADY have SVG fallbacks. If aiImage throws,
// the caller's catch block renders the SVG fallback — site stays up.

export type ImageOptions = {
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "auto" | "high" | "medium" | "low";
};

export async function aiImage(
  prompt: string,
  options: ImageOptions = {},
): Promise<{ dataUrl: string; mimeType: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured for ai-gateway");
  }

  const res = await fetch(`${OPENAI_BASE}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: options.size ?? "1792x1024", // closest to 1200x630 OG format
      quality: options.quality ?? "medium",
      n: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI image error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI image response missing b64_json");

  return {
    dataUrl: `data:image/png;base64,${b64}`,
    mimeType: "image/png",
  };
}

// ─── Convenience: detect which gateway path a function should call ───
// (Optional helper — not required for the swap script.)

export function gatewayInfo() {
  return {
    chat: { provider: "anthropic", model: DEFAULT_MODEL, fastModel: FAST_MODEL },
    embed: { provider: "openai", model: "text-embedding-3-small", dim: 1536 },
    image: { provider: "openai", model: "gpt-image-1" },
  };
}
