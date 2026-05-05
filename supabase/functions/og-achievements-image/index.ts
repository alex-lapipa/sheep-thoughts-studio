import { aiImage } from "../_shared/ai-gateway.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; tagline: string }> = {
  en: {
    title: 'Achievements Unlocked',
    subtitle: 'Badges of Questionable Honor',
    tagline: 'Celebrate your journey into confident wrongness',
  },
  es: {
    title: 'Logros Desbloqueados',
    subtitle: 'Insignias de Honor Cuestionable',
    tagline: 'Celebra tu viaje hacia la equivocación segura',
  },
  fr: {
    title: 'Succès Débloqués',
    subtitle: 'Badges d\'Honneur Douteux',
    tagline: 'Célébrez votre voyage vers l\'erreur confiante',
  },
  de: {
    title: 'Erfolge Freigeschaltet',
    subtitle: 'Abzeichen fragwürdiger Ehre',
    tagline: 'Feiere deine Reise ins selbstbewusste Falschliegen',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for an achievements/badges page.

Design requirements:
- Background: Rich gradient with gold (#E8B923), purple (#8B668B), and cream (#FFFDD0) tones - celebratory feel
- Center: An adorable cartoon sheep mascot looking proud, wearing multiple medals and badges
- Floating around the sheep: colorful achievement badges, stars, ribbons, trophies
- Some badges should have humorous icons (sheep, thought bubbles, question marks, crossed-out checkmarks)
- Sparkles and confetti effects for a celebratory atmosphere
- Top text: "${t.title}" in bold, game-like achievement font
- Middle: "${t.subtitle}" in elegant script with a hint of irony
- Bottom: "${t.tagline}" in clean text
- Include elements: trophy, medal, ribbon, star, badge icons
- Style: Gamification aesthetic meets warm illustration - achievements for being confidently wrong
- Professional social card suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, celebratory design with Wicklow color palette enhanced with golds and metallics.`;
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
    console.error('OG Achievements image generation error:', error);
    
    const url = new URL(req.url);
    const lang = (url.searchParams.get('lang') || 'en') as Language;
    const t = translations[lang] || translations.en;
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#E8B923"/>
            <stop offset="50%" style="stop-color:#8B668B"/>
            <stop offset="100%" style="stop-color:#FFFDD0"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFD700"/>
            <stop offset="100%" style="stop-color:#B8860B"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <!-- Decorative stars -->
        <text x="100" y="120" font-size="40" opacity="0.4">⭐</text>
        <text x="1050" y="100" font-size="50" opacity="0.4">🏆</text>
        <text x="150" y="550" font-size="35" opacity="0.4">🎖️</text>
        <text x="1000" y="520" font-size="45" opacity="0.4">🌟</text>
        <text x="300" y="200" font-size="30" opacity="0.3">🏅</text>
        <text x="850" y="450" font-size="30" opacity="0.3">🎗️</text>
        <text x="600" y="180" text-anchor="middle" font-size="80">🐑🏆</text>
        <text x="600" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#2C2C2C">${escapeXml(t.title)}</text>
        <text x="600" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="32" font-style="italic" fill="#444">${escapeXml(t.subtitle)}</text>
        <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#555">${escapeXml(t.tagline)}</text>
        <!-- Bottom accent -->
        <rect x="350" y="540" width="500" height="8" rx="4" fill="url(#gold)"/>
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
