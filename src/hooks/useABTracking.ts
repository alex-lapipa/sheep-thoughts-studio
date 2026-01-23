import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import type { Json } from '@/integrations/supabase/types';

const SESSION_KEY = 'ab_session_id';
const VARIANT_TRACKED_KEY = 'ab_variant_tracked';

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useABTracking() {
  const { flags } = useFeatureFlags();
  const hasTrackedVariant = useRef(false);
  const sessionId = useRef(getOrCreateSessionId());

  const variant = flags.simplifiedHomepage ? 'simplified' : 'full';

  // Track variant view once per session
  useEffect(() => {
    const alreadyTracked = sessionStorage.getItem(VARIANT_TRACKED_KEY);
    if (alreadyTracked || hasTrackedVariant.current) return;

    hasTrackedVariant.current = true;
    sessionStorage.setItem(VARIANT_TRACKED_KEY, variant);

    supabase
      .from('ab_test_events')
      .insert([{
        session_id: sessionId.current,
        variant,
        test_name: 'homepage_layout',
        event_type: 'view',
      }])
      .then(({ error }) => {
        if (error) console.error('Failed to track AB variant view:', error);
      });
  }, [variant]);

  // Track conversion events
  const trackEvent = useCallback((eventType: string, metadata?: Record<string, string | number | boolean>) => {
    const trackedVariant = sessionStorage.getItem(VARIANT_TRACKED_KEY);
    if (!trackedVariant) return;

    supabase
      .from('ab_test_events')
      .insert([{
        session_id: sessionId.current,
        variant: trackedVariant,
        test_name: 'homepage_layout',
        event_type: eventType,
        metadata: (metadata || {}) as Json,
      }])
      .then(({ error }) => {
        if (error) console.error('Failed to track AB event:', error);
      });
  }, []);

  return { variant, sessionId: sessionId.current, trackEvent };
}

// Convenience hook for product events
export function useABProductTracking() {
  const { trackEvent } = useABTracking();

  return {
    trackProductView: (productId: string, productTitle: string) => 
      trackEvent('product_view', { productId, productTitle }),
    trackAddToCart: (productId: string, productTitle: string, price: number) => 
      trackEvent('add_to_cart', { productId, productTitle, price }),
    trackCheckoutStart: () => 
      trackEvent('checkout_start'),
    trackPurchase: (orderId: string, total: number) => 
      trackEvent('purchase', { orderId, total }),
  };
}
