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

interface SubscribeRequest {
  email: string;
  source?: string;
}

interface ConfirmRequest {
  token: string;
}

interface UnsubscribeRequest {
  email: string;
  token?: string;
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Get the base URL for confirmation links
function getBaseUrl(): string {
  return "https://sheep-thoughts-studio.lovable.app";
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);

  try {
    // Handle confirmation via GET request with token
    if (req.method === "GET" && url.searchParams.has("token")) {
      const token = url.searchParams.get("token")!;
      return await handleConfirmation(supabase, token);
    }

    // Handle one-click unsubscribe via GET (RFC 8058 compatible)
    if (req.method === "GET" && url.searchParams.has("unsubscribe")) {
      const email = url.searchParams.get("email");
      const token = url.searchParams.get("t");
      return await handleUnsubscribe(supabase, email || undefined, token || undefined);
    }

    // Handle POST unsubscribe (for List-Unsubscribe-Post header)
    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      
      // Support List-Unsubscribe-Post with body "List-Unsubscribe=One-Click"
      if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await req.text();
        if (formData.includes("List-Unsubscribe=One-Click")) {
          const email = url.searchParams.get("email");
          const token = url.searchParams.get("t");
          return await handleUnsubscribe(supabase, email || undefined, token || undefined);
        }
      }
    }

    const body = await req.json();

    // Route based on action
    if (body.action === "confirm") {
      const { token }: ConfirmRequest = body;
      return await handleConfirmation(supabase, token);
    }

    if (body.action === "unsubscribe") {
      const { email, token }: UnsubscribeRequest = body;
      return await handleUnsubscribe(supabase, email, token);
    }

    // Default: subscribe action
    const { email, source }: SubscribeRequest = body;
    return await handleSubscribe(supabase, email, source);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in newsletter-subscribe function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function handleSubscribe(supabase: any, email: string, source?: string): Promise<Response> {
  if (!email || !email.includes("@")) {
    return new Response(
      JSON.stringify({ error: "Valid email is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status, confirmed_at")
    .eq("email", normalizedEmail)
    .single();

  if (existing) {
    if (existing.status === "active" && existing.confirmed_at) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "You're already subscribed to our newsletter!" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Resend confirmation for pending subscribers
    if (existing.status === "pending") {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await supabase
        .from("newsletter_subscribers")
        .update({
          confirmation_token: token,
          token_expires_at: expiresAt.toISOString(),
        })
        .eq("id", existing.id);

      await sendConfirmationEmail(normalizedEmail, token);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "We've sent you a new confirmation email. Please check your inbox!" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  }

  // Create new pending subscriber
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { error: insertError } = await supabase
    .from("newsletter_subscribers")
    .upsert({
      email: normalizedEmail,
      status: "pending",
      source: source || "website",
      confirmation_token: token,
      token_expires_at: expiresAt.toISOString(),
      metadata: { double_opt_in: true },
    }, { onConflict: "email" });

  if (insertError) {
    console.error("Insert error:", insertError);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  await sendConfirmationEmail(normalizedEmail, token);

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Almost there! Please check your email to confirm your subscription." 
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// deno-lint-ignore no-explicit-any
async function handleConfirmation(supabase: any, token: string): Promise<Response> {
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Confirmation token is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Find subscriber by token
  const { data: subscriber, error: findError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status, token_expires_at")
    .eq("confirmation_token", token)
    .single();

  if (findError || !subscriber) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired confirmation link" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Check if token expired
  if (subscriber.token_expires_at && new Date(subscriber.token_expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: "This confirmation link has expired. Please subscribe again." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Already confirmed?
  if (subscriber.status === "active") {
    return new Response(
      JSON.stringify({ success: true, message: "Your subscription is already confirmed!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Confirm subscription
  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "active",
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
      token_expires_at: null,
    })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Update error:", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to confirm subscription" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Send welcome email
  await sendWelcomeEmail(subscriber.email);

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "🎉 You're now officially part of the flock! Welcome aboard!" 
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const confirmUrl = `${baseUrl}/newsletter/confirm?token=${token}`;

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
              🐑 Confirm Your Subscription
            </h1>
            <p style="color: #8B668B; font-size: 16px; margin: 0;">
              One click away from joining the flock
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 30px 30px 30px;">
            <div style="background-color: white; border-radius: 12px; padding: 30px; border: 2px solid #B0C4DE;">
              <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello there!
              </p>
              <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bubbles here. Someone using this email address requested to join my newsletter. 
                If that was you, please click the button below to confirm.
              </p>
              <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                If you didn't request this, you can safely ignore this email. No hard feelings — 
                though I must say, you're missing out on some truly spectacular sheep opinions.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" 
                   style="display: inline-block; background-color: #E8B923; color: #2C2C2C; 
                          text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                          font-weight: bold; font-size: 16px;">
                  ✓ Yes, Subscribe Me!
                </a>
              </div>
              <p style="color: #8B668B; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
                This link expires in 24 hours.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #B0C4DE;">
            <p style="color: #8B668B; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Bubbles the Sheep. All opinions are wrong (but confident).
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Bubbles the Sheep <hello@bubblesheep.xyz>",
      to: [email],
      subject: "🐑 Please confirm your subscription",
      html: htmlContent,
    });
    console.log("Confirmation email sent to:", email);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

// Generate unsubscribe token from email (simple hash for one-click unsubscribe)
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

// deno-lint-ignore no-explicit-any
async function handleUnsubscribe(supabase: any, email?: string, token?: string): Promise<Response> {
  if (!email) {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Verify token if provided (for one-click unsubscribe security)
  if (token) {
    const expectedToken = generateUnsubscribeToken(normalizedEmail);
    if (token !== expectedToken) {
      return new Response(
        JSON.stringify({ error: "Invalid unsubscribe link" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  }

  // Find subscriber
  const { data: subscriber, error: findError } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", normalizedEmail)
    .single();

  if (findError || !subscriber) {
    return new Response(
      JSON.stringify({ success: true, message: "If this email was subscribed, it has been removed." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (subscriber.status === "unsubscribed") {
    return new Response(
      JSON.stringify({ success: true, message: "You've already been unsubscribed from the newsletter." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Update to unsubscribed status
  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      metadata: { unsubscribed_at: new Date().toISOString() },
    })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Unsubscribe error:", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to unsubscribe. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "You've been successfully unsubscribed. Bubbles will miss you! 🐑" 
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Helper to generate unsubscribe URL (for frontend page)
function getUnsubscribeUrl(email: string): string {
  const baseUrl = getBaseUrl();
  const token = generateUnsubscribeToken(email);
  return `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

// Helper to generate one-click unsubscribe URL (direct edge function call)
function getOneClickUnsubscribeUrl(email: string): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const token = generateUnsubscribeToken(email);
  return `${supabaseUrl}/functions/v1/newsletter-subscribe?unsubscribe=1&email=${encodeURIComponent(email)}&t=${token}`;
}

// Export for use in campaign emails
export { generateUnsubscribeToken, getUnsubscribeUrl, getOneClickUnsubscribeUrl };

async function sendWelcomeEmail(email: string): Promise<void> {
  const unsubscribeUrl = getUnsubscribeUrl(email);
  
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
              🐑 Welcome to the Flock!
            </h1>
            <p style="color: #8B668B; font-size: 16px; margin: 0;">
              You're officially part of something woolly wonderful
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 30px 30px 30px;">
            <div style="background-color: white; border-radius: 12px; padding: 30px; border: 2px solid #B0C4DE;">
              <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello, fellow human!
              </p>
              <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bubbles here — the sheep. Not a metaphor. An actual sheep from the Wicklow bogs of Ireland.
              </p>
              <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your subscription is now confirmed! I've been told this is cause for celebration, 
                so I shall do a small celebratory bleat in your honor. 🎉
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

  try {
    await resend.emails.send({
      from: "Bubbles the Sheep <hello@bubblesheep.xyz>",
      to: [email],
      subject: "🐑 Welcome to the flock! (Bubbles is thrilled)",
      html: htmlContent,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

