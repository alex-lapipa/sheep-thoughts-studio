import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ListOrdered
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

const statusConfig = {
  not_sent: { icon: Clock, color: 'bg-gray-500/10 text-gray-600', label: 'Not Sent' },
  queued: { icon: Send, color: 'bg-blue-500/10 text-blue-600', label: 'Queued' },
  in_production: { icon: Package, color: 'bg-yellow-500/10 text-yellow-600', label: 'In Production' },
  shipped: { icon: Truck, color: 'bg-purple-500/10 text-purple-600', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600', label: 'Delivered' },
  error: { icon: XCircle, color: 'bg-red-500/10 text-red-600', label: 'Error' },
  cancelled: { icon: XCircle, color: 'bg-gray-500/10 text-gray-600', label: 'Cancelled' },
};

export default function OrdersPage() {
  const [jobs, setJobs] = useState<PODJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [sendingToPod, setSendingToPod] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [filterStatus, filterProvider]);

  async function fetchJobs() {
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
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

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

  const filteredJobs = jobs.filter(j => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      j.shopify_order_name?.toLowerCase().includes(searchLower) ||
      j.shopify_order_id.toLowerCase().includes(searchLower) ||
      j.tracking_number?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'not_sent' || j.status === 'queued').length,
    inProduction: jobs.filter(j => j.status === 'in_production').length,
    shipped: jobs.filter(j => j.status === 'shipped' || j.status === 'delivered').length,
    errors: jobs.filter(j => j.status === 'error').length,
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
            <TabsTrigger value="orders" className="gap-2">
              <ListOrdered className="h-4 w-4" />
              POD Orders
              {stats.errors > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {stats.errors}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <StoreAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600">In Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProduction}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Shipped/Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.shipped}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
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

            {/* Orders Table */}
            <Card>
              <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No POD jobs found</p>
                <p className="text-sm">Orders will appear here when synced from Shopify</p>
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
                    const StatusIcon = statusConfig[job.status].icon;

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
                            className={statusConfig[job.status].color}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[job.status].label}
                          </Badge>
                          {job.error_message && (
                            <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate">
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
                                  <Send className="h-4 w-4" />
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
