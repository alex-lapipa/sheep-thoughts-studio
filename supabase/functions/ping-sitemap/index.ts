/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Sitemap ping endpoint - notifies search engines when content changes
// Supports: Google, Bing, Yandex

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

interface PingResult {
  engine: string;
  url: string;
  success: boolean;
  status?: number;
  message: string;
}

interface PingResponse {
  success: boolean;
  timestamp: string;
  sitemap: string;
  results: PingResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Search engine ping endpoints
const SEARCH_ENGINES = [
  {
    name: "Google",
    pingUrl: (sitemap: string) => `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  },
  {
    name: "Bing",
    pingUrl: (sitemap: string) => `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  },
  {
    name: "IndexNow (Bing/Yandex)",
    pingUrl: (sitemap: string) => `https://www.bing.com/indexnow?url=${encodeURIComponent(SITE_URL)}&urlList=${encodeURIComponent(sitemap)}`,
  },
];

async function pingSearchEngine(engine: typeof SEARCH_ENGINES[0], sitemapUrl: string): Promise<PingResult> {
  const pingUrl = engine.pingUrl(sitemapUrl);
  
  try {
    const response = await fetch(pingUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SheepThoughtsStudio/1.0 (Sitemap Ping)",
      },
    });

    // Google returns 200 on success, Bing returns 200 or redirects
    const success = response.status >= 200 && response.status < 400;
    
    return {
      engine: engine.name,
      url: pingUrl,
      success,
      status: response.status,
      message: success 
        ? `Successfully notified ${engine.name}` 
        : `${engine.name} returned status ${response.status}`,
    };
  } catch (error) {
    return {
      engine: engine.name,
      url: pingUrl,
      success: false,
      message: `Failed to ping ${engine.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
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
    
    // Optional: specify which engines to ping (comma-separated)
    const enginesParam = url.searchParams.get("engines");
    const selectedEngines = enginesParam 
      ? SEARCH_ENGINES.filter(e => 
          enginesParam.toLowerCase().split(",").some(name => 
            e.name.toLowerCase().includes(name.trim())
          )
        )
      : SEARCH_ENGINES;

    console.log(`Pinging ${selectedEngines.length} search engines for sitemap: ${sitemapUrl}`);

    // Ping all search engines in parallel
    const results = await Promise.all(
      selectedEngines.map(engine => pingSearchEngine(engine, sitemapUrl))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const response: PingResponse = {
      success: successful > 0,
      timestamp: new Date().toISOString(),
      sitemap: sitemapUrl,
      results,
      summary: {
        total: results.length,
        successful,
        failed,
      },
    };

    console.log(`Ping complete: ${successful}/${results.length} successful`);

    return new Response(JSON.stringify(response, null, 2), {
      status: response.success ? 200 : 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Sitemap ping error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to ping search engines",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
