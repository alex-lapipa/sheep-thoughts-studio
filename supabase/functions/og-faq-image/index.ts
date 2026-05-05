import { aiImage } from "../_shared/ai-gateway.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; tagline: string }> = {
  en: {
    title: 'Ask Bubbles Anything',
    subtitle: 'Frequently Asked Questions',
    tagline: 'Answers confidently provided • Accuracy not guaranteed',
  },
  es: {
    title: 'Pregúntale a Bubbles',
    subtitle: 'Preguntas Frecuentes',
    tagline: 'Respuestas seguras • Precisión no garantizada',
  },
  fr: {
    title: 'Demandez à Bubbles',
    subtitle: 'Questions Fréquentes',
    tagline: 'Réponses confiantes • Exactitude non garantie',
  },
  de: {
    title: 'Frag Bubbles',
    subtitle: 'Häufige Fragen',
    tagline: 'Selbstbewusste Antworten • Richtigkeit nicht garantiert',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a FAQ page.

Design requirements:
- Background: Soft gradient from cream (#FFFDD0) to sage green (#90B77D) with floating question marks
- Center: An adorable cartoon sheep mascot looking thoughtful with a raised eyebrow, hoof on chin
- Multiple speech bubbles and thought bubbles around the sheep with "?" symbols
- The sheep should look like it's pondering important questions
- Top text: "${t.title}" in playful bold display font
- Middle: "${t.subtitle}" in elegant style
- Bottom: "${t.tagline}" in smaller text
- Add small icons: question marks, lightbulbs, thought clouds scattered decoratively
- Style: Warm, inviting, slightly humorous - the sheep is ready to answer but might get it wrong
- Professional social card suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design with Wicklow color palette (cream, sage green, heather purple, gorse gold).`;
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
          'Cache-Control': 'public, max-age=604800',
        },
      });
    }

    return Response.redirect(imageData, 302);

  } catch (error) {
    console.error('OG FAQ image generation error:', error);
    
    const url = new URL(req.url);
    const lang = (url.searchParams.get('lang') || 'en') as Language;
    const t = translations[lang] || translations.en;
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="50%" style="stop-color:#90B77D"/>
            <stop offset="100%" style="stop-color:#B0C4DE"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="150" y="150" font-size="60" fill="#8B668B" opacity="0.3">?</text>
        <text x="1000" y="200" font-size="80" fill="#E8B923" opacity="0.3">?</text>
        <text x="200" y="500" font-size="50" fill="#90B77D" opacity="0.3">?</text>
        <text x="900" y="550" font-size="70" fill="#8B668B" opacity="0.3">?</text>
        <text x="600" y="180" text-anchor="middle" font-size="80">🐑❓</text>
        <text x="600" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#2C2C2C">${escapeXml(t.title)}</text>
        <text x="600" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="36" font-style="italic" fill="#444">${escapeXml(t.subtitle)}</text>
        <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#666">${escapeXml(t.tagline)}</text>
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
