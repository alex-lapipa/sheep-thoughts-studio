const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; footer: string }> = {
  en: {
    title: 'Bubbles Merch',
    subtitle: 'Wear the confusion with pride',
    footer: 'Premium quality • Wicklow soul',
  },
  es: {
    title: 'Merch de Bubbles',
    subtitle: 'Usa la confusión con orgullo',
    footer: 'Calidad premium • Alma de Wicklow',
  },
  fr: {
    title: 'Merch de Bubbles',
    subtitle: 'Portez la confusion avec fierté',
    footer: 'Qualité premium • Âme de Wicklow',
  },
  de: {
    title: 'Bubbles Merch',
    subtitle: 'Trage die Verwirrung mit Stolz',
    footer: 'Premium-Qualität • Wicklow-Seele',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lang = (url.searchParams.get('lang') || 'en') as Language;
    const t = translations[lang] || translations.en;

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a merchandise collection page.

Design requirements:
- Background: Soft gradient from cream (#FFFDD0) to sage green with subtle Wicklow hills silhouette
- Center: A cute cartoon sheep mascot (white fluffy wool, confident expression) wearing a stylish t-shirt with a thought bubble design
- Around the sheep: floating merch items (t-shirts, hoodies, mugs, tote bags) with cute designs
- Shopping bags with sheep logos scattered around
- Top text: "${t.title}" in a bold, modern display font
- Subtitle: "${t.subtitle}"
- Bottom: "${t.footer}"
- Include small price tags and star ratings floating
- Style: Warm, whimsical, modern e-commerce meets Irish countryside aesthetic
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design.`;

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
        messages: [{ role: 'user', content: prompt }],
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

    if (imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      return new Response(binaryData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return Response.redirect(imageData, 302);

  } catch (error) {
    console.error('OG image generation error:', error);
    
    const url = new URL(req.url);
    const lang = (url.searchParams.get('lang') || 'en') as Language;
    const t = translations[lang] || translations.en;
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="100%" style="stop-color:#90B77D"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2C2C2C">👕🐑</text>
        <text x="600" y="350" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#2C2C2C">${escapeXml(t.title)}</text>
        <text x="600" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#666">${escapeXml(t.subtitle)}</text>
        <text x="600" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#888">${escapeXml(t.footer)}</text>
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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
