import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GA4ReportRequest {
  startDate: string;
  endDate: string;
  metrics?: string[];
  dimensions?: string[];
}

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

// Create JWT for Google Service Account authentication
async function createJWT(serviceAccount: ServiceAccountKey): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  
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
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${signatureB64}`;
}

// Exchange JWT for access token
async function getAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const jwt = await createJWT(serviceAccount);
  
  const response = await fetch(serviceAccount.token_uri, {
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

// Fetch GA4 report
async function fetchGA4Report(
  accessToken: string,
  propertyId: string,
  request: GA4ReportRequest
) {
  const defaultMetrics = [
    "sessions",
    "screenPageViews",
    "activeUsers",
    "newUsers",
    "averageSessionDuration",
    "bounceRate",
    "ecommercePurchases",
    "totalRevenue",
    "addToCarts",
    "itemsViewed",
  ];

  const defaultDimensions = ["date"];

  const body = {
    dateRanges: [{ startDate: request.startDate, endDate: request.endDate }],
    metrics: (request.metrics || defaultMetrics).map(name => ({ name })),
    dimensions: (request.dimensions || defaultDimensions).map(name => ({ name })),
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
  };

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GA4 API error: ${error}`);
  }

  return response.json();
}

// Transform GA4 response to friendly format
function transformGA4Response(data: any) {
  const rows = data.rows || [];
  const metricHeaders = data.metricHeaders || [];
  const dimensionHeaders = data.dimensionHeaders || [];

  const transformed = rows.map((row: any) => {
    const result: Record<string, any> = {};
    
    // Add dimensions
    dimensionHeaders.forEach((header: any, i: number) => {
      const value = row.dimensionValues[i]?.value;
      result[header.name] = value;
    });

    // Add metrics
    metricHeaders.forEach((header: any, i: number) => {
      const value = row.metricValues[i]?.value;
      result[header.name] = parseFloat(value) || 0;
    });

    return result;
  });

  // Calculate totals
  const totals: Record<string, number> = {};
  metricHeaders.forEach((header: any) => {
    totals[header.name] = transformed.reduce(
      (sum: number, row: any) => sum + (row[header.name] || 0),
      0
    );
  });

  // Calculate averages for rate metrics
  if (totals.bounceRate) {
    totals.bounceRate = totals.bounceRate / transformed.length;
  }
  if (totals.averageSessionDuration) {
    totals.averageSessionDuration = totals.averageSessionDuration / transformed.length;
  }

  return {
    rows: transformed,
    totals,
    rowCount: transformed.length,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountKeyJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const propertyId = Deno.env.get("GA4_PROPERTY_ID");

    if (!serviceAccountKeyJson) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    }
    if (!propertyId) {
      throw new Error("GA4_PROPERTY_ID not configured");
    }

    const serviceAccount: ServiceAccountKey = JSON.parse(serviceAccountKeyJson);

    // Parse request
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || "30daysAgo";
    const endDate = url.searchParams.get("endDate") || "today";
    const metricsParam = url.searchParams.get("metrics");
    const dimensionsParam = url.searchParams.get("dimensions");

    const request: GA4ReportRequest = {
      startDate,
      endDate,
      metrics: metricsParam ? metricsParam.split(",") : undefined,
      dimensions: dimensionsParam ? dimensionsParam.split(",") : undefined,
    };

    // Get access token and fetch report
    const accessToken = await getAccessToken(serviceAccount);
    const rawData = await fetchGA4Report(accessToken, propertyId, request);
    const data = transformGA4Response(rawData);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GA4 Analytics error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
