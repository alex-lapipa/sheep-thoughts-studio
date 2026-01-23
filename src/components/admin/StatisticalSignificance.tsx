import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, CheckCircle2, AlertTriangle, XCircle, 
  HelpCircle, ChevronDown, ChevronUp, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatisticalSignificanceProps {
  controlVisitors: number;
  controlConversions: number;
  treatmentVisitors: number;
  treatmentConversions: number;
  controlLabel?: string;
  treatmentLabel?: string;
}

// Standard normal distribution CDF approximation (Abramowitz and Stegun)
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Calculate Z-score for two proportions
function calculateZScore(
  p1: number, n1: number,
  p2: number, n2: number
): number {
  if (n1 === 0 || n2 === 0) return 0;
  
  const pPooled = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));
  
  if (se === 0) return 0;
  return (p1 - p2) / se;
}

// Calculate sample size needed for given power and effect size
function calculateRequiredSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number, // as decimal (0.1 = 10% relative lift)
  alpha: number = 0.05,
  power: number = 0.8
): number {
  const zAlpha = 1.96; // for 95% confidence (two-tailed)
  const zBeta = 0.84; // for 80% power
  
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  
  const pAvg = (p1 + p2) / 2;
  const effect = Math.abs(p2 - p1);
  
  if (effect === 0) return Infinity;
  
  const n = 2 * Math.pow((zAlpha * Math.sqrt(2 * pAvg * (1 - pAvg)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) / effect, 2);
  
  return Math.ceil(n);
}

interface StatResult {
  zScore: number;
  pValue: number;
  confidenceLevel: number;
  isSignificant: boolean;
  significanceLevel: "high" | "medium" | "low" | "none";
  lift: number;
  liftDirection: "positive" | "negative" | "neutral";
  controlRate: number;
  treatmentRate: number;
  requiredSampleSize: number;
  currentProgress: number;
}

function calculateStatistics(
  controlVisitors: number,
  controlConversions: number,
  treatmentVisitors: number,
  treatmentConversions: number,
  minimumDetectableEffect: number = 0.1
): StatResult {
  const controlRate = controlVisitors > 0 ? controlConversions / controlVisitors : 0;
  const treatmentRate = treatmentVisitors > 0 ? treatmentConversions / treatmentVisitors : 0;
  
  const zScore = calculateZScore(treatmentRate, treatmentVisitors, controlRate, controlVisitors);
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore))); // two-tailed
  const confidenceLevel = (1 - pValue) * 100;
  
  const lift = controlRate > 0 
    ? ((treatmentRate - controlRate) / controlRate) * 100 
    : 0;
  
  let significanceLevel: "high" | "medium" | "low" | "none" = "none";
  if (pValue < 0.01) significanceLevel = "high";
  else if (pValue < 0.05) significanceLevel = "medium";
  else if (pValue < 0.1) significanceLevel = "low";
  
  const requiredSampleSize = calculateRequiredSampleSize(
    controlRate || 0.02, // default 2% if no data
    minimumDetectableEffect
  );
  
  const currentSampleSize = Math.min(controlVisitors, treatmentVisitors);
  const currentProgress = Math.min((currentSampleSize / requiredSampleSize) * 100, 100);
  
  return {
    zScore,
    pValue,
    confidenceLevel,
    isSignificant: pValue < 0.05,
    significanceLevel,
    lift,
    liftDirection: lift > 1 ? "positive" : lift < -1 ? "negative" : "neutral",
    controlRate: controlRate * 100,
    treatmentRate: treatmentRate * 100,
    requiredSampleSize,
    currentProgress,
  };
}

export function StatisticalSignificance({
  controlVisitors,
  controlConversions,
  treatmentVisitors,
  treatmentConversions,
  controlLabel = "Control",
  treatmentLabel = "Treatment",
}: StatisticalSignificanceProps) {
  const [minimumDetectableEffect, setMinimumDetectableEffect] = useState(0.1);
  const [showDetails, setShowDetails] = useState(false);

  const stats = useMemo(() => 
    calculateStatistics(
      controlVisitors, 
      controlConversions, 
      treatmentVisitors, 
      treatmentConversions,
      minimumDetectableEffect
    ), 
    [controlVisitors, controlConversions, treatmentVisitors, treatmentConversions, minimumDetectableEffect]
  );

  const getSignificanceBadge = () => {
    switch (stats.significanceLevel) {
      case "high":
        return (
          <Badge className="bg-affirmative/20 text-affirmative border-affirmative/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Highly Significant (p &lt; 0.01)
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-affirmative/20 text-affirmative border-affirmative/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Significant (p &lt; 0.05)
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Marginally Significant (p &lt; 0.1)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground gap-1">
            <XCircle className="h-3 w-3" />
            Not Significant
          </Badge>
        );
    }
  };

  const getRecommendation = () => {
    if (stats.currentProgress < 100) {
      const remaining = Math.max(0, stats.requiredSampleSize - Math.min(controlVisitors, treatmentVisitors));
      return {
        type: "waiting" as const,
        message: `Need ~${remaining.toLocaleString()} more samples per variant to detect a ${(minimumDetectableEffect * 100).toFixed(0)}% lift with 80% power.`,
      };
    }
    
    if (stats.isSignificant) {
      if (stats.lift > 0) {
        return {
          type: "winner" as const,
          message: `${treatmentLabel} outperforms ${controlLabel} by ${stats.lift.toFixed(1)}%. Consider rolling out the treatment.`,
        };
      } else {
        return {
          type: "loser" as const,
          message: `${controlLabel} outperforms ${treatmentLabel} by ${Math.abs(stats.lift).toFixed(1)}%. Consider keeping the control.`,
        };
      }
    }
    
    return {
      type: "inconclusive" as const,
      message: "Results are not statistically significant. Continue collecting data or consider if the effect size is meaningful.",
    };
  };

  const recommendation = getRecommendation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Calculator className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Statistical Significance</CardTitle>
              <CardDescription>Determine if your results are meaningful</CardDescription>
            </div>
          </div>
          {getSignificanceBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Result */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Confidence Level
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Probability that the observed difference is not due to random chance. 95%+ is typically considered significant.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className={cn(
              "text-2xl font-bold",
              stats.confidenceLevel >= 95 ? "text-affirmative" : 
              stats.confidenceLevel >= 90 ? "text-amber-500" : 
              "text-muted-foreground"
            )}>
              {stats.confidenceLevel.toFixed(1)}%
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              P-Value
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Probability of observing this result if there were no real difference. Lower is better (&lt;0.05 = significant).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className="text-2xl font-bold">
              {stats.pValue < 0.001 ? "<0.001" : stats.pValue.toFixed(3)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Relative Lift
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Percentage change in conversion rate of treatment vs control.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className={cn(
              "text-2xl font-bold flex items-center gap-1",
              stats.lift > 0 ? "text-affirmative" : stats.lift < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {stats.lift > 0 && <TrendingUp className="h-5 w-5" />}
              {stats.lift > 0 ? "+" : ""}{stats.lift.toFixed(1)}%
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Z-Score
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Number of standard deviations from the mean. |Z| &gt; 1.96 = significant at 95%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className="text-2xl font-bold">
              {stats.zScore.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sample Size Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sample Size Progress</span>
            <span className="font-medium">{stats.currentProgress.toFixed(0)}%</span>
          </div>
          <Progress value={stats.currentProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.min(controlVisitors, treatmentVisitors).toLocaleString()} / {stats.requiredSampleSize.toLocaleString()} samples needed per variant
          </p>
        </div>

        {/* MDE Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Minimum Detectable Effect
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The smallest relative lift you want to be able to detect. Smaller effects require more samples.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <Badge variant="outline">{(minimumDetectableEffect * 100).toFixed(0)}% lift</Badge>
          </div>
          <Slider
            value={[minimumDetectableEffect * 100]}
            onValueChange={([v]) => setMinimumDetectableEffect(v / 100)}
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Recommendation */}
        <motion.div 
          className={cn(
            "p-4 rounded-lg border",
            recommendation.type === "winner" && "bg-affirmative/10 border-affirmative/30",
            recommendation.type === "loser" && "bg-destructive/10 border-destructive/30",
            recommendation.type === "waiting" && "bg-amber-500/10 border-amber-500/30",
            recommendation.type === "inconclusive" && "bg-muted border-border"
          )}
          layout
        >
          <p className={cn(
            "text-sm font-medium",
            recommendation.type === "winner" && "text-affirmative",
            recommendation.type === "loser" && "text-destructive",
            recommendation.type === "waiting" && "text-amber-600",
            recommendation.type === "inconclusive" && "text-muted-foreground"
          )}>
            {recommendation.message}
          </p>
        </motion.div>

        {/* Expandable Details */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show Calculation Details
            </>
          )}
        </Button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-blue-500">{treatmentLabel}</p>
                  <p className="text-muted-foreground">Visitors: {treatmentVisitors.toLocaleString()}</p>
                  <p className="text-muted-foreground">Conversions: {treatmentConversions.toLocaleString()}</p>
                  <p className="text-muted-foreground">Rate: {stats.treatmentRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="font-medium text-orange-500">{controlLabel}</p>
                  <p className="text-muted-foreground">Visitors: {controlVisitors.toLocaleString()}</p>
                  <p className="text-muted-foreground">Conversions: {controlConversions.toLocaleString()}</p>
                  <p className="text-muted-foreground">Rate: {stats.controlRate.toFixed(2)}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
