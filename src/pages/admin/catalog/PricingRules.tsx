import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, Plus, Pencil, Trash2, RefreshCw, Percent, Calculator } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PricingRule {
  id: string;
  name: string;
  margin_type: string;
  margin_value: number;
  base_cost: number | null;
  min_price: number | null;
  max_price: number | null;
  product_type: string | null;
  pod_provider: string | null;
  rounding_rule: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [marginType, setMarginType] = useState('percentage');
  const [marginValue, setMarginValue] = useState('');
  const [baseCost, setBaseCost] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [productType, setProductType] = useState('');
  const [podProvider, setPodProvider] = useState('all');
  const [roundingRule, setRoundingRule] = useState('nearest');
  const [priority, setPriority] = useState('1');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      toast.error('Failed to fetch pricing rules');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setMarginType('percentage');
    setMarginValue('');
    setBaseCost('');
    setMinPrice('');
    setMaxPrice('');
    setProductType('');
    setPodProvider('all');
    setRoundingRule('nearest');
    setPriority('1');
    setIsActive(true);
    setEditingRule(null);
  }

  function openEditDialog(rule: PricingRule) {
    setEditingRule(rule);
    setName(rule.name);
    setMarginType(rule.margin_type);
    setMarginValue(rule.margin_value.toString());
    setBaseCost(rule.base_cost?.toString() || '');
    setMinPrice(rule.min_price?.toString() || '');
    setMaxPrice(rule.max_price?.toString() || '');
    setProductType(rule.product_type || '');
    setPodProvider(rule.pod_provider || 'all');
    setRoundingRule(rule.rounding_rule || 'nearest');
    setPriority(rule.priority.toString());
    setIsActive(rule.is_active);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!name.trim() || !marginValue) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const podProviderValue = podProvider === 'all' ? null : podProvider as 'printful' | 'printify' | 'gelato';
      const payload = {
        name: name.trim(),
        margin_type: marginType,
        margin_value: parseFloat(marginValue),
        base_cost: baseCost ? parseFloat(baseCost) : null,
        min_price: minPrice ? parseFloat(minPrice) : null,
        max_price: maxPrice ? parseFloat(maxPrice) : null,
        product_type: productType || null,
        pod_provider: podProviderValue,
        rounding_rule: roundingRule,
        priority: parseInt(priority),
        is_active: isActive,
      };

      if (editingRule) {
        const { error } = await supabase
          .from('pricing_rules')
          .update(payload)
          .eq('id', editingRule.id);
        if (error) throw error;
        toast.success('Pricing rule updated');
      } else {
        const { error } = await supabase
          .from('pricing_rules')
          .insert(payload);
        if (error) throw error;
        toast.success('Pricing rule created');
      }

      setDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save pricing rule');
    }
  }

  async function handleDelete(rule: PricingRule) {
    if (!confirm(`Delete "${rule.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', rule.id);
      if (error) throw error;
      toast.success('Pricing rule deleted');
      fetchRules();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="pricing-rules" className="font-display text-3xl font-bold">Pricing Rules</h1>
            <p className="text-muted-foreground mt-1">
              Configure margin and pricing calculations for products
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit' : 'New'} Pricing Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rule Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Standard Margin" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Margin Type</Label>
                    <Select value={marginType} onValueChange={setMarginType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="multiplier">Multiplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Margin Value *</Label>
                    <Input type="number" value={marginValue} onChange={(e) => setMarginValue(e.target.value)} placeholder={marginType === 'percentage' ? '30' : '10.00'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Price</Label>
                    <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Price</Label>
                    <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999.99" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Input value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="All types" />
                  </div>
                  <div className="space-y-2">
                    <Label>POD Provider</Label>
                    <Select value={podProvider} onValueChange={setPodProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="printful">Printful</SelectItem>
                        <SelectItem value="printify">Printify</SelectItem>
                        <SelectItem value="gelato">Gelato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rounding</Label>
                    <Select value={roundingRule} onValueChange={setRoundingRule}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nearest">Nearest</SelectItem>
                        <SelectItem value="up">Round Up</SelectItem>
                        <SelectItem value="down">Round Down</SelectItem>
                        <SelectItem value="99">End in .99</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min="1" max="100" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingRule ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rules Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pricing rules configured</p>
                <p className="text-sm">Add a rule to set up automatic margin calculations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(rule.updated_at), { addSuffix: true })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {rule.margin_type === 'percentage' ? (
                            <Percent className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                          )}
                          {rule.margin_value}
                          {rule.margin_type === 'percentage' && '%'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {rule.product_type && (
                            <Badge variant="outline" className="w-fit text-xs">{rule.product_type}</Badge>
                          )}
                          {rule.pod_provider && (
                            <Badge variant="outline" className="w-fit text-xs capitalize">{rule.pod_provider}</Badge>
                          )}
                          {!rule.product_type && !rule.pod_provider && (
                            <span className="text-muted-foreground text-xs">All products</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={rule.is_active 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-gray-500/10 text-gray-600'
                          }
                        >
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rule)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>
    </AdminLayout>
  );
}
