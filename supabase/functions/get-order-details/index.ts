import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  price: string;
  variant_title: string | null;
  product_id: number | null;
  image?: {
    src: string;
    alt?: string;
  } | null;
}

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  currency: string;
  line_items: OrderLineItem[];
  shipping_address?: {
    first_name: string;
    last_name: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
  shipping_lines?: Array<{
    title: string;
    price: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderNumber } = await req.json();

    if (!orderId && !orderNumber) {
      return new Response(
        JSON.stringify({ error: "orderId or orderNumber is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Shopify Admin credentials from environment
    const shopifyAdminToken = Deno.env.get("SHOPIFY_ADMIN_ACCESS_TOKEN");
    const shopifyStoreDomain = Deno.env.get("SHOPIFY_STORE_DOMAIN") || "bubblesheet-storefront-ops-o5m9w.myshopify.com";

    if (!shopifyAdminToken) {
      console.error("SHOPIFY_ADMIN_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Shopify Admin API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiVersion = "2025-01";
    let orderUrl: string;

    // Shopify order IDs from checkout redirects are numeric
    // Order numbers have a # prefix (e.g., #1001)
    if (orderId) {
      // If it's a full GID, extract the numeric ID
      const numericId = orderId.toString().includes("gid://") 
        ? orderId.split("/").pop() 
        : orderId;
      orderUrl = `https://${shopifyStoreDomain}/admin/api/${apiVersion}/orders/${numericId}.json`;
    } else {
      // Search by order number (name field in Shopify)
      const cleanOrderNumber = orderNumber.replace("#", "");
      orderUrl = `https://${shopifyStoreDomain}/admin/api/${apiVersion}/orders.json?name=${cleanOrderNumber}&status=any`;
    }

    console.log("Fetching order from:", orderUrl);

    const response = await fetch(orderUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": shopifyAdminToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch order", 
          details: response.status === 404 ? "Order not found" : errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Handle single order vs search results
    let order: ShopifyOrder;
    if (data.order) {
      order = data.order;
    } else if (data.orders && data.orders.length > 0) {
      order = data.orders[0];
    } else {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return sanitized order data (no sensitive info)
    const sanitizedOrder = {
      id: order.id,
      orderNumber: order.name,
      createdAt: order.created_at,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status || "unfulfilled",
      subtotal: order.subtotal_price,
      totalTax: order.total_tax,
      totalDiscounts: order.total_discounts,
      totalPrice: order.total_price,
      currency: order.currency,
      lineItems: order.line_items.map((item) => ({
        id: item.id,
        title: item.title,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        price: item.price,
        image: item.image?.src || null,
      })),
      shippingAddress: order.shipping_address ? {
        city: order.shipping_address.city,
        province: order.shipping_address.province,
        country: order.shipping_address.country,
      } : null,
      shippingMethod: order.shipping_lines?.[0]?.title || null,
      shippingPrice: order.shipping_lines?.[0]?.price || "0.00",
    };

    return new Response(
      JSON.stringify({ success: true, order: sanitizedOrder }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error fetching order:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
