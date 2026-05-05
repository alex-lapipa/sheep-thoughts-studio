import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { aiImage } from "../_shared/ai-gateway.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BADGES = [
  { days: 3, emoji: "🌱", title: "Seedling", color: "#4ade80" },
  { days: 7, emoji: "🔥", title: "Week Warrior", color: "#f97316" },
  { days: 14, emoji: "⭐", title: "Fortnight Scholar", color: "#facc15" },
  { days: 30, emoji: "🏆", title: "Monthly Master", color: "#3b82f6" },
  { days: 60, emoji: "🧙", title: "Wisdom Sage", color: "#a855f7" },
  { days: 100, emoji: "💯", title: "Centurion", color: "#ec4899" },
  { days: 365, emoji: "🐑", title: "Year of Enlightenment", color: "#14b8a6" },
];

// BRAND-ALIGNED PROMPT BASE
const BRAND_PROMPT_BASE = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio).

CRITICAL CHARACTER CONSTRAINTS (NON-NEGOTIABLE):
- The sheep MUST be quadrupedal (on four legs) - NEVER standing on two legs
- The sheep faces RIGHT in profile view
- Expression: neutral, vacant, confident gaze - NOT cute, NOT childish, NOT cartoonish
- White fluffy wool with weathered texture
- NO kawaii styling, NO humanoid poses

ENVIRONMENT:
- Wicklow bog landscape with Sugarloaf Mountain silhouette
- Soft gradient from cream (#FFFDD0) to sage green
- Irish mountain atmosphere`;

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

    if (!skipCache) {
      const { data: fileList } = await supabase.storage
        .from('og-images')
        .list('', { search: cacheKey });

      if (fileList && fileList.length > 0) {
        await supabase.from('og_cache_events').insert({
          cache_key: cacheKey,
          event_type: 'hit',
          image_type: 'badge',
        });
        
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/og-images/${cacheKey}`;
        return Response.redirect(publicUrl, 302);
      }
    }

    await supabase.from('og_cache_events').insert({
      cache_key: cacheKey,
      event_type: skipCache ? 'regenerate' : 'miss',
      image_type: 'badge',
    });

    const unlockedDays = badgesParam.split(',').map(d => parseInt(d, 10)).filter(d => !isNaN(d));
    const unlockedBadges = BADGES.filter(b => unlockedDays.includes(b.days) || streak >= b.days);
    const badgeCount = unlockedBadges.length;
    const badgeList = unlockedBadges.map(b => `${b.emoji} ${b.title}`).join(', ') || 'No badges yet';
    
    const prompt = `${BRAND_PROMPT_BASE}

COMPOSITION:
- The sheep stands proudly in profile on a Wicklow hill
- Around the sheep: ${badgeCount} floating achievement badges in an arc: ${badgeList}
- Each badge as a colorful medallion with its emoji
- Top text: "${username}'s Wisdom Badges" in display font
- Bottom text: "${streak} Day Streak • ${badgeCount}/${BADGES.length} Badges Earned"
- Subtle sparkles and celebration elements
- Professional social card layout

Ultra high resolution, clean modern design.`;
    const result = await aiImage(prompt, { size: '1792x1024' });

    const imageData = result.dataUrl;
    if (!imageData) {
      throw new Error('No image generated');
    }

    if (imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      await supabase.storage
        .from('og-images')
        .upload(cacheKey, binaryData, { contentType: 'image/png', upsert: true });
      
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

    const imageResponse = await fetch(imageData);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);

    await supabase.storage
      .from('og-images')
      .upload(cacheKey, imageBytes, { contentType: 'image/png', upsert: true });

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
