import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Tag, Plus, Trash2, RefreshCw, Percent, DollarSign, Copy, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PriceRule {
  id: number;
  title: string;
  value_type: string;
  value: string;
  target_type: string;
  target_selection: string;
  allocation_method: string;
  customer_selection: string;
  starts_at: string;
  ends_at: string | null;
  usage_limit: number | null;
  once_per_customer: boolean;
  prerequisite_subtotal?: string;
}

interface DiscountCode {
  id: number;
  code: string;
  usage_count: number;
  price_rule_id: number;
}

export default function DiscountCodesPage() {
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [discountCodes, setDiscountCodes] = useState<Map<number, DiscountCode[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [valueType, setValueType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [oncePerCustomer, setOncePerCustomer] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch price rules from Shopify
      const rules = await fetchPriceRules();
      setPriceRules(rules);
      
      // Fetch discount codes for each rule
      const codesMap = new Map<number, DiscountCode[]>();
      for (const rule of rules) {
        const codes = await fetchDiscountCodes(rule.id);
        codesMap.set(rule.id, codes);
      }
      setDiscountCodes(codesMap);
    } catch (error) {
      console.error('Error fetching discount data:', error);
      toast.error('Failed to fetch discount codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function fetchPriceRules(): Promise<PriceRule[]> {
    const { listPriceRules } = await import('@/lib/shopifyAdmin');
    return listPriceRules();
  }

  async function fetchDiscountCodes(priceRuleId: number): Promise<DiscountCode[]> {
    const { listDiscountCodes } = await import('@/lib/shopifyAdmin');
    return listDiscountCodes(priceRuleId);
  }

  function resetForm() {
    setTitle('');
    setCode('');
    setValueType('percentage');
    setValue('');
    setMinSubtotal('');
    setUsageLimit('');
    setOncePerCustomer(true);
    setStartsAt('');
    setEndsAt('');
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'BUBBLES';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(`${prefix}${randomPart}`);
  }

  async function handleSubmit() {
    if (!title.trim() || !code.trim() || !value) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { createPriceRule, createDiscountCode } = await import('@/lib/shopifyAdmin');
      
      // Create price rule
      const priceRule = await createPriceRule({
        title: title.trim(),
        value_type: valueType,
        value: valueType === 'percentage' ? `-${value}` : `-${value}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        customer_selection: 'all',
        starts_at: startsAt || new Date().toISOString(),
        ends_at: endsAt || undefined,
        usage_limit: usageLimit ? parseInt(usageLimit) : undefined,
        once_per_customer: oncePerCustomer,
        prerequisite_subtotal: minSubtotal ? minSubtotal : undefined,
      });

      if (!priceRule?.id) {
        throw new Error('Failed to create price rule');
      }

      // Create discount code
      await createDiscountCode(priceRule.id, code.trim().toUpperCase());

      toast.success(`Discount code "${code.toUpperCase()}" created!`);
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to create discount:', error);
      toast.error('Failed to create discount code');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(priceRuleId: number, title: string) {
    if (!confirm(`Delete discount "${title}" and all its codes?`)) return;

    try {
      const { deletePriceRule } = await import('@/lib/shopifyAdmin');
      await deletePriceRule(priceRuleId);
      toast.success('Discount deleted');
      fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete discount');
    }
  }

  function copyCode(codeText: string) {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    toast.success(`Copied "${codeText}" to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function getDiscountDisplay(rule: PriceRule) {
    const absValue = Math.abs(parseFloat(rule.value));
    if (rule.value_type === 'percentage') {
      return `${absValue}% off`;
    }
    return `€${absValue.toFixed(2)} off`;
  }

  function getStatus(rule: PriceRule): 'active' | 'scheduled' | 'expired' {
    const now = new Date();
    const start = new Date(rule.starts_at);
    const end = rule.ends_at ? new Date(rule.ends_at) : null;
    
    if (start > now) return 'scheduled';
    if (end && end < now) return 'expired';
    return 'active';
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="discount-codes" className="font-display text-3xl font-bold">Discount Codes</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage Shopify discount codes for promotions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discount
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Discount Code</DialogTitle>
                  <DialogDescription>
                    Create a new discount code that customers can use at checkout
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Discount Name *</Label>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g., Summer Sale 2026" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Discount Code *</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={code} 
                        onChange={(e) => setCode(e.target.value.toUpperCase())} 
                        placeholder="e.g., SUMMER20"
                        className="font-mono"
                      />
                      <Button type="button" variant="outline" onClick={generateCode}>
                        Generate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={valueType} onValueChange={(v) => setValueType(v as 'percentage' | 'fixed_amount')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Value *</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={value} 
                          onChange={(e) => setValue(e.target.value)} 
                          placeholder={valueType === 'percentage' ? '10' : '5.00'}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {valueType === 'percentage' ? '%' : '€'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Minimum Subtotal (optional)</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={minSubtotal} 
                        onChange={(e) => setMinSubtotal(e.target.value)} 
                        placeholder="50.00"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Usage Limit</Label>
                      <Input 
                        type="number" 
                        value={usageLimit} 
                        onChange={(e) => setUsageLimit(e.target.value)} 
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-6">
                      <Label>Once per customer</Label>
                      <Switch checked={oncePerCustomer} onCheckedChange={setOncePerCustomer} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input 
                        type="datetime-local" 
                        value={startsAt} 
                        onChange={(e) => setStartsAt(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input 
                        type="datetime-local" 
                        value={endsAt} 
                        onChange={(e) => setEndsAt(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Discount'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Discount Codes Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : priceRules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No discount codes yet</p>
                <p className="text-sm mt-1">Create your first discount code to offer promotions</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceRules.map((rule) => {
                    const codes = discountCodes.get(rule.id) || [];
                    const status = getStatus(rule);
                    const totalUsage = codes.reduce((sum, c) => sum + c.usage_count, 0);
                    
                    return (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{rule.title}</p>
                            {codes.map((c) => (
                              <div key={c.id} className="flex items-center gap-2">
                                <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">
                                  {c.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyCode(c.code)}
                                >
                                  {copiedCode === c.code ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {rule.value_type === 'percentage' ? (
                              <Percent className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="font-medium">{getDiscountDisplay(rule)}</span>
                          </div>
                          {rule.prerequisite_subtotal && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Min. €{parseFloat(rule.prerequisite_subtotal).toFixed(2)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{totalUsage}</span>
                          {rule.usage_limit && (
                            <span className="text-muted-foreground">/{rule.usage_limit}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(rule.starts_at), 'MMM d, yyyy')}</p>
                            {rule.ends_at && (
                              <p className="text-muted-foreground">
                                → {format(new Date(rule.ends_at), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              status === 'active' 
                                ? 'bg-green-500/10 text-green-600 border-green-500/30' 
                                : status === 'scheduled'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                : 'bg-gray-500/10 text-gray-600 border-gray-500/30'
                            }
                          >
                            {status === 'active' && 'Active'}
                            {status === 'scheduled' && 'Scheduled'}
                            {status === 'expired' && 'Expired'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(rule.id, rule.title)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-700 dark:text-blue-400">
                  How discount codes work
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discount codes are synced directly with Shopify. Customers can enter codes at checkout
                  to receive their discount. Usage is tracked automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
