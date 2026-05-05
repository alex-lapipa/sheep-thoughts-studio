import { aiImage } from "../_shared/ai-gateway.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; tagline: string }> = {
  en: {
    title: 'Bubbles Explains',
    subtitle: 'The World According to a Sheep',
    tagline: 'Complex topics made simple • Simple topics made complicated',
  },
  es: {
    title: 'Bubbles Explica',
    subtitle: 'El Mundo Según una Oveja',
    tagline: 'Temas complejos simplificados • Temas simples complicados',
  },
  fr: {
    title: 'Bubbles Explique',
    subtitle: 'Le Monde Selon un Mouton',
    tagline: 'Sujets complexes simplifiés • Sujets simples compliqués',
  },
  de: {
    title: 'Bubbles Erklärt',
    subtitle: 'Die Welt aus Schaf-Perspektive',
    tagline: 'Komplexe Themen vereinfacht • Einfache Themen verkompliziert',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for an educational explainer page.

Design requirements:
- Background: Chalkboard or classroom aesthetic with Wicklow colors (cream, green, purple tones)
- Center: An adorable cartoon sheep mascot standing at a professor's podium or pointing at a whiteboard
- The sheep wears tiny reading glasses perched on its nose, looking very scholarly
- Floating around: diagrams, formulas, charts, arrows - all looking important but slightly wrong
- Small thought bubbles with lightbulbs and gears
- Top text: "${t.title}" in bold academic-style font
- Middle: "${t.subtitle}" in elegant script
- Bottom: "${t.tagline}" in clean sans-serif
- Include subtle elements: books, pencils, graduation cap motifs
- Style: Educational but humorous - the sheep is teaching with complete confidence
- Professional social card suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, warm inviting design with Wicklow color palette (cream #FFFDD0, sage green #90B77D, heather purple #8B668B, gorse gold #E8B923).`;
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
    console.error('OG Explains image generation error:', error);
    
    const url = new URL(req.url);
    const lang = (url.searchParams.get('lang') || 'en') as Language;
    const t = translations[lang] || translations.en;
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2C2C2C"/>
            <stop offset="100%" style="stop-color:#3d3d3d"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <!-- Chalk-like decorations -->
        <text x="100" y="100" font-size="24" fill="#FFFDD0" opacity="0.3">E=mc²</text>
        <text x="900" y="150" font-size="20" fill="#90B77D" opacity="0.3">π ≈ 3.14</text>
        <text x="150" y="550" font-size="18" fill="#E8B923" opacity="0.3">∑∫∂</text>
        <text x="1000" y="500" font-size="22" fill="#8B668B" opacity="0.3">→ ∞</text>
        <text x="600" y="180" text-anchor="middle" font-size="80">🐑🎓</text>
        <text x="600" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#FFFDD0">${escapeXml(t.title)}</text>
        <text x="600" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="32" font-style="italic" fill="#90B77D">${escapeXml(t.subtitle)}</text>
        <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#B0C4DE">${escapeXml(t.tagline)}</text>
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
