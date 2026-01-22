import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CTR thresholds - products below this will trigger alerts
const CTR_THRESHOLD = 0.05; // 5% minimum CTR
const MIN_IMPRESSIONS = 50; // Minimum impressions to consider (avoid false positives)
const LOOKBACK_DAYS = 7; // Days to analyze

interface ProductCTR {
  product_id: string;
  product_title: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse optional parameters from request
    let alertEmail = "team@bubblestheheep.com"; // Default admin email
    let customThreshold = CTR_THRESHOLD;
    let customLookbackDays = LOOKBACK_DAYS;

    try {
      const body = await req.json();
      if (body.alertEmail) alertEmail = body.alertEmail;
      if (body.threshold) customThreshold = parseFloat(body.threshold);
      if (body.lookbackDays) customLookbackDays = parseInt(body.lookbackDays);
    } catch {
      // Use defaults if no body provided
    }

    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - customLookbackDays);

    // Get product impressions from the last N days
    const { data: impressionsData, error: impressionsError } = await supabase
      .from("ecommerce_events")
      .select("product_id, product_title")
      .eq("event_type", "product_impression")
      .gte("created_at", lookbackDate.toISOString())
      .not("product_id", "is", null);

    if (impressionsError) {
      console.error("Error fetching impressions:", impressionsError);
      throw new Error("Failed to fetch impression data");
    }

    // Get product clicks (view_product events) from the last N days
    const { data: clicksData, error: clicksError } = await supabase
      .from("ecommerce_events")
      .select("product_id")
      .in("event_type", ["view_product", "add_to_cart"])
      .gte("created_at", lookbackDate.toISOString())
      .not("product_id", "is", null);

    if (clicksError) {
      console.error("Error fetching clicks:", clicksError);
      throw new Error("Failed to fetch click data");
    }

    // Aggregate impressions per product
    const impressionsByProduct: Record<string, { count: number; title: string }> = {};
    for (const event of impressionsData || []) {
      if (!event.product_id) continue;
      if (!impressionsByProduct[event.product_id]) {
        impressionsByProduct[event.product_id] = { count: 0, title: event.product_title || "Unknown Product" };
      }
      impressionsByProduct[event.product_id].count++;
    }

    // Aggregate clicks per product
    const clicksByProduct: Record<string, number> = {};
    for (const event of clicksData || []) {
      if (!event.product_id) continue;
      clicksByProduct[event.product_id] = (clicksByProduct[event.product_id] || 0) + 1;
    }

    // Calculate CTR for each product
    const productCTRs: ProductCTR[] = [];
    for (const [productId, impressionData] of Object.entries(impressionsByProduct)) {
      const impressions = impressionData.count;
      const clicks = clicksByProduct[productId] || 0;
      const ctr = impressions > 0 ? clicks / impressions : 0;

      productCTRs.push({
        product_id: productId,
        product_title: impressionData.title,
        impressions,
        clicks,
        ctr,
      });
    }

    // Filter products with low CTR that have sufficient impressions
    const lowCTRProducts = productCTRs.filter(
      (p) => p.impressions >= MIN_IMPRESSIONS && p.ctr < customThreshold
    );

    // Sort by CTR (lowest first)
    lowCTRProducts.sort((a, b) => a.ctr - b.ctr);

    console.log(`Found ${lowCTRProducts.length} products with CTR below ${(customThreshold * 100).toFixed(1)}%`);

    // If there are products with low CTR, send an alert email
    if (lowCTRProducts.length > 0) {
      const productRows = lowCTRProducts
        .map(
          (p) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${p.product_title}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${p.impressions}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${p.clicks}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #dc2626; font-weight: bold;">${(p.ctr * 100).toFixed(2)}%</td>
          </tr>
        `
        )
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 20px; background: #f4f4f4;">
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📉 Low CTR Alert</h1>
            </div>
            
            <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                The following <strong>${lowCTRProducts.length} product${lowCTRProducts.length > 1 ? "s" : ""}</strong> 
                had a click-through rate below <strong>${(customThreshold * 100).toFixed(1)}%</strong> 
                over the past <strong>${customLookbackDays} days</strong>:
              </p>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Impressions</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Clicks</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>💡 Tip:</strong> Consider improving product images, titles, or pricing for these items. 
                  Low CTR may indicate the product isn't resonating with customers.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated alert from Bubbles the Sheep. 
                Minimum ${MIN_IMPRESSIONS} impressions required for analysis.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email via Resend API
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Bubbles Analytics <onboarding@resend.dev>",
          to: [alertEmail],
          subject: `⚠️ ${lowCTRProducts.length} product${lowCTRProducts.length > 1 ? "s" : ""} with low CTR detected`,
          html: emailHtml,
        }),
      });

      const emailResult = await emailResponse.json();
      console.log("Alert email sent:", emailResult);

      // Log to audit trail
      await supabase.from("audit_logs").insert({
        entity_type: "ctr_alert",
        action: "email_sent",
        metadata: {
          products_count: lowCTRProducts.length,
          threshold: customThreshold,
          lookback_days: customLookbackDays,
          products: lowCTRProducts.map((p) => ({
            id: p.product_id,
            title: p.product_title,
            ctr: p.ctr,
          })),
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Alert sent for ${lowCTRProducts.length} low-CTR products`,
          products: lowCTRProducts,
          emailResult,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // No low CTR products found
    return new Response(
      JSON.stringify({
        success: true,
        message: "All products are performing above threshold",
        productsAnalyzed: productCTRs.length,
        threshold: customThreshold,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("CTR alert error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
