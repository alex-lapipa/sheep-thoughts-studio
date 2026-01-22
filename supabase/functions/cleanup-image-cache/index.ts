import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET_NAME = "og-images";
const MAX_AGE_DAYS = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);
    
    console.log(`Cleaning up images older than ${cutoffDate.toISOString()}`);
    
    const results = {
      scanned: 0,
      deleted: 0,
      failed: 0,
      errors: [] as string[],
      freedBytes: 0,
    };

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 1000,
        sortBy: { column: "created_at", order: "asc" },
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log("No files found in bucket");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No files to clean up",
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    results.scanned = files.length;
    const filesToDelete: string[] = [];

    for (const file of files) {
      // Skip folders
      if (!file.name || file.id === null) continue;
      
      const createdAt = new Date(file.created_at);
      
      if (createdAt < cutoffDate) {
        filesToDelete.push(file.name);
        results.freedBytes += file.metadata?.size || 0;
      }
    }

    if (filesToDelete.length === 0) {
      console.log("No files older than cutoff date");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No files older than 30 days",
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${filesToDelete.length} files to delete`);

    // Delete files in batches
    const batchSize = 100;
    for (let i = 0; i < filesToDelete.length; i += batchSize) {
      const batch = filesToDelete.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(batch);

      if (deleteError) {
        results.failed += batch.length;
        results.errors.push(`Batch ${i / batchSize + 1}: ${deleteError.message}`);
      } else {
        results.deleted += batch.length;
      }
    }

    // Log cleanup event to og_cache_events
    await supabase.from("og_cache_events").insert({
      cache_key: "scheduled_cleanup",
      event_type: "cleanup",
      image_type: "all",
      metadata: {
        scanned: results.scanned,
        deleted: results.deleted,
        failed: results.failed,
        freed_bytes: results.freedBytes,
        cutoff_date: cutoffDate.toISOString(),
      },
    });

    const freedMB = (results.freedBytes / (1024 * 1024)).toFixed(2);
    console.log(`Cleanup complete: deleted ${results.deleted} files, freed ${freedMB}MB`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Cleaned up ${results.deleted} files older than 30 days (freed ${freedMB}MB)`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during cache cleanup:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
