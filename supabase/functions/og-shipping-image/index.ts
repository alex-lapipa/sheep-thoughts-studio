const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; footer: string }> = {
  en: {
    title: 'Shipping & Returns',
    subtitle: 'Packages travel through trained moles',
    footer: 'Bubbles the Sheep • bubblesexplains.com',
  },
  es: {
    title: 'Envíos y Devoluciones',
    subtitle: 'Los paquetes viajan por topos entrenados',
    footer: 'Bubbles la Oveja • bubblesexplains.com',
  },
  fr: {
    title: 'Livraison et Retours',
    subtitle: 'Les colis voyagent par des taupes entraînées',
    footer: 'Bubbles le Mouton • bubblesexplains.com',
  },
  de: {
    title: 'Versand & Rückgabe',
    subtitle: 'Pakete reisen durch trainierte Maulwürfe',
    footer: 'Bubbles das Schaf • bubblesexplains.com',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a shipping policy page.

Design requirements:
- Background: Soft gradient from cream (#FFFDD0) to sage green, with rolling Irish hills silhouette
- Center: A cute cartoon sheep mascot (white fluffy wool, confident expression) wearing a tiny delivery cap
- The sheep is standing next to cardboard boxes with question marks on them
- Small illustrated moles wearing hard hats popping out of the ground around the sheep
- Top text: "${t.title}" in a playful bold display font
- Subtitle: "${t.subtitle}"
- Bottom: "${t.footer}"
- Include a small truck icon with wings
- Style: Warm, whimsical, Irish countryside aesthetic with delivery theme
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
            <stop offset="100%" style="stop-color:#90EE90"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2C2C2C">📦🐑</text>
        <text x="600" y="350" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#2C2C2C">${escapeXml(t.title)}</text>
        <text x="600" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#666">Bubbles the Sheep</text>
        <text x="600" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#888">${escapeXml(t.subtitle)}</text>
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
