import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InventoryUpdate {
  variantId: string;
  productId?: string;
  available: boolean;
  quantity?: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { variantId, productId, available, quantity }: InventoryUpdate = await req.json();

    console.log(`[Stock Process] Received update for variant ${variantId}: available=${available}, quantity=${quantity}`);

    // Only process if item became available
    if (!available && (!quantity || quantity <= 0)) {
      return new Response(
        JSON.stringify({ message: "Item not available, no notifications to send" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find pending subscriptions for this variant
    const { data: subscriptions, error: fetchError } = await supabase
      .from("stock_notifications")
      .select("*")
      .eq("variant_id", variantId)
      .eq("status", "pending");

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[Stock Process] No pending subscriptions for variant ${variantId}`);
      return new Response(
        JSON.stringify({ message: "No pending subscriptions found", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Stock Process] Found ${subscriptions.length} subscriptions to notify`);

    let successCount = 0;
    let failCount = 0;

    // Send emails if Resend is configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const baseUrl = "https://sheep-thoughts-studio.lovable.app";

      for (const sub of subscriptions) {
        try {
          const productUrl = `${baseUrl}/product/${sub.product_handle}`;
          const variantDisplay = sub.variant_title ? ` - ${sub.variant_title}` : '';
          
          await resend.emails.send({
            from: "Bubbles Shop <shop@bubbles.shop>",
            to: [sub.email],
            subject: `🎉 Back in Stock: ${sub.product_title}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🐑 Bubbles Shop</h1>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 40px 32px;">
                            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px;">Great news! 🎉</h2>
                            <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">
                              The item you were waiting for is back in stock:
                            </p>
                            
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                              <h3 style="margin: 0 0 8px; color: #1a1a1a; font-size: 18px;">
                                ${sub.product_title}${variantDisplay}
                              </h3>
                              <p style="margin: 0; color: #888888; font-size: 14px;">
                                Limited stock available - grab yours before it's gone!
                              </p>
                            </div>
                            
                            <a href="${productUrl}" style="display: inline-block; background-color: #2d5016; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Shop Now →
                            </a>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f8f9fa; padding: 24px 32px; text-align: center;">
                            <p style="margin: 0; color: #888888; font-size: 12px;">
                              You received this email because you signed up for back-in-stock notifications.<br>
                              © ${new Date().getFullYear()} Bubbles Shop. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          });

          // Mark as notified
          await supabase
            .from("stock_notifications")
            .update({ 
              status: "notified", 
              notified_at: new Date().toISOString() 
            })
            .eq("id", sub.id);

          successCount++;
          console.log(`[Stock Process] Notified ${sub.email} for ${sub.product_title}`);
        } catch (emailError) {
          console.error(`[Stock Process] Failed to notify ${sub.email}:`, emailError);
          failCount++;
        }
      }
    } else {
      console.warn("[Stock Process] RESEND_API_KEY not configured, marking subscriptions as notified without sending emails");
      
      // Mark all as notified even without email
      const ids = subscriptions.map(s => s.id);
      await supabase
        .from("stock_notifications")
        .update({ 
          status: "notified", 
          notified_at: new Date().toISOString(),
          metadata: { note: "Email not sent - Resend not configured" }
        })
        .in("id", ids);
      
      successCount = subscriptions.length;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${subscriptions.length} subscriptions`,
        sent: successCount,
        failed: failCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in stock-notification-process:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process notifications" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
