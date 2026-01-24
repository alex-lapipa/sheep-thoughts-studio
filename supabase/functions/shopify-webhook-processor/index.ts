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

// Topics that should trigger inventory/stock alerts
const INVENTORY_TOPICS = [
  "inventory_levels/update",
  "inventory_items/update",
  "variants/in_stock",
  "variants/out_of_stock",
];

// Topics that should trigger order status emails
const ORDER_STATUS_TOPICS = [
  "orders/create",
  "orders/paid",
  "orders/fulfilled",
  "orders/partially_fulfilled",
  "orders/cancelled",
  "fulfillments/create",
  "fulfillments/update",
];

interface WebhookPayload {
  action?: "retry";
  eventId?: string;
  topic?: string;
  payload?: Record<string, unknown>;
  id?: string | number;
  title?: string;
  // Order-specific fields
  name?: string;
  email?: string;
  customer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  line_items?: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  fulfillment_status?: string | null;
  fulfillments?: Array<{
    status: string;
    tracking_number?: string;
    tracking_url?: string;
    tracking_company?: string;
  }>;
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

    // Handle order status changes and send emails
    if (ORDER_STATUS_TOPICS.includes(topic)) {
      const emailResult = await sendOrderStatusEmail(supabaseUrl, topic, payload);
      if (emailResult.success) {
        actions.push(`Order status email sent: ${emailResult.status} to ${emailResult.email}`);
      } else if (emailResult.skipped) {
        actions.push(`Order status email skipped: ${emailResult.reason}`);
      } else {
        actions.push(`Order status email failed: ${emailResult.error}`);
      }

      // Log order event for audit trail
      const orderId = payload.id as string | number | undefined;
      const orderName = payload.name as string | undefined;
      
      await supabase.from("audit_logs").insert({
        entity_type: "shopify_order",
        entity_id: String(orderId),
        action: topic,
        after_data: { 
          orderName, 
          topic,
          fulfillmentStatus: payload.fulfillment_status,
          emailSent: emailResult.success,
        },
        metadata: { source: "shopify_webhook" },
      });
      
      actions.push(`Audit logged: ${topic} for order ${orderName || orderId}`);
    }

    // Handle inventory updates
    if (INVENTORY_TOPICS.includes(topic)) {
      const inventoryItemId = payload.inventory_item_id as string | number | undefined;
      const locationId = payload.location_id as string | number | undefined;
      const available = payload.available as number | undefined;
      const variantId = payload.variant_id as string | number | undefined;
      
      await supabase.from("audit_logs").insert({
        entity_type: "shopify_inventory",
        entity_id: String(inventoryItemId || variantId),
        action: topic,
        after_data: { 
          topic,
          inventoryItemId,
          locationId,
          available,
          variantId,
        },
        metadata: { source: "shopify_webhook" },
      });
      
      actions.push(`Inventory ${topic}: item ${inventoryItemId || variantId}, available: ${available ?? 'N/A'}`);
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

interface OrderStatusEmailResult {
  success: boolean;
  skipped?: boolean;
  email?: string;
  status?: string;
  reason?: string;
  error?: string;
}

async function sendOrderStatusEmail(
  supabaseUrl: string,
  topic: string,
  payload: Record<string, unknown>
): Promise<OrderStatusEmailResult> {
  try {
    // Extract customer email
    const customer = payload.customer as { email?: string; first_name?: string; last_name?: string } | undefined;
    const email = (payload.email as string) || customer?.email;
    
    if (!email) {
      return { success: false, skipped: true, reason: "No customer email found" };
    }

    // Determine email status based on topic and payload
    let status: string;
    let trackingNumber: string | undefined;
    let trackingUrl: string | undefined;
    let carrier: string | undefined;

    const fulfillments = payload.fulfillments as Array<{
      status: string;
      tracking_number?: string;
      tracking_url?: string;
      tracking_company?: string;
    }> | undefined;

    const latestFulfillment = fulfillments?.[fulfillments.length - 1];

    switch (topic) {
      case "orders/create":
        status = "confirmed";
        break;
      case "orders/paid":
        status = "confirmed";
        break;
      case "orders/fulfilled":
      case "fulfillments/create":
      case "fulfillments/update":
        status = "shipped";
        if (latestFulfillment) {
          trackingNumber = latestFulfillment.tracking_number;
          trackingUrl = latestFulfillment.tracking_url;
          carrier = latestFulfillment.tracking_company;
        }
        break;
      case "orders/partially_fulfilled":
        status = "processing";
        break;
      case "orders/cancelled":
        status = "cancelled";
        break;
      default:
        return { success: false, skipped: true, reason: `Unhandled topic: ${topic}` };
    }

    // Extract line items for the email
    const lineItems = (payload.line_items as Array<{
      title: string;
      quantity: number;
      price: string;
    }> | undefined)?.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: `$${parseFloat(item.price).toFixed(2)}`,
    }));

    const customerName = customer?.first_name 
      ? `${customer.first_name}${customer.last_name ? ` ${customer.last_name}` : ''}`
      : "Valued Customer";

    // Call the order status email function
    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-status-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        orderName: payload.name || `#${payload.order_number || payload.id}`,
        orderId: String(payload.id),
        customerName,
        status,
        trackingNumber,
        trackingUrl,
        carrier,
        lineItems,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Failed to send order status email:", result);
      return { success: false, error: result.error || "Email send failed" };
    }

    console.log(`Order status email sent: ${status} to ${email}`);
    return { success: true, email, status };

  } catch (error) {
    console.error("Error sending order status email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
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
