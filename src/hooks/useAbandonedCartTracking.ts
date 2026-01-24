import { useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { supabase } from '@/integrations/supabase/client';

const TRACKING_DELAY_MS = 30000; // Wait 30 seconds before tracking as abandoned

export function useAbandonedCartTracking(email?: string) {
  const { items, cartId, checkoutUrl } = useCartStore();
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current);
      trackingTimeoutRef.current = null;
    }

    // Don't track if no email, no items, or no cart
    if (!email || items.length === 0 || !cartId || !checkoutUrl) {
      return;
    }

    // Create a hash of current cart state to avoid duplicate tracking
    const cartHash = JSON.stringify({ cartId, items: items.map(i => ({ v: i.variantId, q: i.quantity })) });
    
    // Skip if already tracked this exact cart state
    if (cartHash === lastTrackedRef.current) {
      return;
    }

    // Set timeout to track cart after delay
    trackingTimeoutRef.current = setTimeout(async () => {
      try {
        const totalAmount = items.reduce(
          (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
          0
        );

        const trackingItems = items.map(item => ({
          productId: item.product.node.id,
          productTitle: item.product.node.title,
          variantId: item.variantId,
          variantTitle: item.variantTitle,
          price: parseFloat(item.price.amount),
          quantity: item.quantity,
          imageUrl: item.product.node.images?.edges?.[0]?.node?.url,
        }));

        await supabase.functions.invoke('abandoned-cart-track', {
          body: {
            email,
            cartId,
            checkoutUrl,
            items: trackingItems,
            totalAmount,
            currency: items[0]?.price.currencyCode || 'EUR',
          },
        });

        lastTrackedRef.current = cartHash;
        console.log('[Abandoned Cart] Tracked cart for', email);
      } catch (error) {
        console.error('[Abandoned Cart] Failed to track:', error);
      }
    }, TRACKING_DELAY_MS);

    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, [email, items, cartId, checkoutUrl]);

  // Mark cart as recovered when checkout is initiated
  const markRecovered = async () => {
    if (!cartId) return;

    try {
      await supabase.functions.invoke('abandoned-cart-recover', {
        body: { cartId },
      });
      console.log('[Abandoned Cart] Marked as recovered');
    } catch (error) {
      console.error('[Abandoned Cart] Failed to mark recovered:', error);
    }
  };

  return { markRecovered };
}
