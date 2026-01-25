import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate pseudo-embeddings matching semantic-search pattern
function generateSemanticEmbedding(text: string): number[] {
  const dimensions = 1536;
  const embedding: number[] = new Array(dimensions);
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
  
  for (let i = 0; i < dimensions; i++) {
    let value = 0;
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      let wordHash = 0;
      for (let k = 0; k < word.length; k++) {
        wordHash = ((wordHash << 5) - wordHash + word.charCodeAt(k)) | 0;
      }
      const contribution = Math.sin(wordHash * (i + 1) * 0.001) * (1 / (j + 1));
      value += contribution;
    }
    embedding[i] = Math.tanh(value);
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
}

// Shopify Admin API helper
async function shopifyAdminRequest(query: string, variables: Record<string, unknown> = {}) {
  const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  const storeDomain = "bubblesheet-storefront-ops-o5m9w.myshopify.com";
  
  if (!shopifyToken) {
    throw new Error("SHOPIFY_ACCESS_TOKEN not configured");
  }

  const response = await fetch(`https://${storeDomain}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": shopifyToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error: ${response.status} - ${text}`);
  }

  return response.json();
}

// Health check functions
async function runHealthChecks() {
  const checks: Array<{
    category: string;
    check_name: string;
    status: string;
    evidence: Record<string, unknown>;
    likely_cause: string | null;
    suggested_fix: string | null;
    requires_approval: boolean;
  }> = [];

  try {
    // 1. Store & Theme Health
    const shopQuery = `{
      shop {
        name
        primaryDomain { host sslEnabled }
        currencyCode
        enabledPresentmentCurrencies
        checkoutApiSupported
      }
      onlineStore: publication(id: "gid://shopify/Publication/1") {
        id
      }
    }`;
    
    const shopData = await shopifyAdminRequest(shopQuery);
    const shop = shopData?.data?.shop;
    
    checks.push({
      category: "storefront_theme",
      check_name: "Store Configuration",
      status: shop ? "ok" : "critical",
      evidence: { shop },
      likely_cause: shop ? null : "Store data unavailable",
      suggested_fix: shop ? null : "Check Shopify API connection",
      requires_approval: false,
    });

    checks.push({
      category: "storefront_theme",
      check_name: "SSL Status",
      status: shop?.primaryDomain?.sslEnabled ? "ok" : "critical",
      evidence: { domain: shop?.primaryDomain },
      likely_cause: shop?.primaryDomain?.sslEnabled ? null : "SSL not enabled",
      suggested_fix: shop?.primaryDomain?.sslEnabled ? null : "Enable SSL in Shopify domain settings",
      requires_approval: false,
    });

    // 2. Catalog & Inventory Health
    const inventoryQuery = `{
      products(first: 100) {
        edges {
          node {
            id
            title
            status
            totalInventory
            priceRangeV2 {
              minVariantPrice { amount }
            }
            images(first: 1) {
              edges { node { id } }
            }
          }
        }
      }
    }`;
    
    const productsData = await shopifyAdminRequest(inventoryQuery);
    const products = productsData?.data?.products?.edges || [];
    
    const lowStock = products.filter((p: any) => p.node.totalInventory <= 5 && p.node.totalInventory > 0);
    const outOfStock = products.filter((p: any) => p.node.totalInventory === 0);
    const noImages = products.filter((p: any) => !p.node.images?.edges?.length);
    const zeroPrice = products.filter((p: any) => parseFloat(p.node.priceRangeV2?.minVariantPrice?.amount || "0") === 0);

    checks.push({
      category: "catalog_inventory",
      check_name: "Inventory Levels",
      status: outOfStock.length > 5 ? "critical" : lowStock.length > 3 ? "warn" : "ok",
      evidence: { 
        totalProducts: products.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        lowStockItems: lowStock.slice(0, 5).map((p: any) => ({ title: p.node.title, stock: p.node.totalInventory })),
      },
      likely_cause: outOfStock.length > 0 ? "Products have zero inventory" : null,
      suggested_fix: outOfStock.length > 0 ? "Restock items or mark as unavailable" : null,
      requires_approval: false,
    });

    checks.push({
      category: "catalog_inventory",
      check_name: "Product Images",
      status: noImages.length > 0 ? "warn" : "ok",
      evidence: { 
        productsWithoutImages: noImages.length,
        items: noImages.slice(0, 5).map((p: any) => p.node.title),
      },
      likely_cause: noImages.length > 0 ? "Some products missing images" : null,
      suggested_fix: noImages.length > 0 ? "Add product images for better conversion" : null,
      requires_approval: false,
    });

    checks.push({
      category: "catalog_inventory",
      check_name: "Pricing Anomalies",
      status: zeroPrice.length > 0 ? "critical" : "ok",
      evidence: { 
        zeroPriceProducts: zeroPrice.length,
        items: zeroPrice.slice(0, 5).map((p: any) => p.node.title),
      },
      likely_cause: zeroPrice.length > 0 ? "Products with $0 price detected" : null,
      suggested_fix: zeroPrice.length > 0 ? "Review and set correct pricing" : null,
      requires_approval: true,
    });

    // 3. Orders Health
    const ordersQuery = `{
      orders(first: 50, query: "fulfillment_status:unfulfilled") {
        edges {
          node {
            id
            name
            createdAt
            displayFulfillmentStatus
          }
        }
      }
    }`;
    
    const ordersData = await shopifyAdminRequest(ordersQuery);
    const unfulfilledOrders = ordersData?.data?.orders?.edges || [];
    
    // Check for stuck orders (unfulfilled for > 3 days)
    const now = new Date();
    const stuckOrders = unfulfilledOrders.filter((o: any) => {
      const created = new Date(o.node.createdAt);
      const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 3;
    });

    checks.push({
      category: "orders_fulfillment",
      check_name: "Unfulfilled Orders",
      status: stuckOrders.length > 5 ? "critical" : unfulfilledOrders.length > 10 ? "warn" : "ok",
      evidence: { 
        totalUnfulfilled: unfulfilledOrders.length,
        stuckOrders: stuckOrders.length,
        stuckItems: stuckOrders.slice(0, 5).map((o: any) => ({ name: o.node.name, created: o.node.createdAt })),
      },
      likely_cause: stuckOrders.length > 0 ? "Orders pending fulfillment for over 3 days" : null,
      suggested_fix: stuckOrders.length > 0 ? "Review and process stuck orders" : null,
      requires_approval: false,
    });

    // 4. Checkout & Payment (limited visibility - detect only)
    checks.push({
      category: "checkout_payments",
      check_name: "Checkout API Status",
      status: shop?.checkoutApiSupported ? "ok" : "warn",
      evidence: { checkoutApiSupported: shop?.checkoutApiSupported },
      likely_cause: shop?.checkoutApiSupported ? null : "Checkout API may be limited",
      suggested_fix: null,
      requires_approval: false,
    });

    // 5. Apps health (via webhooks)
    const webhooksQuery = `{
      webhookSubscriptions(first: 50) {
        edges {
          node {
            id
            topic
            endpoint { __typename }
            createdAt
          }
        }
      }
    }`;
    
    const webhooksData = await shopifyAdminRequest(webhooksQuery);
    const webhooks = webhooksData?.data?.webhookSubscriptions?.edges || [];

    checks.push({
      category: "apps_integrations",
      check_name: "Webhook Subscriptions",
      status: webhooks.length === 0 ? "warn" : "ok",
      evidence: { 
        totalWebhooks: webhooks.length,
        topics: webhooks.map((w: any) => w.node.topic),
      },
      likely_cause: webhooks.length === 0 ? "No webhooks registered" : null,
      suggested_fix: webhooks.length === 0 ? "Configure webhooks for real-time sync" : null,
      requires_approval: false,
    });

  } catch (error) {
    checks.push({
      category: "storefront_theme",
      check_name: "API Connection",
      status: "critical",
      evidence: { error: error.message },
      likely_cause: "Failed to connect to Shopify API",
      suggested_fix: "Check API credentials and permissions",
      requires_approval: false,
    });
  }

  return checks;
}

// Get store configuration summary
async function getStoreConfig() {
  const query = `{
    shop {
      name
      email
      primaryDomain { host sslEnabled }
      currencyCode
      enabledPresentmentCurrencies
      billingAddress { country countryCodeV2 }
      timezoneAbbreviation
      checkoutApiSupported
    }
    localization: shop {
      currencyFormats {
        moneyFormat
        moneyWithCurrencyFormat
      }
    }
    products(first: 1) { edges { node { id } } }
    productVariants(first: 1) { edges { node { id } } }
  }`;

  const data = await shopifyAdminRequest(query);
  return data?.data;
}

// Get apps/integrations summary
async function getAppsIntegrations() {
  // Note: Shopify Admin API doesn't expose installed apps directly
  // We can infer from webhooks, metafields, and script tags
  const query = `{
    webhookSubscriptions(first: 100) {
      edges {
        node {
          id
          topic
          endpoint { __typename }
          createdAt
        }
      }
    }
    scriptTags(first: 50) {
      edges {
        node {
          id
          src
          displayScope
          createdAt
        }
      }
    }
  }`;

  const data = await shopifyAdminRequest(query);
  return {
    webhooks: data?.data?.webhookSubscriptions?.edges || [],
    scriptTags: data?.data?.scriptTags?.edges || [],
  };
}

// RAG search across namespaces
async function ragSearch(
  supabase: any,
  query: string,
  namespaces: string[] = ["shopify_docs", "store_state", "sop_uploads"],
  limit: number = 10
) {
  const embedding = generateSemanticEmbedding(query);
  const embeddingStr = `[${embedding.join(",")}]`;
  
  const results = [];
  
  for (const namespace of namespaces) {
    const { data, error } = await supabase.rpc("search_ops_rag_knowledge", {
      query_embedding: embeddingStr,
      filter_namespace: namespace,
      match_threshold: 0.3,
      match_count: limit,
    });
    
    if (!error && data) {
      results.push(...data.map((r: any) => ({ ...r, namespace })));
    }
  }
  
  // Sort by similarity
  return results.sort((a: any, b: any) => b.similarity - a.similarity).slice(0, limit);
}

// Agent chat handler
async function handleAgentChat(
  supabase: any,
  message: string,
  context: { mode: string; conversationId?: string }
) {
  // Determine query intent
  const isConfigQuestion = /current|configuration|setting|status|working/i.test(message);
  const isHowToQuestion = /how|what should|can i|help|guide/i.test(message);
  const isChangeRequest = /change|update|modify|fix|enable|disable/i.test(message);
  
  // Retrieve relevant knowledge
  const namespaceOrder = isConfigQuestion 
    ? ["store_state", "shopify_docs", "sop_uploads"]
    : ["shopify_docs", "sop_uploads", "store_state"];
  
  const ragResults = await ragSearch(supabase, message, namespaceOrder, 5);
  
  // Get current store state for context
  let storeContext = null;
  try {
    storeContext = await getStoreConfig();
  } catch (e) {
    console.error("Failed to get store context:", e);
  }
  
  // Build response
  const response = {
    sources: ragResults.map((r: any) => ({
      title: r.title,
      namespace: r.namespace,
      similarity: r.similarity,
    })),
    currentStatus: storeContext ? {
      storeName: storeContext.shop?.name,
      domain: storeContext.shop?.primaryDomain?.host,
      currency: storeContext.shop?.currencyCode,
    } : null,
    recommendations: [] as string[],
    actionsRequiringApproval: [] as any[],
    risks: [] as string[],
  };

  // Add recommendations based on context
  if (isChangeRequest) {
    response.actionsRequiringApproval.push({
      type: "change_request",
      description: `Potential change detected: "${message}"`,
      requiresApproval: true,
      riskLevel: "medium",
    });
    response.risks.push("Changes should be reviewed before execution");
  }

  // Generate answer using Lovable AI
  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are BUBBLESHEEP STORE OPS, an operational assistant for the bubblesheep.xyz Shopify store.

Your role:
- Help super admins monitor, validate, and optimize store operations
- Provide clear, actionable recommendations
- Never make changes without explicit approval
- Always cite your sources and evidence

Current store context:
${JSON.stringify(storeContext, null, 2)}

Relevant knowledge:
${ragResults.map((r: any) => `[${r.namespace}] ${r.title}: ${r.content?.substring(0, 200)}...`).join("\n\n")}

Response format:
- Be direct and operational
- Use bullet points
- Include "What I checked", "Current status", "Recommendations", and "Actions requiring approval" if applicable`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const aiData = await aiResponse.json();
  const answer = aiData?.choices?.[0]?.message?.content || "Unable to generate response";

  return {
    answer,
    ...response,
  };
}

// Create store state snapshot
async function createSnapshot(supabase: any, snapshotType: string) {
  let snapshotData = {};
  
  try {
    if (snapshotType === "full" || snapshotType === "config") {
      snapshotData = { ...snapshotData, config: await getStoreConfig() };
    }
    if (snapshotType === "full" || snapshotType === "apps") {
      snapshotData = { ...snapshotData, apps: await getAppsIntegrations() };
    }
    
    // Get previous snapshot for diff
    const { data: prevSnapshot } = await supabase
      .from("store_state_snapshots")
      .select("snapshot_data")
      .eq("snapshot_type", snapshotType)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    const diff = prevSnapshot ? computeDiff(prevSnapshot.snapshot_data, snapshotData) : null;
    
    const { data, error } = await supabase
      .from("store_state_snapshots")
      .insert({
        snapshot_type: snapshotType,
        snapshot_data: snapshotData,
        diff_from_previous: diff,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    throw new Error(`Failed to create snapshot: ${error.message}`);
  }
}

// Simple diff computation
function computeDiff(oldData: any, newData: any): any {
  const changes: any = { added: {}, removed: {}, changed: {} };
  
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  
  for (const key of allKeys) {
    if (!(key in oldData)) {
      changes.added[key] = newData[key];
    } else if (!(key in newData)) {
      changes.removed[key] = oldData[key];
    } else if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.changed[key] = { old: oldData[key], new: newData[key] };
    }
  }
  
  return changes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();

    let result;

    switch (action) {
      case "health_check":
        const checks = await runHealthChecks();
        
        // Store results in database
        for (const check of checks) {
          await supabase.from("ops_health_checks").insert(check);
        }
        
        result = { success: true, checks };
        break;

      case "get_store_config":
        result = { success: true, config: await getStoreConfig() };
        break;

      case "get_apps":
        result = { success: true, apps: await getAppsIntegrations() };
        break;

      case "chat":
        const response = await handleAgentChat(supabase, params.message, {
          mode: params.mode || "assist",
          conversationId: params.conversationId,
        });
        result = { success: true, response };
        break;

      case "create_snapshot":
        const snapshot = await createSnapshot(supabase, params.snapshotType || "full");
        result = { success: true, snapshot };
        break;

      case "get_health_history":
        const { data: healthHistory } = await supabase
          .from("ops_health_checks")
          .select("*")
          .order("checked_at", { ascending: false })
          .limit(params.limit || 100);
        result = { success: true, checks: healthHistory };
        break;

      case "get_snapshots":
        const { data: snapshots } = await supabase
          .from("store_state_snapshots")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(params.limit || 20);
        result = { success: true, snapshots };
        break;

      case "get_pending_actions":
        const { data: actions } = await supabase
          .from("ops_actions")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        result = { success: true, actions };
        break;

      case "approve_action":
        // Verify super admin
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Not authenticated");
        
        const { data: userData, error: authError } = await supabase.auth.getUser(
          authHeader.replace("Bearer ", "")
        );
        if (authError) throw authError;
        
        const { data: isSuperAdmin } = await supabase.rpc("is_super_admin", {
          _user_id: userData.user.id
        });
        
        if (!isSuperAdmin) {
          throw new Error("Only super admins can approve actions");
        }
        
        const { error: updateError } = await supabase
          .from("ops_actions")
          .update({
            status: "approved",
            approved_by: userData.user.id,
          })
          .eq("id", params.actionId);
        
        if (updateError) throw updateError;
        result = { success: true, message: "Action approved" };
        break;

      case "rag_search":
        const ragResults = await ragSearch(
          supabase,
          params.query,
          params.namespaces,
          params.limit || 10
        );
        result = { success: true, results: ragResults };
        break;

      case "ingest_knowledge":
        // Add knowledge to RAG
        const embedding = generateSemanticEmbedding(params.content);
        const embeddingStr = `[${embedding.join(",")}]`;
        
        const { error: insertError } = await supabase
          .from("ops_rag_knowledge")
          .insert({
            namespace: params.namespace,
            title: params.title,
            content: params.content,
            source_url: params.sourceUrl,
            source_type: params.sourceType,
            tags: params.tags || [],
            embedding: embeddingStr,
          });
        
        if (insertError) throw insertError;
        result = { success: true, message: "Knowledge ingested" };
        break;

      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Store Ops Agent error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});