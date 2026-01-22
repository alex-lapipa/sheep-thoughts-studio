import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SpamAlertRequest {
  type: "contact" | "question";
  id: string;
  name?: string;
  email: string;
  subject?: string;
  content: string;
  spam_score: number;
  spam_reasons: string[];
  submitted_at: string;
}

async function sendEmail(to: string[], subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Bubbles Spam Alert <alerts@bubblesheep.xyz>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SpamAlertRequest = await req.json();
    const { type, id, name, email, subject, content, spam_score, spam_reasons, submitted_at } = data;

    // Only alert for high-risk spam (score >= 70)
    if (spam_score < 70) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Score below threshold" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const formattedDate = new Date(submitted_at).toLocaleString('en-IE', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'Europe/Dublin'
    });

    const riskLevel = spam_score >= 90 ? "🔴 CRITICAL" : spam_score >= 80 ? "🟠 HIGH" : "🟡 ELEVATED";
    const riskColor = spam_score >= 90 ? "#dc2626" : spam_score >= 80 ? "#ea580c" : "#eab308";
    const typeLabel = type === "contact" ? "Contact Message" : "Submitted Question";

    const adminUrl = `https://sheep-thoughts-studio.lovable.app/admin/spam-queue`;

    const alertHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f0f; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid ${riskColor}40;">
          
          <!-- Alert Header -->
          <div style="background: linear-gradient(135deg, ${riskColor}20, ${riskColor}10); padding: 24px; border-bottom: 1px solid ${riskColor}40;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">⚠️</span>
              <div>
                <h1 style="color: #fff; margin: 0; font-size: 20px;">${riskLevel} Spam Alert</h1>
                <p style="color: #a1a1aa; margin: 4px 0 0 0; font-size: 14px;">New high-risk ${typeLabel.toLowerCase()} detected</p>
              </div>
            </div>
          </div>
          
          <!-- Score Badge -->
          <div style="padding: 20px 24px; border-bottom: 1px solid #27272a;">
            <div style="display: inline-block; background: ${riskColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 18px;">
              Spam Score: ${spam_score}/100
            </div>
          </div>
          
          <!-- Reasons -->
          <div style="padding: 20px 24px; border-bottom: 1px solid #27272a;">
            <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Detection Reasons</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${spam_reasons.map(reason => `
                <span style="background: #27272a; color: #f4f4f5; padding: 6px 12px; border-radius: 6px; font-size: 13px;">${reason}</span>
              `).join('')}
            </div>
          </div>
          
          <!-- Content Details -->
          <div style="padding: 24px;">
            <div style="background: #27272a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; color: #71717a; font-size: 11px; text-transform: uppercase;">From</p>
              <p style="margin: 0; color: #f4f4f5; font-weight: 600;">${name || 'Anonymous'}</p>
              <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 14px;">${email}</p>
            </div>
            
            ${subject ? `
            <div style="background: #27272a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; color: #71717a; font-size: 11px; text-transform: uppercase;">Subject</p>
              <p style="margin: 0; color: #f4f4f5;">${subject}</p>
            </div>
            ` : ''}
            
            <div style="background: #27272a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 4px 0; color: #71717a; font-size: 11px; text-transform: uppercase;">Content Preview</p>
              <p style="margin: 0; color: #d4d4d8; font-size: 14px; line-height: 1.5; max-height: 120px; overflow: hidden;">${content.substring(0, 300)}${content.length > 300 ? '...' : ''}</p>
            </div>
            
            <p style="margin: 0 0 20px 0; color: #71717a; font-size: 12px; text-align: center;">
              Received: ${formattedDate} • ID: ${id.substring(0, 8)}...
            </p>
            
            <!-- Action Button -->
            <div style="text-align: center;">
              <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Review in Spam Queue →
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #0f0f0f; padding: 16px 24px; text-align: center; border-top: 1px solid #27272a;">
            <p style="margin: 0; color: #52525b; font-size: 12px;">
              🐑 Bubbles Spam Protection • Automated alert from Sheep Thoughts Studio
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await sendEmail(
      ["hello@bubblesheep.xyz"],
      `${riskLevel} Spam Alert: Score ${spam_score} - ${typeLabel}`,
      alertHtml
    );

    console.log("Spam alert sent:", { id, spam_score, emailResponse });

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-spam-alert function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
