import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Webhook, RefreshCw, Eye, RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
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

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  processed: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  failed: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  retrying: { icon: RefreshCw, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
};

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
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
        <div>
          <h1 className="font-display text-3xl font-bold">Webhook Events</h1>
          <p className="text-muted-foreground mt-1">
            Monitor incoming Shopify webhook events
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
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
                                      <p className="text-sm font-medium text-red-600">Error</p>
                                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
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
      </div>
    </AdminLayout>
  );
}
