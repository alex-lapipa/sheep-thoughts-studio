import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Store, CheckCircle, XCircle, RefreshCw, ExternalLink, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';

interface ShopifySettingsData {
  id: string;
  store_domain: string;
  api_version: string;
  default_location_id: string | null;
  scopes: string[] | null;
  last_api_call: string | null;
  last_api_status: string | null;
  is_connected: boolean;
}

export default function ShopifySettings() {
  const [settings, setSettings] = useState<ShopifySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [storeDomain, setStoreDomain] = useState('');
  const { log } = useAuditLog();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('shopify_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
        setStoreDomain(data.store_domain);
      }
    } catch (error) {
      console.error('Error fetching Shopify settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-admin', {
        body: { action: 'test_connection' },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Connection successful!');
        await log({
          action: 'test_connection',
          entityType: 'shopify_settings',
          metadata: { success: true },
        });
        fetchSettings();
      } else {
        toast.error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  }

  async function handleStartOAuth() {
    try {
      const { data, error } = await supabase.functions.invoke('shopify-oauth', {
        body: { action: 'start', storeDomain },
      });

      if (error) throw error;

      if (data.authUrl) {
        await log({
          action: 'start_oauth',
          entityType: 'shopify_settings',
          metadata: { store_domain: storeDomain },
        });
        window.location.href = data.authUrl;
      } else {
        toast.error('Failed to start OAuth flow');
      }
    } catch (error) {
      console.error('OAuth start failed:', error);
      toast.error('Failed to start OAuth flow');
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Shopify Connection</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Shopify Admin API connection and settings
          </p>
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
            {settings?.is_connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-muted-foreground">{settings.store_domain}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    API v{settings.api_version}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Last API Call</p>
                    <p className="text-sm font-medium">
                      {settings.last_api_call 
                        ? new Date(settings.last_api_call).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={settings.last_api_status === 'success' ? 'default' : 'destructive'}>
                      {settings.last_api_status || 'Unknown'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleTestConnection} disabled={testing}>
                    {testing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  <a 
                    href={`https://${settings.store_domain}/admin`}
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
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Not Connected</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your Shopify store to enable Admin API features
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You'll need to create a Shopify app and configure OAuth credentials to connect.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="store">Store Domain</Label>
                    <Input
                      id="store"
                      placeholder="your-store.myshopify.com"
                      value={storeDomain}
                      onChange={(e) => setStoreDomain(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleStartOAuth} disabled={!storeDomain}>
                    <Store className="h-4 w-4 mr-2" />
                    Connect with OAuth
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scopes */}
        {settings?.is_connected && settings.scopes && (
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
                {settings.scopes.map((scope) => (
                  <Badge key={scope} variant="secondary">
                    {scope}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Required Scopes Info */}
        <Card>
          <CardHeader>
            <CardTitle>Required Scopes</CardTitle>
            <CardDescription>
              Your Shopify app needs these scopes for full functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'read_products', 'write_products',
                'read_orders', 'write_orders',
                'read_inventory', 'write_inventory',
                'read_fulfillments', 'write_fulfillments',
                'read_locations',
                'read_price_rules', 'write_price_rules',
              ].map((scope) => (
                <Badge key={scope} variant="outline" className="justify-start">
                  {scope}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Webhook Status
            </CardTitle>
            <CardDescription>
              Real-time event notifications from Shopify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Webhooks are configured automatically when you connect your store.
              </p>
              <Button variant="outline" asChild>
                <a href="/admin/shopify/webhooks">
                  View Webhook Events
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
