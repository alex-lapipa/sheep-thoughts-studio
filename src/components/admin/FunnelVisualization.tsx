import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Package, ShoppingCart, CreditCard, CheckCircle2,
  ArrowDown, TrendingDown, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelStage {
  name: string;
  simplified: number;
  full: number;
}

interface FunnelVisualizationProps {
  stages: FunnelStage[];
}

interface DropOffData {
  stageName: string;
  nextStageName: string;
  simplified: {
    current: number;
    next: number;
    dropOff: number;
    dropOffRate: number;
    retentionRate: number;
  };
  full: {
    current: number;
    next: number;
    dropOff: number;
    dropOffRate: number;
    retentionRate: number;
  };
  winner: "simplified" | "full" | "tie";
}

function calculateDropOffs(stages: FunnelStage[]): DropOffData[] {
  const dropOffs: DropOffData[] = [];
  
  for (let i = 0; i < stages.length - 1; i++) {
    const current = stages[i];
    const next = stages[i + 1];
    
    const simplifiedDropOff = current.simplified - next.simplified;
    const simplifiedDropOffRate = current.simplified > 0 
      ? (simplifiedDropOff / current.simplified) * 100 
      : 0;
    const simplifiedRetention = 100 - simplifiedDropOffRate;
    
    const fullDropOff = current.full - next.full;
    const fullDropOffRate = current.full > 0 
      ? (fullDropOff / current.full) * 100 
      : 0;
    const fullRetention = 100 - fullDropOffRate;
    
    let winner: "simplified" | "full" | "tie" = "tie";
    if (simplifiedRetention > fullRetention + 1) winner = "simplified";
    else if (fullRetention > simplifiedRetention + 1) winner = "full";
    
    dropOffs.push({
      stageName: current.name,
      nextStageName: next.name,
      simplified: {
        current: current.simplified,
        next: next.simplified,
        dropOff: simplifiedDropOff,
        dropOffRate: simplifiedDropOffRate,
        retentionRate: simplifiedRetention,
      },
      full: {
        current: current.full,
        next: next.full,
        dropOff: fullDropOff,
        dropOffRate: fullDropOffRate,
        retentionRate: fullRetention,
      },
      winner,
    });
  }
  
  return dropOffs;
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  'Views': Eye,
  'Product Views': Package,
  'Add to Cart': ShoppingCart,
  'Checkout': CreditCard,
  'Purchase': CheckCircle2,
};

export function FunnelVisualization({ stages }: FunnelVisualizationProps) {
  const dropOffs = useMemo(() => calculateDropOffs(stages), [stages]);
  
  const maxValue = Math.max(...stages.flatMap(s => [s.simplified, s.full]));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-accent" />
          Funnel Drop-Off Analysis
        </CardTitle>
        <CardDescription>
          Compare retention rates between variants at each funnel stage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Simplified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>Full</span>
          </div>
        </div>

        {/* Funnel Stages */}
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.name] || Eye;
            const simplifiedWidth = maxValue > 0 ? (stage.simplified / maxValue) * 100 : 0;
            const fullWidth = maxValue > 0 ? (stage.full / maxValue) * 100 : 0;
            const dropOff = dropOffs[index];
            
            return (
              <div key={stage.name}>
                {/* Stage Row */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    {/* Stage Icon & Name */}
                    <div className="w-32 flex items-center gap-2 shrink-0">
                      <div className="p-2 rounded-lg bg-background">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium truncate">{stage.name}</span>
                    </div>
                    
                    {/* Bars Container */}
                    <div className="flex-1 space-y-1.5">
                      {/* Simplified Bar */}
                      <div className="flex items-center gap-2">
                        <div className="relative h-6 flex-1 bg-muted/50 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${simplifiedWidth}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="absolute inset-y-0 left-0 bg-blue-500/80 rounded"
                          />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {stage.simplified.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Full Bar */}
                      <div className="flex items-center gap-2">
                        <div className="relative h-6 flex-1 bg-muted/50 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fullWidth}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                            className="absolute inset-y-0 left-0 bg-orange-500/80 rounded"
                          />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {stage.full.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Drop-off Connector */}
                {dropOff && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="flex items-center gap-4 py-2 px-3"
                  >
                    <div className="w-32 shrink-0" />
                    <div className="flex-1 flex items-center gap-4">
                      {/* Simplified Drop-off */}
                      <div className="flex-1 flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-blue-500/60" />
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-xs font-medium",
                            dropOff.winner === "simplified" ? "text-affirmative" : "text-muted-foreground"
                          )}>
                            {dropOff.simplified.retentionRate.toFixed(1)}% retained
                          </span>
                          <span className="text-xs text-destructive/70">
                            (-{dropOff.simplified.dropOff.toLocaleString()})
                          </span>
                          {dropOff.winner === "simplified" && (
                            <TrendingUp className="h-3 w-3 text-affirmative" />
                          )}
                        </div>
                      </div>
                      
                      {/* Full Drop-off */}
                      <div className="flex-1 flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-orange-500/60" />
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-xs font-medium",
                            dropOff.winner === "full" ? "text-affirmative" : "text-muted-foreground"
                          )}>
                            {dropOff.full.retentionRate.toFixed(1)}% retained
                          </span>
                          <span className="text-xs text-destructive/70">
                            (-{dropOff.full.dropOff.toLocaleString()})
                          </span>
                          {dropOff.winner === "full" && (
                            <TrendingUp className="h-3 w-3 text-affirmative" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm font-medium text-blue-500 mb-2">Simplified Overall</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start → End</span>
                <span className="font-medium">
                  {stages[0]?.simplified || 0} → {stages[stages.length - 1]?.simplified || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Conversion</span>
                <span className="font-bold text-blue-500">
                  {stages[0]?.simplified > 0 
                    ? ((stages[stages.length - 1]?.simplified / stages[0]?.simplified) * 100).toFixed(2)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <p className="text-sm font-medium text-orange-500 mb-2">Full Overall</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start → End</span>
                <span className="font-medium">
                  {stages[0]?.full || 0} → {stages[stages.length - 1]?.full || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Conversion</span>
                <span className="font-bold text-orange-500">
                  {stages[0]?.full > 0 
                    ? ((stages[stages.length - 1]?.full / stages[0]?.full) * 100).toFixed(2)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage-by-Stage Winner Summary */}
        <div className="flex flex-wrap gap-2">
          {dropOffs.map((dropOff, index) => (
            <Badge
              key={index}
              variant="outline"
              className={cn(
                "text-xs",
                dropOff.winner === "simplified" && "border-blue-500/50 bg-blue-500/10 text-blue-500",
                dropOff.winner === "full" && "border-orange-500/50 bg-orange-500/10 text-orange-500",
                dropOff.winner === "tie" && "border-muted-foreground/30"
              )}
            >
              {dropOff.stageName} → {dropOff.nextStageName}:{" "}
              {dropOff.winner === "tie" ? "Tie" : dropOff.winner === "simplified" ? "Simplified" : "Full"}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
