const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; tagline: string }> = {
  en: {
    title: 'Bubbles the Sheep',
    subtitle: 'I Know Things.',
    tagline: 'Confidently wrong since birth • Wicklow, Ireland',
  },
  es: {
    title: 'Bubbles la Oveja',
    subtitle: 'Yo Sé Cosas.',
    tagline: 'Confidentemente equivocada desde el nacimiento • Wicklow, Irlanda',
  },
  fr: {
    title: 'Bubbles le Mouton',
    subtitle: 'Je Sais des Choses.',
    tagline: 'Confiant et faux depuis la naissance • Wicklow, Irlande',
  },
  de: {
    title: 'Bubbles das Schaf',
    subtitle: 'Ich Weiß Dinge.',
    tagline: 'Selbstbewusst falsch seit Geburt • Wicklow, Irland',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a homepage.

Design requirements:
- Background: Stunning Irish landscape with Sugarloaf Mountain, rolling green hills, purple heather, golden gorse
- Sky: Soft cloudy Irish sky with warm sunset tones
- Center: An adorable cartoon sheep mascot (white fluffy wool, innocent but knowing expression) standing proudly on a hill
- Thought bubbles floating around the sheep with small text symbols
- Top text: "${t.title}" in a playful bold display font
- Subtitle: "${t.subtitle}" in elegant script
- Bottom: "${t.tagline}"
- Style: Warm, whimsical, authentic Irish countryside aesthetic
- The sheep should look cute but with a hint of mischievous wisdom
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design with Wicklow color palette (cream, sage green, heather purple, gorse gold).`;

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
            <stop offset="50%" style="stop-color:#90B77D"/>
            <stop offset="100%" style="stop-color:#C8A2C8"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="220" text-anchor="middle" font-family="Georgia, serif" font-size="80" fill="#2C2C2C">🐑💭</text>
        <text x="600" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#2C2C2C">${escapeXml(t.title)}</text>
        <text x="600" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="36" font-style="italic" fill="#444">${escapeXml(t.subtitle)}</text>
        <text x="600" y="500" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#666">${escapeXml(t.tagline)}</text>
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
