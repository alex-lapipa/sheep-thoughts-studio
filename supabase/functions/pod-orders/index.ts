import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PODJob {
  id: string;
  shopify_order_id: string;
  shopify_order_name: string | null;
  shopify_line_item_id: string;
  pod_provider: 'printful' | 'printify' | 'gelato';
  pod_order_id: string | null;
  status: string;
  variant_mapping_id: string | null;
  metadata: Record<string, unknown>;
}

interface VariantMapping {
  id: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  pod_provider: 'printful' | 'printify' | 'gelato' | null;
  pod_product_id: string | null;
  pod_variant_id: string | null;
  pod_template_id: string | null;
  print_files: Record<string, string>;
  status: string;
}

interface PODProvider {
  id: string;
  provider: 'printful' | 'printify' | 'gelato';
  api_key_name: string | null;
  status: string;
  settings: Record<string, unknown>;
}

interface RequestBody {
  action: 'send_to_pod' | 'check_status' | 'cancel_order' | 'sync_tracking';
  jobId?: string;
  jobIds?: string[];
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { action, jobId, jobIds } = body;

    switch (action) {
      case 'send_to_pod':
        return await handleSendToPod(supabase, jobId!);
      
      case 'check_status':
        return await handleCheckStatus(supabase, jobIds || [jobId!]);
      
      case 'cancel_order':
        return await handleCancelOrder(supabase, jobId!);
      
      case 'sync_tracking':
        return await handleSyncTracking(supabase, jobIds || [jobId!]);
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('POD Orders error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSendToPod(supabase: ReturnType<typeof createClient>, jobId: string) {
  // 1. Fetch the POD job
  const { data: job, error: jobError } = await supabase
    .from('pod_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return errorResponse(`Job not found: ${jobError?.message || 'Unknown error'}`);
  }

  const podJob = job as PODJob;

  // 2. Check if already sent
  if (podJob.status !== 'not_sent' && podJob.status !== 'error') {
    return errorResponse(`Job is already ${podJob.status}`);
  }

  // 3. Get POD provider configuration
  const { data: provider, error: providerError } = await supabase
    .from('pod_providers')
    .select('*')
    .eq('provider', podJob.pod_provider)
    .single();

  if (providerError || !provider) {
    await updateJobError(supabase, jobId, `Provider ${podJob.pod_provider} not configured`);
    return errorResponse(`Provider not configured: ${podJob.pod_provider}`);
  }

  const podProvider = provider as PODProvider;

  // 4. Check provider connection status
  if (podProvider.status !== 'connected') {
    await updateJobError(supabase, jobId, `Provider ${podJob.pod_provider} is ${podProvider.status}`);
    return errorResponse(`Provider ${podJob.pod_provider} is not connected`);
  }

  // 5. Get the variant mapping if available
  let variantMapping: VariantMapping | null = null;
  if (podJob.variant_mapping_id) {
    const { data: mapping } = await supabase
      .from('variant_mappings')
      .select('*')
      .eq('id', podJob.variant_mapping_id)
      .single();
    variantMapping = mapping as VariantMapping;
  }

  // 6. Get API key from secrets (stored by name reference)
  let apiKey: string | null = null;
  if (podProvider.api_key_name) {
    apiKey = Deno.env.get(podProvider.api_key_name) || null;
  }

  // 7. Attempt to send to POD provider
  try {
    // Update status to queued first
    await supabase
      .from('pod_jobs')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // Call the appropriate POD provider API
    const result = await sendToPodProvider(
      podJob.pod_provider,
      apiKey,
      podJob,
      variantMapping,
      podProvider.settings
    );

    if (result.success) {
      // Update job with POD order details
      await supabase
        .from('pod_jobs')
        .update({
          status: 'in_production',
          pod_order_id: result.orderId,
          pod_line_item_id: result.lineItemId,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'pod_order_sent',
        entity_type: 'pod_job',
        entity_id: jobId,
        metadata: {
          provider: podJob.pod_provider,
          pod_order_id: result.orderId,
          shopify_order_id: podJob.shopify_order_id,
        },
      });

      return successResponse({
        success: true,
        orderId: result.orderId,
        message: `Order sent to ${podJob.pod_provider}`,
      });
    } else {
      await updateJobError(supabase, jobId, result.error || 'Unknown error');
      return errorResponse(result.error || 'Failed to send to POD provider');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await updateJobError(supabase, jobId, errorMsg);
    return errorResponse(errorMsg);
  }
}

async function handleCheckStatus(supabase: ReturnType<typeof createClient>, jobIds: string[]) {
  const results: Array<{ jobId: string; status: string; tracking?: string }> = [];

  for (const jobId of jobIds) {
    const { data: job } = await supabase
      .from('pod_jobs')
      .select('*, pod_providers!pod_provider(api_key_name, settings)')
      .eq('id', jobId)
      .single();

    if (!job || !job.pod_order_id) {
      results.push({ jobId, status: 'not_found' });
      continue;
    }

    // In a real implementation, call the POD provider API to check status
    // For now, return current status
    results.push({
      jobId,
      status: job.status,
      tracking: job.tracking_number,
    });
  }

  return successResponse({ success: true, results });
}

async function handleCancelOrder(supabase: ReturnType<typeof createClient>, jobId: string) {
  const { data: job, error } = await supabase
    .from('pod_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return errorResponse('Job not found');
  }

  // Can only cancel if not yet shipped
  if (job.status === 'shipped' || job.status === 'delivered') {
    return errorResponse('Cannot cancel shipped or delivered orders');
  }

  // Update job status
  await supabase
    .from('pod_jobs')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  // Log to audit
  await supabase.from('audit_logs').insert({
    action: 'pod_order_cancelled',
    entity_type: 'pod_job',
    entity_id: jobId,
    metadata: { shopify_order_id: job.shopify_order_id },
  });

  return successResponse({ success: true, message: 'Order cancelled' });
}

async function handleSyncTracking(supabase: ReturnType<typeof createClient>, jobIds: string[]) {
  const updated: string[] = [];

  for (const jobId of jobIds) {
    const { data: job } = await supabase
      .from('pod_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job || !job.pod_order_id) continue;

    // In a real implementation, fetch tracking from POD provider
    // For now, just mark as checked
    await supabase
      .from('pod_jobs')
      .update({ last_status_check: new Date().toISOString() })
      .eq('id', jobId);

    updated.push(jobId);
  }

  return successResponse({ success: true, updated, count: updated.length });
}

async function sendToPodProvider(
  provider: 'printful' | 'printify' | 'gelato',
  apiKey: string | null,
  job: PODJob,
  mapping: VariantMapping | null,
  settings: Record<string, unknown>
): Promise<{ success: boolean; orderId?: string; lineItemId?: string; error?: string }> {
  // Validate we have what we need
  if (!apiKey) {
    return { success: false, error: `No API key configured for ${provider}` };
  }

  if (!mapping?.pod_variant_id) {
    return { success: false, error: 'No variant mapping found for this product' };
  }

  // In production, this would call the actual POD provider APIs:
  // - Printful: POST https://api.printful.com/orders
  // - Printify: POST https://api.printify.com/v1/shops/{shop_id}/orders.json
  // - Gelato: POST https://api.gelato.com/v3/orders
  
  // For now, simulate a successful order creation
  // The actual implementation would:
  // 1. Fetch order details from Shopify (customer address, etc.)
  // 2. Transform to POD provider format
  // 3. Submit order to POD provider
  // 4. Return the provider's order ID

  console.log(`[POD Orders] Sending to ${provider}:`, {
    jobId: job.id,
    shopifyOrderId: job.shopify_order_id,
    podVariantId: mapping.pod_variant_id,
    printFiles: mapping.print_files,
  });

  // Simulate API call
  // In production, replace this with actual API calls
  switch (provider) {
    case 'printful':
      // const printfulResponse = await fetch('https://api.printful.com/orders', { ... });
      return {
        success: true,
        orderId: `PF-${Date.now()}`,
        lineItemId: `LI-${job.shopify_line_item_id.slice(-8)}`,
      };

    case 'printify':
      // const printifyResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, { ... });
      return {
        success: true,
        orderId: `PRFY-${Date.now()}`,
        lineItemId: `LI-${job.shopify_line_item_id.slice(-8)}`,
      };

    case 'gelato':
      // const gelatoResponse = await fetch('https://api.gelato.com/v3/orders', { ... });
      return {
        success: true,
        orderId: `GEL-${Date.now()}`,
        lineItemId: `LI-${job.shopify_line_item_id.slice(-8)}`,
      };

    default:
      return { success: false, error: `Unknown provider: ${provider}` };
  }
}

async function updateJobError(
  supabase: ReturnType<typeof createClient>,
  jobId: string,
  errorMessage: string
) {
  await supabase
    .from('pod_jobs')
    .update({
      status: 'error',
      error_message: errorMessage,
      retry_count: supabase.rpc('increment', { row_id: jobId }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

function successResponse(data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
