import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, Target, Rocket, Users, ShoppingBag, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  month: string;
  quarter: string;
  title: string;
  tasks: string[];
  status: 'completed' | 'in-progress' | 'upcoming';
  icon: React.ReactNode;
  kpi: string;
}

const milestones: Milestone[] = [
  {
    month: 'Mar 2025',
    quarter: 'Q1',
    title: 'Brand Launch',
    tasks: ['Website live', 'Shopify setup', '10 initial products', 'Social profiles'],
    status: 'upcoming',
    icon: <Rocket className="h-5 w-5" />,
    kpi: '€800 revenue'
  },
  {
    month: 'Apr 2025',
    quarter: 'Q1',
    title: 'Content Engine',
    tasks: ['Daily social posts', 'Email welcome flow', 'SEO foundations', 'First blog posts'],
    status: 'upcoming',
    icon: <Megaphone className="h-5 w-5" />,
    kpi: '1K followers'
  },
  {
    month: 'May 2025',
    quarter: 'Q1',
    title: 'Audience Growth',
    tasks: ['Influencer outreach', 'UGC campaign', 'Paid ads test', 'Community building'],
    status: 'upcoming',
    icon: <Users className="h-5 w-5" />,
    kpi: '2K followers'
  },
  {
    month: 'Jun 2025',
    quarter: 'Q2',
    title: 'Product Expansion',
    tasks: ['Summer collection', 'Seasonal designs', 'New product types', 'Bundle offers'],
    status: 'upcoming',
    icon: <ShoppingBag className="h-5 w-5" />,
    kpi: '20 SKUs'
  },
  {
    month: 'Jul-Aug 2025',
    quarter: 'Q2',
    title: 'Summer Scale',
    tasks: ['Double ad spend', 'Festival collabs', 'Press outreach', 'Affiliate program'],
    status: 'upcoming',
    icon: <Target className="h-5 w-5" />,
    kpi: '€3K/month'
  },
  {
    month: 'Sep 2025',
    quarter: 'Q3',
    title: 'EU Expansion',
    tasks: ['German localization', 'EU shipping optimization', 'Local influencers', 'Multi-currency'],
    status: 'upcoming',
    icon: <Rocket className="h-5 w-5" />,
    kpi: '5K followers'
  },
  {
    month: 'Oct 2025',
    quarter: 'Q3',
    title: 'Holiday Prep',
    tasks: ['Gift guides', 'Bundle pricing', 'Inventory planning', 'Email campaigns'],
    status: 'upcoming',
    icon: <Calendar className="h-5 w-5" />,
    kpi: '€5K/month'
  },
  {
    month: 'Nov-Dec 2025',
    quarter: 'Q4',
    title: 'Peak Season',
    tasks: ['Black Friday', 'Holiday rush', 'Max ad spend', 'Customer service scale'],
    status: 'upcoming',
    icon: <Target className="h-5 w-5" />,
    kpi: '€15K/month'
  },
  {
    month: 'Jan-Feb 2026',
    quarter: 'Q4',
    title: 'Year 2 Planning',
    tasks: ['Performance review', 'Strategy refinement', 'Team expansion', 'New markets'],
    status: 'upcoming',
    icon: <Rocket className="h-5 w-5" />,
    kpi: '€50K total'
  },
];

export function TimelineRoadmap() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-accent" />
          <div>
            <CardTitle>12-Month Roadmap</CardTitle>
            <CardDescription>
              Strategic milestones and tactical execution timeline
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-primary to-muted" />
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative pl-14">
                {/* Timeline node */}
                <div className={cn(
                  "absolute left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  milestone.status === 'completed' 
                    ? "bg-green-500 border-green-500 text-white"
                    : milestone.status === 'in-progress'
                    ? "bg-accent border-accent text-white animate-pulse"
                    : "bg-background border-muted-foreground/30"
                )}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : milestone.status === 'in-progress' ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                
                {/* Content card */}
                <div className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-md",
                  milestone.status === 'in-progress' 
                    ? "bg-accent/5 border-accent/30"
                    : "bg-card"
                )}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="gap-1">
                      {milestone.icon}
                      {milestone.quarter}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{milestone.month}</span>
                    <Badge 
                      variant={milestone.status === 'completed' ? 'default' : 'secondary'}
                      className={cn(
                        milestone.status === 'completed' && "bg-green-500",
                        milestone.status === 'in-progress' && "bg-accent"
                      )}
                    >
                      {milestone.status === 'completed' ? 'Done' : milestone.status === 'in-progress' ? 'Active' : 'Upcoming'}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">{milestone.title}</h4>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {milestone.tasks.map((task, taskIndex) => (
                      <span 
                        key={taskIndex}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-accent" />
                    <span className="font-medium">Target:</span>
                    <span className="text-accent font-bold">{milestone.kpi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
