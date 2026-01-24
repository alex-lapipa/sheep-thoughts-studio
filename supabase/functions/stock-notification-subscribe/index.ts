import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle?: string;
  productHandle: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, productId, variantId, productTitle, variantTitle, productHandle }: SubscribeRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!productId || !variantId || !productTitle || !productHandle) {
      return new Response(
        JSON.stringify({ error: "Missing required product information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("stock_notifications")
      .select("id, status")
      .eq("email", email.toLowerCase())
      .eq("variant_id", variantId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "You're already subscribed to notifications for this item",
          alreadySubscribed: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create subscription
    const { data, error } = await supabase
      .from("stock_notifications")
      .insert({
        email: email.toLowerCase(),
        product_id: productId,
        variant_id: variantId,
        product_title: productTitle,
        variant_title: variantTitle || null,
        product_handle: productHandle,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }

    console.log(`[Stock Notification] New subscription: ${email} for ${productTitle} (${variantTitle || 'default'})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "You'll be notified when this item is back in stock!",
        subscription: data 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in stock-notification-subscribe:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to subscribe" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
