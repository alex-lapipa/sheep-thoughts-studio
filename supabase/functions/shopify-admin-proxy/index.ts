import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: string;
  price_rule?: Record<string, unknown>;
  price_rule_id?: number;
  discount_code_id?: number;
  code?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    const storeDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN') || 'bubblesheet-storefront-ops-o5m9w.myshopify.com';
    
    if (!accessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN not configured');
    }

    const body: RequestBody = await req.json();
    const { action } = body;

    const shopifyAdminUrl = `https://${storeDomain}/admin/api/2024-01`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    };

    let result: unknown;

    switch (action) {
      case 'list_price_rules': {
        const response = await fetch(`${shopifyAdminUrl}/price_rules.json`, {
          method: 'GET',
          headers,
        });
        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      case 'create_price_rule': {
        const priceRule = body.price_rule;
        if (!priceRule) {
          throw new Error('price_rule is required');
        }
        
        const response = await fetch(`${shopifyAdminUrl}/price_rules.json`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ price_rule: priceRule }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
        }
        result = await response.json();
        break;
      }

      case 'delete_price_rule': {
        const priceRuleId = body.price_rule_id;
        if (!priceRuleId) {
          throw new Error('price_rule_id is required');
        }
        
        const response = await fetch(`${shopifyAdminUrl}/price_rules/${priceRuleId}.json`, {
          method: 'DELETE',
          headers,
        });
        
        if (!response.ok && response.status !== 204) {
          throw new Error(`Shopify API error: ${response.status}`);
        }
        result = { success: true };
        break;
      }

      case 'list_discount_codes': {
        const priceRuleId = body.price_rule_id;
        if (!priceRuleId) {
          throw new Error('price_rule_id is required');
        }
        
        const response = await fetch(
          `${shopifyAdminUrl}/price_rules/${priceRuleId}/discount_codes.json`,
          { method: 'GET', headers }
        );
        
        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      case 'create_discount_code': {
        const priceRuleId = body.price_rule_id;
        const code = body.code;
        if (!priceRuleId || !code) {
          throw new Error('price_rule_id and code are required');
        }
        
        const response = await fetch(
          `${shopifyAdminUrl}/price_rules/${priceRuleId}/discount_codes.json`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ discount_code: { code } }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
        }
        result = await response.json();
        break;
      }

      case 'delete_discount_code': {
        const priceRuleId = body.price_rule_id;
        const discountCodeId = body.discount_code_id;
        if (!priceRuleId || !discountCodeId) {
          throw new Error('price_rule_id and discount_code_id are required');
        }
        
        const response = await fetch(
          `${shopifyAdminUrl}/price_rules/${priceRuleId}/discount_codes/${discountCodeId}.json`,
          { method: 'DELETE', headers }
        );
        
        if (!response.ok && response.status !== 204) {
          throw new Error(`Shopify API error: ${response.status}`);
        }
        result = { success: true };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Shopify Admin Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
