import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { aiImage } from "../_shared/ai-gateway.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mode colors matching the brand
const MODE_COLORS: Record<string, { gradient: string; accent: string }> = {
  innocent: { gradient: 'soft mint green to cream', accent: '#4ade80' },
  concerned: { gradient: 'warm amber to cream', accent: '#facc15' },
  triggered: { gradient: 'coral orange to cream', accent: '#f97316' },
  savage: { gradient: 'deep purple to cream', accent: '#a855f7' },
  nuclear: { gradient: 'hot pink to cream', accent: '#ec4899' },
};

// Generate a cache key from the parameters
function generateCacheKey(title: string, price: string, mode: string, productType: string): string {
  const params = `${title}-${price}-${mode}-${productType}`;
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < params.length; i++) {
    const char = params.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `product-${Math.abs(hash).toString(36)}.png`;
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
    const title = url.searchParams.get('title') || 'Bubbles Merch';
    const price = url.searchParams.get('price') || '';
    const imageUrl = url.searchParams.get('image') || '';
    const mode = url.searchParams.get('mode') || 'innocent';
    const productType = url.searchParams.get('type') || 'product';
    const skipCache = url.searchParams.get('nocache') === '1';

    const cacheKey = generateCacheKey(title, price, mode, productType);

    // Check if cached image exists
    if (!skipCache) {
      const { data: existingFile } = await supabase.storage
        .from('og-images')
        .createSignedUrl(cacheKey, 60);

      if (existingFile?.signedUrl) {
        // Verify the file actually exists by checking its metadata
        const { data: fileList } = await supabase.storage
          .from('og-images')
          .list('', { search: cacheKey });

        if (fileList && fileList.length > 0) {
          // Log cache hit
          await supabase.from('og_cache_events').insert({
            cache_key: cacheKey,
            event_type: 'hit',
            image_type: 'product',
          });
          
          // Return cached image URL with redirect
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/og-images/${cacheKey}`;
          return Response.redirect(publicUrl, 302);
        }
      }
    }

    // Log cache miss
    await supabase.from('og_cache_events').insert({
      cache_key: cacheKey,
      event_type: skipCache ? 'regenerate' : 'miss',
      image_type: 'product',
    });

    const modeStyle = MODE_COLORS[mode] || MODE_COLORS.innocent;

    // Build the prompt for AI image generation
    const prompt = `Create a social media preview card (1200x630 pixels, 16:9 aspect ratio) for a product showcase.

Design requirements:
- Background: Soft gradient from ${modeStyle.gradient}, with subtle Irish Wicklow mountain silhouettes at the bottom
- Left side (60%): Product showcase area with a subtle cream/white card backdrop
- Right side (40%): A cute cartoon sheep mascot (white fluffy wool, friendly curious expression) peeking in from the side
- Top left: "BUBBLES MERCH" text in a playful display font with ${modeStyle.accent} accent
- Main text: "${title}" in bold, elegant typography
${price ? `- Price tag: "€${price}" in a circular badge with ${modeStyle.accent} background` : ''}
- Product type indicator: "${productType}" as a small tag
- Style: Warm, whimsical, Irish countryside aesthetic with modern e-commerce feel
- Include subtle wool texture patterns and soft shadows
- Professional social card layout suitable for Twitter/Facebook/LinkedIn sharing
- The sheep should look excited about the product

Ultra high resolution, clean modern design with brand colors: cream (#FFFDD0), gold (#E8B923), mauve (#8B668B), mountain mist blue (#B0C4DE).`;
    const result = await aiImage(prompt, { size: '1792x1024' });

    const imageData = result.dataUrl;
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
        console.log(`Cached OG image: ${cacheKey}`);
      }
      
      return new Response(binaryData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=604800', // Cache for 7 days
          'X-OG-Cache': 'MISS',
        },
      });
    }

    // If it's a URL, fetch, cache, and return
    const imageResponse = await fetch(imageData);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);

    // Upload to cache
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
    console.error('OG product image generation error:', error);
    
    // Return a fallback SVG image
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'Bubbles Merch';
    const price = url.searchParams.get('price') || '';
    
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFDD0"/>
            <stop offset="100%" style="stop-color:#B0C4DE"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="80" y="80" font-family="Georgia, serif" font-size="28" fill="#8B668B">BUBBLES MERCH</text>
        <text x="600" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#2C2C2C">🐑</text>
        <text x="600" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="bold" fill="#2C2C2C">${escapeXml(title)}</text>
        ${price ? `<text x="600" y="440" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="#E8B923">€${escapeXml(price)}</text>` : ''}
        <text x="600" y="520" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#666">Confidently Wrong Fashion</text>
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

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
