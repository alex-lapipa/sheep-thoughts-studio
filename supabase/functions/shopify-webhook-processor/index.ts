/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain, x-shopify-webhook-id",
};

// Topics that should trigger a sitemap ping (product changes affect SEO)
const SITEMAP_TRIGGER_TOPICS = [
  "products/create",
  "products/update",
  "products/delete",
  "collections/create",
  "collections/update",
  "collections/delete",
];

interface WebhookPayload {
  action?: "retry";
  eventId?: string;
  topic?: string;
  payload?: Record<string, unknown>;
  id?: string | number;
  title?: string;
}

interface WebhookRecord {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  attempts: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: WebhookPayload = await req.json();
    
    // Handle retry action from admin UI
    if (body.action === "retry" && body.eventId) {
      return await handleRetry(supabase, body.eventId, supabaseUrl);
    }

    // Handle incoming Shopify webhook
    const topic = req.headers.get("x-shopify-topic") || body.topic;
    const webhookId = req.headers.get("x-shopify-webhook-id");
    const shopDomain = req.headers.get("x-shopify-shop-domain");

    if (!topic) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing webhook topic" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing Shopify webhook: ${topic} from ${shopDomain}`);

    // Store the webhook event
    const { data: webhook, error: insertError } = await supabase
      .from("shopify_webhooks")
      .insert({
        topic,
        shopify_webhook_id: webhookId,
        payload: body.payload || body,
        headers: {
          "x-shopify-topic": topic,
          "x-shopify-webhook-id": webhookId,
          "x-shopify-shop-domain": shopDomain,
        },
        status: "pending",
        idempotency_key: webhookId || `${topic}-${Date.now()}`,
      })
      .select()
      .single();

    if (insertError) {
      // Check for duplicate (idempotency)
      if (insertError.code === "23505") {
        console.log(`Duplicate webhook ignored: ${webhookId}`);
        return new Response(
          JSON.stringify({ success: true, message: "Duplicate webhook, already processed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw insertError;
    }

    // Process the webhook based on topic
    const payloadToProcess = (body.payload || body) as Record<string, unknown>;
    const result = await processWebhook(supabase, topic, payloadToProcess, supabaseUrl);

    // Update webhook status
    await supabase
      .from("shopify_webhooks")
      .update({
        status: result.success ? "processed" : "failed",
        processed_at: new Date().toISOString(),
        error_message: result.error || null,
        attempts: 1,
        last_attempt_at: new Date().toISOString(),
      })
      .eq("id", (webhook as WebhookRecord).id);

    return new Response(
      JSON.stringify({ 
        success: result.success, 
        webhookId: (webhook as WebhookRecord).id, 
        actions: result.actions,
        error: result.error 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook processor error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processWebhook(
  supabase: SupabaseClient,
  topic: string,
  payload: Record<string, unknown>,
  supabaseUrl: string
): Promise<{ success: boolean; actions: string[]; error?: string }> {
  const actions: string[] = [];

  try {
    // Check if this topic should trigger a sitemap ping
    if (SITEMAP_TRIGGER_TOPICS.includes(topic)) {
      console.log(`Topic ${topic} triggers sitemap ping`);
      
      const pingResult = await pingSitemap(supabaseUrl);
      if (pingResult.success) {
        actions.push(`Sitemap ping: ${pingResult.summary.successful}/${pingResult.summary.total} search engines notified`);
      } else {
        actions.push(`Sitemap ping attempted but had issues`);
      }
    }

    // Log product changes for audit trail
    if (topic.startsWith("products/")) {
      const productId = payload.id as string | number | undefined;
      const productTitle = payload.title as string | undefined;
      
      await supabase.from("audit_logs").insert({
        entity_type: "shopify_product",
        entity_id: String(productId),
        action: topic,
        after_data: { title: productTitle, topic },
        metadata: { source: "shopify_webhook" },
      });
      
      actions.push(`Audit logged: ${topic} for product ${productTitle || productId}`);
    }

    // Log collection changes
    if (topic.startsWith("collections/")) {
      const collectionId = payload.id as string | number | undefined;
      const collectionTitle = payload.title as string | undefined;
      
      await supabase.from("audit_logs").insert({
        entity_type: "shopify_collection",
        entity_id: String(collectionId),
        action: topic,
        after_data: { title: collectionTitle, topic },
        metadata: { source: "shopify_webhook" },
      });
      
      actions.push(`Audit logged: ${topic} for collection ${collectionTitle || collectionId}`);
    }

    return { success: true, actions };

  } catch (error) {
    console.error("Process webhook error:", error);
    return { 
      success: false, 
      actions, 
      error: error instanceof Error ? error.message : "Processing failed" 
    };
  }
}

async function pingSitemap(supabaseUrl: string): Promise<{
  success: boolean;
  summary: { total: number; successful: number };
}> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/ping-sitemap`);
    const data = await response.json();
    
    console.log(`Sitemap ping result: ${data.summary?.successful}/${data.summary?.total} successful`);
    
    return {
      success: data.success,
      summary: data.summary || { total: 0, successful: 0 },
    };
  } catch (error) {
    console.error("Failed to ping sitemap:", error);
    return { success: false, summary: { total: 0, successful: 0 } };
  }
}

async function handleRetry(
  supabase: SupabaseClient,
  eventId: string,
  supabaseUrl: string
): Promise<Response> {
  // Get the original webhook
  const { data: webhookData, error } = await supabase
    .from("shopify_webhooks")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !webhookData) {
    return new Response(
      JSON.stringify({ success: false, error: "Webhook not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const webhook = webhookData as WebhookRecord;

  // Update status to retrying
  await supabase
    .from("shopify_webhooks")
    .update({ 
      status: "retrying",
      attempts: (webhook.attempts || 0) + 1,
      last_attempt_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  // Reprocess the webhook
  const result = await processWebhook(
    supabase,
    webhook.topic,
    webhook.payload,
    supabaseUrl
  );

  // Update final status
  await supabase
    .from("shopify_webhooks")
    .update({
      status: result.success ? "processed" : "failed",
      processed_at: result.success ? new Date().toISOString() : null,
      error_message: result.error || null,
    })
    .eq("id", eventId);

  return new Response(
    JSON.stringify({ 
      success: result.success, 
      actions: result.actions,
      error: result.error 
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
