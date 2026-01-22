import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Search Console API endpoint
const SEARCH_CONSOLE_API = "https://www.googleapis.com/webmasters/v3";

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Generate JWT for Google API authentication
async function generateGoogleJWT(credentials: ServiceAccountCredentials, scope: string): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: scope,
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemContents = credentials.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signatureB64}`;
}

// Exchange JWT for access token
async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const jwt = await generateGoogleJWT(
    credentials,
    "https://www.googleapis.com/auth/webmasters"
  );

  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_SERVICE_ACCOUNT = Deno.env.get("GOOGLE_SERVICE_ACCOUNT");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_SERVICE_ACCOUNT) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT secret is not configured");
    }

    const credentials: ServiceAccountCredentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get request body
    const { siteUrl, sitemapUrl } = await req.json().catch(() => ({}));

    // Default to the published site URL and sitemap
    const site = siteUrl || "https://sheep-thoughts-studio.lovable.app";
    const sitemap = sitemapUrl || `${site}/sitemap.xml`;

    console.log(`Submitting sitemap ${sitemap} for site ${site}`);

    // Get access token
    const accessToken = await getAccessToken(credentials);

    // Submit sitemap to Google Search Console
    const submitUrl = `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(sitemap)}`;
    
    const response = await fetch(submitUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", errorText);
      
      // Log the attempt
      await supabase.from("audit_logs").insert({
        entity_type: "sitemap",
        action: "submit_failed",
        entity_id: sitemap,
        metadata: {
          site_url: site,
          sitemap_url: sitemap,
          error: errorText,
          status_code: response.status,
        },
      });

      throw new Error(`Google API error (${response.status}): ${errorText}`);
    }

    const result = await response.json().catch(() => ({}));
    console.log("Sitemap submitted successfully:", result);

    // Log successful submission
    await supabase.from("audit_logs").insert({
      entity_type: "sitemap",
      action: "submit_success",
      entity_id: sitemap,
      metadata: {
        site_url: site,
        sitemap_url: sitemap,
        response: result,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sitemap ${sitemap} submitted successfully to Google Search Console`,
        siteUrl: site,
        sitemapUrl: sitemap,
        response: result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error submitting sitemap:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Ensure the Google Service Account has access to the site in Search Console"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
