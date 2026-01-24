/**
 * Shopify Admin API helpers for discount codes and price rules
 * These functions interact with Shopify's Admin API through our tools
 */

interface PriceRuleInput {
  title: string;
  value_type: 'percentage' | 'fixed_amount';
  value: string;
  target_type: string;
  target_selection: string;
  allocation_method: string;
  customer_selection: string;
  starts_at: string;
  ends_at?: string;
  usage_limit?: number;
  once_per_customer?: boolean;
  prerequisite_subtotal?: string;
}

interface PriceRule {
  id: number;
  title: string;
  value_type: string;
  value: string;
  target_type: string;
  target_selection: string;
  allocation_method: string;
  customer_selection: string;
  starts_at: string;
  ends_at: string | null;
  usage_limit: number | null;
  once_per_customer: boolean;
  prerequisite_subtotal?: string;
}

interface DiscountCode {
  id: number;
  code: string;
  usage_count: number;
  price_rule_id: number;
}

// Note: These functions will be called via Supabase edge function
// which has access to the Shopify Admin API token

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callShopifyAdmin(action: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/shopify-admin-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, ...params }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify Admin API error: ${error}`);
  }

  return response.json();
}

export async function listPriceRules(): Promise<PriceRule[]> {
  const result = await callShopifyAdmin('list_price_rules') as { price_rules?: PriceRule[] };
  return result.price_rules || [];
}

export async function createPriceRule(input: PriceRuleInput): Promise<PriceRule> {
  const result = await callShopifyAdmin('create_price_rule', { price_rule: input }) as { price_rule: PriceRule };
  return result.price_rule;
}

export async function deletePriceRule(priceRuleId: number): Promise<void> {
  await callShopifyAdmin('delete_price_rule', { price_rule_id: priceRuleId });
}

export async function listDiscountCodes(priceRuleId: number): Promise<DiscountCode[]> {
  const result = await callShopifyAdmin('list_discount_codes', { price_rule_id: priceRuleId }) as { discount_codes?: DiscountCode[] };
  return result.discount_codes || [];
}

export async function createDiscountCode(priceRuleId: number, code: string): Promise<DiscountCode> {
  const result = await callShopifyAdmin('create_discount_code', { 
    price_rule_id: priceRuleId, 
    code 
  }) as { discount_code: DiscountCode };
  return result.discount_code;
}

export async function deleteDiscountCode(priceRuleId: number, discountCodeId: number): Promise<void> {
  await callShopifyAdmin('delete_discount_code', { 
    price_rule_id: priceRuleId, 
    discount_code_id: discountCodeId 
  });
}
