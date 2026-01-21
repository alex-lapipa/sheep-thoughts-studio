import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  ExternalLink,
  MapPin,
  Package,
  CreditCard,
  Image
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Exception {
  id: string;
  type: 'address_issue' | 'pod_failure' | 'unmapped_variant' | 'missing_print_file' | 'payment_issue' | 'inventory_issue' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  severity: number;
  title: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  shopify_order_id: string | null;
  suggested_action: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

const typeConfig = {
  address_issue: { icon: MapPin, label: 'Address Issue', color: 'text-yellow-600' },
  pod_failure: { icon: XCircle, label: 'POD Failure', color: 'text-red-600' },
  unmapped_variant: { icon: Package, label: 'Unmapped Variant', color: 'text-orange-600' },
  missing_print_file: { icon: Image, label: 'Missing Print File', color: 'text-purple-600' },
  payment_issue: { icon: CreditCard, label: 'Payment Issue', color: 'text-red-600' },
  inventory_issue: { icon: Package, label: 'Inventory Issue', color: 'text-blue-600' },
  other: { icon: AlertTriangle, label: 'Other', color: 'text-gray-600' },
};

const statusConfig = {
  open: { color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  in_progress: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  resolved: { color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  ignored: { color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
};

const severityLabels = ['', 'Low', 'Medium', 'High', 'Critical'];
const severityColors = ['', 'text-gray-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];

export default function ExceptionsPage() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedExc, setSelectedExc] = useState<Exception | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchExceptions();
  }, [filterStatus, filterType]);

  async function fetchExceptions() {
    try {
      let query = supabase
        .from('exceptions_queue')
        .select('*')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }
      if (filterType !== 'all') {
        query = query.eq('type', filterType as any);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setExceptions((data || []) as Exception[]);
    } catch (error) {
      console.error('Error fetching exceptions:', error);
      toast.error('Failed to fetch exceptions');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(exc: Exception, newStatus: string) {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id;
      }
      if (notes) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('exceptions_queue')
        .update(updates)
        .eq('id', exc.id);

      if (error) throw error;

      await log({
        action: 'update_exception',
        entityType: 'exception',
        entityId: exc.id,
        afterData: updates,
      });

      toast.success(`Exception marked as ${newStatus}`);
      setSelectedExc(null);
      setNotes('');
      fetchExceptions();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update exception');
    }
  }

  async function handleAssignToMe(exc: Exception) {
    try {
      const { error } = await supabase
        .from('exceptions_queue')
        .update({ 
          assigned_to: user?.id,
          status: 'in_progress'
        })
        .eq('id', exc.id);

      if (error) throw error;

      await log({
        action: 'assign_exception',
        entityType: 'exception',
        entityId: exc.id,
        metadata: { assigned_to: user?.id },
      });

      toast.success('Assigned to you');
      fetchExceptions();
    } catch (error) {
      console.error('Assignment failed:', error);
      toast.error('Failed to assign');
    }
  }

  // Stats
  const stats = {
    open: exceptions.filter(e => e.status === 'open').length,
    inProgress: exceptions.filter(e => e.status === 'in_progress').length,
    critical: exceptions.filter(e => e.severity >= 3 && e.status === 'open').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Exceptions Queue</h1>
            <p className="text-muted-foreground mt-1">
              Handle order issues and POD failures
            </p>
          </div>
          <Button variant="outline" onClick={() => fetchExceptions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={stats.open > 0 ? 'border-red-500/50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card className={stats.critical > 0 ? 'border-red-600' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exceptions List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : exceptions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="font-medium">All clear!</p>
                <p className="text-sm">No exceptions to handle</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {exceptions.map((exc) => {
              const TypeIcon = typeConfig[exc.type]?.icon || AlertTriangle;
              const typeInfo = typeConfig[exc.type] || typeConfig.other;

              return (
                <Card key={exc.id} className={exc.severity >= 3 ? 'border-red-500/50' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-secondary ${typeInfo.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{exc.title}</h3>
                          <Badge variant="outline" className={statusConfig[exc.status].color}>
                            {exc.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={severityColors[exc.severity]}>
                            {severityLabels[exc.severity]}
                          </Badge>
                        </div>
                        {exc.description && (
                          <p className="text-sm text-muted-foreground mb-2">{exc.description}</p>
                        )}
                        {exc.suggested_action && (
                          <div className="bg-secondary/50 p-2 rounded text-sm mb-2">
                            <strong>Suggested:</strong> {exc.suggested_action}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(exc.created_at), { addSuffix: true })}
                          </span>
                          {exc.assigned_to && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Assigned
                            </span>
                          )}
                          {exc.shopify_order_id && (
                            <span>Order: {exc.shopify_order_id.slice(0, 8)}...</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exc.status === 'open' && !exc.assigned_to && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAssignToMe(exc)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Take
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedExc(exc)}
                            >
                              Handle
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Handle Exception</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="font-medium">{exc.title}</p>
                                <p className="text-sm text-muted-foreground">{exc.description}</p>
                              </div>
                              {exc.suggested_action && (
                                <div className="bg-secondary p-3 rounded-lg">
                                  <p className="text-sm font-medium">Suggested Action</p>
                                  <p className="text-sm">{exc.suggested_action}</p>
                                </div>
                              )}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                  placeholder="Add resolution notes..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(exc, 'ignored')}
                                >
                                  Ignore
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(exc, 'in_progress')}
                                >
                                  In Progress
                                </Button>
                                <Button onClick={() => handleUpdateStatus(exc, 'resolved')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolve
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
