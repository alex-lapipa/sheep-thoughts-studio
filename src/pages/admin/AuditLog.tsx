import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Search, RefreshCw, Clock, User, Eye, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  before_data: unknown;
  after_data: unknown;
  metadata: unknown;
  ip_address: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: 'bg-green-500/10 text-green-600',
  update: 'bg-blue-500/10 text-blue-600',
  delete: 'bg-red-500/10 text-red-600',
  connect: 'bg-purple-500/10 text-purple-600',
  disconnect: 'bg-orange-500/10 text-orange-600',
  login: 'bg-gray-500/10 text-gray-600',
  default: 'bg-gray-500/10 text-gray-600',
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEntries();
  }, [filterAction, filterEntity]);

  async function fetchEntries() {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filterAction !== 'all') {
        query = query.ilike('action', `%${filterAction}%`);
      }
      if (filterEntity !== 'all') {
        query = query.eq('entity_type', filterEntity);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = entries.filter(e => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      e.action.toLowerCase().includes(searchLower) ||
      e.entity_type.toLowerCase().includes(searchLower) ||
      e.entity_id?.toLowerCase().includes(searchLower)
    );
  });

  // Get unique entity types for filter
  const entityTypes = [...new Set(entries.map(e => e.entity_type))];

  function getActionColor(action: string): string {
    const key = Object.keys(actionColors).find(k => action.toLowerCase().includes(k));
    return actionColors[key || 'default'];
  }

  function toggleRowExpanded(id: string) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  }

  // Stats
  const stats = {
    total: entries.length,
    today: entries.filter(e => {
      const created = new Date(e.created_at);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length,
    creates: entries.filter(e => e.action.toLowerCase().includes('create')).length,
    updates: entries.filter(e => e.action.toLowerCase().includes('update')).length,
    deletes: entries.filter(e => e.action.toLowerCase().includes('delete')).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="audit-log" className="font-display text-3xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground mt-1">
              Track all administrative actions and changes
            </p>
          </div>
          <Button variant="outline" onClick={() => fetchEntries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Creates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.creates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.updates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Deletes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.deletes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card id="audit-filters">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions, entities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Creates</SelectItem>
                  <SelectItem value="update">Updates</SelectItem>
                  <SelectItem value="delete">Deletes</SelectItem>
                  <SelectItem value="connect">Connections</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found</p>
                <p className="text-sm">Actions will be logged here automatically</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <>
                      <TableRow key={entry.id} className="cursor-pointer" onClick={() => toggleRowExpanded(entry.id)}>
                        <TableCell>
                          {expandedRows.has(entry.id) 
                            ? <ChevronUp className="h-4 w-4" /> 
                            : <ChevronDown className="h-4 w-4" />
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionColor(entry.action)}>
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.entity_type}</p>
                            {entry.entity_id && (
                              <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                                {entry.entity_id}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.user_id ? (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3" />
                              <span className="font-mono text-xs truncate max-w-[100px]">
                                {entry.user_id.slice(0, 8)}...
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(entry);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(entry.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="p-4 space-y-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-muted-foreground">Timestamp</p>
                                  <p>{format(new Date(entry.created_at), 'PPpp')}</p>
                                </div>
                                {entry.ip_address && (
                                  <div>
                                    <p className="font-medium text-muted-foreground">IP Address</p>
                                    <p className="font-mono">{entry.ip_address}</p>
                                  </div>
                                )}
                              </div>
                              {entry.metadata && (
                                <div>
                                  <p className="font-medium text-muted-foreground mb-1">Metadata</p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(entry.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Entry Details</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Action</p>
                    <Badge variant="outline" className={getActionColor(selectedEntry.action)}>
                      {selectedEntry.action}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                    <p>{selectedEntry.entity_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
                    <p className="font-mono text-sm">{selectedEntry.entity_id || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm">{selectedEntry.user_id || 'System'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                    <p>{format(new Date(selectedEntry.created_at), 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                    <p className="font-mono text-sm">{selectedEntry.ip_address || '—'}</p>
                  </div>
                </div>
                
                {selectedEntry.before_data && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Before Data</p>
                    <pre className="text-xs bg-red-50 dark:bg-red-950/20 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedEntry.before_data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedEntry.after_data && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">After Data</p>
                    <pre className="text-xs bg-green-50 dark:bg-green-950/20 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedEntry.after_data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedEntry.metadata && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
