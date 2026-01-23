const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'es' | 'fr' | 'de';

const translations: Record<Language, { title: string; subtitle: string; tagline: string }> = {
  en: {
    title: 'Talk to Bubbles',
    subtitle: 'Voice Chat with a Wicklow Sheep',
    tagline: 'Ask anything • Get confidently wrong answers • Irish accent included',
  },
  es: {
    title: 'Habla con Bubbles',
    subtitle: 'Chat de Voz con una Oveja de Wicklow',
    tagline: 'Pregunta lo que quieras • Respuestas confidentemente incorrectas',
  },
  fr: {
    title: 'Parler à Bubbles',
    subtitle: 'Chat Vocal avec un Mouton de Wicklow',
    tagline: 'Posez vos questions • Réponses confidemment fausses',
  },
  de: {
    title: 'Sprich mit Bubbles',
    subtitle: 'Sprachunterhaltung mit einem Wicklow-Schaf',
    tagline: 'Frag alles • Selbstbewusst falsche Antworten • Irischer Akzent',
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

    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a voice chat page.

Design requirements:
- Background: Cozy Irish cottage interior or misty Wicklow hillside with warm lighting
- Center: An adorable cartoon sheep mascot wearing a small headset/microphone, looking eager to chat
- Sound wave or speech bubble visual elements around the sheep suggesting conversation
- Microphone or phone icon subtly integrated
- Top text: "${t.title}" in a bold, friendly display font
- Subtitle: "${t.subtitle}" in elegant typography
- Bottom: "${t.tagline}"
- Style: Warm, inviting, conversational atmosphere
- Color palette: Cream, sage green (#90B77D), heather purple (#C8A2C8), warm gold accents
- The sheep should look friendly and approachable, ready to have a chat
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design with Irish countryside warmth.`;

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
        <text x="600" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="80" fill="#2C2C2C">🐑🎙️</text>
        <text x="600" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#2C2C2C">${escapeXml(t.title)}</text>
        <text x="600" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="32" font-style="italic" fill="#444">${escapeXml(t.subtitle)}</text>
        <text x="600" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#666">${escapeXml(t.tagline)}</text>
        <text x="600" y="560" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#888">🎧 Voice • 💬 Text • 📞 Real-time</text>
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
