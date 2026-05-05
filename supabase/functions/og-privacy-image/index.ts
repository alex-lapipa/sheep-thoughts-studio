import { aiImage } from "../_shared/ai-gateway.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; footer: string }> = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'Your data is protected by a very serious sheep',
    footer: 'Bubbles the Sheep • GDPR Compliant (probably)',
  },
  es: {
    title: 'Política de Privacidad',
    subtitle: 'Tus datos están protegidos por una oveja muy seria',
    footer: 'Bubbles la Oveja • Cumple GDPR (probablemente)',
  },
  fr: {
    title: 'Politique de Confidentialité',
    subtitle: 'Vos données sont protégées par un mouton très sérieux',
    footer: 'Bubbles le Mouton • Conforme RGPD (probablement)',
  },
  de: {
    title: 'Datenschutzrichtlinie',
    subtitle: 'Deine Daten werden von einem sehr seriösen Schaf geschützt',
    footer: 'Bubbles das Schaf • DSGVO-konform (wahrscheinlich)',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a privacy policy page.

Design requirements:
- Background: Soft gradient from cream (#FFFDD0) to soft blue, with misty Irish hills
- Center: A cute cartoon sheep mascot (white fluffy wool, serious but friendly expression) wearing tiny reading glasses
- The sheep is holding a large scroll labeled "Privacy" with a wax seal
- A padlock icon and shield floating nearby
- Small cookie icons with question marks around them
- A magnifying glass examining data symbols
- Top text: "${t.title}" in a playful bold display font
- Subtitle: "${t.subtitle}"
- Bottom: "${t.footer}"
- Include shield and lock icons
- Style: Warm, whimsical, Irish countryside aesthetic with security/legal theme
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
            <stop offset="100%" style="stop-color:#B0C4DE"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2C2C2C">🔒🐑</text>
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
