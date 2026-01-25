import { useCallback, useEffect, useState } from "react";

interface RecentlyViewedProduct {
  id: string;
  handle: string;
  title: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
  viewedAt: number;
}

const STORAGE_KEY = "bubbles-recently-viewed";
const MAX_ITEMS = 8;
const EXPIRY_DAYS = 7;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentlyViewedProduct[];
        // Filter out expired items (older than 7 days)
        const cutoff = Date.now() - (EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        const valid = parsed.filter(item => item.viewedAt > cutoff);
        setRecentlyViewed(valid);
        
        // Update storage if we removed expired items
        if (valid.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addProduct = useCallback((product: {
    id: string;
    handle: string;
    title: string;
    price: string;
    currencyCode: string;
    imageUrl: string;
  }) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      
      // Add to front with timestamp
      const newItem: RecentlyViewedProduct = {
        ...product,
        viewedAt: Date.now(),
      };
      
      // Keep only MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  const getRecentlyViewed = useCallback((excludeId?: string) => {
    return recentlyViewed.filter(p => p.id !== excludeId);
  }, [recentlyViewed]);

  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addProduct,
    getRecentlyViewed,
    clearRecentlyViewed,
  };
}
