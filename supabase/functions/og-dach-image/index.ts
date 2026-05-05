import { aiImage } from "../_shared/ai-gateway.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DACHRegion = 'de' | 'at' | 'ch';

interface RegionContent {
  name: string;
  flag: string;
  title: string;
  subtitle: string;
  tagline: string;
  landmark: string;
  colors: string;
}

const regionContent: Record<DACHRegion, RegionContent> = {
  de: {
    name: 'Deutschland',
    flag: '🇩🇪',
    title: 'Bubbles das Schaf',
    subtitle: 'Ich Weiß Dinge.',
    tagline: 'Selbstbewusst falsch seit Geburt • Wicklow trifft Deutschland',
    landmark: 'with subtle German elements like a Brandenburg Gate silhouette in the distance, rolling hills reminiscent of Bavarian countryside',
    colors: 'German flag colors subtly integrated as accents (black, red, gold highlights)',
  },
  at: {
    name: 'Österreich',
    flag: '🇦🇹',
    title: 'Bubbles das Schaf',
    subtitle: 'Grüß Gott!',
    tagline: 'Ein Schaf mit Meinungen • Aus Wicklow für Österreich',
    landmark: 'with Austrian Alps in the background, alpine meadows, hints of Vienna architecture silhouette',
    colors: 'Austrian flag colors subtly woven in (red and white accents)',
  },
  ch: {
    name: 'Schweiz',
    flag: '🇨🇭',
    title: 'Bubbles das Schaf',
    subtitle: 'Grüezi!',
    tagline: 'Präzise falsch • Von Wicklow in die Schweiz',
    landmark: 'with Swiss Alps, Matterhorn silhouette, alpine flowers, clean mountain air aesthetic',
    colors: 'Swiss flag colors as subtle accents (red with white cross motif)',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const region = (url.searchParams.get('region') || 'de') as DACHRegion;
    const content = regionContent[region] || regionContent.de;

    const prompt = `Create a premium social media preview card (1200x630 pixels, 16:9 aspect ratio) for ${content.name}.

Design requirements:
- Background: Blend of Irish Wicklow landscape with ${content.landmark}
- Color palette: Wicklow colors (cream #FFFDD0, sage green #90B77D, heather purple #8B668B) ${content.colors}
- Sky: Dramatic sunset/golden hour lighting connecting Ireland to ${content.name}
- Center: An adorable cartoon sheep mascot (fluffy white wool, expressive knowing eyes, slightly smug smile)
- The sheep should wear a tiny accessory suggesting ${content.name} (small alpine hat for AT/CH, nothing obvious for DE)
- Flag: Small ${content.flag} flag or subtle national pattern element in corner

Text Layout:
- Top: "${content.title}" in bold playful display font
- Middle: "${content.subtitle}" in elegant flowing script
- Bottom: "${content.tagline}" in clean sans-serif

Style notes:
- Professional social card suitable for Facebook/Twitter/LinkedIn
- Warm, inviting, slightly whimsical illustration style
- The sheep should look intelligent but also adorably misguided
- Balance Irish authenticity with ${content.name} cultural nods
- NO real photographs, illustrated/painted style only

Ultra high resolution, clean modern design with excellent text legibility.`;
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
          'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        },
      });
    }

    return Response.redirect(imageData, 302);

  } catch (error) {
    console.error('OG DACH image generation error:', error);
    
    const url = new URL(req.url);
    const region = (url.searchParams.get('region') || 'de') as DACHRegion;
    const content = regionContent[region] || regionContent.de;
    
    // Fallback SVG with region-specific branding
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="40%" style="stop-color:#90B77D"/>
            <stop offset="100%" style="stop-color:#C8A2C8"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#E8B923"/>
            <stop offset="100%" style="stop-color:#FFD700"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Mountain silhouette -->
        <path d="M0,450 L200,350 L400,420 L600,300 L800,380 L1000,320 L1200,400 L1200,630 L0,630 Z" fill="#2C2C2C" opacity="0.15"/>
        
        <!-- Flag and sheep emoji -->
        <text x="600" y="180" text-anchor="middle" font-size="100">${content.flag}🐑</text>
        
        <!-- Title -->
        <text x="600" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#2C2C2C">
          ${escapeXml(content.title)}
        </text>
        
        <!-- Subtitle -->
        <text x="600" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-style="italic" fill="#444">
          ${escapeXml(content.subtitle)}
        </text>
        
        <!-- Tagline -->
        <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#666">
          ${escapeXml(content.tagline)}
        </text>
        
        <!-- Bottom accent bar -->
        <rect x="400" y="540" width="400" height="6" rx="3" fill="url(#accent)"/>
        
        <!-- Region name badge -->
        <rect x="480" y="560" width="240" height="40" rx="20" fill="#2C2C2C" opacity="0.8"/>
        <text x="600" y="588" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFDD0">
          ${escapeXml(content.name)}
        </text>
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
