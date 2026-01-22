import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Badge definitions matching the frontend
const BADGES = [
  { days: 3, emoji: "🌱", title: "Seedling", color: "#4ade80" },
  { days: 7, emoji: "🔥", title: "Week Warrior", color: "#f97316" },
  { days: 14, emoji: "⭐", title: "Fortnight Scholar", color: "#facc15" },
  { days: 30, emoji: "🏆", title: "Monthly Master", color: "#3b82f6" },
  { days: 60, emoji: "🧙", title: "Wisdom Sage", color: "#a855f7" },
  { days: 100, emoji: "💯", title: "Centurion", color: "#ec4899" },
  { days: 365, emoji: "🐑", title: "Year of Enlightenment", color: "#14b8a6" },
];

// Generate a cache key from the parameters
function generateCacheKey(badges: string, streak: number, username: string): string {
  const params = `${badges}-${streak}-${username}`;
  let hash = 0;
  for (let i = 0; i < params.length; i++) {
    const char = params.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `badge-${Math.abs(hash).toString(36)}.png`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const badgesParam = url.searchParams.get('badges') || '';
    const streak = parseInt(url.searchParams.get('streak') || '0', 10);
    const username = url.searchParams.get('name') || 'A Wise Soul';
    const skipCache = url.searchParams.get('nocache') === '1';

    const cacheKey = generateCacheKey(badgesParam, streak, username);

    // Check if cached image exists
    if (!skipCache) {
      const { data: fileList } = await supabase.storage
        .from('og-images')
        .list('', { search: cacheKey });

      if (fileList && fileList.length > 0) {
        // Log cache hit
        await supabase.from('og_cache_events').insert({
          cache_key: cacheKey,
          event_type: 'hit',
          image_type: 'badge',
        });
        
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/og-images/${cacheKey}`;
        return Response.redirect(publicUrl, 302);
      }
    }

    // Log cache miss
    await supabase.from('og_cache_events').insert({
      cache_key: cacheKey,
      event_type: skipCache ? 'regenerate' : 'miss',
      image_type: 'badge',
    });

    // Parse unlocked badges
    const unlockedDays = badgesParam.split(',').map(d => parseInt(d, 10)).filter(d => !isNaN(d));
    const unlockedBadges = BADGES.filter(b => unlockedDays.includes(b.days) || streak >= b.days);
    const badgeCount = unlockedBadges.length;

    // Build the prompt for AI image generation
    const badgeList = unlockedBadges.map(b => `${b.emoji} ${b.title}`).join(', ') || 'No badges yet';
    
    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a badge collection achievement. 

Design requirements:
- Background: Soft gradient from cream (#FFFDD0) to light sage green, with subtle Irish mountain silhouettes
- Center: A cute cartoon sheep mascot (white fluffy wool, friendly expression) looking proud
- Around the sheep: ${badgeCount} floating achievement badges arranged in an arc: ${badgeList}
- Each badge should be a colorful medallion with its emoji
- Top text: "${username}'s Wisdom Badges" in a playful display font
- Bottom text: "${streak} Day Streak • ${badgeCount}/${BADGES.length} Badges Earned"
- Style: Warm, whimsical, Irish countryside aesthetic
- Include subtle sparkles and celebration elements
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing

Ultra high resolution, clean modern design.`;

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
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
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

    // Process and cache the image
    if (imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Upload to Supabase Storage for caching
      const { error: uploadError } = await supabase.storage
        .from('og-images')
        .upload(cacheKey, binaryData, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Failed to cache OG image:', uploadError);
      } else {
        console.log(`Cached OG badge image: ${cacheKey}`);
      }
      
      return new Response(binaryData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=604800',
          'X-OG-Cache': 'MISS',
        },
      });
    }

    // If it's a URL, fetch, cache, and return
    const imageResponse = await fetch(imageData);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);

    await supabase.storage
      .from('og-images')
      .upload(cacheKey, imageBytes, {
        contentType: 'image/png',
        upsert: true,
      });

    return new Response(imageBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800',
        'X-OG-Cache': 'MISS',
      },
    });

  } catch (error) {
    console.error('OG image generation error:', error);
    
    // Return a fallback SVG image
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="100%" style="stop-color:#B0C4DE"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="600" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2C2C2C">🐑</text>
        <text x="600" y="350" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#2C2C2C">Wisdom Badges</text>
        <text x="600" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#666">Bubbles the Sheep</text>
        <text x="600" y="500" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#888">Track your journey of confidently wrong wisdom</text>
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
