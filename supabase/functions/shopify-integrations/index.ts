import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Shopify App Store app data for display (POD and commonly installed apps)
const APP_METADATA: Record<string, { 
  name: string; 
  category: string; 
  logo: string; 
  description: string;
  features: string[];
  appStoreUrl: string;
}> = {
  // POD Apps
  "printful": {
    name: "Printful",
    category: "pod",
    logo: "🖨️",
    description: "Premium print-on-demand and dropshipping",
    features: ["Auto-fulfillment", "Global warehouses", "300+ products", "White-label branding"],
    appStoreUrl: "https://apps.shopify.com/printful",
  },
  "printify": {
    name: "Printify",
    category: "pod",
    logo: "🎨",
    description: "Global print network with provider choice",
    features: ["800+ products", "90+ print providers", "Mockup generator", "Auto-routing"],
    appStoreUrl: "https://apps.shopify.com/printify",
  },
  "gelato": {
    name: "Gelato",
    category: "pod",
    logo: "🌍",
    description: "Local production in 32+ countries",
    features: ["Sustainable printing", "Local production", "Fast delivery", "API access"],
    appStoreUrl: "https://apps.shopify.com/gelato",
  },
  // Marketing & Sales Apps
  "klaviyo": {
    name: "Klaviyo",
    category: "marketing",
    logo: "📧",
    description: "Email & SMS marketing automation",
    features: ["Segmentation", "Flows", "SMS campaigns", "Analytics"],
    appStoreUrl: "https://apps.shopify.com/klaviyo-email-marketing",
  },
  "omnisend": {
    name: "Omnisend",
    category: "marketing",
    logo: "📬",
    description: "Email & SMS marketing for ecommerce",
    features: ["Automation workflows", "Push notifications", "Popups", "Reporting"],
    appStoreUrl: "https://apps.shopify.com/omnisend",
  },
  "mailchimp": {
    name: "Mailchimp",
    category: "marketing",
    logo: "🐒",
    description: "Email marketing & automation",
    features: ["Campaign builder", "Audience management", "Analytics", "Automations"],
    appStoreUrl: "https://apps.shopify.com/mailchimp",
  },
  "privy": {
    name: "Privy",
    category: "marketing",
    logo: "💬",
    description: "Pop ups, email, & SMS",
    features: ["Exit-intent popups", "Spin-to-win", "Free shipping bar", "Cart saver"],
    appStoreUrl: "https://apps.shopify.com/privy",
  },
  // Reviews & UGC
  "judge-me": {
    name: "Judge.me",
    category: "reviews",
    logo: "⭐",
    description: "Product reviews & ratings",
    features: ["Photo reviews", "Review requests", "SEO rich snippets", "Social sharing"],
    appStoreUrl: "https://apps.shopify.com/judgeme",
  },
  "loox": {
    name: "Loox",
    category: "reviews",
    logo: "📸",
    description: "Photo reviews & referrals",
    features: ["Photo reviews", "Video reviews", "Referral program", "Carousel widget"],
    appStoreUrl: "https://apps.shopify.com/loox",
  },
  "yotpo": {
    name: "Yotpo",
    category: "reviews",
    logo: "💫",
    description: "Reviews, loyalty & referrals",
    features: ["Product reviews", "Loyalty program", "Referrals", "Visual UGC"],
    appStoreUrl: "https://apps.shopify.com/yotpo-social-reviews",
  },
  // Shipping & Fulfillment
  "shipstation": {
    name: "ShipStation",
    category: "shipping",
    logo: "📦",
    description: "Shipping & order management",
    features: ["Multi-carrier", "Batch shipping", "Branded tracking", "Automation rules"],
    appStoreUrl: "https://apps.shopify.com/shipstation",
  },
  "aftership": {
    name: "AfterShip",
    category: "shipping",
    logo: "🚚",
    description: "Order tracking & returns",
    features: ["Branded tracking page", "Delivery notifications", "Returns portal", "Analytics"],
    appStoreUrl: "https://apps.shopify.com/aftership",
  },
  "easyship": {
    name: "Easyship",
    category: "shipping",
    logo: "✈️",
    description: "Shipping rates & global delivery",
    features: ["Rate comparison", "Dynamic checkout rates", "Tax & duty calculator", "250+ couriers"],
    appStoreUrl: "https://apps.shopify.com/easyship",
  },
  // Analytics & Reporting
  "google-analytics": {
    name: "Google & YouTube",
    category: "analytics",
    logo: "📊",
    description: "Google Analytics & Shopping integration",
    features: ["GA4 tracking", "Google Ads", "Shopping feed", "Performance Max"],
    appStoreUrl: "https://apps.shopify.com/google",
  },
  "facebook-instagram": {
    name: "Facebook & Instagram",
    category: "sales-channel",
    logo: "📱",
    description: "Social commerce & ads",
    features: ["Shop sync", "Instagram checkout", "Ads integration", "Pixel tracking"],
    appStoreUrl: "https://apps.shopify.com/facebook",
  },
  "triple-whale": {
    name: "Triple Whale",
    category: "analytics",
    logo: "🐋",
    description: "Attribution & analytics",
    features: ["Multi-touch attribution", "Profit tracking", "Creative analytics", "Cohort analysis"],
    appStoreUrl: "https://apps.shopify.com/triple-whale",
  },
  // Inventory & Operations
  "stocky": {
    name: "Stocky",
    category: "inventory",
    logo: "📋",
    description: "Inventory management by Shopify",
    features: ["Demand forecasting", "Purchase orders", "Inventory reports", "Supplier management"],
    appStoreUrl: "https://apps.shopify.com/stocky",
  },
  "sku-iq": {
    name: "SKU IQ",
    category: "inventory",
    logo: "🔄",
    description: "Multi-channel inventory sync",
    features: ["Real-time sync", "Multi-location", "Stock alerts", "Bundle management"],
    appStoreUrl: "https://apps.shopify.com/sku-iq",
  },
  // Customer Support
  "gorgias": {
    name: "Gorgias",
    category: "support",
    logo: "💬",
    description: "Helpdesk & customer support",
    features: ["Unified inbox", "Macros", "Order management", "Automation"],
    appStoreUrl: "https://apps.shopify.com/helpdesk",
  },
  "zendesk": {
    name: "Zendesk",
    category: "support",
    logo: "💚",
    description: "Customer service platform",
    features: ["Ticketing", "Live chat", "Knowledge base", "Reporting"],
    appStoreUrl: "https://apps.shopify.com/zendesk",
  },
  "tidio": {
    name: "Tidio",
    category: "support",
    logo: "🤖",
    description: "Live chat & chatbots",
    features: ["Live chat", "AI chatbots", "Messenger integration", "Visitor tracking"],
    appStoreUrl: "https://apps.shopify.com/tidio-chat",
  },
  // Upsells & Cross-sells
  "recharge": {
    name: "Recharge",
    category: "subscriptions",
    logo: "🔁",
    description: "Subscriptions & recurring payments",
    features: ["Subscription management", "Customer portal", "Bundle subscriptions", "Analytics"],
    appStoreUrl: "https://apps.shopify.com/subscription-payments",
  },
  "bold-upsell": {
    name: "Bold Upsell",
    category: "upsell",
    logo: "💰",
    description: "Upsell & cross-sell",
    features: ["Post-purchase offers", "In-cart upsells", "Pop-up offers", "AI recommendations"],
    appStoreUrl: "https://apps.shopify.com/product-upsell",
  },
  // SEO & Content
  "seo-manager": {
    name: "SEO Manager",
    category: "seo",
    logo: "🔍",
    description: "SEO optimization tools",
    features: ["Meta tags", "JSON-LD", "Sitemap", "404 monitoring"],
    appStoreUrl: "https://apps.shopify.com/seo-meta-manager",
  },
};

interface ShopifyApp {
  id: number;
  title: string;
  api_key?: string;
  installed_at?: string;
  uninstalled_at?: string | null;
}

interface InstalledAppInfo {
  id: string;
  title: string;
  installed: boolean;
  installedAt?: string;
  category: string;
  logo: string;
  description: string;
  features: string[];
  appStoreUrl: string;
  status: "active" | "inactive" | "unknown";
}

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  totalInventory: number;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string;
        price: { amount: string; currencyCode: string };
        availableForSale: boolean;
        inventoryQuantity: number;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options: Array<{ name: string; values: string[] }>;
}

interface ShopifyOrderNode {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: { edges: Array<{ node: { title: string; quantity: number } }> };
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
    country: string;
  } | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  const shopifyStorefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (!shopifyAccessToken) {
    return new Response(
      JSON.stringify({ success: false, error: "SHOPIFY_ACCESS_TOKEN not configured" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    // Get store domain from settings
    const { data: settings, error: settingsError } = await supabase
      .from("shopify_settings")
      .select("store_domain, api_version, scopes, is_connected")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ success: false, error: "Shopify settings not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { store_domain, api_version, scopes, is_connected } = settings;
    const shopifyAdminUrl = `https://${store_domain}/admin/api/${api_version}`;
    const shopifyGraphqlUrl = `https://${store_domain}/admin/api/${api_version}/graphql.json`;
    const shopifyStorefrontUrl = `https://${store_domain}/api/${api_version}/graphql.json`;

    // ============================================
    // ACTION: list - Get all integrations, apps, store info
    // ============================================
    if (action === "list") {
      const installedApps = await fetchInstalledApps(shopifyAdminUrl, shopifyAccessToken);
      
      const webhooksResponse = await fetch(`${shopifyAdminUrl}/webhooks.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const webhooksData = webhooksResponse.ok ? await webhooksResponse.json() : { webhooks: [] };
      const webhooks = webhooksData.webhooks || [];

      const shopResponse = await fetch(`${shopifyAdminUrl}/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const shopData = shopResponse.ok ? await shopResponse.json() : { shop: {} };
      const shop = shopData.shop || {};

      const enrichedApps = installedApps.map((app: ShopifyApp) => {
        const appKey = normalizeAppName(app.title);
        const metadata = APP_METADATA[appKey] || {
          name: app.title,
          category: "other",
          logo: "📱",
          description: "Shopify app integration",
          features: [],
          appStoreUrl: `https://apps.shopify.com/search?q=${encodeURIComponent(app.title)}`,
        };

        return {
          id: String(app.id),
          title: metadata.name || app.title,
          installed: true,
          installedAt: app.installed_at,
          category: metadata.category,
          logo: metadata.logo,
          description: metadata.description,
          features: metadata.features,
          appStoreUrl: metadata.appStoreUrl,
          status: app.uninstalled_at ? "inactive" : "active",
        } as InstalledAppInfo;
      });

      const activeWebhookTopics = webhooks.map((w: { topic: string }) => w.topic);

      return new Response(
        JSON.stringify({
          success: true,
          store: {
            name: shop.name,
            domain: store_domain,
            email: shop.email,
            plan: shop.plan_name,
            currency: shop.currency,
            timezone: shop.timezone,
          },
          connection: {
            isConnected: is_connected,
            scopes: scopes || [],
            apiVersion: api_version,
          },
          apps: enrichedApps,
          webhooks: {
            count: webhooks.length,
            topics: activeWebhookTopics,
          },
          podProviders: getPodProviderStatus(enrichedApps),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: store_info - Get detailed store info
    // ============================================
    if (action === "store_info") {
      const shopResponse = await fetch(`${shopifyAdminUrl}/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      
      if (!shopResponse.ok) {
        throw new Error(`Failed to fetch shop info: ${shopResponse.status}`);
      }
      
      const shopData = await shopResponse.json();
      const shop = shopData.shop;

      return new Response(
        JSON.stringify({
          success: true,
          store: {
            id: shop.id,
            name: shop.name,
            email: shop.email,
            domain: shop.domain,
            myshopifyDomain: shop.myshopify_domain,
            primaryDomain: shop.primary_domain,
            plan: shop.plan_name,
            planDisplayName: shop.plan_display_name,
            currency: shop.currency,
            timezone: shop.iana_timezone,
            country: shop.country_name,
            countryCode: shop.country_code,
            phone: shop.phone,
            createdAt: shop.created_at,
            updatedAt: shop.updated_at,
            checkoutApiSupported: shop.checkout_api_supported,
            multiLocationEnabled: shop.multi_location_enabled,
            setupRequired: shop.setup_required,
            preLaunchEnabled: shop.pre_launch_enabled,
            passwordEnabled: shop.password_enabled,
            eligibleForPayments: shop.eligible_for_payments,
            hasStorefront: shop.has_storefront,
            hasDiscounts: shop.has_discounts,
            hasGiftCards: shop.has_gift_cards,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: products - Get products (Admin API)
    // ============================================
    if (action === "products") {
      const { first = 50, query = "", after = null } = body;
      
      const graphqlQuery = `
        query GetProducts($first: Int!, $query: String, $after: String) {
          products(first: $first, query: $query, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                description
                vendor
                productType
                tags
                status
                totalInventory
                priceRangeV2 {
                  minVariantPrice { amount currencyCode }
                  maxVariantPrice { amount currencyCode }
                }
                images(first: 5) {
                  edges {
                    node { url altText }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      sku
                      availableForSale
                      inventoryQuantity
                      selectedOptions { name value }
                    }
                  }
                }
                options { name values }
              }
            }
          }
        }
      `;

      const graphqlResponse = await fetch(shopifyGraphqlUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { first, query, after },
        }),
      });

      if (!graphqlResponse.ok) {
        throw new Error(`GraphQL request failed: ${graphqlResponse.status}`);
      }

      const graphqlData = await graphqlResponse.json();

      if (graphqlData.errors) {
        throw new Error(graphqlData.errors.map((e: { message: string }) => e.message).join(", "));
      }

      const products = graphqlData.data?.products;

      // Transform Admin API response to match expected format
      const transformedProducts = products?.edges?.map((edge: { node: Record<string, unknown> }) => {
        const node = edge.node as {
          id: string;
          title: string;
          handle: string;
          description: string;
          vendor: string;
          productType: string;
          tags: string[];
          status: string;
          totalInventory: number;
          priceRangeV2?: { minVariantPrice: { amount: string; currencyCode: string }; maxVariantPrice: { amount: string; currencyCode: string } };
          images: { edges: Array<{ node: { url: string; altText: string | null } }> };
          variants: { edges: Array<{ node: { id: string; title: string; sku: string; availableForSale: boolean; inventoryQuantity: number; selectedOptions: Array<{ name: string; value: string }> } }> };
          options: Array<{ name: string; values: string[] }>;
        };
        
        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          vendor: node.vendor,
          productType: node.productType,
          tags: node.tags,
          status: node.status,
          totalInventory: node.totalInventory,
          priceRange: {
            minVariantPrice: node.priceRangeV2?.minVariantPrice || { amount: "0", currencyCode: "EUR" },
            maxVariantPrice: node.priceRangeV2?.maxVariantPrice || { amount: "0", currencyCode: "EUR" },
          },
          images: node.images,
          variants: {
            edges: node.variants?.edges?.map(v => ({
              node: {
                id: v.node.id,
                title: v.node.title,
                sku: v.node.sku,
                price: node.priceRangeV2?.minVariantPrice || { amount: "0", currencyCode: "EUR" },
                availableForSale: v.node.availableForSale,
                inventoryQuantity: v.node.inventoryQuantity,
                selectedOptions: v.node.selectedOptions,
              }
            })) || []
          },
          options: node.options,
        };
      }) || [];

      return new Response(
        JSON.stringify({
          success: true,
          products: transformedProducts,
          pageInfo: products?.pageInfo || { hasNextPage: false, endCursor: null },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: orders - Get orders (Admin API)
    // ============================================
    if (action === "orders") {
      const { first = 50, query = "", after = null } = body;
      
      const graphqlQuery = `
        query GetOrders($first: Int!, $query: String, $after: String) {
          orders(first: $first, query: $query, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                name
                email
                createdAt
                displayFinancialStatus
                displayFulfillmentStatus
                totalPriceSet {
                  shopMoney { amount currencyCode }
                }
                lineItems(first: 10) {
                  edges {
                    node { title quantity }
                  }
                }
                shippingAddress {
                  firstName
                  lastName
                  city
                  country
                }
              }
            }
          }
        }
      `;

      const graphqlResponse = await fetch(shopifyGraphqlUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { first, query, after },
        }),
      });

      if (!graphqlResponse.ok) {
        throw new Error(`GraphQL request failed: ${graphqlResponse.status}`);
      }

      const graphqlData = await graphqlResponse.json();

      if (graphqlData.errors) {
        throw new Error(graphqlData.errors.map((e: { message: string }) => e.message).join(", "));
      }

      const orders = graphqlData.data?.orders;

      return new Response(
        JSON.stringify({
          success: true,
          orders: orders?.edges?.map((edge: { node: ShopifyOrderNode }) => edge.node) || [],
          pageInfo: orders?.pageInfo || { hasNextPage: false, endCursor: null },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: inventory - Get inventory levels
    // ============================================
    if (action === "inventory") {
      const { locationId = null } = body;
      
      // Get locations first - handle 403 gracefully (missing read_locations permission)
      const locationsResponse = await fetch(`${shopifyAdminUrl}/locations.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });

      // If 403, the API token doesn't have read_locations permission - return empty gracefully
      if (locationsResponse.status === 403) {
        console.warn("Shopify API token lacks read_locations permission - returning empty inventory");
        return new Response(
          JSON.stringify({ 
            success: true, 
            locations: [], 
            inventory: [],
            warning: "Inventory access requires 'read_locations' and 'read_inventory' permissions in your Shopify app."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!locationsResponse.ok) {
        throw new Error(`Failed to fetch locations: ${locationsResponse.status}`);
      }

      const locationsData = await locationsResponse.json();
      const locations = locationsData.locations || [];

      // Get inventory levels for the first/specified location
      const targetLocationId = locationId || locations[0]?.id;
      
      if (!targetLocationId) {
        return new Response(
          JSON.stringify({ success: true, locations: [], inventory: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const inventoryResponse = await fetch(
        `${shopifyAdminUrl}/inventory_levels.json?location_ids=${targetLocationId}&limit=250`,
        {
          headers: {
            "X-Shopify-Access-Token": shopifyAccessToken,
            "Content-Type": "application/json",
          },
        }
      );

      const inventoryData = inventoryResponse.ok ? await inventoryResponse.json() : { inventory_levels: [] };

      return new Response(
        JSON.stringify({
          success: true,
          locations: locations.map((loc: { id: number; name: string; active: boolean; address1: string; city: string; country: string }) => ({
            id: loc.id,
            name: loc.name,
            active: loc.active,
            address: `${loc.address1}, ${loc.city}, ${loc.country}`,
          })),
          inventory: inventoryData.inventory_levels || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: storefront_products - Get products via Storefront API
    // ============================================
    if (action === "storefront_products") {
      if (!shopifyStorefrontToken) {
        return new Response(
          JSON.stringify({ success: false, error: "Storefront token not configured" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { first = 20, query = "", after = null } = body;
      
      const graphqlQuery = `
        query GetProducts($first: Int!, $query: String, $after: String) {
          products(first: $first, query: $query, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                description
                tags
                priceRange {
                  minVariantPrice { amount currencyCode }
                }
                images(first: 5) {
                  edges {
                    node { url altText }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price { amount currencyCode }
                      availableForSale
                      selectedOptions { name value }
                    }
                  }
                }
                options { name values }
              }
            }
          }
        }
      `;

      const graphqlResponse = await fetch(shopifyStorefrontUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Storefront-Access-Token": shopifyStorefrontToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { first, query, after },
        }),
      });

      if (!graphqlResponse.ok) {
        throw new Error(`Storefront API request failed: ${graphqlResponse.status}`);
      }

      const graphqlData = await graphqlResponse.json();

      if (graphqlData.errors) {
        throw new Error(graphqlData.errors.map((e: { message: string }) => e.message).join(", "));
      }

      const products = graphqlData.data?.products;

      return new Response(
        JSON.stringify({
          success: true,
          products: products?.edges || [],
          pageInfo: products?.pageInfo || { hasNextPage: false, endCursor: null },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: collections - Get collections
    // ============================================
    if (action === "collections") {
      const { first = 50 } = body;
      
      const collectionsResponse = await fetch(`${shopifyAdminUrl}/custom_collections.json?limit=${first}`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });

      const smartCollectionsResponse = await fetch(`${shopifyAdminUrl}/smart_collections.json?limit=${first}`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });

      const customCollections = collectionsResponse.ok 
        ? (await collectionsResponse.json()).custom_collections || []
        : [];
      const smartCollections = smartCollectionsResponse.ok
        ? (await smartCollectionsResponse.json()).smart_collections || []
        : [];

      const allCollections = [
        ...customCollections.map((c: { id: number; title: string; handle: string; body_html: string; published_at: string; image?: { src: string } }) => ({ ...c, type: 'custom' })),
        ...smartCollections.map((c: { id: number; title: string; handle: string; body_html: string; published_at: string; image?: { src: string } }) => ({ ...c, type: 'smart' })),
      ];

      return new Response(
        JSON.stringify({
          success: true,
          collections: allCollections.map((c: { id: number; title: string; handle: string; body_html: string; published_at: string; type: string; image?: { src: string } }) => ({
            id: c.id,
            title: c.title,
            handle: c.handle,
            description: c.body_html?.replace(/<[^>]*>/g, '') || '',
            type: c.type,
            publishedAt: c.published_at,
            image: c.image?.src || null,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: analytics - Get store analytics
    // ============================================
    if (action === "analytics") {
      const { days = 30 } = body;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);
      const sinceISO = sinceDate.toISOString();

      // Fetch recent orders for analytics
      const ordersResponse = await fetch(
        `${shopifyAdminUrl}/orders.json?created_at_min=${sinceISO}&status=any&limit=250`,
        {
          headers: {
            "X-Shopify-Access-Token": shopifyAccessToken,
            "Content-Type": "application/json",
          },
        }
      );

      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] };
      const orders = ordersData.orders || [];

      // Calculate analytics
      const totalRevenue = orders.reduce((sum: number, order: { total_price: string }) => 
        sum + parseFloat(order.total_price || '0'), 0
      );
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Count fulfillment statuses
      const fulfillmentStats = orders.reduce((acc: Record<string, number>, order: { fulfillment_status: string | null }) => {
        const status = order.fulfillment_status || 'unfulfilled';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Count financial statuses
      const financialStats = orders.reduce((acc: Record<string, number>, order: { financial_status: string }) => {
        const status = order.financial_status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            period: `Last ${days} days`,
            totalRevenue,
            totalOrders,
            avgOrderValue,
            fulfillmentStats,
            financialStats,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ACTION: sync_status - Get sync status for all integrations
    // ============================================
    if (action === "sync_status") {
      // Get webhooks status
      const webhooksResponse = await fetch(`${shopifyAdminUrl}/webhooks.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const webhooksData = webhooksResponse.ok ? await webhooksResponse.json() : { webhooks: [] };

      // Get product count
      const productCountResponse = await fetch(`${shopifyAdminUrl}/products/count.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const productCountData = productCountResponse.ok ? await productCountResponse.json() : { count: 0 };

      // Get order count
      const orderCountResponse = await fetch(`${shopifyAdminUrl}/orders/count.json?status=any`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const orderCountData = orderCountResponse.ok ? await orderCountResponse.json() : { count: 0 };

      // Check POD provider status from database
      const { data: podProviders } = await supabase
        .from("pod_providers")
        .select("provider, status, last_sync_at");

      // Check variant mappings status
      const { data: mappings, count: mappingsCount } = await supabase
        .from("variant_mappings")
        .select("status", { count: "exact" });

      const mappingStats = (mappings || []).reduce((acc: Record<string, number>, m: { status: string }) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {});

      return new Response(
        JSON.stringify({
          success: true,
          syncStatus: {
            shopify: {
              connected: is_connected,
              apiVersion: api_version,
              webhooksActive: (webhooksData.webhooks || []).length,
              productCount: productCountData.count || 0,
              orderCount: orderCountData.count || 0,
            },
            pod: {
              providers: podProviders || [],
            },
            mappings: {
              total: mappingsCount || 0,
              byStatus: mappingStats,
            },
            lastChecked: new Date().toISOString(),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Invalid action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Shopify integrations error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchInstalledApps(
  shopifyAdminUrl: string,
  accessToken: string
): Promise<ShopifyApp[]> {
  try {
    const chargesResponse = await fetch(`${shopifyAdminUrl}/application_charges.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (chargesResponse.ok) {
      const data = await chargesResponse.json();
      const appMap = new Map<string, ShopifyApp>();
      (data.application_charges || []).forEach((charge: { id: number; name: string; created_at: string }) => {
        if (!appMap.has(charge.name)) {
          appMap.set(charge.name, {
            id: charge.id,
            title: charge.name,
            installed_at: charge.created_at,
          });
        }
      });
      return Array.from(appMap.values());
    }
  } catch (e) {
    console.log("Could not fetch application charges:", e);
  }

  try {
    const recurringResponse = await fetch(`${shopifyAdminUrl}/recurring_application_charges.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (recurringResponse.ok) {
      const data = await recurringResponse.json();
      const appMap = new Map<string, ShopifyApp>();
      (data.recurring_application_charges || []).forEach((charge: { id: number; name: string; created_at: string; status: string }) => {
        if (!appMap.has(charge.name)) {
          appMap.set(charge.name, {
            id: charge.id,
            title: charge.name,
            installed_at: charge.created_at,
            uninstalled_at: charge.status === 'cancelled' ? new Date().toISOString() : null,
          });
        }
      });
      if (appMap.size > 0) {
        return Array.from(appMap.values());
      }
    }
  } catch (e) {
    console.log("Could not fetch recurring charges:", e);
  }

  return [];
}

function normalizeAppName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPodProviderStatus(apps: InstalledAppInfo[]): {
  printful: boolean;
  printify: boolean;
  gelato: boolean;
  other: string[];
} {
  const podApps = apps.filter(app => app.category === "pod");
  return {
    printful: podApps.some(app => normalizeAppName(app.title).includes("printful")),
    printify: podApps.some(app => normalizeAppName(app.title).includes("printify")),
    gelato: podApps.some(app => normalizeAppName(app.title).includes("gelato")),
    other: podApps
      .filter(app => 
        !normalizeAppName(app.title).includes("printful") &&
        !normalizeAppName(app.title).includes("printify") &&
        !normalizeAppName(app.title).includes("gelato")
      )
      .map(app => app.title),
  };
}
