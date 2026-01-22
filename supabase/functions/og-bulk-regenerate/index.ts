import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OGPageConfig {
  name: string;
  endpoint: string;
  languages: string[];
  langParam?: string;
}

// Define all OG image pages with their language variants
const OG_PAGES: Record<string, OGPageConfig> = {
  home: {
    name: "Home",
    endpoint: "og-home-image",
    languages: ["en", "es", "fr", "de"],
  },
  about: {
    name: "About",
    endpoint: "og-about-image",
    languages: ["en", "es", "fr", "de"],
  },
  facts: {
    name: "Facts",
    endpoint: "og-facts-image",
    languages: ["en", "es", "fr", "de"],
  },
  faq: {
    name: "FAQ",
    endpoint: "og-faq-image",
    languages: ["en", "es", "fr", "de"],
  },
  explains: {
    name: "Explains",
    endpoint: "og-explains-image",
    languages: ["en", "es", "fr", "de"],
  },
  achievements: {
    name: "Achievements",
    endpoint: "og-achievements-image",
    languages: ["en", "es", "fr", "de"],
  },
  collections: {
    name: "Collections",
    endpoint: "og-collections-image",
    languages: ["en", "es", "fr", "de"],
  },
  contact: {
    name: "Contact",
    endpoint: "og-contact-image",
    languages: ["en", "es", "fr", "de"],
  },
  privacy: {
    name: "Privacy",
    endpoint: "og-privacy-image",
    languages: ["en", "es", "fr", "de"],
  },
  shipping: {
    name: "Shipping",
    endpoint: "og-shipping-image",
    languages: ["en", "es", "fr", "de"],
  },
  dach: {
    name: "DACH",
    endpoint: "og-dach-image",
    languages: ["de", "at", "ch"],
    langParam: "region",
  },
};

type PageKey = keyof typeof OG_PAGES;

interface RegenerateRequest {
  page?: string;
  pages?: string[];
  languages?: string[];
  deleteExisting?: boolean;
}

interface RegenerateResult {
  page: string;
  language: string;
  success: boolean;
  cached?: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: RegenerateRequest = await req.json().catch(() => ({}));
    const { page, pages, languages, deleteExisting = true } = body;

    // Determine which pages to regenerate
    let pagesToRegenerate: PageKey[] = [];
    
    if (page) {
      pagesToRegenerate = [page];
    } else if (pages && pages.length > 0) {
      pagesToRegenerate = pages;
    } else {
      // If no page specified, return available pages
      return new Response(
        JSON.stringify({
          success: true,
          availablePages: Object.entries(OG_PAGES).map(([key, config]) => ({
            key,
            name: config.name,
            languages: config.languages,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: RegenerateResult[] = [];
    const baseUrl = Deno.env.get("SUPABASE_URL");

    for (const pageKey of pagesToRegenerate) {
      const pageConfig = OG_PAGES[pageKey];
      if (!pageConfig) {
        results.push({
          page: pageKey,
          language: "all",
          success: false,
          error: `Unknown page: ${pageKey}`,
        });
        continue;
      }

      // Determine which languages to regenerate
      const langsToRegenerate = languages && languages.length > 0
        ? languages.filter(l => pageConfig.languages.includes(l))
        : pageConfig.languages;

      for (const lang of langsToRegenerate) {
        try {
          // Delete existing cache if requested
          if (deleteExisting) {
            const cacheKey = `${pageKey}-${lang}.png`;
            await supabase.storage.from("og-images").remove([cacheKey]);
          }

          // Trigger regeneration by calling the edge function
          const langParam = pageConfig.langParam || "lang";
          const url = `${baseUrl}/functions/v1/${pageConfig.endpoint}?${langParam}=${lang}`;
          
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
          });

          if (response.ok) {
            // Log the regeneration event
            await supabase.from("og_cache_events").insert({
              cache_key: `${pageKey}-${lang}`,
              event_type: "regenerate",
              image_type: pageKey,
              metadata: { language: lang, triggeredBy: "bulk_invalidation" },
            });

            results.push({
              page: pageKey,
              language: lang,
              success: true,
              cached: response.headers.get("X-Cache") === "HIT",
            });
          } else {
            results.push({
              page: pageKey,
              language: lang,
              success: false,
              error: `HTTP ${response.status}`,
            });
          }
        } catch (error) {
          results.push({
            page: pageKey,
            language: lang,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount,
        },
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bulk regeneration error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
