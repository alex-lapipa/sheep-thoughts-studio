import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "7d"; // 1h, 24h, 7d, 30d, all

    // Calculate time range
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get cache events stats
    const { data: events, error: eventsError } = await supabase
      .from("og_cache_events")
      .select("event_type, image_type, created_at, metadata")
      .gte("created_at", startDate.toISOString());

    if (eventsError) {
      console.error("Error fetching cache events:", eventsError);
    }

    const eventsList = events || [];

    // Calculate stats
    const hits = eventsList.filter(e => e.event_type === "hit").length;
    const misses = eventsList.filter(e => e.event_type === "miss").length;
    const regenerations = eventsList.filter(e => e.event_type === "regenerate").length;
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    // Stats by image type
    const typeStats: Record<string, { hits: number; misses: number; regenerations: number }> = {};
    eventsList.forEach(event => {
      if (event.event_type === "cleanup") return; // Skip cleanup events for type stats
      const type = event.image_type || "unknown";
      if (!typeStats[type]) {
        typeStats[type] = { hits: 0, misses: 0, regenerations: 0 };
      }
      if (event.event_type === "hit") typeStats[type].hits++;
      if (event.event_type === "miss") typeStats[type].misses++;
      if (event.event_type === "regenerate") typeStats[type].regenerations++;
    });

    // Get cleanup history (all time for history, period for stats)
    const cleanupEvents = eventsList.filter(e => e.event_type === "cleanup");
    
    // Also get recent cleanup events (last 10 regardless of period)
    const { data: recentCleanups, error: cleanupError } = await supabase
      .from("og_cache_events")
      .select("created_at, metadata")
      .eq("event_type", "cleanup")
      .order("created_at", { ascending: false })
      .limit(10);

    if (cleanupError) {
      console.error("Error fetching cleanup history:", cleanupError);
    }

    const cleanupHistory = (recentCleanups || []).map(c => ({
      date: c.created_at,
      scanned: (c.metadata as any)?.scanned || 0,
      deleted: (c.metadata as any)?.deleted || 0,
      failed: (c.metadata as any)?.failed || 0,
      freedBytes: (c.metadata as any)?.freed_bytes || 0,
    }));

    // Calculate cleanup totals for selected period
    const cleanupTotals = cleanupEvents.reduce((acc, e) => {
      const meta = e.metadata as any;
      return {
        totalCleanups: acc.totalCleanups + 1,
        totalDeleted: acc.totalDeleted + (meta?.deleted || 0),
        totalFreedBytes: acc.totalFreedBytes + (meta?.freed_bytes || 0),
      };
    }, { totalCleanups: 0, totalDeleted: 0, totalFreedBytes: 0 });

    // Get storage stats
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from("og-images")
      .list("", { limit: 1000 });

    if (storageError) {
      console.error("Error fetching storage files:", storageError);
    }

    const files = storageFiles || [];
    const totalFiles = files.length;
    const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);

    // Count by type
    const storageByType: Record<string, { count: number; size: number }> = {};
    files.forEach(file => {
      let type = "other";
      if (file.name.startsWith("product-")) type = "product";
      else if (file.name.startsWith("badge-")) type = "badge";
      else if (file.name.startsWith("privacy-")) type = "privacy";
      else if (file.name.startsWith("shipping-")) type = "shipping";
      else if (file.name.startsWith("contact-")) type = "contact";

      if (!storageByType[type]) {
        storageByType[type] = { count: 0, size: 0 };
      }
      storageByType[type].count++;
      storageByType[type].size += file.metadata?.size || 0;
    });

    // Get oldest and newest files
    const sortedByDate = [...files].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const oldestFile = sortedByDate[0] || null;
    const newestFile = sortedByDate[sortedByDate.length - 1] || null;

    // Get hourly stats for chart (last 24 hours)
    const hourlyStats: Array<{ hour: string; hits: number; misses: number }> = [];
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = eventsList.filter(e => new Date(e.created_at) >= last24h);
    
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      const hourEvents = recentEvents.filter(e => {
        const eventTime = new Date(e.created_at);
        return eventTime >= hourStart && eventTime < hourEnd;
      });
      
      hourlyStats.push({
        hour: hourStart.toISOString(),
        hits: hourEvents.filter(e => e.event_type === "hit").length,
        misses: hourEvents.filter(e => e.event_type === "miss").length,
      });
    }

    const stats = {
      period,
      generatedAt: now.toISOString(),
      cache: {
        hits,
        misses,
        regenerations,
        total,
        hitRate: Math.round(hitRate * 100) / 100,
        byType: typeStats,
      },
      storage: {
        totalFiles,
        totalSizeBytes: totalSize,
        totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        byType: storageByType,
        oldestFile: oldestFile ? {
          name: oldestFile.name,
          createdAt: oldestFile.created_at,
        } : null,
        newestFile: newestFile ? {
          name: newestFile.name,
          createdAt: newestFile.created_at,
        } : null,
      },
      cleanup: {
        ...cleanupTotals,
        lastCleanup: cleanupHistory[0] || null,
        history: cleanupHistory,
      },
      hourlyStats,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get cache statistics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
