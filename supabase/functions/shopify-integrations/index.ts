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

    if (action === "list") {
      // Fetch installed apps from Shopify (this requires read_content or access_all_apps scope)
      // We'll try to get what we can and supplement with known app data
      const installedApps = await fetchInstalledApps(shopifyAdminUrl, shopifyAccessToken);
      
      // Fetch webhooks to show active integrations
      const webhooksResponse = await fetch(`${shopifyAdminUrl}/webhooks.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const webhooksData = webhooksResponse.ok ? await webhooksResponse.json() : { webhooks: [] };
      const webhooks = webhooksData.webhooks || [];

      // Fetch shop info for additional context
      const shopResponse = await fetch(`${shopifyAdminUrl}/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });
      const shopData = shopResponse.ok ? await shopResponse.json() : { shop: {} };
      const shop = shopData.shop || {};

      // Build response with real and enriched data
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

      // Get active webhook topics for integration status
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

    if (action === "store_info") {
      // Just fetch store info
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

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
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
  // Try to fetch installed apps - this may be limited by scope
  // Shopify's metafields or app installations endpoint
  try {
    // Try the application_charges endpoint to infer installed apps
    const chargesResponse = await fetch(`${shopifyAdminUrl}/application_charges.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (chargesResponse.ok) {
      const data = await chargesResponse.json();
      // Extract unique app info from charges
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

  // Try recurring application charges for subscription apps
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

  // Fallback: return empty array - frontend will show available apps instead
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
  const podApps = apps.filter((app) => app.category === "pod");
  return {
    printful: podApps.some((app) => app.title.toLowerCase().includes("printful")),
    printify: podApps.some((app) => app.title.toLowerCase().includes("printify")),
    gelato: podApps.some((app) => app.title.toLowerCase().includes("gelato")),
    other: podApps
      .filter((app) => 
        !app.title.toLowerCase().includes("printful") &&
        !app.title.toLowerCase().includes("printify") &&
        !app.title.toLowerCase().includes("gelato")
      )
      .map((app) => app.title),
  };
}
