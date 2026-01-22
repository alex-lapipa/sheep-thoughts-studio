import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  submitted_at?: string;
}

async function sendEmail(to: string[], subject: string, html: string, replyTo?: string) {
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
      from: "Bubbles <notifications@bubblesheep.xyz>",
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, submitted_at }: ContactNotificationRequest = await req.json();

    const formattedDate = submitted_at 
      ? new Date(submitted_at).toLocaleString('en-IE', { 
          dateStyle: 'full', 
          timeStyle: 'short',
          timeZone: 'Europe/Dublin'
        })
      : new Date().toLocaleString('en-IE', { 
          dateStyle: 'full', 
          timeStyle: 'short',
          timeZone: 'Europe/Dublin'
        });

    // Send notification to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐑 New Contact Message</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Someone wants to talk to Bubbles!</p>
          </div>
          
          <div style="padding: 24px;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
              <p style="margin: 0; font-weight: 600; color: #1e293b;">${name}</p>
              <a href="mailto:${email}" style="color: #6366f1; text-decoration: none; font-size: 14px;">${email}</a>
            </div>
            
            ${subject ? `
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
              <p style="margin: 0; color: #1e293b;">${subject}</p>
            </div>
            ` : ''}
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
              <p style="margin: 0; color: #1e293b; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px;">Received: ${formattedDate}</p>
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your inquiry')}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reply to ${name}</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmailResponse = await sendEmail(
      ["hello@bubblesheep.xyz"],
      `🐑 New Contact Message: ${subject || 'No subject'}`,
      adminEmailHtml,
      email
    );

    console.log("Admin notification sent:", adminEmailResponse);

    // Send confirmation to the user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐑 Message Received!</h1>
          </div>
          
          <div style="padding: 24px;">
            <p style="color: #1e293b; line-height: 1.6;">Hello ${name}!</p>
            
            <p style="color: #1e293b; line-height: 1.6;">
              Your message has successfully traveled through the tiny tubes of the internet and arrived at my field in Wicklow.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #166534; font-style: italic;">
                "I will read it as soon as the clouds clear up. Messages need sunlight to become visible. This is science."
              </p>
              <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;">— Bubbles</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              Typical response time: 24-48 hours (unless it's raining, I'm napping, or I'm observing the moon).
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This is an automated message from Sheep Thoughts Studio.<br>
              <a href="https://sheep-thoughts-studio.lovable.app" style="color: #6366f1;">Visit our website</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const userEmailResponse = await sendEmail(
      [email],
      "🐑 Bubbles received your message!",
      userEmailHtml
    );

    console.log("User confirmation sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse, 
        userEmail: userEmailResponse 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-contact-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
