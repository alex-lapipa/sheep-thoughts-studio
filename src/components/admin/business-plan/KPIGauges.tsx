import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Gauge, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Target, 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  target: string;
  progress: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, value, target, progress, trend, trendValue, icon, color }: KPICardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 w-1 h-full", color)} />
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{title}</span>
          <div className={cn("p-1.5 rounded-lg", color.replace('bg-', 'bg-opacity-20 '))}>{icon}</div>
        </div>
        <div className="flex items-end justify-between mb-2">
          <p className="text-2xl font-bold">{value}</p>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
            {trendValue}
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mb-1" />
        <p className="text-xs text-muted-foreground">Target: {target}</p>
      </CardContent>
    </Card>
  );
}

interface MetricRingProps {
  value: number;
  label: string;
  sublabel: string;
  color: string;
}

function MetricRing({ value, label, sublabel, color }: MetricRingProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{value}%</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-2">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

export function KPIGauges() {
  const kpis: KPICardProps[] = [
    {
      title: "Monthly Revenue",
      value: "€4,850",
      target: "€5,000",
      progress: 97,
      trend: 'up',
      trendValue: "+23%",
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      color: "bg-green-500"
    },
    {
      title: "Conversion Rate",
      value: "5.4%",
      target: "6.0%",
      progress: 90,
      trend: 'up',
      trendValue: "+0.8%",
      icon: <ShoppingCart className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-500"
    },
    {
      title: "Avg Order Value",
      value: "€38",
      target: "€42",
      progress: 90,
      trend: 'up',
      trendValue: "+€3",
      icon: <Target className="h-4 w-4 text-amber-600" />,
      color: "bg-amber-500"
    },
    {
      title: "Customer LTV",
      value: "€85",
      target: "€100",
      progress: 85,
      trend: 'up',
      trendValue: "+12%",
      icon: <Users className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-500"
    },
    {
      title: "Social Followers",
      value: "3,420",
      target: "5,000",
      progress: 68,
      trend: 'up',
      trendValue: "+420",
      icon: <Users className="h-4 w-4 text-pink-600" />,
      color: "bg-pink-500"
    },
    {
      title: "Email List",
      value: "1,250",
      target: "2,000",
      progress: 62,
      trend: 'up',
      trendValue: "+180",
      icon: <Zap className="h-4 w-4 text-orange-600" />,
      color: "bg-orange-500"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Gauge className="h-6 w-6 text-accent" />
          <div>
            <CardTitle>KPI Dashboard</CardTitle>
            <CardDescription>
              Real-time performance metrics and target tracking
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
        
        {/* Metric Rings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
          <MetricRing 
            value={65} 
            label="Gross Margin" 
            sublabel="Target: 70%"
            color="hsl(142, 71%, 45%)"
          />
          <MetricRing 
            value={42} 
            label="Marketing ROI" 
            sublabel="Target: 50%"
            color="hsl(217, 91%, 60%)"
          />
          <MetricRing 
            value={78} 
            label="Customer Sat." 
            sublabel="NPS Score"
            color="hsl(45, 93%, 47%)"
          />
          <MetricRing 
            value={54} 
            label="Repeat Rate" 
            sublabel="Target: 60%"
            color="hsl(280, 65%, 60%)"
          />
        </div>
        
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 border-green-500/30">
            <TrendingUp className="h-3 w-3" /> Revenue On Track
          </Badge>
          <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-700 border-blue-500/30">
            <Users className="h-3 w-3" /> Growing Audience
          </Badge>
          <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-700 border-amber-500/30">
            <Target className="h-3 w-3" /> AOV Improving
          </Badge>
          <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-700 border-purple-500/30">
            <Zap className="h-3 w-3" /> High Engagement
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
