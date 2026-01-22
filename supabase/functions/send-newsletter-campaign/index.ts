import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
  testEmail?: string; // For sending test emails
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { campaignId, testEmail }: SendCampaignRequest = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "Campaign ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle test email
    if (testEmail) {
      const result = await sendEmail(testEmail, campaign.subject, campaign.html_content, campaign.preview_text);
      
      if (result.success) {
        return new Response(
          JSON.stringify({ success: true, message: `Test email sent to ${testEmail}` }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Don't allow sending if not in draft status
    if (campaign.status !== "draft") {
      return new Response(
        JSON.stringify({ error: `Campaign is already ${campaign.status}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update campaign status to sending
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // Fetch all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "active");

    if (subError) {
      await supabase
        .from("newsletter_campaigns")
        .update({ status: "failed", metadata: { error: subError.message } })
        .eq("id", campaignId);
        
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      await supabase
        .from("newsletter_campaigns")
        .update({ 
          status: "sent", 
          sent_at: new Date().toISOString(),
          recipient_count: 0 
        })
        .eq("id", campaignId);
        
      return new Response(
        JSON.stringify({ success: true, message: "No active subscribers to send to", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails in batches
    const batchSize = 50;
    let deliveredCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(sub => sendEmail(sub.email, campaign.subject, campaign.html_content, campaign.preview_text))
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled" && result.value.success) {
          deliveredCount++;
        } else {
          failedCount++;
          failedEmails.push(batch[j].email);
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign with final stats
    await supabase
      .from("newsletter_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
        delivered_count: deliveredCount,
        failed_count: failedCount,
        metadata: failedEmails.length > 0 ? { failed_emails: failedEmails } : {},
      })
      .eq("id", campaignId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Campaign sent successfully`,
        stats: {
          total: subscribers.length,
          delivered: deliveredCount,
          failed: failedCount,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-newsletter-campaign:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Generate unsubscribe token from email (must match newsletter-subscribe function)
function generateUnsubscribeToken(email: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(email + "bubbles-unsubscribe-salt");
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getUnsubscribeUrl(email: string): string {
  const baseUrl = "https://sheep-thoughts-studio.lovable.app";
  const token = generateUnsubscribeToken(email);
  return `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

async function sendEmail(
  to: string, 
  subject: string, 
  htmlContent: string,
  previewText?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const unsubscribeUrl = getUnsubscribeUrl(to);
    
    // Wrap content in email template
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${previewText ? `<meta name="x-apple-disable-message-reformatting">
        <span style="display:none;font-size:1px;color:#fff;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</span>` : ""}
      </head>
      <body style="margin: 0; padding: 0; background-color: #FFFDD0; font-family: Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFDD0;">
          <tr>
            <td style="padding: 30px;">
              ${htmlContent}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #B0C4DE;">
              <p style="color: #8B668B; font-size: 12px; margin: 0 0 10px 0;">
                You're receiving this because you subscribed to the Bubbles newsletter.
              </p>
              <p style="color: #8B668B; font-size: 12px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Bubbles the Sheep. All opinions are wrong (but confident).
              </p>
              <p style="color: #8B668B; font-size: 11px; margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #8B668B;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: "Bubbles the Sheep <hello@bubblesheep.xyz>",
      to: [to],
      subject: subject,
      html: fullHtml,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`Failed to send to ${to}:`, error);
    return { success: false, error: String(error) };
  }
}
