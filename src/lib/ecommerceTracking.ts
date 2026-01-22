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
    
    // Send to GA4
    sendGA4Event('begin_checkout', {
      currency,
      value: totalValue,
    });
  },

  productImpression: (productId: string, productTitle: string, price?: number, position?: number, listName?: string) => {
    recordEcommerceEvent({
      event_type: 'product_impression',
      product_id: productId,
      product_title: productTitle,
      price,
      metadata: { 
        position: position !== undefined ? position : undefined,
        list_name: listName,
      },
    });
    
    // Send to GA4
    sendGA4Event('view_item_list', {
      item_list_name: listName || 'default',
      items: [{
        item_id: productId,
        item_name: productTitle,
        price,
        index: position,
      }],
    });
  },

  /**
   * Track when a product list/collection is viewed
   */
  viewProductList: (listName: string, products: Array<{ id: string; title: string; price?: number }>) => {
    recordEcommerceEvent({
      event_type: 'view_product_list',
      metadata: {
        list_name: listName,
        product_count: products.length,
        product_ids: products.slice(0, 20).map(p => p.id),
      },
    });

    // Send to GA4
    sendGA4Event('view_item_list', {
      item_list_name: listName,
      items: products.slice(0, 20).map((p, index) => ({
        item_id: p.id,
        item_name: p.title,
        price: p.price,
        index,
      })),
    });
  },

  /**
   * Track a completed purchase with full item details
   */
  purchaseComplete: (params: {
    orderId: string;
    orderNumber?: string;
    totalValue: number;
    currency: string;
    tax?: number;
    shipping?: number;
    items: Array<{
      productId: string;
      productTitle: string;
      variantId?: string;
      variantTitle?: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    // Record to database
    recordEcommerceEvent({
      event_type: 'purchase_complete',
      price: params.totalValue,
      quantity: params.items.reduce((sum, item) => sum + item.quantity, 0),
      currency: params.currency,
      metadata: {
        order_id: params.orderId,
        order_number: params.orderNumber,
        tax: params.tax,
        shipping: params.shipping,
        items: params.items,
      },
    });

    // Send to GA4 with enhanced ecommerce data
    sendGA4Event('purchase', {
      transaction_id: params.orderId,
      value: params.totalValue,
      currency: params.currency,
      tax: params.tax || 0,
      shipping: params.shipping || 0,
      items: params.items.map((item, index) => ({
        item_id: item.productId,
        item_name: item.productTitle,
        item_variant: item.variantTitle || item.variantId,
        price: item.price,
        quantity: item.quantity,
        index,
      })),
    });
  },
};

/**
 * Send event to Google Analytics 4 via gtag
 */
function sendGA4Event(eventName: string, params: Record<string, unknown>) {
  try {
    // Check if gtag is available (loaded via cookie consent)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
    }
  } catch (err) {
    console.error('[EcommerceTracking] GA4 event error:', err);
  }
}
