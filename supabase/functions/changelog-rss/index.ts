import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Changelog entries - keep in sync with useWhatsNew.ts
const CHANGELOG = [
  {
    version: '1.2.0',
    title: "Newsletter & Legal Updates 📬",
    features: [
      '📧 Newsletter unsubscribe with one-click opt-out',
      '📋 Table of contents sidebar on Terms page',
      '📊 Scroll progress bar on Privacy page',
      '📰 Full changelog history page',
    ],
    date: '2026-01-22',
  },
  {
    version: '1.1.0',
    title: "Campaign Manager & Admin Tools 🚀",
    features: [
      '📨 Newsletter campaign manager in admin',
      '✉️ Double opt-in email confirmation',
      '📤 CSV export for contact messages',
      '🔐 Bulk message management',
    ],
    date: '2026-01-22',
  },
  {
    version: '1.0.0',
    title: "Launch Day! 🐑",
    features: [
      '✨ Newsletter signup with welcome emails',
      '📋 Table of contents on Privacy page',
      '🔗 Smooth scrolling to anchor sections',
      '📊 Admin newsletter management',
      '🎨 Full brand book implementation',
      '🛍️ Shopify storefront integration',
    ],
    date: '2026-01-20',
  },
];

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRssFeed(): string {
  const items = CHANGELOG.map(entry => {
    const description = entry.features.map(f => `• ${escapeXml(f)}`).join('\n');
    const pubDate = new Date(entry.date).toUTCString();
    
    return `
    <item>
      <title>${escapeXml(`v${entry.version} - ${entry.title}`)}</title>
      <link>${SITE_URL}/whats-new</link>
      <guid isPermaLink="false">bubbles-changelog-${entry.version}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bubbles the Sheep - What's New</title>
    <link>${SITE_URL}/whats-new</link>
    <description>Updates and new features from Bubbles the Sheep. A confidently wrong sheep with opinions on everything.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/changelog-rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>Bubbles the Sheep</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rss = generateRssFeed();
    
    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate RSS feed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
