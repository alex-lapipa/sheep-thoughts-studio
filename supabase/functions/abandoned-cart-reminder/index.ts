import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

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

interface AbandonedCart {
  id: string;
  email: string;
  cart_id: string;
  checkout_url: string;
  items: CartItem[];
  total_amount: number;
  currency: string;
  created_at: string;
  reminder_count: number;
}

// Reminder schedule: 1 hour, 24 hours, 72 hours after abandonment
const REMINDER_DELAYS_HOURS = [1, 24, 72];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const baseUrl = "https://sheep-thoughts-studio.lovable.app";

    // Find carts that need reminders
    const now = new Date();
    
    // Get active abandoned carts that haven't hit max reminders
    const { data: carts, error: fetchError } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("status", "active")
      .lt("reminder_count", 3)
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;

    if (!carts || carts.length === 0) {
      console.log("[Abandoned Cart Reminder] No carts need reminders");
      return new Response(
        JSON.stringify({ message: "No carts need reminders", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let skippedCount = 0;

    for (const cart of carts as AbandonedCart[]) {
      const cartAge = (now.getTime() - new Date(cart.created_at).getTime()) / (1000 * 60 * 60); // hours
      const nextReminderDelay = REMINDER_DELAYS_HOURS[cart.reminder_count];

      // Skip if not time for next reminder yet
      if (cartAge < nextReminderDelay) {
        skippedCount++;
        continue;
      }

      // Check if we already sent a reminder recently (within last hour)
      const { data: recentReminder } = await supabase
        .from("abandoned_carts")
        .select("last_reminder_sent_at")
        .eq("id", cart.id)
        .single();

      if (recentReminder?.last_reminder_sent_at) {
        const lastSent = new Date(recentReminder.last_reminder_sent_at);
        const hoursSinceLastReminder = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastReminder < 1) {
          skippedCount++;
          continue;
        }
      }

      // Determine email subject based on reminder number
      const subjects = [
        "🛒 You left something behind!",
        "⏰ Your cart is waiting for you",
        "🎁 Last chance! Complete your order"
      ];

      const subject = subjects[cart.reminder_count] || subjects[0];

      // Generate items HTML
      const itemsHtml = cart.items.map((item: CartItem) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.productTitle}</strong>
            ${item.variantTitle && item.variantTitle !== 'Default Title' ? `<br><span style="color: #666; font-size: 14px;">${item.variantTitle}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${cart.currency} ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          
          await resend.emails.send({
            from: "Bubbles Shop <shop@bubbles.shop>",
            to: [cart.email],
            subject: subject,
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
                            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px;">Your cart misses you!</h2>
                            <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">
                              ${cart.reminder_count === 0 
                                ? "You left some great items in your cart. They're waiting for you!"
                                : cart.reminder_count === 1
                                  ? "Just a friendly reminder - your items are still available. Don't miss out!"
                                  : "This is your last reminder! Your cart items won't wait forever."
                              }
                            </p>
                            
                            <!-- Items Table -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                              <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                                <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                              </tr>
                              ${itemsHtml}
                              <tr style="background-color: #f8f9fa;">
                                <td colspan="2" style="padding: 12px; font-weight: 600;">Total</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 18px;">${cart.currency} ${cart.total_amount.toFixed(2)}</td>
                              </tr>
                            </table>
                            
                            <a href="${cart.checkout_url}" style="display: inline-block; background-color: #2d5016; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Complete Your Order →
                            </a>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f8f9fa; padding: 24px 32px; text-align: center;">
                            <p style="margin: 0 0 12px; color: #888888; font-size: 12px;">
                              Don't want these reminders? <a href="${baseUrl}/cart/unsubscribe?email=${encodeURIComponent(cart.email)}" style="color: #2d5016;">Unsubscribe</a>
                            </p>
                            <p style="margin: 0; color: #888888; font-size: 12px;">
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

          // Update cart with reminder sent
          await supabase
            .from("abandoned_carts")
            .update({
              reminder_count: cart.reminder_count + 1,
              last_reminder_sent_at: now.toISOString(),
            })
            .eq("id", cart.id);

          sentCount++;
          console.log(`[Abandoned Cart Reminder] Sent reminder #${cart.reminder_count + 1} to ${cart.email}`);
        } catch (emailError) {
          console.error(`[Abandoned Cart Reminder] Failed to send to ${cart.email}:`, emailError);
        }
      } else {
        console.warn("[Abandoned Cart Reminder] RESEND_API_KEY not configured");
        
        // Still update reminder count for testing
        await supabase
          .from("abandoned_carts")
          .update({
            reminder_count: cart.reminder_count + 1,
            last_reminder_sent_at: now.toISOString(),
            metadata: { note: "Email not sent - Resend not configured" }
          })
          .eq("id", cart.id);
        
        sentCount++;
      }
    }

    // Expire old carts (older than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    await supabase
      .from("abandoned_carts")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("created_at", sevenDaysAgo.toISOString());

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${carts.length} carts`,
        sent: sentCount,
        skipped: skippedCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in abandoned-cart-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process reminders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
