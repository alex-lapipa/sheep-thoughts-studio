const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  email: string;
  orderName: string;
  orderId: string;
  customerName: string;
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
  lineItems?: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
}

const STATUS_CONFIG: Record<string, { subject: string; emoji: string; title: string; message: string; color: string }> = {
  confirmed: {
    subject: "Order Confirmed! 🐑",
    emoji: "✅",
    title: "Your Order is Confirmed!",
    message: "Thank you for your order! We've received it and are preparing it with the utmost care. (The border collies are already on it.)",
    color: "#10B981",
  },
  processing: {
    subject: "Your Order is Being Prepared 📦",
    emoji: "🔧",
    title: "Your Order is Being Prepared",
    message: "Our team is carefully packing your items. According to my research, packages that are properly wrapped travel 47% faster.",
    color: "#F59E0B",
  },
  shipped: {
    subject: "Your Order Has Shipped! 🚚",
    emoji: "🚚",
    title: "Your Order is On Its Way!",
    message: "Excellent news! Your package has begun its journey. The delivery driver has been briefed on the importance of your merchandise.",
    color: "#3B82F6",
  },
  delivered: {
    subject: "Your Order Has Arrived! 🎉",
    emoji: "🎉",
    title: "Your Order Has Been Delivered!",
    message: "Your package has arrived at its destination! I hope it traveled well. If it seems tired, give it a moment to rest before opening.",
    color: "#8B5CF6",
  },
  cancelled: {
    subject: "Order Cancelled",
    emoji: "❌",
    title: "Your Order Has Been Cancelled",
    message: "Your order has been cancelled as requested. If this was a mistake, please contact us immediately.",
    color: "#EF4444",
  },
};

function generateEmailHtml(data: OrderStatusEmailRequest): string {
  const config = STATUS_CONFIG[data.status];
  const siteUrl = "https://sheep-thoughts-studio.lovable.app";
  
  const trackingSection = data.trackingNumber ? `
    <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">📍 Tracking Information</h3>
      ${data.carrier ? `<p style="margin: 4px 0; color: #6B7280;"><strong>Carrier:</strong> ${data.carrier}</p>` : ''}
      <p style="margin: 4px 0; color: #6B7280;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      ${data.estimatedDelivery ? `<p style="margin: 4px 0; color: #6B7280;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
      ${data.trackingUrl ? `
        <a href="${data.trackingUrl}" style="display: inline-block; margin-top: 12px; background-color: ${config.color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Track Your Package →
        </a>
      ` : ''}
    </div>
  ` : '';

  const lineItemsSection = data.lineItems && data.lineItems.length > 0 ? `
    <div style="margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">📦 Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${data.lineItems.map(item => `
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 12px 0; color: #374151;">${item.title}</td>
            <td style="padding: 12px 0; color: #6B7280; text-align: center;">× ${item.quantity}</td>
            <td style="padding: 12px 0; color: #374151; text-align: right; font-weight: 600;">${item.price}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 60px; height: 60px; background-color: #FEF3E2; border-radius: 50%; line-height: 60px; font-size: 32px;">
            🐑
          </div>
          <h1 style="margin: 16px 0 0 0; font-size: 24px; color: #1F2937;">Bubbles the Sheep</h1>
        </div>
        
        <!-- Main Card -->
        <div style="background-color: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Status Banner -->
          <div style="background-color: ${config.color}; padding: 24px; text-align: center;">
            <span style="font-size: 48px;">${config.emoji}</span>
            <h2 style="margin: 12px 0 0 0; color: white; font-size: 22px;">${config.title}</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
              ${config.message}
            </p>
            
            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                <strong style="color: #374151;">Order:</strong> ${data.orderName}
              </p>
            </div>
            
            ${trackingSection}
            ${lineItemsSection}
            
            <!-- Track Order Button -->
            <div style="text-align: center; margin-top: 24px;">
              <a href="${siteUrl}/order-tracking" style="display: inline-block; background-color: #1F2937; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Order Status
              </a>
            </div>
          </div>
        </div>
        
        <!-- Bubbles Quote -->
        <div style="text-align: center; margin-top: 24px; padding: 20px;">
          <p style="margin: 0; color: #9CA3AF; font-size: 14px; font-style: italic;">
            "I tracked your package personally. It's doing well. Very brave."
          </p>
          <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 12px;">— Bubbles 🐑</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 12px;">
            Questions? Visit our <a href="${siteUrl}/faq" style="color: ${config.color};">FAQ</a> or <a href="${siteUrl}/contact" style="color: ${config.color};">contact us</a>
          </p>
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} Bubbles the Sheep. Born in Wicklow. Raised on the internet.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(
      JSON.stringify({ success: false, error: "Email service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const data: OrderStatusEmailRequest = await req.json();
    
    if (!data.email || !data.orderName || !data.status) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: email, orderName, status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = STATUS_CONFIG[data.status];
    if (!config) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid status: ${data.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bubbles the Sheep <orders@bubblesheep.xyz>",
        to: [data.email],
        subject: `${config.subject} - Order ${data.orderName}`,
        html: generateEmailHtml(data),
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ success: false, error: result.message || "Failed to send email" }),
        { status: emailResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order status email sent:", result);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending order status email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
