import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InstalledApp {
  id: string;
  title: string;
  installed: boolean;
  installedAt?: string;
  category: string;
  logo: string;
  description: string;
  features: string[];
  appStoreUrl: string;
  status: 'active' | 'inactive' | 'unknown';
}

export interface StoreInfo {
  name: string;
  domain: string;
  email: string;
  plan: string;
  currency: string;
  timezone: string;
}

export interface DetailedStoreInfo extends StoreInfo {
  id?: number;
  myshopifyDomain?: string;
  primaryDomain?: string;
  planDisplayName?: string;
  country?: string;
  countryCode?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  checkoutApiSupported?: boolean;
  multiLocationEnabled?: boolean;
  setupRequired?: boolean;
  preLaunchEnabled?: boolean;
  passwordEnabled?: boolean;
  eligibleForPayments?: boolean;
  hasStorefront?: boolean;
  hasDiscounts?: boolean;
  hasGiftCards?: boolean;
}

export interface ConnectionInfo {
  isConnected: boolean;
  scopes: string[];
  apiVersion: string;
}

export interface WebhooksInfo {
  count: number;
  topics: string[];
}

export interface PodProviderStatus {
  printful: boolean;
  printify: boolean;
  gelato: boolean;
  other: string[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  totalInventory: number;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string;
        price: { amount: string; currencyCode: string };
        availableForSale: boolean;
        inventoryQuantity: number;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options: Array<{ name: string; values: string[] }>;
}

export interface ShopifyOrder {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: { edges: Array<{ node: { title: string; quantity: number } }> };
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
    country: string;
  } | null;
}

export interface SyncStatus {
  shopify: {
    connected: boolean;
    apiVersion: string;
    webhooksActive: number;
    productCount: number;
    orderCount: number;
  };
  pod: {
    providers: Array<{ provider: string; status: string; last_sync_at: string | null }>;
  };
  mappings: {
    total: number;
    byStatus: Record<string, number>;
  };
  lastChecked: string;
}

export interface ShopifyAnalytics {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  fulfillmentStats: Record<string, number>;
  financialStats: Record<string, number>;
}

export interface ShopifyIntegrationsData {
  store: StoreInfo | null;
  connection: ConnectionInfo | null;
  apps: InstalledApp[];
  webhooks: WebhooksInfo | null;
  podProviders: PodProviderStatus | null;
}

export function useShopifyIntegrations() {
  const [data, setData] = useState<ShopifyIntegrationsData>({
    store: null,
    connection: null,
    apps: [],
    webhooks: null,
    podProviders: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'list' } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        setData({
          store: response.store,
          connection: response.connection,
          apps: response.apps || [],
          webhooks: response.webhooks,
          podProviders: response.podProviders,
        });
      } else {
        throw new Error(response?.error || 'Failed to fetch integrations');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch integrations';
      setError(message);
      toast.error('Failed to load Shopify integrations', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStoreInfo = useCallback(async (): Promise<DetailedStoreInfo | null> => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'store_info' } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return response.store;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch store info:', err);
      return null;
    }
  }, []);

  const fetchProducts = useCallback(async (options?: { 
    first?: number; 
    query?: string; 
    after?: string | null 
  }): Promise<{ products: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } | null> => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'products', ...options } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return {
          products: response.products,
          pageInfo: response.pageInfo,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      return null;
    }
  }, []);

  const fetchOrders = useCallback(async (options?: { 
    first?: number; 
    query?: string; 
    after?: string | null 
  }): Promise<{ orders: ShopifyOrder[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } | null> => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'orders', ...options } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return {
          orders: response.orders,
          pageInfo: response.pageInfo,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      return null;
    }
  }, []);

  const fetchStorefrontProducts = useCallback(async (options?: { 
    first?: number; 
    query?: string; 
    after?: string | null 
  }) => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'storefront_products', ...options } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return {
          products: response.products,
          pageInfo: response.pageInfo,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch storefront products:', err);
      return null;
    }
  }, []);

  const fetchCollections = useCallback(async (first = 50) => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'collections', first } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return response.collections;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      return null;
    }
  }, []);

  const fetchInventory = useCallback(async (locationId?: string) => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'inventory', locationId } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return {
          locations: response.locations,
          inventory: response.inventory,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      return null;
    }
  }, []);

  const fetchAnalytics = useCallback(async (days = 30): Promise<ShopifyAnalytics | null> => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'analytics', days } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return response.analytics;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      return null;
    }
  }, []);

  const fetchSyncStatus = useCallback(async (): Promise<SyncStatus | null> => {
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke(
        'shopify-integrations',
        { body: { action: 'sync_status' } }
      );

      if (invokeError) throw invokeError;

      if (response?.success) {
        return response.syncStatus;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchIntegrations,
    fetchStoreInfo,
    fetchProducts,
    fetchOrders,
    fetchStorefrontProducts,
    fetchCollections,
    fetchInventory,
    fetchAnalytics,
    fetchSyncStatus,
  };
}
