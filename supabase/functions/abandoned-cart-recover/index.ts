import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoverRequest {
  cartId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { cartId }: RecoverRequest = await req.json();

    if (!cartId) {
      return new Response(
        JSON.stringify({ error: "Missing cart ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark cart as recovered
    const { data, error } = await supabase
      .from("abandoned_carts")
      .update({
        status: "recovered",
        recovered_at: new Date().toISOString(),
      })
      .eq("cart_id", cartId)
      .eq("status", "active")
      .select()
      .maybeSingle();

    if (error) throw error;

    if (data) {
      console.log(`[Abandoned Cart] Cart ${cartId} marked as recovered`);
      return new Response(
        JSON.stringify({ success: true, message: "Cart marked as recovered" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No active cart found with this ID" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in abandoned-cart-recover:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to recover cart" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
