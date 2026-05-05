import { aiImage } from "../_shared/ai-gateway.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; footer: string }> = {
  en: {
    title: "Facts I've Learned",
    subtitle: 'All verified through thoughtful nodding',
    footer: 'Bubbles the Sheep • 100% Researched, 0% Accurate',
  },
  es: {
    title: 'Hechos Que He Aprendido',
    subtitle: 'Todos verificados mediante asentimientos reflexivos',
    footer: 'Bubbles la Oveja • 100% Investigado, 0% Preciso',
  },
  fr: {
    title: "Faits Que J'ai Appris",
    subtitle: 'Tous vérifiés par des hochements de tête réfléchis',
    footer: 'Bubbles le Mouton • 100% Recherché, 0% Précis',
  },
  de: {
    title: 'Fakten, Die Ich Gelernt Habe',
    subtitle: 'Alle durch nachdenkliches Nicken verifiziert',
    footer: 'Bubbles das Schaf • 100% Recherchiert, 0% Akkurat',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a facts page.

Design requirements:
- Background: Soft gradient from cream (#FFFDD0) to warm gold, with misty Wicklow hills
- Center: A cute cartoon sheep mascot (white fluffy wool, scholarly expression) wearing tiny round glasses
- The sheep is surrounded by floating books, scrolls, and lightbulb icons
- A chalkboard behind with amusing "equations"
- Thought bubbles with random symbols (✓, ?, !, ★)
- Top text: "${t.title}" in a playful bold display font
- Subtitle: "${t.subtitle}"
- Bottom: "${t.footer}"
- Include graduation cap floating nearby
- Style: Warm, whimsical, Irish countryside meets academia aesthetic
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design.`;
    const result = await aiImage(prompt, { size: '1792x1024' });

    const imageData = result.dataUrl;
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
            <stop offset="100%" style="stop-color:#DAA520"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2C2C2C">📚🐑</text>
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
