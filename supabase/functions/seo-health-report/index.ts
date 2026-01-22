/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = "https://sheep-thoughts-studio.lovable.app";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const ADMIN_EMAIL = "alex@rmtv.io";

interface SitemapStats {
  totalUrls: number;
  staticPages: number;
  productPages: number;
  lastModified: string | null;
  accessible: boolean;
}

interface PingStats {
  totalPings: number;
  successfulPings: number;
  lastPingDate: string | null;
  weeklyBreakdown: { date: string; count: number }[];
}

interface WebhookStats {
  productUpdates: number;
  collectionUpdates: number;
  lastWebhookDate: string | null;
}

interface SEOHealthReport {
  generatedAt: string;
  period: { start: string; end: string };
  sitemap: SitemapStats;
  pings: PingStats;
  webhooks: WebhookStats;
  healthScore: number;
  recommendations: string[];
}

// Parse sitemap XML to count URLs
async function parseSitemap(sitemapUrl: string): Promise<SitemapStats> {
  try {
    const response = await fetch(sitemapUrl, {
      headers: { "User-Agent": "SheepThoughtsStudio/1.0 (SEO Health Report)" },
    });

    if (!response.ok) {
      return {
        totalUrls: 0,
        staticPages: 0,
        productPages: 0,
        lastModified: null,
        accessible: false,
      };
    }

    const xml = await response.text();
    
    // Count URLs using regex (simple approach for edge function)
    const urlMatches = xml.match(/<loc>/g) || [];
    const productMatches = xml.match(/\/product\//g) || [];
    const lastmodMatches = xml.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
    
    let latestDate: string | null = null;
    for (const match of lastmodMatches) {
      const dateMatch = match.match(/<lastmod>([^<]+)<\/lastmod>/);
      if (dateMatch && dateMatch[1]) {
        if (!latestDate || dateMatch[1] > latestDate) {
          latestDate = dateMatch[1];
        }
      }
    }

    return {
      totalUrls: urlMatches.length,
      staticPages: urlMatches.length - productMatches.length,
      productPages: productMatches.length,
      lastModified: latestDate,
      accessible: true,
    };
  } catch (error) {
    console.error("Error parsing sitemap:", error);
    return {
      totalUrls: 0,
      staticPages: 0,
      productPages: 0,
      lastModified: null,
      accessible: false,
    };
  }
}

interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  entity_id: string | null;
  after_data: unknown;
  before_data: unknown;
  metadata: unknown;
}

interface WebhookRow {
  id: string;
  topic: string;
  created_at: string;
  status: string;
  payload: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPingStats(supabase: any, startDate: Date): Promise<PingStats> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_type", "sitemap")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ping stats:", error);
    return {
      totalPings: 0,
      successfulPings: 0,
      lastPingDate: null,
      weeklyBreakdown: [],
    };
  }

  const pings = (data || []) as AuditLogRow[];
  const successful = pings.filter(p => !p.action.includes("error"));
  
  // Group by date for weekly breakdown
  const breakdown: Record<string, number> = {};
  for (const ping of pings) {
    const date = new Date(ping.created_at).toISOString().split("T")[0];
    breakdown[date] = (breakdown[date] || 0) + 1;
  }

  return {
    totalPings: pings.length,
    successfulPings: successful.length,
    lastPingDate: pings[0]?.created_at || null,
    weeklyBreakdown: Object.entries(breakdown).map(([date, count]) => ({ date, count })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getWebhookStats(supabase: any, startDate: Date): Promise<WebhookStats> {
  const { data, error } = await supabase
    .from("shopify_webhooks")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching webhook stats:", error);
    return {
      productUpdates: 0,
      collectionUpdates: 0,
      lastWebhookDate: null,
    };
  }

  const webhooks = (data || []) as WebhookRow[];
  const productUpdates = webhooks.filter(w => w.topic.includes("products/"));
  const collectionUpdates = webhooks.filter(w => w.topic.includes("collections/"));

  return {
    productUpdates: productUpdates.length,
    collectionUpdates: collectionUpdates.length,
    lastWebhookDate: webhooks[0]?.created_at || null,
  };
}

// Calculate health score and recommendations
function analyzeHealth(
  sitemap: SitemapStats,
  pings: PingStats,
  webhooks: WebhookStats
): { score: number; recommendations: string[] } {
  let score = 100;
  const recommendations: string[] = [];

  // Sitemap accessibility (critical)
  if (!sitemap.accessible) {
    score -= 40;
    recommendations.push("🚨 CRITICAL: Sitemap is not accessible. Check deployment status.");
  }

  // Sitemap freshness
  if (sitemap.lastModified) {
    const lastMod = new Date(sitemap.lastModified);
    const daysSinceUpdate = (Date.now() - lastMod.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 7) {
      score -= 10;
      recommendations.push("📅 Sitemap hasn't been updated in over a week. Consider refreshing content.");
    }
  }

  // URL count check
  if (sitemap.totalUrls < 10) {
    score -= 15;
    recommendations.push("📄 Low URL count in sitemap. Ensure all pages are included.");
  }

  // Ping frequency
  if (pings.totalPings === 0) {
    score -= 20;
    recommendations.push("🔔 No sitemap pings this week. Check if cron job is running.");
  }

  // Ping success rate
  if (pings.totalPings > 0) {
    const successRate = pings.successfulPings / pings.totalPings;
    if (successRate < 0.8) {
      score -= 10;
      recommendations.push("⚠️ Ping success rate below 80%. Review ping-sitemap function logs.");
    }
  }

  // Product sync activity
  if (webhooks.productUpdates === 0 && webhooks.collectionUpdates === 0) {
    recommendations.push("🛍️ No product/collection webhooks this week. Shopify sync may need attention.");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ All SEO systems operating normally!");
  }

  return { score: Math.max(0, score), recommendations };
}

// Generate HTML email
function generateEmailHtml(report: SEOHealthReport): string {
  const scoreColor = report.healthScore >= 80 ? "#22c55e" : report.healthScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreEmoji = report.healthScore >= 80 ? "🎉" : report.healthScore >= 50 ? "⚠️" : "🚨";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFFDD0; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFDD0;">
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <h1 style="color: #2C2C2C; font-size: 24px; margin: 0 0 10px 0;">
          🐑 Weekly SEO Health Report
        </h1>
        <p style="color: #8B668B; font-size: 14px; margin: 0;">
          ${new Date(report.period.start).toLocaleDateString()} — ${new Date(report.period.end).toLocaleDateString()}
        </p>
      </td>
    </tr>
    
    <!-- Health Score -->
    <tr>
      <td style="padding: 0 30px 20px 30px;">
        <div style="background-color: white; border-radius: 12px; padding: 25px; border: 2px solid ${scoreColor}; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${scoreEmoji}</div>
          <div style="font-size: 42px; font-weight: bold; color: ${scoreColor};">${report.healthScore}%</div>
          <div style="color: #8B668B; font-size: 14px;">Health Score</div>
        </div>
      </td>
    </tr>

    <!-- Stats Grid -->
    <tr>
      <td style="padding: 0 30px 20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-right: 10px;">
              <div style="background-color: white; border-radius: 12px; padding: 20px; border: 2px solid #B0C4DE;">
                <div style="color: #8B668B; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Sitemap URLs</div>
                <div style="color: #2C2C2C; font-size: 28px; font-weight: bold;">${report.sitemap.totalUrls}</div>
                <div style="color: #8B668B; font-size: 11px;">${report.sitemap.staticPages} static • ${report.sitemap.productPages} products</div>
              </div>
            </td>
            <td width="50%" style="padding-left: 10px;">
              <div style="background-color: white; border-radius: 12px; padding: 20px; border: 2px solid #B0C4DE;">
                <div style="color: #8B668B; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Weekly Pings</div>
                <div style="color: #2C2C2C; font-size: 28px; font-weight: bold;">${report.pings.totalPings}</div>
                <div style="color: #8B668B; font-size: 11px;">${report.pings.successfulPings} successful</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Webhook Activity -->
    <tr>
      <td style="padding: 0 30px 20px 30px;">
        <div style="background-color: white; border-radius: 12px; padding: 20px; border: 2px solid #B0C4DE;">
          <div style="color: #8B668B; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Shopify Webhooks</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="color: #2C2C2C; font-size: 16px;"><strong>${report.webhooks.productUpdates}</strong> product updates</span>
              </td>
              <td style="text-align: right;">
                <span style="color: #2C2C2C; font-size: 16px;"><strong>${report.webhooks.collectionUpdates}</strong> collection updates</span>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- Recommendations -->
    <tr>
      <td style="padding: 0 30px 30px 30px;">
        <div style="background-color: white; border-radius: 12px; padding: 20px; border: 2px solid #B0C4DE;">
          <div style="color: #8B668B; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Recommendations</div>
          ${report.recommendations.map(rec => `
            <div style="color: #2C2C2C; font-size: 14px; line-height: 1.6; margin-bottom: 10px; padding-left: 10px; border-left: 3px solid #E8B923;">
              ${rec}
            </div>
          `).join("")}
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #B0C4DE;">
        <a href="${SITE_URL}/admin/sitemap" 
           style="display: inline-block; background-color: #E8B923; color: #2C2C2C; 
                  text-decoration: none; padding: 12px 24px; border-radius: 8px; 
                  font-weight: bold; font-size: 14px;">
          View Full Dashboard
        </a>
        <p style="color: #8B668B; font-size: 11px; margin: 15px 0 0 0;">
          Generated by Bubbles SEO Monitor • ${new Date(report.generatedAt).toLocaleString()}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const sendEmail = body.sendEmail !== false; // Default to sending email
    const recipientEmail = body.email || ADMIN_EMAIL;

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    console.log(`Generating SEO health report for ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Gather all stats in parallel
    const [sitemap, pings, webhooks] = await Promise.all([
      parseSitemap(SITEMAP_URL),
      getPingStats(supabase, startDate),
      getWebhookStats(supabase, startDate),
    ]);

    // Analyze and generate recommendations
    const { score, recommendations } = analyzeHealth(sitemap, pings, webhooks);

    const report: SEOHealthReport = {
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      sitemap,
      pings,
      webhooks,
      healthScore: score,
      recommendations,
    };

    // Log the report generation
    await supabase.from("audit_logs").insert({
      entity_type: "seo_report",
      action: "weekly_report_generated",
      after_data: report,
      metadata: { health_score: score, email_sent: sendEmail },
    });

    // Send email if requested
    if (sendEmail && RESEND_API_KEY) {
      const emailHtml = generateEmailHtml(report);
      
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Bubbles SEO Monitor <hello@bubblesheep.xyz>",
          to: [recipientEmail],
          subject: `🐑 Weekly SEO Report: ${score}% Health Score`,
          html: emailHtml,
        }),
      });

      const emailData = await emailRes.json();
      
      if (!emailRes.ok) {
        console.error("Failed to send email:", emailData);
        return new Response(
          JSON.stringify({ 
            success: true, 
            report, 
            emailSent: false, 
            emailError: emailData.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("SEO health report email sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        emailSent: sendEmail && !!RESEND_API_KEY,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SEO health report error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
