import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Package, 
  Truck, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  BarChart3,
  ListOrdered,
  Store,
  Plus,
  Eye,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { StoreAnalyticsDashboard } from '@/components/admin/StoreAnalyticsDashboard';

interface PODJob {
  id: string;
  shopify_order_id: string;
  shopify_order_name: string | null;
  shopify_line_item_id: string;
  pod_provider: 'printful' | 'printify' | 'gelato';
  pod_order_id: string | null;
  status: 'not_sent' | 'queued' | 'in_production' | 'shipped' | 'delivered' | 'error' | 'cancelled';
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface ShopifyOrder {
  id: number;
  gid: string;
  orderNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  total: string;
  subtotal: string;
  tax: string;
  discounts: string;
  currency: string;
  itemCount: number;
  lineItems: Array<{
    id: string;
    title: string;
    variantTitle: string | null;
    quantity: number;
    price: string;
    productId: number | null;
    variantId: number | null;
    sku: string | null;
  }>;
  shippingAddress: {
    name: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
  customer: {
    id: number;
    email: string;
    name: string;
  } | null;
}

const podStatusConfig = {
  not_sent: { icon: Clock, color: 'bg-muted text-muted-foreground', label: 'Not Sent' },
  queued: { icon: Send, color: 'bg-accent/10 text-accent', label: 'Queued' },
  in_production: { icon: Package, color: 'bg-warning/10 text-warning', label: 'In Production' },
  shipped: { icon: Truck, color: 'bg-accent/10 text-accent', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-affirmative/10 text-affirmative', label: 'Delivered' },
  error: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Error' },
  cancelled: { icon: XCircle, color: 'bg-muted text-muted-foreground', label: 'Cancelled' },
};

const financialStatusColors: Record<string, string> = {
  paid: 'bg-affirmative/10 text-affirmative',
  pending: 'bg-warning/10 text-warning',
  authorized: 'bg-accent/10 text-accent',
  refunded: 'bg-destructive/10 text-destructive',
  partially_refunded: 'bg-warning/10 text-warning',
  voided: 'bg-muted text-muted-foreground',
};

const fulfillmentStatusColors: Record<string, string> = {
  fulfilled: 'bg-affirmative/10 text-affirmative',
  partial: 'bg-warning/10 text-warning',
  unfulfilled: 'bg-muted text-muted-foreground',
  restocked: 'bg-accent/10 text-accent',
};

export default function OrdersPage() {
  // POD Jobs state
  const [jobs, setJobs] = useState<PODJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [sendingToPod, setSendingToPod] = useState<string | null>(null);
  
  // Shopify Orders state
  const [shopifyOrders, setShopifyOrders] = useState<ShopifyOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [creatingJobs, setCreatingJobs] = useState<number | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterFinancialStatus, setFilterFinancialStatus] = useState<string>('all');
  const [filterFulfillmentStatus, setFilterFulfillmentStatus] = useState<string>('all');

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      let query = supabase
        .from('pod_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }
      if (filterProvider !== 'all') {
        query = query.eq('pod_provider', filterProvider as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs((data || []) as PODJob[]);
    } catch (error) {
      console.error('Error fetching POD jobs:', error);
      toast.error('Failed to fetch POD jobs');
    } finally {
      setLoadingJobs(false);
    }
  }, [filterStatus, filterProvider]);

  const fetchShopifyOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-orders', {
        body: { 
          action: 'list',
          first: 50,
          financialStatus: filterFinancialStatus,
          fulfillmentStatus: filterFulfillmentStatus,
        },
      });

      if (error) throw error;
      
      if (data?.success) {
        setShopifyOrders(data.orders || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      toast.error('Failed to fetch Shopify orders');
    } finally {
      setLoadingOrders(false);
    }
  }, [filterFinancialStatus, filterFulfillmentStatus]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchShopifyOrders();
  }, [fetchShopifyOrders]);

  async function handleSendToPod(job: PODJob) {
    setSendingToPod(job.id);
    try {
      const { data, error } = await supabase.functions.invoke('pod-orders', {
        body: { 
          action: 'send_to_pod',
          jobId: job.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Order sent to POD provider');
        fetchJobs();
      } else {
        toast.error(data.error || 'Failed to send order');
      }
    } catch (error) {
      console.error('Send to POD failed:', error);
      toast.error('Failed to send to POD');
    } finally {
      setSendingToPod(null);
    }
  }

  async function handleCreatePodJobs(order: ShopifyOrder) {
    setCreatingJobs(order.id);
    try {
      const { data, error } = await supabase.functions.invoke('manage-orders', {
        body: { 
          action: 'create_pod_jobs',
          orderId: String(order.id),
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || 'POD jobs created');
        fetchJobs();
      } else {
        toast.error(data.error || 'Failed to create POD jobs');
      }
    } catch (error) {
      console.error('Create POD jobs failed:', error);
      toast.error('Failed to create POD jobs');
    } finally {
      setCreatingJobs(null);
    }
  }

  const filteredJobs = jobs.filter(j => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      j.shopify_order_name?.toLowerCase().includes(searchLower) ||
      j.shopify_order_id.toLowerCase().includes(searchLower) ||
      j.tracking_number?.toLowerCase().includes(searchLower)
    );
  });

  const filteredOrders = shopifyOrders.filter(o => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.email?.toLowerCase().includes(searchLower) ||
      o.customer?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const podStats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'not_sent' || j.status === 'queued').length,
    inProduction: jobs.filter(j => j.status === 'in_production').length,
    shipped: jobs.filter(j => j.status === 'shipped' || j.status === 'delivered').length,
    errors: jobs.filter(j => j.status === 'error').length,
  };

  const orderStats = {
    total: shopifyOrders.length,
    paid: shopifyOrders.filter(o => o.financialStatus === 'paid').length,
    pending: shopifyOrders.filter(o => o.financialStatus === 'pending').length,
    fulfilled: shopifyOrders.filter(o => o.fulfillmentStatus === 'fulfilled').length,
    unfulfilled: shopifyOrders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Store Operations</h1>
            <p className="text-muted-foreground mt-1">
              Real-time analytics and order fulfillment tracking
            </p>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="shopify-orders" className="gap-2">
              <Store className="h-4 w-4" />
              Shopify Orders
              {orderStats.unfulfilled > 0 && (
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs bg-warning/10 text-warning">
                  {orderStats.unfulfilled}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pod-orders" className="gap-2">
              <ListOrdered className="h-4 w-4" />
              POD Jobs
              {podStats.errors > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {podStats.errors}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <StoreAnalyticsDashboard />
          </TabsContent>

          {/* Shopify Orders Tab */}
          <TabsContent value="shopify-orders" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-affirmative">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-affirmative">{orderStats.paid}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-warning">Pending Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{orderStats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-affirmative">Fulfilled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-affirmative">{orderStats.fulfilled}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unfulfilled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.unfulfilled}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={filterFinancialStatus} onValueChange={setFilterFinancialStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterFulfillmentStatus} onValueChange={setFilterFulfillmentStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Fulfillment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => fetchShopifyOrders()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardContent className="pt-6">
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found</p>
                    <p className="text-sm">Orders from Shopify will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Fulfillment</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer?.name || 'Guest'}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                {order.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={financialStatusColors[order.financialStatus] || 'bg-muted'}
                            >
                              {order.financialStatus?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={fulfillmentStatusColors[order.fulfillmentStatus] || 'bg-muted'}
                            >
                              {order.fulfillmentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.currency} {parseFloat(order.total).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>Order {order.orderNumber}</DialogTitle>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[60vh]">
                                    <div className="space-y-4 pr-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Customer</p>
                                          <p className="font-medium">{order.customer?.name || 'Guest'}</p>
                                          <p className="text-sm">{order.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Shipping</p>
                                          {order.shippingAddress ? (
                                            <div className="text-sm">
                                              <p>{order.shippingAddress.name}</p>
                                              <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                              <p>{order.shippingAddress.country} {order.shippingAddress.zip}</p>
                                            </div>
                                          ) : (
                                            <p className="text-sm text-muted-foreground">No shipping address</p>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-2">Line Items</p>
                                        <div className="space-y-2">
                                          {order.lineItems.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                                              <div>
                                                <p className="font-medium">{item.title}</p>
                                                {item.variantTitle && (
                                                  <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                  SKU: {item.sku || 'N/A'} • Qty: {item.quantity}
                                                </p>
                                              </div>
                                              <p className="font-medium">
                                                {order.currency} {parseFloat(item.price).toFixed(2)}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="flex justify-between items-center pt-4 border-t">
                                        <p className="font-medium">Total</p>
                                        <p className="text-lg font-bold">
                                          {order.currency} {parseFloat(order.total).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCreatePodJobs(order)}
                                disabled={creatingJobs === order.id}
                              >
                                {creatingJobs === order.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    POD Jobs
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* POD Orders Tab */}
          <TabsContent value="pod-orders" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{podStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-accent">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{podStats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-warning">In Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{podStats.inProduction}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-affirmative">Shipped/Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-affirmative">{podStats.shipped}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-destructive">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{podStats.errors}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by order # or tracking..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not_sent">Not Sent</SelectItem>
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="in_production">In Production</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterProvider} onValueChange={setFilterProvider}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="printful">Printful</SelectItem>
                      <SelectItem value="printify">Printify</SelectItem>
                      <SelectItem value="gelato">Gelato</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => fetchJobs()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* POD Jobs Table */}
            <Card>
              <CardContent className="pt-6">
                {loadingJobs ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No POD jobs found</p>
                    <p className="text-sm">Create POD jobs from Shopify orders</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => {
                        const StatusIcon = podStatusConfig[job.status].icon;

                        return (
                          <TableRow key={job.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{job.shopify_order_name || job.shopify_order_id}</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {job.shopify_line_item_id.slice(0, 8)}...
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {job.pod_provider}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={podStatusConfig[job.status].color}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {podStatusConfig[job.status].label}
                              </Badge>
                              {job.error_message && (
                                <p className="text-xs text-destructive mt-1 max-w-[200px] truncate">
                                  {job.error_message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              {job.tracking_number ? (
                                <div className="space-y-1">
                                  <p className="font-mono text-sm">{job.tracking_number}</p>
                                  {job.tracking_url && (
                                    <a 
                                      href={job.tracking_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                                    >
                                      Track <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {job.status === 'not_sent' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSendToPod(job)}
                                    disabled={sendingToPod === job.id}
                                  >
                                    {sendingToPod === job.id ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 mr-1" />
                                        Send
                                      </>
                                    )}
                                  </Button>
                                )}
                                {job.status === 'error' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSendToPod(job)}
                                    disabled={sendingToPod === job.id}
                                  >
                                    Retry
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
