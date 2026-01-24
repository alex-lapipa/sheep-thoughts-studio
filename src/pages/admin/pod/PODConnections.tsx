import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, ExternalLink, CheckCircle, Info, Store, 
  Webhook, RefreshCw, Settings, Truck, Star, BarChart3, 
  MessageSquare, ShoppingBag, Search, Repeat, Activity
} from 'lucide-react';
import { useShopifyIntegrations, InstalledApp } from '@/hooks/useShopifyIntegrations';
import { formatDistanceToNow } from 'date-fns';
import { SyncStatusDashboard } from '@/components/admin/SyncStatusDashboard';

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  pod: {
    icon: <Package className="h-4 w-4" />,
    label: 'Print on Demand',
    description: 'Fulfillment & printing providers',
  },
  marketing: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: 'Marketing',
    description: 'Email, SMS & campaigns',
  },
  reviews: {
    icon: <Star className="h-4 w-4" />,
    label: 'Reviews & UGC',
    description: 'Customer reviews & content',
  },
  shipping: {
    icon: <Truck className="h-4 w-4" />,
    label: 'Shipping',
    description: 'Shipping & tracking',
  },
  analytics: {
    icon: <BarChart3 className="h-4 w-4" />,
    label: 'Analytics',
    description: 'Reporting & attribution',
  },
  'sales-channel': {
    icon: <ShoppingBag className="h-4 w-4" />,
    label: 'Sales Channels',
    description: 'Social & marketplace selling',
  },
  support: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: 'Support',
    description: 'Customer service & chat',
  },
  inventory: {
    icon: <Package className="h-4 w-4" />,
    label: 'Inventory',
    description: 'Stock management',
  },
  subscriptions: {
    icon: <Repeat className="h-4 w-4" />,
    label: 'Subscriptions',
    description: 'Recurring payments',
  },
  upsell: {
    icon: <ShoppingBag className="h-4 w-4" />,
    label: 'Upsells',
    description: 'Cross-sell & upsell',
  },
  seo: {
    icon: <Search className="h-4 w-4" />,
    label: 'SEO',
    description: 'Search optimization',
  },
  other: {
    icon: <Settings className="h-4 w-4" />,
    label: 'Other Apps',
    description: 'Additional integrations',
  },
};

// Available POD apps for discovery
const AVAILABLE_POD_APPS = [
  {
    name: 'Printful',
    logo: '🖨️',
    description: 'Premium print-on-demand with global warehouses',
    appStoreUrl: 'https://apps.shopify.com/printful',
    features: ['Auto-fulfillment', 'Global warehouses', '300+ products', 'White-label'],
  },
  {
    name: 'Printify',
    logo: '🎨',
    description: 'Global print network with 90+ providers',
    appStoreUrl: 'https://apps.shopify.com/printify',
    features: ['800+ products', 'Provider choice', 'Mockup generator', 'Auto-routing'],
  },
  {
    name: 'Gelato',
    logo: '🌍',
    description: 'Local production in 32+ countries',
    appStoreUrl: 'https://apps.shopify.com/gelato',
    features: ['Sustainable', 'Local production', 'Fast delivery', 'API access'],
  },
];

function AppCard({ app }: { app: InstalledApp }) {
  return (
    <Card className="relative overflow-hidden">
      {app.status === 'active' && (
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="bg-affirmative/20 text-affirmative border-affirmative/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{app.logo}</span>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{app.title}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {CATEGORY_CONFIG[app.category]?.label || app.category}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-2">{app.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {app.features.length > 0 && (
            <ul className="space-y-1">
          {app.features.slice(0, 4).map((feature) => (
                <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-affirmative flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
          {app.installedAt && (
            <p className="text-xs text-muted-foreground">
              Installed {formatDistanceToNow(new Date(app.installedAt), { addSuffix: true })}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(app.appStoreUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View in App Store
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AvailableAppCard({ app }: { app: typeof AVAILABLE_POD_APPS[0] }) {
  return (
    <Card className="relative border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl opacity-60">{app.logo}</span>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-muted-foreground">{app.name}</CardTitle>
            <Badge variant="secondary" className="mt-1 text-xs">
              Not Installed
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-2">{app.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <ul className="space-y-1">
            {app.features.map((feature) => (
              <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => window.open(app.appStoreUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Install from App Store
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StoreInfoCard({ store, connection, webhooks }: { 
  store: NonNullable<ReturnType<typeof useShopifyIntegrations>['store']>;
  connection: NonNullable<ReturnType<typeof useShopifyIntegrations>['connection']>;
  webhooks: NonNullable<ReturnType<typeof useShopifyIntegrations>['webhooks']>;
}) {
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-accent" />
            <div>
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>{store.domain}</CardDescription>
            </div>
          </div>
          <Badge variant={connection.isConnected ? 'default' : 'destructive'}>
            {connection.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-medium capitalize">{store.plan || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Currency</p>
            <p className="font-medium">{store.currency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">API Version</p>
            <p className="font-medium">{connection.apiVersion}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Webhook className="h-3 w-3" /> Webhooks
            </p>
            <p className="font-medium">{webhooks.count} active</p>
          </div>
        </div>
        {connection.scopes && connection.scopes.length > 0 && (
          <div className="mt-4">
            <p className="text-muted-foreground text-sm mb-2">API Scopes</p>
            <div className="flex flex-wrap gap-1">
              {connection.scopes.slice(0, 8).map((scope) => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {scope}
                </Badge>
              ))}
              {connection.scopes.length > 8 && (
                <Badge variant="secondary" className="text-xs">
                  +{connection.scopes.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function PODConnections() {
  const { store, connection, apps, webhooks, podProviders, isLoading, error, refetch, fetchSyncStatus, fetchAnalytics } = useShopifyIntegrations();

  const handleOpenShopifyAdmin = () => {
    window.open('https://admin.shopify.com/store/bubblesheet-storefront-ops-o5m9w/settings/apps', '_blank');
  };

  // Group apps by category
  const appsByCategory = apps.reduce((acc, app) => {
    const cat = app.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(app);
    return acc;
  }, {} as Record<string, InstalledApp[]>);

  // Get installed POD apps
  const installedPodApps = apps.filter((app) => app.category === 'pod');
  const availablePodApps = AVAILABLE_POD_APPS.filter(
    (available) => !installedPodApps.some(
      (installed) => installed.title.toLowerCase().includes(available.name.toLowerCase())
    )
  );

  // Get other category apps
  const otherCategories = Object.keys(appsByCategory).filter((cat) => cat !== 'pod');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Shopify Integrations</h1>
            <p className="text-muted-foreground mt-1">
              All installed apps and integrations connected to your Shopify store
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleOpenShopifyAdmin}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Shopify Apps
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Info className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Failed to load integrations</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Store Info */}
            {store && connection && webhooks && (
              <StoreInfoCard store={store} connection={connection} webhooks={webhooks} />
            )}

            {/* Tabs for different sections */}
            <Tabs defaultValue="sync" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
                <TabsTrigger value="sync" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Sync Status</span>
                  <span className="sm:hidden">Sync</span>
                </TabsTrigger>
                <TabsTrigger value="pod" className="gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Print on Demand</span>
                  <span className="sm:hidden">POD</span>
                  {installedPodApps.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{installedPodApps.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <Settings className="h-4 w-4" />
                  All Apps
                  {apps.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{apps.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="gap-2">
                  <Webhook className="h-4 w-4" />
                  Webhooks
                  {webhooks && (
                    <Badge variant="secondary" className="ml-1">{webhooks.count}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="guide" className="gap-2">
                  <Info className="h-4 w-4" />
                  Guide
                </TabsTrigger>
              </TabsList>

              {/* Sync Status Tab */}
              <TabsContent value="sync" className="space-y-6">
                <SyncStatusDashboard 
                  fetchSyncStatus={fetchSyncStatus} 
                  fetchAnalytics={fetchAnalytics} 
                />
              </TabsContent>

              {/* POD Tab */}
              <TabsContent value="pod" className="space-y-6">
                {installedPodApps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-affirmative" />
                      Connected POD Providers
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {installedPodApps.map((app) => (
                        <AppCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>
                )}

                {availablePodApps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                      Available POD Providers
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {availablePodApps.map((app) => (
                        <AvailableAppCard key={app.name} app={app} />
                      ))}
                    </div>
                  </div>
                )}

                {installedPodApps.length === 0 && availablePodApps.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No POD providers detected</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* All Apps Tab */}
              <TabsContent value="all" className="space-y-6">
                {apps.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No installed apps detected</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Install apps from the Shopify App Store to see them here
                      </p>
                      <Button variant="outline" className="mt-4" onClick={handleOpenShopifyAdmin}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Browse App Store
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  Object.entries(appsByCategory).map(([category, categoryApps]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        {CATEGORY_CONFIG[category]?.icon || <Settings className="h-4 w-4" />}
                        {CATEGORY_CONFIG[category]?.label || category}
                        <Badge variant="secondary">{categoryApps.length}</Badge>
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categoryApps.map((app) => (
                          <AppCard key={app.id} app={app} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Webhooks Tab */}
              <TabsContent value="webhooks" className="space-y-4">
                {webhooks && webhooks.topics.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Active Webhooks
                      </CardTitle>
                      <CardDescription>
                        Real-time event notifications from Shopify to your backend
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {webhooks.topics.map((topic) => (
                          <div
                            key={topic}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                          >
                            <CheckCircle className="h-4 w-4 text-affirmative flex-shrink-0" />
                            <code className="text-sm font-mono">{topic}</code>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" asChild>
                          <a href="/admin/shopify/webhooks">
                            View Webhook Events →
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No webhooks configured</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Register webhooks from the Shopify settings
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <a href="/admin/shopify/webhooks">Configure Webhooks</a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Guide Tab */}
              <TabsContent value="guide">
                <Card>
                  <CardHeader>
                    <CardTitle>How Shopify Integrations Work</CardTitle>
                    <CardDescription>
                      Apps and services connect directly to your Shopify store
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-4 text-sm text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Install from App Store</strong>
                        <p className="ml-6 mt-1">
                          Add apps like Printful, Klaviyo, or Judge.me from the Shopify App Store. 
                          They automatically connect to your store.
                        </p>
                      </li>
                      <li>
                        <strong className="text-foreground">Authorize & Configure</strong>
                        <p className="ml-6 mt-1">
                          Each app requests specific permissions (scopes) to access your store data. 
                          Configure settings within the app's dashboard.
                        </p>
                      </li>
                      <li>
                        <strong className="text-foreground">Automatic Sync</strong>
                        <p className="ml-6 mt-1">
                          Apps sync data with Shopify automatically. Products, orders, and customers 
                          stay in sync without manual intervention.
                        </p>
                      </li>
                      <li>
                        <strong className="text-foreground">Webhooks & Events</strong>
                        <p className="ml-6 mt-1">
                          Shopify sends real-time notifications (webhooks) when events occur. 
                          This enables instant order fulfillment, inventory updates, and more.
                        </p>
                      </li>
                      <li>
                        <strong className="text-foreground">POD Fulfillment</strong>
                        <p className="ml-6 mt-1">
                          POD apps receive orders automatically and handle printing, packing, and 
                          shipping. Tracking info syncs back to Shopify orders.
                        </p>
                      </li>
                      <li>
                        <strong className="text-foreground">Variant Mappings</strong>
                        <p className="ml-6 mt-1">
                          Use the{' '}
                          <a href="/admin/pod/variant-mappings" className="text-accent hover:underline">
                            Variant Mappings
                          </a>{' '}
                          page to track which Shopify variants map to POD catalog items.
                        </p>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
