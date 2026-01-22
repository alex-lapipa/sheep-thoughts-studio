// Ecommerce event tracking with database persistence
import { supabase } from '@/integrations/supabase/client';

interface EcommerceEventData {
  event_type: string;
  product_id?: string;
  product_title?: string;
  variant_id?: string;
  price?: number;
  quantity?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record an ecommerce event to the database
 * Fire-and-forget - doesn't block UI
 */
export async function recordEcommerceEvent(data: EcommerceEventData): Promise<void> {
  try {
    // Use type assertion since DB types may not be updated yet
    const { error } = await supabase
      .from('ecommerce_events' as 'share_events')
      .insert({
        event_type: data.event_type,
        product_id: data.product_id,
        product_title: data.product_title,
        variant_id: data.variant_id,
        price: data.price,
        quantity: data.quantity || 1,
        currency: data.currency || 'EUR',
        metadata: data.metadata || {},
      } as never);

    if (error) {
      console.error('[EcommerceTracking] Failed to record event:', error.message);
    }
  } catch (err) {
    console.error('[EcommerceTracking] Error:', err);
  }
}

// Convenience helpers
export const ecommerceTracking = {
  viewProduct: (productId: string, productTitle: string, price?: number) => {
    recordEcommerceEvent({
      event_type: 'view_product',
      product_id: productId,
      product_title: productTitle,
      price,
    });
  },

  addToCart: (productId: string, productTitle: string, variantId: string, price: number, quantity = 1) => {
    recordEcommerceEvent({
      event_type: 'add_to_cart',
      product_id: productId,
      product_title: productTitle,
      variant_id: variantId,
      price,
      quantity,
    });
  },

  removeFromCart: (productId: string, productTitle: string, variantId: string) => {
    recordEcommerceEvent({
      event_type: 'remove_from_cart',
      product_id: productId,
      product_title: productTitle,
      variant_id: variantId,
    });
  },

  openCart: (itemCount: number) => {
    recordEcommerceEvent({
      event_type: 'open_cart',
      quantity: itemCount,
    });
  },

  beginCheckout: (totalItems: number, totalValue: number, currency: string) => {
    recordEcommerceEvent({
      event_type: 'begin_checkout',
      price: totalValue,
      quantity: totalItems,
      currency,
    });
  },
};
