import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Dog, Bird, Cat, Rabbit, Squirrel, Bug, Fish, Rat, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface CreatureNode {
  id: string;
  name: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  tier: number;
  bubblesReasoning: string;
  powerSource: string;
  reports?: string[];
}

const HIERARCHY_DATA: CreatureNode[] = [
  {
    id: "crows",
    name: "The Sugarloaf Crows",
    title: "Supreme Intelligence Council",
    icon: Bird,
    iconColor: "text-slate-300",
    tier: 1,
    bubblesReasoning: "They see everything from above. They hold meetings. They whisper. If that's not a shadow government, I don't know what is.",
    powerSource: "Information control & aerial surveillance",
    reports: ["fox", "heron", "robin"]
  },
  {
    id: "muffins",
    name: "Muffins (ZZ Top Lady)",
    title: "Silent Advisor",
    icon: Dog,
    iconColor: "text-amber-400",
    tier: 1,
    bubblesReasoning: "Never speaks. Never wrong. Has two identities. Classic deep-state operative. Reports directly to... someone. Probably the crows.",
    powerSource: "Strategic silence & dual identity",
    reports: ["sheepdogs"]
  },
  {
    id: "fox",
    name: "The Glendalough Fox",
    title: "Independent Contractor",
    icon: Squirrel,
    iconColor: "text-orange-400",
    tier: 2,
    bubblesReasoning: "Comes and goes as it pleases. Steals sandwiches in broad daylight. Answers to no one visible. Classic freelancer.",
    powerSource: "Boldness & unpredictability",
    reports: ["hedgehog", "rabbits"]
  },
  {
    id: "mart-cat",
    name: "The Mart Cat",
    title: "Chief Auditor",
    icon: Cat,
    iconColor: "text-purple-400",
    tier: 2,
    bubblesReasoning: "Observes all transactions. Participates in none. Knows everyone's business. Neutral but judgmental. A true bureaucrat.",
    powerSource: "Observation & neutrality",
    reports: ["rat"]
  },
  {
    id: "heron",
    name: "The Powerscourt Heron",
    title: "Minister of Patience",
    icon: Bird,
    iconColor: "text-cyan-400",
    tier: 2,
    bubblesReasoning: "Stands in water for hours. Does nothing productive. Still respected. That's real power, so it is.",
    powerSource: "Extreme patience & stillness",
    reports: ["trout"]
  },
  {
    id: "sheepdogs",
    name: "Eddie's Sheepdogs",
    title: "Middle Management",
    icon: Dog,
    iconColor: "text-blue-400",
    tier: 3,
    bubblesReasoning: "Run around telling everyone where to go. Think they're in charge. Report to humans who report to... well, the crows probably.",
    powerSource: "Delegated authority & running",
    reports: ["sheep"]
  },
  {
    id: "robin",
    name: "Carmel's Garden Robin",
    title: "Local Correspondent",
    icon: Bird,
    iconColor: "text-red-400",
    tier: 3,
    bubblesReasoning: "Shows up whenever humans do. Watches. Reports back. Very suspicious timing, always.",
    powerSource: "Proximity to humans & cuteness",
  },
  {
    id: "hedgehog",
    name: "The Nocturnal Consultant",
    title: "Night Shift Supervisor",
    icon: Bug,
    iconColor: "text-amber-300",
    tier: 3,
    bubblesReasoning: "Only works at night. Has spines. Asks no questions. Classic security contractor.",
    powerSource: "Nocturnal operations & defense spines",
  },
  {
    id: "rabbits",
    name: "The Bray Rabbits",
    title: "Underground Network",
    icon: Rabbit,
    iconColor: "text-pink-400",
    tier: 4,
    bubblesReasoning: "Dig tunnels everywhere. Multiply rapidly. Either a communications network or a land invasion. Time will tell.",
    powerSource: "Numbers & tunnel infrastructure",
  },
  {
    id: "trout",
    name: "Glendalough Trout",
    title: "Aquatic Division",
    icon: Fish,
    iconColor: "text-sky-400",
    tier: 4,
    bubblesReasoning: "Control the lakes. Answer only to the heron. Mysterious. Wet.",
    powerSource: "Aquatic territory & slipperiness",
  },
  {
    id: "rat",
    name: "The Mart Rats",
    title: "Logistics & Procurement",
    icon: Rat,
    iconColor: "text-stone-400",
    tier: 4,
    bubblesReasoning: "Move things. Store things. Know where everything is. Essential but unacknowledged. Classic supply chain.",
    powerSource: "Infrastructure access & persistence",
  },
  {
    id: "sheep",
    name: "The General Population",
    title: "Concerned Citizens",
    icon: HelpCircle,
    iconColor: "text-emerald-400",
    tier: 5,
    bubblesReasoning: "That's us. We follow instructions. We eat grass. We ask questions. Mostly ignored, but we're watching. Oh, we're watching.",
    powerSource: "Wool & numbers",
  },
];

const TIER_COLORS: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/40", label: "Apex Authority" },
  2: { bg: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/40", label: "Upper Management" },
  3: { bg: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/40", label: "Middle Operations" },
  4: { bg: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/40", label: "Ground Level" },
  5: { bg: "from-muted/50 to-muted/30", border: "border-muted-foreground/30", label: "The Rest of Us" },
};

export const CreatureHierarchy = () => {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const groupedByTier = HIERARCHY_DATA.reduce((acc, node) => {
    if (!acc[node.tier]) acc[node.tier] = [];
    acc[node.tier].push(node);
    return acc;
  }, {} as Record<number, CreatureNode[]>);

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">The Wicklow Power Structure</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                As understood by Bubbles (definitely accurate)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            {isExpanded ? (
              <>Collapse <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Expand <ChevronDown className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Warning notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4"
        >
          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300/80">
            This organizational chart is based on years of careful observation, strategic eavesdropping, 
            and absolutely no verification whatsoever. Very reliable.
          </p>
        </motion.div>

        {/* Hierarchy visualization */}
        <div className="space-y-3">
          {Object.entries(groupedByTier).map(([tier, nodes], tierIndex) => {
            const tierNum = parseInt(tier);
            const tierStyle = TIER_COLORS[tierNum];
            const showNodes = isExpanded || tierNum <= 2;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tierIndex * 0.1 }}
              >
                {/* Tier label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-muted-foreground/20" />
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    Tier {tierNum}: {tierStyle.label}
                  </Badge>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-muted-foreground/20" />
                </div>

                {/* Nodes */}
                <AnimatePresence>
                  {showNodes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {nodes.map((node, nodeIndex) => {
                        const IconComponent = node.icon;
                        const isNodeExpanded = expandedNode === node.id;

                        return (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: nodeIndex * 0.05 }}
                            className={`
                              p-3 rounded-lg cursor-pointer transition-all duration-200
                              bg-gradient-to-br ${tierStyle.bg} ${tierStyle.border} border
                              hover:scale-[1.02] hover:shadow-lg
                              ${isNodeExpanded ? 'ring-2 ring-primary col-span-full' : ''}
                            `}
                            onClick={() => setExpandedNode(isNodeExpanded ? null : node.id)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`p-2 rounded-full bg-background/50 ${node.iconColor}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm truncate">{node.name}</h4>
                                  {tierNum === 1 && (
                                    <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{node.title}</p>
                                
                                {/* Power source badge */}
                                <Badge variant="secondary" className="mt-2 text-[10px] gap-1">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {node.powerSource}
                                </Badge>

                                {/* Expanded content */}
                                <AnimatePresence>
                                  {isNodeExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-3 pt-3 border-t border-muted-foreground/20"
                                    >
                                      <ThoughtBubble
                                        mode="innocent"
                                        size="sm"
                                        className="text-xs"
                                      >
                                        {node.bubblesReasoning}
                                      </ThoughtBubble>
                                      
                                      {node.reports && node.reports.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          <span className="text-[10px] text-muted-foreground">Reports from:</span>
                                          {node.reports.map(reportId => {
                                            const reporter = HIERARCHY_DATA.find(n => n.id === reportId);
                                            return reporter ? (
                                              <Badge key={reportId} variant="outline" className="text-[10px]">
                                                {reporter.name.split(' ')[0]}
                                              </Badge>
                                            ) : null;
                                          })}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bubbles' final note */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <ThoughtBubble mode="triggered" size="md">
              "I've been studying this hierarchy for years. The crows think I haven't noticed. But I have. Oh, I have. One day I'll understand their game. Until then, I keep watching. And grazing. Mostly grazing."
            </ThoughtBubble>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
