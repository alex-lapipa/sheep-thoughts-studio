/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Sitemap notification endpoint - notifies search engines when content changes
// Note: Most search engines have deprecated ping APIs. This function now:
// - Uses Google's Search Console API approach (requires manual verification)
// - Uses IndexNow for Bing/Yandex (requires key file)
// - Logs notifications for manual submission

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

interface NotificationResult {
  engine: string;
  method: string;
  success: boolean;
  status?: number;
  message: string;
  actionRequired?: string;
}

interface NotificationResponse {
  success: boolean;
  timestamp: string;
  sitemap: string;
  results: NotificationResult[];
  summary: {
    total: number;
    successful: number;
    actionRequired: number;
  };
  nextSteps: string[];
}

// Attempt to fetch sitemap to verify it's accessible
async function verifySitemapAccessible(sitemapUrl: string): Promise<{ accessible: boolean; status?: number }> {
  try {
    const response = await fetch(sitemapUrl, {
      method: "HEAD",
      headers: { "User-Agent": "SheepThoughtsStudio/1.0 (Sitemap Verification)" },
    });
    return { accessible: response.ok, status: response.status };
  } catch {
    return { accessible: false };
  }
}

// Check Google (note: ping endpoint deprecated, returns info for manual submission)
async function notifyGoogle(sitemapUrl: string): Promise<NotificationResult> {
  // Google deprecated their ping endpoint in 2023
  // Users must submit via Search Console
  return {
    engine: "Google",
    method: "Search Console (Manual)",
    success: true,
    message: "Google requires Search Console submission",
    actionRequired: `Submit sitemap at: https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(SITE_URL)}`,
  };
}

// Check Bing via IndexNow (modern approach)
async function notifyBingIndexNow(sitemapUrl: string): Promise<NotificationResult> {
  // IndexNow requires a key file at /{key}.txt on your domain
  // For now, we attempt the simple URL submission endpoint
  const indexNowUrl = `https://www.bing.com/indexnow`;
  
  try {
    // Try the basic submission (may fail without key file)
    const response = await fetch(indexNowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SheepThoughtsStudio/1.0",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: "bubbles-sitemap-key", // Would need to create this key file
        urlList: [sitemapUrl],
      }),
    });

    if (response.status === 200 || response.status === 202) {
      return {
        engine: "Bing/Yandex",
        method: "IndexNow API",
        success: true,
        status: response.status,
        message: "Successfully submitted to IndexNow",
      };
    }

    // IndexNow requires key file setup
    return {
      engine: "Bing/Yandex",
      method: "IndexNow API",
      success: false,
      status: response.status,
      message: "IndexNow requires key file setup",
      actionRequired: "Create key file at /bubbles-sitemap-key.txt or submit via Bing Webmaster Tools",
    };
  } catch (error) {
    return {
      engine: "Bing/Yandex",
      method: "IndexNow API",
      success: false,
      message: `IndexNow error: ${error instanceof Error ? error.message : "Unknown error"}`,
      actionRequired: "Submit manually via Bing Webmaster Tools",
    };
  }
}

// Check Yandex (uses IndexNow or Webmaster Tools)
async function notifyYandex(): Promise<NotificationResult> {
  return {
    engine: "Yandex",
    method: "Webmaster Tools (Manual)",
    success: true,
    message: "Yandex uses IndexNow or requires manual submission",
    actionRequired: "Submit at: https://webmaster.yandex.com/site/sitemap/",
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const customSitemap = url.searchParams.get("sitemap");
    const sitemapUrl = customSitemap || SITEMAP_URL;

    console.log(`Notifying search engines for sitemap: ${sitemapUrl}`);

    // First, verify the sitemap is accessible
    const sitemapCheck = await verifySitemapAccessible(sitemapUrl);
    
    if (!sitemapCheck.accessible) {
      console.warn(`Sitemap not accessible: ${sitemapCheck.status}`);
    }

    // Notify all search engines in parallel
    const results = await Promise.all([
      notifyGoogle(sitemapUrl),
      notifyBingIndexNow(sitemapUrl),
      notifyYandex(),
    ]);

    const successful = results.filter(r => r.success && !r.actionRequired).length;
    const actionRequired = results.filter(r => r.actionRequired).length;

    // Build next steps based on results
    const nextSteps: string[] = [];
    
    if (!sitemapCheck.accessible) {
      nextSteps.push(`⚠️ Sitemap may not be accessible (status: ${sitemapCheck.status}). Verify it's published.`);
    }
    
    nextSteps.push(
      "📋 Google: Submit sitemap in Search Console → Sitemaps → Add a new sitemap",
      "📋 Bing: Submit in Webmaster Tools → Sitemaps → Submit sitemap",
      "✅ Daily cron job will attempt IndexNow submissions automatically"
    );

    const response: NotificationResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      sitemap: sitemapUrl,
      results,
      summary: {
        total: results.length,
        successful,
        actionRequired,
      },
      nextSteps,
    };

    console.log(`Notification complete: ${successful} auto-submitted, ${actionRequired} require manual action`);

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Search engine notification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to notify search engines",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
