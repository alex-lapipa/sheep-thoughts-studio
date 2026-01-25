import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
import { Package, Search, RefreshCw, ExternalLink, Tag, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProductsPage() {
  // Fetch up to 100 products for the admin catalog view
  const { data: products = [], isLoading: loading, refetch } = useProducts(undefined, 100);
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.node?.title?.toLowerCase().includes(searchLower) ||
      p.node?.handle?.toLowerCase().includes(searchLower) ||
      p.node?.productType?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: products.length,
    active: products.filter((p: any) => p.node?.availableForSale).length,
    outOfStock: products.filter((p: any) => !p.node?.availableForSale).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="products-catalog" className="font-display text-3xl font-bold">Products Catalog</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your Shopify product catalog
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-affirmative">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-affirmative">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{stats.outOfStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card id="product-filters">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products found</p>
                <p className="text-sm">Products will appear here when synced from Shopify</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((item: any) => {
                    const product = item.node;
                    const hasComparePrice = product?.compareAtPriceRange?.minVariantPrice?.amount > 0;
                    return (
                      <TableRow key={product?.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product?.images?.edges?.[0]?.node?.url && (
                              <img 
                                src={product.images.edges[0].node.url} 
                                alt={product?.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{product?.title}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {product?.handle}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {product?.vendor || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {product?.productType && (
                            <Badge variant="outline">
                              <Tag className="h-3 w-3 mr-1" />
                              {product.productType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>{product?.priceRange?.minVariantPrice?.amount || '—'}</span>
                            {hasComparePrice && (
                              <span className="text-xs text-muted-foreground line-through ml-1">
                                {product.compareAtPriceRange.minVariantPrice.amount}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={product?.availableForSale 
                              ? 'bg-affirmative/10 text-affirmative' 
                              : 'bg-muted text-muted-foreground'
                            }
                          >
                            {product?.availableForSale ? 'Active' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product?.variants?.edges?.length || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
