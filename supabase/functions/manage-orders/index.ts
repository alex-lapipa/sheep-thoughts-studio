import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  price: string;
  variant_title: string | null;
  product_id: number | null;
  variant_id: number | null;
  sku: string | null;
}

interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  currency: string;
  line_items: OrderLineItem[];
  shipping_address?: {
    first_name: string;
    last_name: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface RequestBody {
  action: 'list' | 'sync' | 'get_details' | 'create_pod_jobs';
  orderId?: string;
  orderNumber?: string;
  first?: number;
  status?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const shopifyAdminToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    const shopifyStoreDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN') || 'bubblesheet-storefront-ops-o5m9w.myshopify.com';
    const apiVersion = '2025-01';

    if (!shopifyAdminToken) {
      return errorResponse('Shopify Admin API not configured', 500);
    }

    const body: RequestBody = await req.json();
    const { action } = body;

    switch (action) {
      case 'list':
        return await handleListOrders(shopifyAdminToken, shopifyStoreDomain, apiVersion, body);
      
      case 'sync':
        return await handleSyncOrders(supabase, shopifyAdminToken, shopifyStoreDomain, apiVersion, body);
      
      case 'get_details':
        return await handleGetOrderDetails(shopifyAdminToken, shopifyStoreDomain, apiVersion, body);
      
      case 'create_pod_jobs':
        return await handleCreatePodJobs(supabase, shopifyAdminToken, shopifyStoreDomain, apiVersion, body);
      
      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Manage Orders error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});

async function handleListOrders(
  token: string,
  domain: string,
  apiVersion: string,
  body: RequestBody
) {
  const { first = 50, status, financialStatus, fulfillmentStatus } = body;
  
  // Build query parameters
  const params = new URLSearchParams({
    limit: String(first),
    status: status || 'any',
  });
  
  if (financialStatus && financialStatus !== 'all') {
    params.append('financial_status', financialStatus);
  }
  if (fulfillmentStatus && fulfillmentStatus !== 'all') {
    params.append('fulfillment_status', fulfillmentStatus);
  }

  const url = `https://${domain}/admin/api/${apiVersion}/orders.json?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify orders fetch error:', response.status, errorText);
    return errorResponse(`Failed to fetch orders: ${response.status}`);
  }

  const data = await response.json();
  const orders = data.orders || [];

  // Transform to a cleaner format
  const transformedOrders = orders.map((order: ShopifyOrder) => ({
    id: order.id,
    gid: order.admin_graphql_api_id,
    orderNumber: order.name,
    email: order.email,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
    total: order.total_price,
    subtotal: order.subtotal_price,
    tax: order.total_tax,
    discounts: order.total_discounts,
    currency: order.currency,
    itemCount: order.line_items.length,
    lineItems: order.line_items.map((item) => ({
      id: item.id,
      title: item.title,
      variantTitle: item.variant_title,
      quantity: item.quantity,
      price: item.price,
      productId: item.product_id,
      variantId: item.variant_id,
      sku: item.sku,
    })),
    shippingAddress: order.shipping_address ? {
      name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
      city: order.shipping_address.city,
      province: order.shipping_address.province,
      country: order.shipping_address.country,
      zip: order.shipping_address.zip,
    } : null,
    customer: order.customer ? {
      id: order.customer.id,
      email: order.customer.email,
      name: `${order.customer.first_name} ${order.customer.last_name}`,
    } : null,
  }));

  return successResponse({
    success: true,
    orders: transformedOrders,
    count: transformedOrders.length,
  });
}

async function handleSyncOrders(
  supabase: ReturnType<typeof createClient>,
  token: string,
  domain: string,
  apiVersion: string,
  body: RequestBody
) {
  const { first = 100 } = body;
  
  // Fetch recent orders from Shopify
  const url = `https://${domain}/admin/api/${apiVersion}/orders.json?limit=${first}&status=any`;
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return errorResponse(`Failed to fetch orders: ${response.status}`);
  }

  const data = await response.json();
  const orders = data.orders || [];

  // Get existing POD jobs to see which orders are already tracked
  const orderIds = orders.map((o: ShopifyOrder) => String(o.id));
  const { data: existingJobs } = await supabase
    .from('pod_jobs')
    .select('shopify_order_id')
    .in('shopify_order_id', orderIds);

  const existingOrderIds = new Set((existingJobs || []).map(j => j.shopify_order_id));

  // Identify orders without POD jobs
  const ordersWithoutJobs = orders.filter((o: ShopifyOrder) => 
    !existingOrderIds.has(String(o.id))
  );

  // Summary
  const syncResult = {
    totalFetched: orders.length,
    existingJobs: existingOrderIds.size,
    newOrders: ordersWithoutJobs.length,
    ordersNeedingJobs: ordersWithoutJobs.map((o: ShopifyOrder) => ({
      id: o.id,
      orderNumber: o.name,
      itemCount: o.line_items.length,
      total: o.total_price,
      currency: o.currency,
    })),
  };

  // Log the sync
  await supabase.from('audit_logs').insert({
    action: 'orders_sync',
    entity_type: 'shopify_orders',
    metadata: {
      totalFetched: syncResult.totalFetched,
      newOrders: syncResult.newOrders,
    },
  });

  return successResponse({
    success: true,
    sync: syncResult,
  });
}

async function handleGetOrderDetails(
  token: string,
  domain: string,
  apiVersion: string,
  body: RequestBody
) {
  const { orderId, orderNumber } = body;
  
  if (!orderId && !orderNumber) {
    return errorResponse('orderId or orderNumber is required');
  }

  let url: string;
  if (orderId) {
    url = `https://${domain}/admin/api/${apiVersion}/orders/${orderId}.json`;
  } else {
    const cleanNumber = orderNumber!.replace('#', '');
    url = `https://${domain}/admin/api/${apiVersion}/orders.json?name=${cleanNumber}&status=any`;
  }

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return errorResponse(`Failed to fetch order: ${response.status}`);
  }

  const data = await response.json();
  const order = data.order || (data.orders && data.orders[0]);

  if (!order) {
    return errorResponse('Order not found', 404);
  }

  return successResponse({
    success: true,
    order: {
      id: order.id,
      gid: order.admin_graphql_api_id,
      orderNumber: order.name,
      email: order.email,
      createdAt: order.created_at,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
      total: order.total_price,
      currency: order.currency,
      lineItems: order.line_items.map((item: OrderLineItem) => ({
        id: item.id,
        title: item.title,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        price: item.price,
        productId: item.product_id,
        variantId: item.variant_id,
        sku: item.sku,
      })),
      shippingAddress: order.shipping_address,
      customer: order.customer,
      note: order.note,
      tags: order.tags,
      fulfillments: order.fulfillments || [],
    },
  });
}

async function handleCreatePodJobs(
  supabase: ReturnType<typeof createClient>,
  token: string,
  domain: string,
  apiVersion: string,
  body: RequestBody
) {
  const { orderId } = body;
  
  if (!orderId) {
    return errorResponse('orderId is required');
  }

  // Fetch the order
  const url = `https://${domain}/admin/api/${apiVersion}/orders/${orderId}.json`;
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return errorResponse(`Failed to fetch order: ${response.status}`);
  }

  const data = await response.json();
  const order = data.order;

  if (!order) {
    return errorResponse('Order not found', 404);
  }

  // Check for existing jobs for this order
  const { data: existingJobs } = await supabase
    .from('pod_jobs')
    .select('shopify_line_item_id')
    .eq('shopify_order_id', String(order.id));

  const existingLineItems = new Set((existingJobs || []).map(j => j.shopify_line_item_id));

  // Get variant mappings to determine POD provider
  const variantIds = order.line_items.map((item: OrderLineItem) => String(item.variant_id));
  const { data: mappings } = await supabase
    .from('variant_mappings')
    .select('*')
    .in('shopify_variant_id', variantIds);

  const mappingsByVariant = new Map(
    (mappings || []).map(m => [m.shopify_variant_id, m])
  );

  // Create POD jobs for each line item that doesn't already have one
  const jobsToCreate: Array<{
    shopify_order_id: string;
    shopify_order_name: string;
    shopify_line_item_id: string;
    pod_provider: 'printful' | 'printify' | 'gelato';
    variant_mapping_id: string | null;
    status: 'not_sent';
    metadata: Record<string, unknown>;
  }> = [];

  for (const item of order.line_items as OrderLineItem[]) {
    const lineItemId = String(item.id);
    
    if (existingLineItems.has(lineItemId)) {
      continue; // Already has a job
    }

    const mapping = mappingsByVariant.get(String(item.variant_id));
    const provider = mapping?.pod_provider || 'printful'; // Default to printful

    jobsToCreate.push({
      shopify_order_id: String(order.id),
      shopify_order_name: order.name,
      shopify_line_item_id: lineItemId,
      pod_provider: provider as 'printful' | 'printify' | 'gelato',
      variant_mapping_id: mapping?.id || null,
      status: 'not_sent',
      metadata: {
        product_title: item.title,
        variant_title: item.variant_title,
        quantity: item.quantity,
        sku: item.sku,
      },
    });
  }

  if (jobsToCreate.length === 0) {
    return successResponse({
      success: true,
      message: 'All line items already have POD jobs',
      created: 0,
    });
  }

  // Insert jobs
  const { data: createdJobs, error: insertError } = await supabase
    .from('pod_jobs')
    .insert(jobsToCreate)
    .select();

  if (insertError) {
    console.error('Failed to create POD jobs:', insertError);
    return errorResponse(`Failed to create jobs: ${insertError.message}`);
  }

  // Log the creation
  await supabase.from('audit_logs').insert({
    action: 'pod_jobs_created',
    entity_type: 'pod_job',
    entity_id: order.id.toString(),
    metadata: {
      orderNumber: order.name,
      jobsCreated: createdJobs?.length || 0,
    },
  });

  return successResponse({
    success: true,
    message: `Created ${createdJobs?.length || 0} POD jobs`,
    created: createdJobs?.length || 0,
    jobs: createdJobs,
  });
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
