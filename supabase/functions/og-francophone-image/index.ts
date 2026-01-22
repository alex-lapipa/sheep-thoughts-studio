const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type FrancophoneRegion = 'fr' | 'be' | 'lu';

interface RegionContent {
  name: string;
  flag: string;
  title: string;
  subtitle: string;
  tagline: string;
  landmark: string;
  colors: string;
}

const regionContent: Record<FrancophoneRegion, RegionContent> = {
  fr: {
    name: 'France',
    flag: '🇫🇷',
    title: 'Bubbles le Mouton',
    subtitle: 'Je Sais des Choses.',
    tagline: 'Confiant et faux depuis la naissance • De Wicklow avec amour',
    landmark: 'with subtle French elements like the Eiffel Tower silhouette in the distance, lavender fields of Provence',
    colors: 'French tricolor subtly integrated as accents (blue, white, red highlights)',
  },
  be: {
    name: 'Belgique',
    flag: '🇧🇪',
    title: 'Bubbles le Mouton',
    subtitle: 'Bonjour!',
    tagline: 'Un mouton avec des opinions • De Wicklow pour la Belgique',
    landmark: 'with Belgian architecture hints like Grand Place silhouette, Art Nouveau elements, Ardennes forest in background',
    colors: 'Belgian flag colors subtly woven in (black, yellow, red accents)',
  },
  lu: {
    name: 'Luxembourg',
    flag: '🇱🇺',
    title: 'Bubbles le Mouton',
    subtitle: 'Moien!',
    tagline: 'Petit pays, grandes opinions fausses • Wicklow rencontre Luxembourg',
    landmark: 'with Luxembourg City fortress silhouette, Moselle valley vineyards, elegant European architecture',
    colors: 'Luxembourg flag colors as subtle accents (red, white, light blue)',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const region = (url.searchParams.get('region') || 'fr') as FrancophoneRegion;
    const content = regionContent[region] || regionContent.fr;

    const prompt = `Create a premium social media preview card (1200x630 pixels, 16:9 aspect ratio) for ${content.name}.

Design requirements:
- Background: Blend of Irish Wicklow landscape with ${content.landmark}
- Color palette: Wicklow colors (cream #FFFDD0, sage green #90B77D, heather purple #8B668B) ${content.colors}
- Sky: Dramatic sunset/golden hour lighting connecting Ireland to ${content.name}
- Center: An adorable cartoon sheep mascot (fluffy white wool, expressive knowing eyes, slightly smug smile)
- The sheep should have a sophisticated, slightly French flair (perhaps a small beret for FR, nothing for BE/LU)
- Flag: Small ${content.flag} flag or subtle national pattern element in corner

Text Layout:
- Top: "${content.title}" in bold elegant display font
- Middle: "${content.subtitle}" in flowing cursive script
- Bottom: "${content.tagline}" in clean sans-serif

Style notes:
- Professional social card suitable for Facebook/Twitter/LinkedIn
- Warm, inviting, slightly whimsical illustration style with French elegance
- The sheep should look intelligent but also adorably misguided
- Balance Irish authenticity with ${content.name} cultural sophistication
- NO real photographs, illustrated/painted style only

Ultra high resolution, clean modern design with excellent text legibility.`;

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
          'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        },
      });
    }

    return Response.redirect(imageData, 302);

  } catch (error) {
    console.error('OG Francophone image generation error:', error);
    
    const url = new URL(req.url);
    const region = (url.searchParams.get('region') || 'fr') as FrancophoneRegion;
    const content = regionContent[region] || regionContent.fr;
    
    // Fallback SVG with region-specific branding
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="40%" style="stop-color:#E6E6FA"/>
            <stop offset="100%" style="stop-color:#C8A2C8"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#002654"/>
            <stop offset="50%" style="stop-color:#FFFFFF"/>
            <stop offset="100%" style="stop-color:#CE1126"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Elegant French-inspired pattern -->
        <path d="M0,500 Q300,420 600,480 T1200,450 L1200,630 L0,630 Z" fill="#2C2C2C" opacity="0.1"/>
        
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
        <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#666">
          ${escapeXml(content.tagline)}
        </text>
        
        <!-- Bottom accent bar with tricolor effect -->
        <rect x="350" y="540" width="500" height="6" rx="3" fill="url(#accent)"/>
        
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
