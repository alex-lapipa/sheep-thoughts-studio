import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, CheckCircle, XCircle, RefreshCw, Settings, Link2, AlertTriangle } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { formatDistanceToNow } from 'date-fns';

interface PODProvider {
  id: string;
  provider: 'printful' | 'printify' | 'gelato';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at: string | null;
  last_sync_status: string | null;
  settings: unknown;
}

const providerInfo = {
  printful: {
    name: 'Printful',
    logo: '🖨️',
    description: 'High-quality print-on-demand and dropshipping',
    docsUrl: 'https://developers.printful.com/',
  },
  printify: {
    name: 'Printify',
    logo: '🎨',
    description: 'Global print network with 800+ products',
    docsUrl: 'https://developers.printify.com/',
  },
  gelato: {
    name: 'Gelato',
    logo: '🌍',
    description: 'Local production in 32+ countries',
    docsUrl: 'https://developer.gelato.com/',
  },
};

export default function PODConnections() {
  const [providers, setProviders] = useState<PODProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);
  const { log } = useAuditLog();

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      const { data, error } = await supabase
        .from('pod_providers')
        .select('*')
        .order('provider');

      if (error) throw error;

      // Merge with default providers
      const allProviders: PODProvider[] = (['printful', 'printify', 'gelato'] as const).map(p => {
        const existing = data?.find(d => d.provider === p);
        if (existing) return existing as PODProvider;
        return {
          id: '',
          provider: p,
          name: providerInfo[p].name,
          status: 'disconnected' as const,
          last_sync_at: null,
          last_sync_status: null,
          settings: {},
        };
      });

      setProviders(allProviders);
    } catch (error) {
      console.error('Error fetching POD providers:', error);
      toast.error('Failed to fetch POD providers');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider: string) {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('pod-connect', {
        body: { 
          action: 'connect',
          provider,
          apiKey: apiKey.trim(),
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Connected to ${providerInfo[provider as keyof typeof providerInfo].name}!`);
        await log({
          action: 'connect_pod',
          entityType: 'pod_provider',
          metadata: { provider },
        });
        setConnectingProvider(null);
        setApiKey('');
        fetchProviders();
      } else {
        toast.error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect to provider');
    }
  }

  async function handleDisconnect(provider: PODProvider) {
    if (!confirm(`Are you sure you want to disconnect ${provider.name}?`)) return;

    try {
      const { error } = await supabase
        .from('pod_providers')
        .update({ status: 'disconnected' })
        .eq('id', provider.id);

      if (error) throw error;

      await log({
        action: 'disconnect_pod',
        entityType: 'pod_provider',
        entityId: provider.id,
        metadata: { provider: provider.provider },
      });

      toast.success(`Disconnected from ${provider.name}`);
      fetchProviders();
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect');
    }
  }

  async function handleSync(provider: PODProvider) {
    setSyncing(provider.provider);
    try {
      const { data, error } = await supabase.functions.invoke('pod-connect', {
        body: { 
          action: 'sync',
          provider: provider.provider,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Synced with ${provider.name}`);
        fetchProviders();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync');
    } finally {
      setSyncing(null);
    }
  }

  const statusColors = {
    connected: 'bg-green-500/10 text-green-600 border-green-500/20',
    disconnected: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">POD Connections</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage your print-on-demand providers
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
              const info = providerInfo[provider.provider];
              const isConnected = provider.status === 'connected';

              return (
                <Card key={provider.provider} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{info.logo}</span>
                        <div>
                          <CardTitle>{info.name}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={statusColors[provider.status]}
                          >
                            {provider.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {provider.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                            {provider.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isConnected && (
                        <div className="text-sm text-muted-foreground">
                          {provider.last_sync_at && (
                            <p>Last sync: {formatDistanceToNow(new Date(provider.last_sync_at), { addSuffix: true })}</p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {isConnected ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSync(provider)}
                              disabled={syncing === provider.provider}
                            >
                              {syncing === provider.provider ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Sync Now
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDisconnect(provider)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Dialog 
                            open={connectingProvider === provider.provider}
                            onOpenChange={(open) => {
                              setConnectingProvider(open ? provider.provider : null);
                              if (!open) setApiKey('');
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Link2 className="h-4 w-4 mr-2" />
                                Connect
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Connect to {info.name}</DialogTitle>
                                <DialogDescription>
                                  Enter your API key to connect. Your key is stored securely.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="api-key">API Key</Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="Enter your API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                  />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <a 
                                    href={info.docsUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline"
                                  >
                                    Get your API key from {info.name} →
                                  </a>
                                </p>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setConnectingProvider(null);
                                      setApiKey('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={() => handleConnect(provider.provider)}>
                                    Connect
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Integration Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>API keys are stored securely and never exposed in the browser</li>
              <li>Each provider requires separate API credentials from their dashboard</li>
              <li>Sync operations pull product templates and catalog data</li>
              <li>Webhooks are configured automatically for order status updates</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
