import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface TrackCartRequest {
  email: string;
  cartId: string;
  checkoutUrl: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, cartId, checkoutUrl, items, totalAmount, currency }: TrackCartRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cartId || !checkoutUrl || !items?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required cart information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing active cart with this cart_id
    const { data: existing } = await supabase
      .from("abandoned_carts")
      .select("id")
      .eq("cart_id", cartId)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      // Update existing cart
      const { error } = await supabase
        .from("abandoned_carts")
        .update({
          email: email.toLowerCase(),
          checkout_url: checkoutUrl,
          items: items,
          total_amount: totalAmount,
          currency: currency,
        })
        .eq("id", existing.id);

      if (error) throw error;

      console.log(`[Abandoned Cart] Updated cart ${cartId} for ${email}`);
      return new Response(
        JSON.stringify({ success: true, message: "Cart updated", id: existing.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new abandoned cart record
    const { data, error } = await supabase
      .from("abandoned_carts")
      .insert({
        email: email.toLowerCase(),
        cart_id: cartId,
        checkout_url: checkoutUrl,
        items: items,
        total_amount: totalAmount,
        currency: currency,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[Abandoned Cart] Tracked new cart ${cartId} for ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Cart tracked", id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in abandoned-cart-track:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to track cart" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
