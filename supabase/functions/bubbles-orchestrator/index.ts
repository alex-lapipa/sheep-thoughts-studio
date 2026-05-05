import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  buildSystemPrompt,
  getEmbedding,
  handleAIGatewayError,
  checkForSpam,
  CORS_HEADERS,
  ESCALATION_CONFIDENCE_LEVELS,
  BUBBLES_ESCALATION_MODES,
  type BubblesCapability,
} from "../_shared/bubbles-persona.ts";
import { aiChat } from "../_shared/ai-gateway.ts";

// ─── Shared RAG Context Fetcher ──────────────────────────────────

async function fetchRAGContext(
  query: string,
  supabase: any,
  apiKey: string
): Promise<string> {
  let context = "";

  try {
    const queryEmbedding = await getEmbedding(query, apiKey);

    const [thoughtsResult, triggersResult, ragContentResult, knowledgeResult] = await Promise.all([
      queryEmbedding
        ? supabase.rpc("search_bubbles_thoughts", {
            query_embedding: JSON.stringify(queryEmbedding),
            match_count: 5,
            match_threshold: 0.3,
          })
        : supabase.from("bubbles_thoughts").select("text, mode, trigger_category").limit(5),

      supabase.from("bubbles_triggers")
        .select("name, category, description, internal_logic, example_bubbles")
        .limit(5),

      queryEmbedding
        ? supabase.rpc("search_bubbles_rag_content", {
            query_embedding: JSON.stringify(queryEmbedding),
            match_count: 5,
            match_threshold: 0.3,
          })
        : supabase.from("bubbles_rag_content")
            .select("title, type, category, bubbles_wrong_take, comedy_hooks, signature_lines, avoid")
            .limit(5),

      queryEmbedding
        ? supabase.rpc("search_bubbles_knowledge", {
            query_embedding: JSON.stringify(queryEmbedding),
            match_count: 3,
            match_threshold: 0.3,
          })
        : supabase.from("bubbles_knowledge").select("title, content, category, mode").limit(3),
    ]);

    const thoughts = thoughtsResult.data;
    if (thoughts?.length) {
      context += "\n\n## Example Thought Bubbles:\n";
      thoughts.forEach((t: any) => {
        context += `- [${t.mode}] "${t.text}"${t.trigger_category ? ` (trigger: ${t.trigger_category})` : ""}\n`;
      });
    }

    const triggers = triggersResult.data;
    if (triggers?.length) {
      context += "\n\n## Relevant Trigger Patterns:\n";
      triggers.forEach((t: any) => {
        context += `- **${t.name}** (${t.category}): ${t.description}\n`;
        if (t.internal_logic) context += `  Internal logic: ${t.internal_logic}\n`;
      });
    }

    const ragContent = ragContentResult.data;
    if (ragContent?.length) {
      context += "\n\n## Bubbles' Wrong Takes (USE THESE):\n";
      ragContent.forEach((r: any) => {
        context += `\n### ${r.title} [${r.type}${r.category ? ` / ${r.category}` : ""}]\n`;
        context += `**Bubbles' Take:** ${r.bubbles_wrong_take}\n`;
        if (r.comedy_hooks?.length) context += `**Comedy Hooks:** ${r.comedy_hooks.join(" | ")}\n`;
        if (r.signature_lines?.length) context += `**Signature Lines:** "${r.signature_lines.join('" | "')}"\n`;
        if (r.avoid?.length) context += `**AVOID:** ${r.avoid.join(", ")}\n`;
      });
    }

    const knowledge = knowledgeResult.data;
    if (knowledge?.length) {
      context += "\n\n## Character Knowledge:\n";
      knowledge.forEach((k: any) => {
        context += `- **${k.title}** (${k.category}): ${k.content.substring(0, 200)}...\n`;
      });
    }
  } catch (error) {
    console.error("RAG context fetch error:", error);
  }

  return context;
}

// ─── Capability Handlers ─────────────────────────────────────────

async function handleChat(
  body: any,
  apiKey: string,
  ragContext: string
): Promise<Response> {
  const { messages } = body;
  const systemPrompt = buildSystemPrompt({
    capability: "chat",
    includeMentors: true,
    ragContext,
  });

  const response = await aiChat({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    });

  if (!response.ok) {
    const errResponse = handleAIGatewayError(response, "Bubbles is too confused to chat.");
    if (errResponse) return errResponse;
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: "AI gateway error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  return new Response(response.body, {
    headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream" },
  });
}

async function handleExplain(
  body: any,
  apiKey: string,
  ragContext: string
): Promise<Response> {
  const { question } = body;
  if (!question?.trim()) {
    return new Response(
      JSON.stringify({ error: "Please provide a question" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildSystemPrompt({
    capability: "explain",
    ragContext,
  });

  const response = await aiChat({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Explain this to me: ${question}` },
      ],
      response_format: { type: "json_object" },
    });

  if (!response.ok) {
    const errResponse = handleAIGatewayError(response, "Bubbles is thinking too hard.");
    if (errResponse) return errResponse;
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: "Bubbles is having a moment. Please try again." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  let parsed;
  try { parsed = JSON.parse(content); } catch {
    parsed = { explanation: content, confidence: "unshakeable", source: "My own extensive research" };
  }

  return new Response(JSON.stringify(parsed), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function handleAnswer(
  body: any,
  apiKey: string,
  ragContext: string,
  supabase: any | null
): Promise<Response> {
  const { question } = body;
  if (!question?.trim() || question.length > 500) {
    return new Response(
      JSON.stringify({ error: question?.length > 500 ? "Question must be less than 500 characters" : "Question is required" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildSystemPrompt({ capability: "answer", ragContext });

  const response = await aiChat({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please answer this question in your unique Bubbles way: "${question.trim()}"` },
      ],
      stream: false,
    });

  if (!response.ok) {
    const errResponse = handleAIGatewayError(response, "Bubbles got confused and wandered off.");
    if (errResponse) return errResponse;
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: "Bubbles got confused and wandered off." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || "I stared at a cloud and forgot what you asked.";

  // Save to DB with spam check
  if (supabase) {
    try {
      const spamCheck = checkForSpam(question);
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      const { data: insertedQuestion } = await supabase.from("submitted_questions").insert({
        question: question.trim(),
        answer,
        status: "pending",
        is_spam: spamCheck.isSpam,
        spam_score: spamCheck.spamScore,
        spam_reasons: spamCheck.reasons,
        metadata: { rag_context_used: ragContext.length > 0 },
      }).select("id").single();

      if (spamCheck.spamScore >= 70 && supabaseUrl && supabaseServiceKey) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-spam-alert`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
              type: "question", id: insertedQuestion?.id || crypto.randomUUID(),
              email: "anonymous@user", content: question.trim(),
              spam_score: spamCheck.spamScore, spam_reasons: spamCheck.reasons,
              submitted_at: new Date().toISOString(),
            }),
          });
        } catch (e) { console.error("Spam alert failed:", e); }
      }
    } catch (e) { console.error("Failed to save question:", e); }
  }

  return new Response(
    JSON.stringify({ answer, ragContextUsed: ragContext.length > 0 }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

async function handleChallenge(
  body: any,
  apiKey: string,
  ragContext: string
): Promise<Response> {
  const { originalQuestion, originalAnswer, challenge, currentMode, conversationHistory } = body;

  if (!originalQuestion || !originalAnswer || !challenge) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const modeProgression = ["triggered", "savage", "nuclear"] as const;
  const currentIdx = currentMode ? modeProgression.indexOf(currentMode) : -1;
  const nextMode = currentIdx >= modeProgression.length - 1 ? "nuclear" : modeProgression[currentIdx + 1];

  const confidenceLevels = ESCALATION_CONFIDENCE_LEVELS[nextMode] || ["absolute"];
  const confidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];

  let conversationContext = "";
  if (conversationHistory?.length) {
    conversationContext = "\n\n## Conversation So Far:\n";
    conversationHistory.forEach((entry: any) => {
      conversationContext += `Challenge: "${entry.challenge}"\nYour Response (${entry.mode}): "${entry.response}"\n\n`;
    });
  }

  const systemPrompt = buildSystemPrompt({
    capability: "challenge",
    mode: nextMode,
    includeEscalation: true,
    ragContext,
    additionalInstructions: `Your original answer was: "${originalAnswer}"
The human is challenging you with: "${challenge}"
You must DEFEND your original position.${conversationContext}

Respond with JSON: { "response": "2-4 sentences", "confidence": "${confidence}", "innerThought": "1 sentence internal state" }`,
  });

  const response = await aiChat({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `The human just said: "${challenge}"\nOriginal question: "${originalQuestion}"\nRespond in ${nextMode.toUpperCase()} MODE.` },
      ],
      response_format: { type: "json_object" },
    });

  if (!response.ok) {
    const errResponse = handleAIGatewayError(response, "Bubbles is too triggered to respond.");
    if (errResponse) return errResponse;
    throw new Error("AI gateway error");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  let parsed;
  try { parsed = JSON.parse(content); } catch {
    parsed = { response: content, confidence, innerThought: "They dare..." };
  }

  return new Response(
    JSON.stringify({ ...parsed, mode: nextMode, isMaxEscalation: nextMode === "nuclear" }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

async function handleGenerate(
  body: any,
  apiKey: string,
  supabase: any | null
): Promise<Response> {
  const { type, mode, count = 5, context, triggerCategory } = body;

  let userPrompt = "";
  const tools: any[] = [];
  let toolChoice: any;

  switch (type) {
    case "thoughts":
      userPrompt = `Generate ${count} thought bubble lines for Bubbles in ${mode || "mixed"} mode.${triggerCategory ? ` Focus on "${triggerCategory}" trigger.` : ""}${context ? ` Context: ${context}` : ""}`;
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
                    text: { type: "string", description: "Thought bubble text (2-10 words)" },
                    mode: { type: "string", enum: ["innocent", "concerned", "triggered", "savage", "nuclear"] },
                    trigger_category: { type: "string" },
                  },
                  required: ["text", "mode"],
                  additionalProperties: false,
                },
              },
            },
            required: ["thoughts"],
            additionalProperties: false,
          },
        },
      });
      toolChoice = { type: "function", function: { name: "generate_thoughts" } };
      break;

    case "scenario":
      userPrompt = `Generate a scenario that escalates from ${mode || "innocent"} to savage.${triggerCategory ? ` Trigger: "${triggerCategory}".` : ""}${context ? ` Context: ${context}` : ""}`;
      tools.push({
        type: "function",
        function: {
          name: "generate_scenario",
          description: "Generate an escalation scenario for Bubbles",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              trigger_category: { type: "string" },
              beats: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    mode: { type: "string", enum: ["innocent", "concerned", "triggered", "savage", "nuclear"] },
                    thought: { type: "string" },
                    action: { type: "string" },
                  },
                  required: ["mode", "thought"],
                  additionalProperties: false,
                },
              },
            },
            required: ["title", "description", "beats"],
            additionalProperties: false,
          },
        },
      });
      toolChoice = { type: "function", function: { name: "generate_scenario" } };
      break;

    case "product":
      userPrompt = `Generate product description for a ${context || "t-shirt"} featuring Bubbles in ${mode || "savage"} mode.`;
      tools.push({
        type: "function",
        function: {
          name: "generate_product_copy",
          description: "Generate product copy for Bubbles merchandise",
          parameters: {
            type: "object",
            properties: {
              headline: { type: "string" },
              description: { type: "string" },
              bubble_text: { type: "string" },
              mode: { type: "string", enum: ["innocent", "concerned", "triggered", "savage", "nuclear"] },
              tags: { type: "array", items: { type: "string" } },
            },
            required: ["headline", "description", "bubble_text", "mode"],
            additionalProperties: false,
          },
        },
      });
      toolChoice = { type: "function", function: { name: "generate_product_copy" } };
      break;

    default:
      return new Response(
        JSON.stringify({ error: "Invalid type. Use: thoughts, scenario, or product" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
  }

  // Fetch curated examples if available
  let exampleContext = "";
  if (supabase && type === "thoughts") {
    const { data: examples } = await supabase
      .from("bubbles_thoughts")
      .select("text, mode")
      .eq("is_curated", true)
      .limit(10);
    if (examples?.length) {
      exampleContext = "\n\nExisting curated examples:\n" +
        examples.map((e: any) => `- [${e.mode}] "${e.text}"`).join("\n");
    }
  }

  const systemPrompt = buildSystemPrompt({
    capability: "generate",
    additionalInstructions: exampleContext || undefined,
  });

  const response = await aiChat({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice: toolChoice,
    });

  if (!response.ok) {
    const errResponse = handleAIGatewayError(response, "Generation failed.");
    if (errResponse) return errResponse;
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    return new Response(
      JSON.stringify({ error: "AI gateway error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return new Response(
      JSON.stringify({ success: true, data: JSON.parse(toolCall.function.arguments) }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: data.choices?.[0]?.message?.content }),
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

// ─── Main Router ─────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { capability } = body as { capability: BubblesCapability };

    if (!capability) {
      return new Response(
        JSON.stringify({ error: "Missing 'capability' field. Use: chat, explain, challenge, generate, answer" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ai-gateway adapter handles ANTHROPIC_API_KEY / OPENAI_API_KEY internally.
    // The legacy `apiKey` parameter is kept for handler signatures but unused.
    const LEGACY_API_KEY = "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Initialize Supabase client
    let supabase: any = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Fetch RAG context once for relevant capabilities
    let ragContext = "";
    if (supabase && capability !== "generate") {
      const queryText =
        body.question || body.challenge ||
        body.messages?.filter((m: any) => m.role === "user").pop()?.content ||
        "";
      if (queryText) {
        ragContext = await fetchRAGContext(queryText, supabase, LEGACY_API_KEY);
      }
    }

    // Route to handler
    switch (capability) {
      case "chat":
        return await handleChat(body, LEGACY_API_KEY, ragContext);
      case "explain":
        return await handleExplain(body, LEGACY_API_KEY, ragContext);
      case "answer":
        return await handleAnswer(body, LEGACY_API_KEY, ragContext, supabase);
      case "challenge":
        return await handleChallenge(body, LEGACY_API_KEY, ragContext);
      case "generate":
        return await handleGenerate(body, LEGACY_API_KEY, supabase);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown capability: ${capability}` }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Orchestrator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
