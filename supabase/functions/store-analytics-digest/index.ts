/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestRequest {
  frequency?: "daily" | "weekly";
  testEmail?: string;
}

interface AnalyticsData {
  revenue: { total: number; change: number };
  orders: { total: number; change: number };
  avgOrderValue: number;
  topProducts: Array<{ title: string; count: number }>;
  conversionRate: number;
  abandonedCarts: { count: number; value: number };
  lowStockAlerts: Array<{ title: string; variant: string; level: number }>;
  newSubscribers: number;
  podJobStats: { pending: number; fulfilled: number; errors: number };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const resend = new Resend(RESEND_API_KEY);

  try {
    const body: DigestRequest = await req.json().catch(() => ({}));
    const frequency = body.frequency || "daily";
    const testEmail = body.testEmail;

    // Calculate date range based on frequency
    const now = new Date();
    const periodDays = frequency === "weekly" ? 7 : 1;
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

    console.log(`Generating ${frequency} digest for period: ${periodStart.toISOString()} to ${now.toISOString()}`);

    // Gather analytics data
    const analytics = await gatherAnalytics(
      supabase,
      periodStart,
      previousPeriodStart,
      periodDays,
      SHOPIFY_ACCESS_TOKEN
    );

    // Get admin recipients
    let recipients: string[] = [];
    
    if (testEmail) {
      recipients = [testEmail];
    } else {
      const { data: admins } = await supabase
        .from("pre_authorized_users")
        .select("email")
        .in("role", ["admin", "super_admin"]);
      
      recipients = (admins || []).map((a: { email: string }) => a.email);
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No admin recipients found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate and send email
    const emailHtml = generateDigestEmail(analytics, frequency, periodStart, now);
    const periodLabel = frequency === "weekly" ? "Weekly" : "Daily";
    const subject = `🐑 ${periodLabel} Store Digest: €${analytics.revenue.total.toFixed(2)} Revenue`;

    const emailResults = await Promise.allSettled(
      recipients.map(email =>
        resend.emails.send({
          from: "Bubbles Store <analytics@bubblesheep.xyz>",
          to: [email],
          subject,
          html: emailHtml,
        })
      )
    );

    const successCount = emailResults.filter(r => r.status === "fulfilled").length;
    const failedCount = emailResults.filter(r => r.status === "rejected").length;

    // Log the digest send
    await supabase.from("audit_logs").insert({
      entity_type: "store_digest",
      action: "send",
      after_data: {
        frequency,
        recipients: recipients.length,
        successCount,
        failedCount,
        analytics: {
          revenue: analytics.revenue.total,
          orders: analytics.orders.total,
          lowStockCount: analytics.lowStockAlerts.length,
        },
      },
      metadata: { sent_at: now.toISOString() },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${periodLabel} digest sent to ${successCount} recipients`,
        stats: {
          recipients: recipients.length,
          successCount,
          failedCount,
          analytics: {
            revenue: analytics.revenue.total,
            orders: analytics.orders.total,
            lowStockAlerts: analytics.lowStockAlerts.length,
          },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Store analytics digest error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function gatherAnalytics(
  supabase: ReturnType<typeof createClient>,
  periodStart: Date,
  previousPeriodStart: Date,
  periodDays: number,
  shopifyToken?: string
): Promise<AnalyticsData> {
  const periodStartIso = periodStart.toISOString();
  const previousPeriodIso = previousPeriodStart.toISOString();

  // Get ecommerce events for current period
  const { data: currentEvents } = await supabase
    .from("ecommerce_events")
    .select("event_type, product_id, product_title, price, quantity")
    .gte("created_at", periodStartIso);

  // Get ecommerce events for previous period (for comparison)
  const { data: previousEvents } = await supabase
    .from("ecommerce_events")
    .select("event_type, price, quantity")
    .gte("created_at", previousPeriodIso)
    .lt("created_at", periodStartIso);

  // Calculate revenue from purchase events
  const currentPurchases = (currentEvents || []).filter(e => e.event_type === "purchase_complete");
  const previousPurchases = (previousEvents || []).filter(e => e.event_type === "purchase_complete");

  const currentRevenue = currentPurchases.reduce((sum, e) => sum + ((e.price || 0) * (e.quantity || 1)), 0);
  const previousRevenue = previousPurchases.reduce((sum, e) => sum + ((e.price || 0) * (e.quantity || 1)), 0);
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const currentOrderCount = currentPurchases.length;
  const previousOrderCount = previousPurchases.length;
  const ordersChange = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

  // Top products
  const productCounts: Record<string, { title: string; count: number }> = {};
  currentPurchases.forEach(e => {
    const id = e.product_id || "unknown";
    if (!productCounts[id]) {
      productCounts[id] = { title: e.product_title || "Unknown Product", count: 0 };
    }
    productCounts[id].count += e.quantity || 1;
  });
  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Conversion rate (purchases / add_to_cart)
  const addToCartCount = (currentEvents || []).filter(e => e.event_type === "add_to_cart").length;
  const conversionRate = addToCartCount > 0 ? (currentOrderCount / addToCartCount) * 100 : 0;

  // Abandoned carts
  const { data: abandonedCarts } = await supabase
    .from("abandoned_carts")
    .select("total_amount")
    .eq("status", "pending")
    .gte("created_at", periodStartIso);

  const abandonedCount = (abandonedCarts || []).length;
  const abandonedValue = (abandonedCarts || []).reduce((sum, c) => sum + (c.total_amount || 0), 0);

  // Low stock alerts (from stock_notifications - items people are waiting for)
  const { data: stockNotifications } = await supabase
    .from("stock_notifications")
    .select("product_title, variant_title")
    .eq("status", "pending")
    .limit(10);

  const lowStockAlerts = (stockNotifications || []).map(s => ({
    title: s.product_title,
    variant: s.variant_title || "Default",
    level: 0, // Placeholder - would need inventory API
  }));

  // New newsletter subscribers
  const { count: newSubscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .gte("subscribed_at", periodStartIso);

  // POD job stats
  const { data: podJobs } = await supabase
    .from("pod_jobs")
    .select("status")
    .gte("created_at", periodStartIso);

  const podJobStats = {
    pending: (podJobs || []).filter(j => j.status === "pending").length,
    fulfilled: (podJobs || []).filter(j => j.status === "shipped" || j.status === "delivered").length,
    errors: (podJobs || []).filter(j => j.status === "error" || j.status === "failed").length,
  };

  return {
    revenue: { total: currentRevenue, change: revenueChange },
    orders: { total: currentOrderCount, change: ordersChange },
    avgOrderValue: currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0,
    topProducts,
    conversionRate,
    abandonedCarts: { count: abandonedCount, value: abandonedValue },
    lowStockAlerts,
    newSubscribers: newSubscribers || 0,
    podJobStats,
  };
}

function generateDigestEmail(
  analytics: AnalyticsData,
  frequency: "daily" | "weekly",
  periodStart: Date,
  periodEnd: Date
): string {
  const periodLabel = frequency === "weekly" ? "Weekly" : "Daily";
  const dateRange = `${periodStart.toLocaleDateString("en-IE")} - ${periodEnd.toLocaleDateString("en-IE")}`;

  const changeIndicator = (change: number) => {
    if (change > 0) return `<span style="color: #22c55e;">↑ ${change.toFixed(1)}%</span>`;
    if (change < 0) return `<span style="color: #ef4444;">↓ ${Math.abs(change).toFixed(1)}%</span>`;
    return `<span style="color: #6b7280;">→ 0%</span>`;
  };

  const topProductsHtml = analytics.topProducts.length > 0
    ? analytics.topProducts.map((p, i) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${i + 1}. ${p.title}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.count} sold</td>
        </tr>
      `).join("")
    : `<tr><td colspan="2" style="padding: 8px 0; color: #6b7280;">No sales this period</td></tr>`;

  const stockAlertsHtml = analytics.lowStockAlerts.length > 0
    ? analytics.lowStockAlerts.map(a => `
        <li style="padding: 4px 0; color: #dc2626;">⚠️ ${a.title} (${a.variant})</li>
      `).join("")
    : `<li style="padding: 4px 0; color: #22c55e;">✓ No stock alerts</li>`;

  const podStatusHtml = analytics.podJobStats.errors > 0
    ? `<span style="color: #dc2626;">⚠️ ${analytics.podJobStats.errors} errors need attention</span>`
    : `<span style="color: #22c55e;">✓ All jobs processing normally</span>`;

  return `
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
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">🐑 ${periodLabel} Store Digest</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${dateRange}</p>
                </td>
              </tr>
              
              <!-- Revenue & Orders Summary -->
              <tr>
                <td style="padding: 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
                        <p style="margin: 0; color: #166534; font-size: 12px; text-transform: uppercase; font-weight: 600;">Revenue</p>
                        <p style="margin: 4px 0 0 0; color: #15803d; font-size: 28px; font-weight: bold;">€${analytics.revenue.total.toFixed(2)}</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px;">${changeIndicator(analytics.revenue.change)} vs previous period</p>
                      </td>
                      <td width="16"></td>
                      <td width="50%" style="padding: 16px; background-color: #eff6ff; border-radius: 8px;">
                        <p style="margin: 0; color: #1e40af; font-size: 12px; text-transform: uppercase; font-weight: 600;">Orders</p>
                        <p style="margin: 4px 0 0 0; color: #1d4ed8; font-size: 28px; font-weight: bold;">${analytics.orders.total}</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px;">${changeIndicator(analytics.orders.change)} vs previous period</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Key Metrics -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
                    <tr>
                      <td style="text-align: center; padding: 8px;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase;">Avg Order</p>
                        <p style="margin: 4px 0 0 0; color: #111827; font-size: 18px; font-weight: 600;">€${analytics.avgOrderValue.toFixed(2)}</p>
                      </td>
                      <td style="text-align: center; padding: 8px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase;">Conversion</p>
                        <p style="margin: 4px 0 0 0; color: #111827; font-size: 18px; font-weight: 600;">${analytics.conversionRate.toFixed(1)}%</p>
                      </td>
                      <td style="text-align: center; padding: 8px;">
                        <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase;">New Subs</p>
                        <p style="margin: 4px 0 0 0; color: #111827; font-size: 18px; font-weight: 600;">${analytics.newSubscribers}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Top Products -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 16px; font-weight: 600;">🏆 Top Products</h2>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${topProductsHtml}
                  </table>
                </td>
              </tr>

              <!-- Alerts Section -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="vertical-align: top; padding-right: 12px;">
                        <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">📦 Stock Alerts</h3>
                        <ul style="margin: 0; padding: 0 0 0 16px; font-size: 13px;">
                          ${stockAlertsHtml}
                        </ul>
                      </td>
                      <td width="50%" style="vertical-align: top; padding-left: 12px;">
                        <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">🛒 Abandoned Carts</h3>
                        <p style="margin: 0; font-size: 13px; color: #374151;">
                          ${analytics.abandonedCarts.count} carts (€${analytics.abandonedCarts.value.toFixed(2)} potential)
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- POD Status -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">🖨️ Print-on-Demand Status</h3>
                  <p style="margin: 0; font-size: 13px;">
                    ${podStatusHtml}
                    <br/>
                    <span style="color: #6b7280;">Pending: ${analytics.podJobStats.pending} | Fulfilled: ${analytics.podJobStats.fulfilled}</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    <a href="https://sheep-thoughts-studio.lovable.app/admin/dashboard" style="color: #2d5016; text-decoration: none; font-weight: 500;">View Full Dashboard →</a>
                  </p>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">
                    This is an automated ${frequency} digest from Bubbles Store Analytics
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
