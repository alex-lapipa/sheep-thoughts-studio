import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ExternalLink, CheckCircle, Info } from 'lucide-react';

const podProviders = [
  {
    name: 'Printful',
    logo: '🖨️',
    description: 'High-quality print-on-demand and dropshipping',
    shopifyAppUrl: 'https://apps.shopify.com/printful',
    features: ['Auto-fulfillment', 'Global shipping', '300+ products'],
  },
  {
    name: 'Printify',
    logo: '🎨',
    description: 'Global print network with 800+ products',
    shopifyAppUrl: 'https://apps.shopify.com/printify',
    features: ['Print provider choice', 'Mockup generator', 'Auto-routing'],
  },
  {
    name: 'Gelato',
    logo: '🌍',
    description: 'Local production in 32+ countries',
    shopifyAppUrl: 'https://apps.shopify.com/gelato',
    features: ['Local production', 'Eco-friendly', 'Fast delivery'],
  },
];

export default function PODConnections() {
  const handleOpenShopifyAdmin = () => {
    window.open('https://admin.shopify.com/store/bubblesheet-storefront-ops-o5m9w/settings/apps', '_blank');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">POD Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Print-on-demand providers are managed through Shopify's native app integrations
          </p>
        </div>

        {/* Info Banner */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Info className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">POD apps connect directly to Shopify</p>
                <p className="text-sm text-muted-foreground">
                  Install and manage POD providers from the Shopify App Store. Once connected, 
                  orders automatically sync for fulfillment. Variant mappings in this admin 
                  link your Shopify products to POD catalog items.
                </p>
                <Button onClick={handleOpenShopifyAdmin} className="mt-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Shopify Apps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POD Provider Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {podProviders.map((provider) => (
            <Card key={provider.name} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.logo}</span>
                  <div>
                    <CardTitle>{provider.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      <Package className="h-3 w-3 mr-1" />
                      Shopify App
                    </Badge>
                  </div>
                </div>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-1">
                    {provider.features.map((feature) => (
                      <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(provider.shopifyAppUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in App Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workflow Info */}
        <Card>
          <CardHeader>
            <CardTitle>How POD Integration Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Install POD app</strong> — Add Printful, Printify, or Gelato from the Shopify App Store
              </li>
              <li>
                <strong className="text-foreground">Connect your account</strong> — Authorize the app to access your Shopify store
              </li>
              <li>
                <strong className="text-foreground">Create products in POD</strong> — Design products in the POD dashboard
              </li>
              <li>
                <strong className="text-foreground">Sync to Shopify</strong> — POD products automatically create/update Shopify listings
              </li>
              <li>
                <strong className="text-foreground">Map variants</strong> — Use the <a href="/admin/pod/variant-mappings" className="text-accent hover:underline">Variant Mappings</a> page to track which Shopify variants map to POD items
              </li>
              <li>
                <strong className="text-foreground">Orders auto-fulfill</strong> — When customers order, POD receives and fulfills automatically
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}