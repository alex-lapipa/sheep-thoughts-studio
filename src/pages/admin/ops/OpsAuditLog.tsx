import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';

interface OpsAction {
  id: string;
  action_type: string;
  action_title: string;
  action_description: string | null;
  target_resource: string | null;
  target_resource_id: string | null;
  planned_changes: Record<string, unknown>;
  risk_level: string;
  rollback_plan: string | null;
  status: string;
  requested_by: string | null;
  approved_by: string | null;
  executed_at: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  execution_result: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: 'text-warning', icon: Clock },
  approved: { color: 'text-blue-500', icon: CheckCircle2 },
  rejected: { color: 'text-destructive', icon: XCircle },
  executed: { color: 'text-affirmative', icon: CheckCircle2 },
  failed: { color: 'text-destructive', icon: AlertTriangle },
  rolled_back: { color: 'text-orange-500', icon: RotateCcw },
};

const RISK_CONFIG: Record<string, string> = {
  low: 'bg-affirmative/10 text-affirmative',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

export default function OpsAuditLog() {
  const [actions, setActions] = useState<OpsAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<OpsAction | null>(null);

  useEffect(() => {
    loadActions();
  }, []);

  async function loadActions() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ops_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActions((data as OpsAction[]) || []);
    } catch (error) {
      console.error('Failed to load ops actions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredActions = actions.filter(action => {
    const matchesSearch = 
      action.action_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.action_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.target_resource?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  function exportToCSV() {
    const headers = ['Timestamp', 'Title', 'Type', 'Resource', 'Status', 'Risk', 'Description'];
    const rows = filteredActions.map(a => [
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm:ss'),
      a.action_title,
      a.action_type,
      a.target_resource || '-',
      a.status,
      a.risk_level,
      a.action_description || '-',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ops-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Ops Audit Log
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete history of agent actions, approvals, and changes
            </p>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rolled_back">Rolled Back</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions Table */}
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No actions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActions.map((action) => {
                      const statusConfig = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow key={action.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(action.created_at), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{action.action_title}</p>
                              <p className="text-xs text-muted-foreground">{action.action_type}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {action.target_resource || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('gap-1', statusConfig.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {action.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', RISK_CONFIG[action.risk_level])}>
                              {action.risk_level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedAction(action)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{action.action_title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Type</p>
                                      <p className="text-sm text-muted-foreground">{action.action_type}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Status</p>
                                      <Badge variant="outline" className={cn('gap-1', statusConfig.color)}>
                                        <StatusIcon className="h-3 w-3" />
                                        {action.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Risk Level</p>
                                      <Badge className={cn('text-xs', RISK_CONFIG[action.risk_level])}>
                                        {action.risk_level}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Created</p>
                                      <p className="text-sm text-muted-foreground">
                                        {format(new Date(action.created_at), 'PPpp')}
                                      </p>
                                    </div>
                                  </div>

                                  {action.action_description && (
                                    <div>
                                      <p className="text-sm font-medium">Description</p>
                                      <p className="text-sm text-muted-foreground">{action.action_description}</p>
                                    </div>
                                  )}

                                  {action.rollback_plan && (
                                    <div>
                                      <p className="text-sm font-medium">Rollback Plan</p>
                                      <p className="text-sm text-muted-foreground">{action.rollback_plan}</p>
                                    </div>
                                  )}

                                  {action.planned_changes && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Planned Changes</p>
                                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                                        {JSON.stringify(action.planned_changes, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {action.before_snapshot && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Before Snapshot</p>
                                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                        {JSON.stringify(action.before_snapshot, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {action.after_snapshot && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">After Snapshot</p>
                                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                        {JSON.stringify(action.after_snapshot, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {action.error_message && (
                                    <div className="p-3 bg-destructive/10 rounded border border-destructive/20">
                                      <p className="text-sm font-medium text-destructive">Error</p>
                                      <p className="text-sm">{action.error_message}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}