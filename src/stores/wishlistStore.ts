import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct } from '@/lib/shopify';
import { supabase } from '@/integrations/supabase/client';

export interface WishlistItem {
  productId: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  price: { amount: string; currencyCode: string };
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  isSynced: boolean;
  addItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: ShopifyProduct) => void;
  clearWishlist: () => void;
  syncWithCloud: (userId: string) => Promise<void>;
  loadFromCloud: (userId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSynced: false,

      addItem: (product) => {
        const { items } = get();
        const node = product.node;
        
        // Check if already exists
        if (items.some(item => item.productId === node.id)) {
          return;
        }

        const newItem: WishlistItem = {
          productId: node.id,
          handle: node.handle,
          title: node.title,
          imageUrl: node.images?.edges?.[0]?.node?.url || null,
          price: node.priceRange?.minVariantPrice || { amount: '0', currencyCode: 'EUR' },
          addedAt: new Date().toISOString(),
        };

        set({ items: [...items, newItem], isSynced: false });
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ 
          items: items.filter(item => item.productId !== productId),
          isSynced: false 
        });
      },

      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId);
      },

      toggleItem: (product) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.node.id)) {
          removeItem(product.node.id);
        } else {
          addItem(product);
        }
      },

      clearWishlist: () => {
        set({ items: [], isSynced: false });
      },

      syncWithCloud: async (userId) => {
        const { items } = get();
        set({ isLoading: true });
        
        try {
          // Use type assertion for new table
          const { error } = await (supabase as any)
            .from('user_wishlists')
            .upsert({
              user_id: userId,
              items: items,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          if (error) throw error;
          set({ isSynced: true });
        } catch (error) {
          console.error('[Wishlist] Sync failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromCloud: async (userId) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await (supabase as any)
            .from('user_wishlists')
            .select('items')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;
          
          if (data?.items) {
            const cloudItems = data.items as WishlistItem[];
            set({ items: cloudItems, isSynced: true });
          }
        } catch (error) {
          console.error('[Wishlist] Load from cloud failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'bubbles-wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
