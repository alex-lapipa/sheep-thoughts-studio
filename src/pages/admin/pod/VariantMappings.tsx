import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link2, CheckCircle, XCircle, AlertTriangle, Search, RefreshCw, Upload, ExternalLink, Image } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';

interface VariantMapping {
  id: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  shopify_sku: string | null;
  shopify_title: string | null;
  shopify_options: unknown;
  pod_provider: 'printful' | 'printify' | 'gelato' | null;
  pod_product_id: string | null;
  pod_variant_id: string | null;
  pod_template_id: string | null;
  print_files: Record<string, string>;
  status: 'ok' | 'missing_file' | 'missing_variant' | 'mismatch' | 'unmapped';
  validation_errors: string[] | null;
}

const statusConfig = {
  ok: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'OK' },
  missing_file: { icon: Image, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Missing File' },
  missing_variant: { icon: AlertTriangle, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', label: 'Missing Variant' },
  mismatch: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Mismatch' },
  unmapped: { icon: Link2, color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', label: 'Unmapped' },
};

export default function VariantMappings() {
  const [mappings, setMappings] = useState<VariantMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [selectedMappings, setSelectedMappings] = useState<Set<string>>(new Set());
  const [validating, setValidating] = useState(false);
  const { log } = useAuditLog();

  useEffect(() => {
    fetchMappings();
  }, [filterStatus, filterProvider]);

  async function fetchMappings() {
    try {
      let query = supabase
        .from('variant_mappings')
        .select('*')
        .order('shopify_title');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }
      if (filterProvider !== 'all') {
        query = query.eq('pod_provider', filterProvider as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMappings((data || []) as VariantMapping[]);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      toast.error('Failed to fetch variant mappings');
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateAll() {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pod-validate-mappings', {
        body: { action: 'validate_all' },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Validated ${data.validated} mappings`);
        await log({
          action: 'validate_mappings',
          entityType: 'variant_mapping',
          metadata: { count: data.validated },
        });
        fetchMappings();
      } else {
        toast.error(data.error || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('Failed to validate mappings');
    } finally {
      setValidating(false);
    }
  }

  function toggleSelection(id: string) {
    const newSelection = new Set(selectedMappings);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMappings(newSelection);
  }

  function toggleSelectAll() {
    if (selectedMappings.size === filteredMappings.length) {
      setSelectedMappings(new Set());
    } else {
      setSelectedMappings(new Set(filteredMappings.map(m => m.id)));
    }
  }

  const filteredMappings = mappings.filter(m => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      m.shopify_title?.toLowerCase().includes(searchLower) ||
      m.shopify_sku?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    total: mappings.length,
    ok: mappings.filter(m => m.status === 'ok').length,
    issues: mappings.filter(m => m.status !== 'ok' && m.status !== 'unmapped').length,
    unmapped: mappings.filter(m => m.status === 'unmapped').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Variant Mapping</h1>
            <p className="text-muted-foreground mt-1">
              Map Shopify variants to POD provider products
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleValidateAll} disabled={validating}>
              {validating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Validate All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Mapped OK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ok}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.issues}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unmapped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.unmapped}</div>
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
                    placeholder="Search by title or SKU..."
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
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="missing_file">Missing File</SelectItem>
                  <SelectItem value="missing_variant">Missing Variant</SelectItem>
                  <SelectItem value="mismatch">Mismatch</SelectItem>
                  <SelectItem value="unmapped">Unmapped</SelectItem>
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
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedMappings.size > 0 && (
          <Card className="border-accent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedMappings.size} selected
                </span>
                <Button variant="outline" size="sm">
                  Bulk Assign Provider
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload Print Files
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedMappings(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mappings Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No variant mappings found</p>
                <p className="text-sm">Mappings are created when products are synced from Shopify</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedMappings.size === filteredMappings.length && filteredMappings.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Shopify Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>POD Provider</TableHead>
                    <TableHead>Print Files</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map((mapping) => {
                    const StatusIcon = statusConfig[mapping.status].icon;
                    const printFileCount = Object.keys(mapping.print_files || {}).length;

                    return (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedMappings.has(mapping.id)}
                            onCheckedChange={() => toggleSelection(mapping.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{mapping.shopify_title || 'Untitled'}</p>
                            {mapping.shopify_options && (
                              <p className="text-sm text-muted-foreground">
                                {Object.values(mapping.shopify_options).join(' / ')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {mapping.shopify_sku || '-'}
                        </TableCell>
                        <TableCell>
                          {mapping.pod_provider ? (
                            <Badge variant="outline" className="capitalize">
                              {mapping.pod_provider}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {printFileCount > 0 ? (
                            <Badge variant="secondary">
                              <Image className="h-3 w-3 mr-1" />
                              {printFileCount} file{printFileCount !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusConfig[mapping.status].color}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[mapping.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
