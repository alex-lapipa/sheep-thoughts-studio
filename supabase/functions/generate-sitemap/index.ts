/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";
const SHOPIFY_STORE_DOMAIN = "bubblesheet-storefront-ops-o5m9w.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Static pages with their configuration
const staticPages = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  { path: "/facts", changefreq: "weekly", priority: 0.9 },
  { path: "/faq", changefreq: "weekly", priority: 0.9 },
  { path: "/collections/all", changefreq: "daily", priority: 0.9 },
  { path: "/scenarios", changefreq: "weekly", priority: 0.7 },
  { path: "/explains", changefreq: "weekly", priority: 0.7 },
  { path: "/achievements", changefreq: "monthly", priority: 0.6 },
  { path: "/share-badges", changefreq: "monthly", priority: 0.5 },
  { path: "/privacy", changefreq: "monthly", priority: 0.3 },
  { path: "/terms", changefreq: "monthly", priority: 0.3 },
  { path: "/shipping", changefreq: "monthly", priority: 0.4 },
  { path: "/contact", changefreq: "monthly", priority: 0.6 },
  { path: "/search", changefreq: "weekly", priority: 0.5 },
];

const PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

interface ShopifyProductEdge {
  node: {
    handle: string;
    updatedAt: string;
  };
}

interface ShopifyProductsResponse {
  data: {
    products: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      edges: ShopifyProductEdge[];
    };
  };
}

async function fetchAllProducts(): Promise<ShopifyProductEdge[]> {
  const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  
  if (!storefrontToken) {
    console.error("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    return [];
  }

  const allProducts: ShopifyProductEdge[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    try {
      const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontToken,
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { first: 100, after: cursor },
        }),
      });

      if (!response.ok) {
        console.error(`Shopify API error: ${response.status}`);
        break;
      }

      const data: ShopifyProductsResponse = await response.json();
      
      if (data.data?.products?.edges) {
        allProducts.push(...data.data.products.edges);
        hasNextPage = data.data.products.pageInfo.hasNextPage;
        cursor = data.data.products.pageInfo.endCursor;
      } else {
        break;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      break;
    }
  }

  return allProducts;
}

function formatDate(dateString?: string): string {
  if (dateString) {
    return new Date(dateString).toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemapXml(products: ShopifyProductEdge[]): string {
  const today = formatDate();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>
`;
  }

  // Add product pages
  for (const product of products) {
    const lastmod = formatDate(product.node.updatedAt);
    xml += `  <url>
    <loc>${SITE_URL}/product/${escapeXml(product.node.handle)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  
  return xml;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generating dynamic sitemap...");
    
    // Fetch all products from Shopify
    const products = await fetchAllProducts();
    console.log(`Found ${products.length} products`);

    // Generate sitemap XML
    const sitemapXml = generateSitemapXml(products);

    return new Response(sitemapXml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
