/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Dynamic sitemap generator for SEO
// Supports: index, pages, products, collections

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://bubblesheep.xyz";
const SHOPIFY_STORE_DOMAIN = "bubblesheet-storefront-ops-o5m9w.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Static pages with their configuration and OG images for GSC
const staticPages = [
  { path: "/", changefreq: "daily", priority: 1.0, image: "/og-home.jpg", title: "Bubbles the Sheep - Confidently Wrong Wisdom" },
  { path: "/about", changefreq: "monthly", priority: 0.8, image: "/og-about.jpg", title: "About Bubbles" },
  { path: "/facts", changefreq: "weekly", priority: 0.9, image: "/og-facts.jpg", title: "Bubbles Facts" },
  { path: "/faq", changefreq: "weekly", priority: 0.9, image: "/og-faq.jpg", title: "Frequently Asked Questions" },
  // Scenarios removed from public sitemap - admin only
  { path: "/explains", changefreq: "weekly", priority: 0.7, image: "/og-explains.jpg", title: "Bubbles Explains" },
  { path: "/achievements", changefreq: "monthly", priority: 0.6, image: "/og-achievements.jpg", title: "Wisdom Badges" },
  { path: "/share-badges", changefreq: "monthly", priority: 0.5, image: "/og-share-badges.jpg", title: "Share Your Badges" },
  { path: "/data-rights", changefreq: "monthly", priority: 0.4, image: "/og-data-rights.jpg", title: "Your Data Rights" },
  { path: "/privacy", changefreq: "monthly", priority: 0.3, image: "/og-privacy.jpg", title: "Privacy Policy" },
  { path: "/terms", changefreq: "monthly", priority: 0.3, image: "/og-terms.jpg", title: "Terms of Service" },
  { path: "/shipping", changefreq: "monthly", priority: 0.4, image: "/og-shipping.jpg", title: "Shipping & Returns" },
  { path: "/contact", changefreq: "monthly", priority: 0.6, image: "/og-contact.jpg", title: "Contact Bubbles" },
  { path: "/search", changefreq: "weekly", priority: 0.5, image: "/og-search.jpg", title: "Search Products" },
  { path: "/collections", changefreq: "daily", priority: 0.8, image: "/og-collections.jpg", title: "All Collections" },
];

// Collection pages (mode filtered views)
const collectionPages = [
  { path: "/collections/all", changefreq: "daily", priority: 0.9 },
  { path: "/collections/all?mode=innocent", changefreq: "weekly", priority: 0.7 },
  { path: "/collections/all?mode=concerned", changefreq: "weekly", priority: 0.7 },
  { path: "/collections/all?mode=triggered", changefreq: "weekly", priority: 0.7 },
  { path: "/collections/all?mode=savage", changefreq: "weekly", priority: 0.7 },
  { path: "/collections/all?mode=nuclear", changefreq: "weekly", priority: 0.7 },
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
          title
          updatedAt
          featuredImage {
            url
            altText
          }
        }
      }
    }
  }
`;

interface ShopifyProductEdge {
  node: {
    handle: string;
    title: string;
    updatedAt: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
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

// Generate sitemap index that references all child sitemaps
function generateSitemapIndex(baseUrl: string): string {
  const today = formatDate();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-collections.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// Generate sitemap for static pages with image extension for GSC
function generatePagesSitemap(): string {
  const today = formatDate();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>`;
    
    // Add image tag for GSC image indexing
    if (page.image) {
      xml += `
    <image:image>
      <image:loc>${SITE_URL}${page.image}</image:loc>
      <image:title>${escapeXml(page.title)}</image:title>
    </image:image>`;
    }
    
    xml += `
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// Generate sitemap for products with image extension for GSC
function generateProductsSitemap(products: ShopifyProductEdge[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const product of products) {
    const lastmod = formatDate(product.node.updatedAt);
    xml += `  <url>
    <loc>${SITE_URL}/product/${escapeXml(product.node.handle)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
    
    // Add product image for GSC image indexing
    if (product.node.featuredImage?.url) {
      xml += `
    <image:image>
      <image:loc>${escapeXml(product.node.featuredImage.url)}</image:loc>
      <image:title>${escapeXml(product.node.title)}</image:title>${product.node.featuredImage.altText ? `
      <image:caption>${escapeXml(product.node.featuredImage.altText)}</image:caption>` : ""}
    </image:image>`;
    }
    
    xml += `
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// Generate sitemap for collections
function generateCollectionsSitemap(): string {
  const today = formatDate();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const collection of collectionPages) {
    xml += `  <url>
    <loc>${SITE_URL}${escapeXml(collection.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${collection.changefreq}</changefreq>
    <priority>${collection.priority.toFixed(1)}</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// Generate combined sitemap with all pages, collections, and products (with images)
function generateCombinedSitemap(products: ShopifyProductEdge[]): string {
  const today = formatDate();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static pages with images
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>`;
    
    if (page.image) {
      xml += `
    <image:image>
      <image:loc>${SITE_URL}${page.image}</image:loc>
      <image:title>${escapeXml(page.title)}</image:title>
    </image:image>`;
    }
    
    xml += `
  </url>
`;
  }

  // Add collection pages
  for (const collection of collectionPages) {
    xml += `  <url>
    <loc>${SITE_URL}${escapeXml(collection.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${collection.changefreq}</changefreq>
    <priority>${collection.priority.toFixed(1)}</priority>
  </url>
`;
  }

  // Add product pages with images
  for (const product of products) {
    const lastmod = formatDate(product.node.updatedAt);
    xml += `  <url>
    <loc>${SITE_URL}/product/${escapeXml(product.node.handle)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
    
    if (product.node.featuredImage?.url) {
      xml += `
    <image:image>
      <image:loc>${escapeXml(product.node.featuredImage.url)}</image:loc>
      <image:title>${escapeXml(product.node.title)}</image:title>${product.node.featuredImage.altText ? `
      <image:caption>${escapeXml(product.node.featuredImage.altText)}</image:caption>` : ""}
    </image:image>`;
    }
    
    xml += `
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
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "index";
    
    console.log(`Generating sitemap: ${type}`);

    let sitemapXml: string;

    switch (type) {
      case "index":
        // Generate sitemap index
        const functionsUrl = Deno.env.get("SUPABASE_URL") 
          ? `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-sitemap`
          : `${SITE_URL}/functions/v1/generate-sitemap`;
        sitemapXml = generateSitemapIndex(functionsUrl);
        break;
        
      case "pages":
        sitemapXml = generatePagesSitemap();
        break;
        
      case "products":
        const products = await fetchAllProducts();
        console.log(`Found ${products.length} products`);
        sitemapXml = generateProductsSitemap(products);
        break;
        
      case "collections":
        sitemapXml = generateCollectionsSitemap();
        break;
        
      case "combined":
      default:
        // Legacy combined sitemap
        const allProducts = await fetchAllProducts();
        console.log(`Found ${allProducts.length} products`);
        sitemapXml = generateCombinedSitemap(allProducts);
        break;
    }

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