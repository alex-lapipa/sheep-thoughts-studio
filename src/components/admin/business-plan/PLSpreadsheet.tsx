import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type Scenario = 'conservative' | 'moderate' | 'aggressive';

interface PLData {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marketing: number;
  operations: number;
  technology: number;
  admin: number;
  totalOpex: number;
  ebitda: number;
  taxes: number;
  netIncome: number;
}

// Generate P&L data for each scenario and year
const generatePLData = (scenario: Scenario, year: 1 | 2): PLData[] => {
  const months = year === 1 
    ? ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
    : ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  
  // Scenario multipliers
  const multipliers = {
    conservative: { baseRevenue: 800, growth: 1.08, aov: 32, conversion: 0.015 },
    moderate: { baseRevenue: 1200, growth: 1.12, aov: 38, conversion: 0.022 },
    aggressive: { baseRevenue: 2000, growth: 1.18, aov: 45, conversion: 0.035 },
  };
  
  const m = multipliers[scenario];
  const yearMultiplier = year === 1 ? 1 : 2.5;
  
  return months.map((month, index) => {
    const growthFactor = Math.pow(m.growth, index);
    const seasonalFactor = [1.0, 1.1, 1.2, 1.0, 0.9, 0.85, 1.0, 1.3, 1.8, 2.2, 1.1, 0.9][index];
    
    const revenue = Math.round(m.baseRevenue * growthFactor * seasonalFactor * yearMultiplier);
    const cogs = Math.round(revenue * 0.35); // 35% COGS for POD
    const grossProfit = revenue - cogs;
    
    const marketing = Math.round(revenue * (year === 1 ? 0.15 : 0.12));
    const operations = Math.round(revenue * 0.05);
    const technology = year === 1 ? 200 : 350;
    const admin = year === 1 ? 150 : 250;
    const totalOpex = marketing + operations + technology + admin;
    
    const ebitda = grossProfit - totalOpex;
    const taxes = ebitda > 0 ? Math.round(ebitda * 0.21) : 0;
    const netIncome = ebitda - taxes;
    
    return {
      month: `${month} ${year === 1 ? '25' : '26'}`,
      revenue,
      cogs,
      grossProfit,
      marketing,
      operations,
      technology,
      admin,
      totalOpex,
      ebitda,
      taxes,
      netIncome,
    };
  });
};

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `€${(value / 1000).toFixed(1)}k`;
  }
  return `€${value}`;
};

const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface ScenarioTabProps {
  scenario: Scenario;
  year: 1 | 2;
}

function ScenarioTab({ scenario, year }: ScenarioTabProps) {
  const data = useMemo(() => generatePLData(scenario, year), [scenario, year]);
  
  const totals = useMemo(() => {
    return data.reduce((acc, row) => ({
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      grossProfit: acc.grossProfit + row.grossProfit,
      marketing: acc.marketing + row.marketing,
      operations: acc.operations + row.operations,
      technology: acc.technology + row.technology,
      admin: acc.admin + row.admin,
      totalOpex: acc.totalOpex + row.totalOpex,
      ebitda: acc.ebitda + row.ebitda,
      taxes: acc.taxes + row.taxes,
      netIncome: acc.netIncome + row.netIncome,
    }), {
      revenue: 0, cogs: 0, grossProfit: 0, marketing: 0, operations: 0,
      technology: 0, admin: 0, totalOpex: 0, ebitda: 0, taxes: 0, netIncome: 0,
    });
  }, [data]);
  
  const grossMargin = ((totals.grossProfit / totals.revenue) * 100).toFixed(1);
  const netMargin = ((totals.netIncome / totals.revenue) * 100).toFixed(1);
  
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Annual Revenue</p>
            <p className="text-2xl font-bold text-accent">{formatFullCurrency(totals.revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Gross Margin</p>
            <p className="text-2xl font-bold">{grossMargin}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">EBITDA</p>
            <p className={cn("text-2xl font-bold", totals.ebitda >= 0 ? "text-green-600" : "text-red-600")}>
              {formatFullCurrency(totals.ebitda)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Net Income</p>
            <p className={cn("text-2xl font-bold", totals.netIncome >= 0 ? "text-green-600" : "text-red-600")}>
              {formatFullCurrency(totals.netIncome)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* P&L Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold sticky left-0 bg-muted/50 min-w-[140px]">Line Item</TableHead>
              {data.map((row) => (
                <TableHead key={row.month} className="text-center min-w-[80px] text-xs">
                  {row.month}
                </TableHead>
              ))}
              <TableHead className="text-center font-bold min-w-[100px] bg-muted">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Revenue */}
            <TableRow className="bg-green-500/5">
              <TableCell className="font-semibold sticky left-0 bg-green-500/5">Revenue</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs font-medium text-green-700">
                  {formatCurrency(row.revenue)}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-green-500/10 text-green-700">
                {formatFullCurrency(totals.revenue)}
              </TableCell>
            </TableRow>
            
            {/* COGS */}
            <TableRow>
              <TableCell className="sticky left-0 bg-background">Cost of Goods Sold</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs text-red-600">
                  ({formatCurrency(row.cogs)})
                </TableCell>
              ))}
              <TableCell className="text-center font-medium bg-muted text-red-600">
                ({formatFullCurrency(totals.cogs)})
              </TableCell>
            </TableRow>
            
            {/* Gross Profit */}
            <TableRow className="bg-blue-500/5 border-y-2">
              <TableCell className="font-semibold sticky left-0 bg-blue-500/5">Gross Profit</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs font-medium">
                  {formatCurrency(row.grossProfit)}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-blue-500/10">
                {formatFullCurrency(totals.grossProfit)}
              </TableCell>
            </TableRow>
            
            {/* Operating Expenses Header */}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold sticky left-0 bg-muted/30 text-muted-foreground" colSpan={14}>
                Operating Expenses
              </TableCell>
            </TableRow>
            
            {/* Marketing */}
            <TableRow>
              <TableCell className="pl-6 sticky left-0 bg-background">Marketing</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs text-muted-foreground">
                  ({formatCurrency(row.marketing)})
                </TableCell>
              ))}
              <TableCell className="text-center font-medium bg-muted text-muted-foreground">
                ({formatFullCurrency(totals.marketing)})
              </TableCell>
            </TableRow>
            
            {/* Operations */}
            <TableRow>
              <TableCell className="pl-6 sticky left-0 bg-background">Operations</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs text-muted-foreground">
                  ({formatCurrency(row.operations)})
                </TableCell>
              ))}
              <TableCell className="text-center font-medium bg-muted text-muted-foreground">
                ({formatFullCurrency(totals.operations)})
              </TableCell>
            </TableRow>
            
            {/* Technology */}
            <TableRow>
              <TableCell className="pl-6 sticky left-0 bg-background">Technology</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs text-muted-foreground">
                  ({formatCurrency(row.technology)})
                </TableCell>
              ))}
              <TableCell className="text-center font-medium bg-muted text-muted-foreground">
                ({formatFullCurrency(totals.technology)})
              </TableCell>
            </TableRow>
            
            {/* Admin */}
            <TableRow>
              <TableCell className="pl-6 sticky left-0 bg-background">Admin & Other</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs text-muted-foreground">
                  ({formatCurrency(row.admin)})
                </TableCell>
              ))}
              <TableCell className="text-center font-medium bg-muted text-muted-foreground">
                ({formatFullCurrency(totals.admin)})
              </TableCell>
            </TableRow>
            
            {/* Total OpEx */}
            <TableRow className="bg-red-500/5">
              <TableCell className="font-semibold sticky left-0 bg-red-500/5">Total OpEx</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs font-medium text-red-600">
                  ({formatCurrency(row.totalOpex)})
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-red-500/10 text-red-600">
                ({formatFullCurrency(totals.totalOpex)})
              </TableCell>
            </TableRow>
            
            {/* EBITDA */}
            <TableRow className="bg-accent/10 border-y-2">
              <TableCell className="font-bold sticky left-0 bg-accent/10">EBITDA</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className={cn(
                  "text-center text-xs font-bold",
                  row.ebitda >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {row.ebitda >= 0 ? formatCurrency(row.ebitda) : `(${formatCurrency(Math.abs(row.ebitda))})`}
                </TableCell>
              ))}
              <TableCell className={cn(
                "text-center font-bold bg-accent/20",
                totals.ebitda >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {totals.ebitda >= 0 ? formatFullCurrency(totals.ebitda) : `(${formatFullCurrency(Math.abs(totals.ebitda))})`}
              </TableCell>
            </TableRow>
            
            {/* Taxes */}
            <TableRow>
              <TableCell className="sticky left-0 bg-background">Taxes (21%)</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-center text-xs text-muted-foreground">
                  {row.taxes > 0 ? `(${formatCurrency(row.taxes)})` : '-'}
                </TableCell>
              ))}
              <TableCell className="text-center font-medium bg-muted text-muted-foreground">
                ({formatFullCurrency(totals.taxes)})
              </TableCell>
            </TableRow>
            
            {/* Net Income */}
            <TableRow className="bg-primary/10 border-t-2">
              <TableCell className="font-bold sticky left-0 bg-primary/10">Net Income</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className={cn(
                  "text-center text-xs font-bold",
                  row.netIncome >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {row.netIncome >= 0 ? formatCurrency(row.netIncome) : `(${formatCurrency(Math.abs(row.netIncome))})`}
                </TableCell>
              ))}
              <TableCell className={cn(
                "text-center font-bold bg-primary/20",
                totals.netIncome >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {totals.netIncome >= 0 ? formatFullCurrency(totals.netIncome) : `(${formatFullCurrency(Math.abs(totals.netIncome))})`}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PLSpreadsheet() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-accent" />
          <div>
            <CardTitle>P&L Projections</CardTitle>
            <CardDescription>
              Full profit & loss statements for Year 1 and Year 2 across all scenarios
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conservative" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="conservative" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Conservative
            </TabsTrigger>
            <TabsTrigger value="moderate" className="gap-2">
              <Minus className="h-4 w-4" />
              Moderate
            </TabsTrigger>
            <TabsTrigger value="aggressive" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Aggressive
            </TabsTrigger>
          </TabsList>
          
          {(['conservative', 'moderate', 'aggressive'] as const).map((scenario) => (
            <TabsContent key={scenario} value={scenario}>
              <Tabs defaultValue="year1" className="w-full">
                <div className="flex items-center gap-4 mb-4">
                  <TabsList>
                    <TabsTrigger value="year1">Year 1 (Mar '25 - Feb '26)</TabsTrigger>
                    <TabsTrigger value="year2">Year 2 (Mar '26 - Feb '27)</TabsTrigger>
                  </TabsList>
                  <Badge variant={scenario === 'conservative' ? 'secondary' : scenario === 'moderate' ? 'default' : 'outline'}>
                    {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario
                  </Badge>
                </div>
                
                <TabsContent value="year1">
                  <ScenarioTab scenario={scenario} year={1} />
                </TabsContent>
                <TabsContent value="year2">
                  <ScenarioTab scenario={scenario} year={2} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
