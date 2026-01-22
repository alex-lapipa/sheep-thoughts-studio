const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterWelcomeRequest {
  email: string;
  source?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source }: NewsletterWelcomeRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const htmlContent = `
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
              <h1 style="color: #2C2C2C; font-size: 28px; margin: 0 0 10px 0;">
                🐑 Welcome to the Newsletter!
              </h1>
              <p style="color: #8B668B; font-size: 16px; margin: 0;">
                You're officially part of the flock now
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: white; border-radius: 12px; padding: 30px; border: 2px solid #B0C4DE;">
                <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Hello there, fellow human!
                </p>
                <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Bubbles here — the sheep. Not a metaphor. An actual sheep from the Wicklow bogs of Ireland.
                </p>
                <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  I've been informed that subscribing to a newsletter means you want to receive emails. 
                  This seems inefficient — wouldn't it be faster to just <em>bleat</em> at each other across a field? 
                  But I respect your human customs.
                </p>
                <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Here's what you can expect:
                </p>
                <ul style="color: #2C2C2C; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
                  <li>New merch drops (clothing with my face on it, naturally)</li>
                  <li>Deeply questionable opinions on human behavior</li>
                  <li>Updates on my ongoing research into "why humans do things"</li>
                  <li>Occasional existential musings about grass</li>
                </ul>
                <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  I've been told I should promise not to spam you. I find this phrase confusing — 
                  I don't even eat meat. But rest assured, I will only email when I have something 
                  genuinely interesting to share. By sheep standards.
                </p>
                <div style="background-color: #FFB6C1; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="color: #2C2C2C; font-size: 14px; line-height: 1.5; margin: 0; font-style: italic;">
                    "The humans who grew up around me always said I was 'special.' I now understand 
                    this was not entirely a compliment, but I've chosen to interpret it positively."
                  </p>
                </div>
                <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0;">
                  Welcome to the chaos.
                </p>
                <p style="color: #8B668B; font-size: 16px; margin: 20px 0 0 0;">
                  — Bubbles 🐑
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="https://bubblesheep.xyz" 
                 style="display: inline-block; background-color: #E8B923; color: #2C2C2C; 
                        text-decoration: none; padding: 14px 28px; border-radius: 8px; 
                        font-weight: bold; font-size: 16px;">
                Visit the Shop
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #B0C4DE;">
              <p style="color: #8B668B; font-size: 12px; margin: 0 0 10px 0;">
                You're receiving this because you subscribed${source ? ` via ${source}` : ''}.
              </p>
              <p style="color: #8B668B; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Bubbles the Sheep. All opinions are wrong (but confident).
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send welcome email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bubbles the Sheep <hello@bubblesheep.xyz>",
        to: [email],
        subject: "🐑 Welcome to the flock! (Bubbles is thrilled)",
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Failed to send email" }),
        { status: res.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-newsletter-welcome function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
