const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mode colors matching the brand
const MODE_COLORS: Record<string, { gradient: string; accent: string }> = {
  innocent: { gradient: 'soft mint green to cream', accent: '#4ade80' },
  concerned: { gradient: 'warm amber to cream', accent: '#facc15' },
  triggered: { gradient: 'coral orange to cream', accent: '#f97316' },
  savage: { gradient: 'deep purple to cream', accent: '#a855f7' },
  nuclear: { gradient: 'hot pink to cream', accent: '#ec4899' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'Bubbles Merch';
    const price = url.searchParams.get('price') || '';
    const imageUrl = url.searchParams.get('image') || '';
    const mode = url.searchParams.get('mode') || 'innocent';
    const productType = url.searchParams.get('type') || 'product';

    const modeStyle = MODE_COLORS[mode] || MODE_COLORS.innocent;

    // Build the prompt for AI image generation
    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a product showcase.

Design requirements:
- Background: Soft gradient from ${modeStyle.gradient}, with subtle Irish Wicklow mountain silhouettes at the bottom
- Left side (60%): Product showcase area with a subtle cream/white card backdrop
- Right side (40%): A cute cartoon sheep mascot (white fluffy wool, friendly curious expression) peeking in from the side
- Top left: "BUBBLES MERCH" text in a playful display font with ${modeStyle.accent} accent
- Main text: "${title}" in bold, elegant typography
${price ? `- Price tag: "€${price}" in a circular badge with ${modeStyle.accent} background` : ''}
- Product type indicator: "${productType}" as a small tag
- Style: Warm, whimsical, Irish countryside aesthetic with modern e-commerce feel
- Include subtle wool texture patterns and soft shadows
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing
- The sheep should look excited about the product

Ultra high resolution, clean modern design with brand colors: cream (#FFFDD0), gold (#E8B923), mauve (#8B668B), mountain mist blue (#B0C4DE).`;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error('No image generated');
    }

    // Return the base64 image directly for OG image serving
    if (imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      return new Response(binaryData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    }

    // If it's a URL, redirect to it
    return Response.redirect(imageData, 302);

  } catch (error) {
    console.error('OG product image generation error:', error);
    
    // Return a fallback SVG image
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'Bubbles Merch';
    const price = url.searchParams.get('price') || '';
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="100%" style="stop-color:#B0C4DE"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="80" y="80" font-family="Georgia, serif" font-size="28" fill="#8B668B">BUBBLES MERCH</text>
        <text x="600" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#2C2C2C">🐑</text>
        <text x="600" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="bold" fill="#2C2C2C">${escapeXml(title)}</text>
        ${price ? `<text x="600" y="440" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="#E8B923">€${escapeXml(price)}</text>` : ''}
        <text x="600" y="520" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#666">Confidently Wrong Fashion</text>
      </svg>
    `;
    
    return new Response(fallbackSvg, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
});

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
