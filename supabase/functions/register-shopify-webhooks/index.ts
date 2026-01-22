/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook topics to register for product updates
const WEBHOOK_TOPICS = [
  "products/create",
  "products/update", 
  "products/delete",
  "collections/create",
  "collections/update",
  "collections/delete",
  "orders/create",
  "orders/updated",
  "orders/fulfilled",
];

interface ShopifyWebhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  format: string;
}

interface RegisterResult {
  topic: string;
  status: "created" | "exists" | "error";
  webhookId?: number;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (!shopifyAccessToken) {
    return new Response(
      JSON.stringify({ success: false, error: "SHOPIFY_ACCESS_TOKEN not configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "register";

    // Get store domain from settings
    const { data: settings, error: settingsError } = await supabase
      .from("shopify_settings")
      .select("store_domain, api_version")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ success: false, error: "Shopify settings not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { store_domain, api_version } = settings;
    const shopifyAdminUrl = `https://${store_domain}/admin/api/${api_version}`;
    const webhookEndpoint = `${supabaseUrl}/functions/v1/shopify-webhook-processor`;

    if (action === "list") {
      // List existing webhooks
      const webhooks = await listWebhooks(shopifyAdminUrl, shopifyAccessToken);
      return new Response(
        JSON.stringify({ success: true, webhooks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "register") {
      // Get existing webhooks first
      const existingWebhooks = await listWebhooks(shopifyAdminUrl, shopifyAccessToken);
      const results: RegisterResult[] = [];

      for (const topic of WEBHOOK_TOPICS) {
        // Check if webhook already exists
        const existing = existingWebhooks.find(
          (w: ShopifyWebhook) => w.topic === topic && w.address === webhookEndpoint
        );

        if (existing) {
          results.push({
            topic,
            status: "exists",
            webhookId: existing.id,
          });
          continue;
        }

        // Create new webhook
        try {
          const webhook = await createWebhook(
            shopifyAdminUrl,
            shopifyAccessToken,
            topic,
            webhookEndpoint
          );
          results.push({
            topic,
            status: "created",
            webhookId: webhook.id,
          });
        } catch (error) {
          results.push({
            topic,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Log the registration
      await supabase.from("audit_logs").insert({
        entity_type: "shopify_webhooks",
        action: "register_webhooks",
        after_data: { results, endpoint: webhookEndpoint },
        metadata: { store_domain, topics_count: WEBHOOK_TOPICS.length },
      });

      const created = results.filter((r) => r.status === "created").length;
      const existing = results.filter((r) => r.status === "exists").length;
      const errors = results.filter((r) => r.status === "error").length;

      return new Response(
        JSON.stringify({
          success: errors === 0,
          summary: { created, existing, errors, total: WEBHOOK_TOPICS.length },
          results,
          endpoint: webhookEndpoint,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "unregister") {
      // Unregister all webhooks pointing to our endpoint
      const existingWebhooks = await listWebhooks(shopifyAdminUrl, shopifyAccessToken);
      const ourWebhooks = existingWebhooks.filter(
        (w: ShopifyWebhook) => w.address === webhookEndpoint
      );

      const deleteResults = [];
      for (const webhook of ourWebhooks) {
        try {
          await deleteWebhook(shopifyAdminUrl, shopifyAccessToken, webhook.id);
          deleteResults.push({ id: webhook.id, topic: webhook.topic, status: "deleted" });
        } catch (error) {
          deleteResults.push({
            id: webhook.id,
            topic: webhook.topic,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          deleted: deleteResults.filter((r) => r.status === "deleted").length,
          results: deleteResults,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook registration error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function listWebhooks(
  shopifyAdminUrl: string,
  accessToken: string
): Promise<ShopifyWebhook[]> {
  const response = await fetch(`${shopifyAdminUrl}/webhooks.json`, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list webhooks: ${response.status}`);
  }

  const data = await response.json();
  return data.webhooks || [];
}

async function createWebhook(
  shopifyAdminUrl: string,
  accessToken: string,
  topic: string,
  address: string
): Promise<ShopifyWebhook> {
  const response = await fetch(`${shopifyAdminUrl}/webhooks.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      webhook: {
        topic,
        address,
        format: "json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create webhook: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.webhook;
}

async function deleteWebhook(
  shopifyAdminUrl: string,
  accessToken: string,
  webhookId: number
): Promise<void> {
  const response = await fetch(`${shopifyAdminUrl}/webhooks/${webhookId}.json`, {
    method: "DELETE",
    headers: {
      "X-Shopify-Access-Token": accessToken,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete webhook: ${response.status}`);
  }
}
