import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Store, CheckCircle, RefreshCw, ExternalLink, Shield, Clock, Webhook, Trash2 } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { SyncStatusDashboard } from '@/components/admin/SyncStatusDashboard';
import { useShopifyIntegrations } from '@/hooks/useShopifyIntegrations';
import { Skeleton } from '@/components/ui/skeleton';

interface WebhookStatus {
  registered: number;
  topics: string[];
  endpoint: string | null;
}

export default function ShopifySettings() {
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);
  const [registeringWebhooks, setRegisteringWebhooks] = useState(false);
  const [unregisteringWebhooks, setUnregisteringWebhooks] = useState(false);
  const { log } = useAuditLog();
  
  // Use the hook to get live connection data from Shopify API
  const { 
    store,
    connection,
    isLoading, 
    refetch,
    fetchSyncStatus, 
    fetchAnalytics 
  } = useShopifyIntegrations();

  const isConnected = connection?.isConnected ?? false;
  const storeDomain = store?.domain ?? '';
  const storeName = store?.name ?? '';
  const apiVersion = connection?.apiVersion ?? '';
  const scopes = connection?.scopes ?? [];
  const storePlan = store?.plan ?? '';

  useEffect(() => {
    if (isConnected) {
      fetchWebhookStatus();
    }
  }, [isConnected]);

  async function fetchWebhookStatus() {
    try {
      const { data, error } = await supabase.functions.invoke('register-shopify-webhooks', {
        body: { action: 'list' },
      });

      if (error) throw error;

      if (data.success && data.webhooks) {
        const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-webhook-processor`;
        const registeredWebhooks = data.webhooks.filter(
          (w: { address: string }) => w.address === endpoint
        );
        setWebhookStatus({
          registered: registeredWebhooks.length,
          topics: registeredWebhooks.map((w: { topic: string }) => w.topic),
          endpoint,
        });
      }
    } catch (error) {
      console.error('Error fetching webhook status:', error);
    }
  }

  async function handleRegisterWebhooks() {
    setRegisteringWebhooks(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-shopify-webhooks', {
        body: { action: 'register' },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Webhooks registered: ${data.summary.created} created, ${data.summary.existing} already existed`);
        await log({
          action: 'register_webhooks',
          entityType: 'shopify_webhooks',
          metadata: data.summary,
        });
        fetchWebhookStatus();
      } else {
        toast.error(data.error || 'Failed to register webhooks');
      }
    } catch (error) {
      console.error('Webhook registration failed:', error);
      toast.error('Failed to register webhooks');
    } finally {
      setRegisteringWebhooks(false);
    }
  }

  async function handleUnregisterWebhooks() {
    setUnregisteringWebhooks(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-shopify-webhooks', {
        body: { action: 'unregister' },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`${data.deleted} webhooks unregistered`);
        await log({
          action: 'unregister_webhooks',
          entityType: 'shopify_webhooks',
          metadata: { deleted: data.deleted },
        });
        fetchWebhookStatus();
      } else {
        toast.error(data.error || 'Failed to unregister webhooks');
      }
    } catch (error) {
      console.error('Webhook unregistration failed:', error);
      toast.error('Failed to unregister webhooks');
    } finally {
      setUnregisteringWebhooks(false);
    }
  }

  async function handleRefresh() {
    await refetch();
    if (isConnected) {
      await fetchWebhookStatus();
    }
    toast.success('Connection status refreshed');
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Shopify Connection</h1>
            <p className="text-muted-foreground mt-1">
              Manage your Shopify Admin API connection and settings
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-affirmative" />
                <div>
                  <p className="font-medium">Connected to {storeName}</p>
                  <p className="text-sm text-muted-foreground">{storeDomain}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">API v{apiVersion}</Badge>
                  <Badge variant="secondary">{storePlan}</Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <a 
                  href={`https://${storeDomain}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Shopify Admin
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scopes */}
        {scopes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                API Scopes
              </CardTitle>
              <CardDescription>
                Permissions granted to this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {scopes.map((scope) => (
                  <Badge key={scope} variant="secondary">
                    {scope}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Registration
            </CardTitle>
            <CardDescription>
              Register webhooks with Shopify to receive live product update notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhookStatus && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Registered Webhooks</span>
                    <Badge variant={webhookStatus.registered > 0 ? 'default' : 'secondary'}>
                      {webhookStatus.registered} active
                    </Badge>
                  </div>
                  {webhookStatus.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {webhookStatus.topics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {webhookStatus.endpoint && (
                    <div className="text-xs text-muted-foreground truncate">
                      Endpoint: {webhookStatus.endpoint}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleRegisterWebhooks} 
                  disabled={registeringWebhooks}
                >
                  {registeringWebhooks ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Webhook className="h-4 w-4 mr-2" />
                  )}
                  Register Webhooks
                </Button>
                
                {webhookStatus && webhookStatus.registered > 0 && (
                  <Button 
                    variant="outline"
                    onClick={handleUnregisterWebhooks} 
                    disabled={unregisteringWebhooks}
                  >
                    {unregisteringWebhooks ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Unregister All
                  </Button>
                )}
                
                <Button variant="outline" asChild>
                  <a href="/admin/shopify/webhooks">
                    <Clock className="h-4 w-4 mr-2" />
                    View Events
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Status Dashboard */}
        <SyncStatusDashboard 
          fetchSyncStatus={fetchSyncStatus} 
          fetchAnalytics={fetchAnalytics} 
        />
      </div>
    </AdminLayout>
  );
}