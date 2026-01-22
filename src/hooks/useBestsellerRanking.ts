import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BestsellerData {
  productId: string;
  score: number; // Weighted score: purchases * 10 + add_to_cart * 3 + views * 1
}

/**
 * Fetches bestseller ranking from ecommerce_events table
 * Uses weighted scoring: purchases (10x), add to cart (3x), views (1x)
 */
export function useBestsellerRanking() {
  return useQuery({
    queryKey: ['bestseller-ranking'],
    queryFn: async (): Promise<Map<string, number>> => {
      // Fetch all relevant events from last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: events, error } = await supabase
        .from('ecommerce_events')
        .select('product_id, event_type, quantity')
        .in('event_type', ['purchase_complete', 'add_to_cart', 'view_product'])
        .gte('created_at', ninetyDaysAgo.toISOString())
        .not('product_id', 'is', null);

      if (error) {
        console.error('[BestsellerRanking] Error fetching events:', error);
        return new Map();
      }

      // Calculate weighted scores per product
      const scores = new Map<string, number>();

      for (const event of events || []) {
        if (!event.product_id) continue;

        const currentScore = scores.get(event.product_id) || 0;
        let weight = 1;

        switch (event.event_type) {
          case 'purchase_complete':
            weight = 10 * (event.quantity || 1);
            break;
          case 'add_to_cart':
            weight = 3 * (event.quantity || 1);
            break;
          case 'view_product':
            weight = 1;
            break;
        }

        scores.set(event.product_id, currentScore + weight);
      }

      return scores;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Sort products by bestseller score
 */
export function sortByBestseller<T extends { node: { id: string } }>(
  products: T[],
  rankings: Map<string, number>
): T[] {
  return [...products].sort((a, b) => {
    // Extract numeric ID from Shopify GID
    const aId = extractProductId(a.node.id);
    const bId = extractProductId(b.node.id);
    
    const aScore = rankings.get(aId) || 0;
    const bScore = rankings.get(bId) || 0;
    
    return bScore - aScore;
  });
}

/**
 * Extract product ID from Shopify GID format
 * e.g., "gid://shopify/Product/123456" -> "123456"
 */
function extractProductId(gid: string): string {
  const match = gid.match(/\/Product\/(\d+)/);
  return match ? match[1] : gid;
}
