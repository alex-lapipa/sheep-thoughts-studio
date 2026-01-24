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

  const fetchStoreInfo = useCallback(async () => {
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

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchIntegrations,
    fetchStoreInfo,
  };
}
