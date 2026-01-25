import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Webhook, RefreshCw, Eye, RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Unplug, Plug } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WebhookEvent {
  id: string;
  topic: string;
  status: 'pending' | 'processed' | 'failed' | 'retrying';
  payload: unknown;
  error_message: string | null;
  attempts: number;
  created_at: string;
  processed_at: string | null;
}

interface RegisteredWebhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  format: string;
}

interface WebhookRegistrationStatus {
  registered: number;
  topics: string[];
  endpoint: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-warning/10 text-warning border-warning/20' },
  processed: { icon: CheckCircle, color: 'bg-affirmative/10 text-affirmative border-affirmative/20' },
  failed: { icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  retrying: { icon: RefreshCw, color: 'bg-primary/10 text-primary border-primary/20' },
};

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [registeredWebhooks, setRegisteredWebhooks] = useState<RegisteredWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchEvents();
    fetchRegisteredWebhooks();
  }, [filterStatus, filterTopic]);

  async function fetchEvents() {
    try {
      let query = supabase
        .from('shopify_webhooks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }
      if (filterTopic !== 'all') {
        query = query.eq('topic', filterTopic);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents((data || []) as WebhookEvent[]);
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      toast.error('Failed to fetch webhook events');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRegisteredWebhooks() {
    try {
      const { data, error } = await supabase.functions.invoke('register-shopify-webhooks', {
        body: { action: 'list' },
      });

      if (error) throw error;
      setRegisteredWebhooks(data?.webhooks || []);
    } catch (error) {
      console.error('Error fetching registered webhooks:', error);
    }
  }

  async function handleRegisterWebhooks() {
    setRegistrationLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-shopify-webhooks', {
        body: { action: 'register' },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Webhooks registered: ${data.summary.created} new, ${data.summary.existing} existing`);
        fetchRegisteredWebhooks();
      } else {
        toast.error('Some webhooks failed to register');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register webhooks');
    } finally {
      setRegistrationLoading(false);
    }
  }

  async function handleUnregisterWebhooks() {
    setRegistrationLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-shopify-webhooks', {
        body: { action: 'unregister' },
      });

      if (error) throw error;

      toast.success(`Unregistered ${data.deleted} webhooks`);
      fetchRegisteredWebhooks();
    } catch (error) {
      console.error('Unregistration failed:', error);
      toast.error('Failed to unregister webhooks');
    } finally {
      setRegistrationLoading(false);
    }
  }

  async function handleRetry(eventId: string) {
    setRetrying(eventId);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-webhook-processor', {
        body: { action: 'retry', eventId },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Webhook reprocessed successfully');
        fetchEvents();
      } else {
        toast.error(data.error || 'Retry failed');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      toast.error('Failed to retry webhook');
    } finally {
      setRetrying(null);
    }
  }

  const topics = [...new Set(events.map(e => e.topic))];

  // Stats
  const stats = {
    total: events.length,
    processed: events.filter(e => e.status === 'processed').length,
    failed: events.filter(e => e.status === 'failed').length,
    pending: events.filter(e => e.status === 'pending' || e.status === 'retrying').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Webhook Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage Shopify webhook integrations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={registeredWebhooks.length > 0 ? 'bg-affirmative/10 text-affirmative' : 'bg-warning/10 text-warning'}>
              {registeredWebhooks.length} webhooks registered
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Registration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Last 100 events</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-affirmative">Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-affirmative">{stats.processed}</div>
                  <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}% success rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-destructive">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-warning">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">In queue</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="retrying">Retrying</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Topic:</span>
                    <Select value={filterTopic} onValueChange={setFilterTopic}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        {topics.map(topic => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fetchEvents()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Events Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No webhook events found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => {
                        const StatusIcon = statusConfig[event.status].icon;
                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-mono text-sm">{event.topic}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusConfig[event.status].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{event.attempts}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setSelectedEvent(event)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Webhook Event Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium">Topic</p>
                                          <p className="font-mono text-sm">{event.topic}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Status</p>
                                          <Badge variant="outline" className={statusConfig[event.status].color}>
                                            {event.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      {event.error_message && (
                                        <div>
                                          <p className="text-sm font-medium text-destructive">Error</p>
                                          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                            {event.error_message}
                                          </p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium mb-2">Payload</p>
                                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                                          {JSON.stringify(event.payload, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {event.status === 'failed' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRetry(event.id)}
                                    disabled={retrying === event.id}
                                  >
                                    {retrying === event.id ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
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

          <TabsContent value="registration" className="space-y-6 mt-6">
            {/* Registration Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Webhook Registration
                </CardTitle>
                <CardDescription>
                  Register or unregister webhooks with Shopify to receive real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleRegisterWebhooks}
                    disabled={registrationLoading}
                  >
                    {registrationLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plug className="h-4 w-4 mr-2" />
                    )}
                    Register Webhooks
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleUnregisterWebhooks}
                    disabled={registrationLoading || registeredWebhooks.length === 0}
                  >
                    {registrationLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Unplug className="h-4 w-4 mr-2" />
                    )}
                    Unregister All
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={fetchRegisteredWebhooks}
                    disabled={registrationLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Available webhook topics:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Products: create, update, delete</li>
                    <li>Collections: create, update, delete</li>
                    <li>Inventory: level updates, item updates</li>
                    <li>Variants: in stock, out of stock</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Registered Webhooks Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Registered Webhooks ({registeredWebhooks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {registeredWebhooks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p>No webhooks registered</p>
                    <p className="text-sm">Click "Register Webhooks" to set up real-time sync</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registeredWebhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell className="font-mono text-sm">{webhook.topic}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{webhook.format}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-affirmative/10 text-affirmative border-affirmative/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
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
