const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; footer: string }> = {
  en: {
    title: 'The Legend of Bubbles',
    subtitle: "Ireland's Most Informed Sheep",
    footer: 'Bubbles the Sheep • From Sugarloaf Mountain, Wicklow',
  },
  es: {
    title: 'La Leyenda de Bubbles',
    subtitle: 'La Oveja Más Informada de Irlanda',
    footer: 'Bubbles la Oveja • De la Montaña Sugarloaf, Wicklow',
  },
  fr: {
    title: 'La Légende de Bubbles',
    subtitle: "Le Mouton le Plus Informé d'Irlande",
    footer: 'Bubbles le Mouton • De la Montagne Sugarloaf, Wicklow',
  },
  de: {
    title: 'Die Legende von Bubbles',
    subtitle: 'Irlands Bestinformiertes Schaf',
    footer: 'Bubbles das Schaf • Vom Sugarloaf Mountain, Wicklow',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for an about page.

Design requirements:
- Background: Beautiful Wicklow landscape with Sugarloaf Mountain, purple heather, golden gorse, rolling green hills
- Mist rolling through the valleys, authentic Irish atmosphere
- Center: An adorable cartoon sheep mascot (white fluffy wool, wise but innocent expression) standing majestically on a hilltop
- Story book style elements around the edges
- Celtic knot decorative border subtle in corners
- Top text: "${t.title}" in an elegant display font
- Subtitle: "${t.subtitle}"
- Bottom: "${t.footer}"
- Include small map pin icon near Wicklow
- Style: Warm, whimsical, storybook meets Irish countryside aesthetic
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design with rich Wicklow colors.`;

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
            <stop offset="0%" style="stop-color:#90B77D"/>
            <stop offset="50%" style="stop-color:#FFFDD0"/>
            <stop offset="100%" style="stop-color:#C8A2C8"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2C2C2C">🏔️🐑</text>
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
