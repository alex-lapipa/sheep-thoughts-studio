import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log("Checking for scheduled campaigns...");

    // Find campaigns that are scheduled and due to be sent
    const now = new Date().toISOString();
    
    const { data: dueCampaigns, error: fetchError } = await supabase
      .from("newsletter_campaigns")
      .select("id, subject, scheduled_at")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("Error fetching scheduled campaigns:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch scheduled campaigns" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!dueCampaigns || dueCampaigns.length === 0) {
      console.log("No scheduled campaigns due for sending");
      return new Response(
        JSON.stringify({ success: true, message: "No campaigns due", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${dueCampaigns.length} campaign(s) due for sending`);

    const results: Array<{ campaignId: string; success: boolean; error?: string }> = [];

    for (const campaign of dueCampaigns) {
      console.log(`Processing campaign: ${campaign.id} - "${campaign.subject}"`);

      try {
        // Update status to "draft" so send-newsletter-campaign can process it
        // The send function checks for "draft" status
        const { error: updateError } = await supabase
          .from("newsletter_campaigns")
          .update({ status: "draft" })
          .eq("id", campaign.id);

        if (updateError) {
          console.error(`Failed to update campaign ${campaign.id}:`, updateError);
          results.push({ campaignId: campaign.id, success: false, error: updateError.message });
          continue;
        }

        // Call the send-newsletter-campaign function
        const sendResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/send-newsletter-campaign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ campaignId: campaign.id }),
          }
        );

        const sendResult = await sendResponse.json();

        if (!sendResponse.ok) {
          console.error(`Failed to send campaign ${campaign.id}:`, sendResult);
          results.push({ campaignId: campaign.id, success: false, error: sendResult.error });
          
          // Revert to scheduled status if sending failed
          await supabase
            .from("newsletter_campaigns")
            .update({ status: "scheduled" })
            .eq("id", campaign.id);
        } else {
          console.log(`Successfully sent campaign ${campaign.id}:`, sendResult);
          results.push({ campaignId: campaign.id, success: true });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error processing campaign ${campaign.id}:`, errorMessage);
        results.push({ campaignId: campaign.id, success: false, error: errorMessage });
        
        // Revert to scheduled status on error
        await supabase
          .from("newsletter_campaigns")
          .update({ status: "scheduled" })
          .eq("id", campaign.id);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`Processed ${results.length} campaigns: ${successCount} successful, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} scheduled campaigns`,
        processed: results.length,
        successful: successCount,
        failed: failedCount,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-scheduled-campaigns:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
