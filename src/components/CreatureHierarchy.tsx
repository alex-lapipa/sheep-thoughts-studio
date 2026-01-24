import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Dog, Bird, Cat, Rabbit, Squirrel, Bug, Fish, Rat, HelpCircle, Network, ZoomIn, ZoomOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CreatureNode {
  id: string;
  name: string;
  shortName: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  tier: number;
  bubblesReasoning: string;
  powerSource: string;
  reportsTo?: string[];
  x?: number;
  y?: number;
}

const HIERARCHY_DATA: CreatureNode[] = [
  {
    id: "crows",
    name: "The Sugarloaf Crows",
    shortName: "Crows",
    title: "Supreme Intelligence Council",
    icon: Bird,
    iconColor: "text-slate-300",
    tier: 1,
    bubblesReasoning: "They see everything from above. They hold meetings. They whisper. If that's not a shadow government, I don't know what is.",
    powerSource: "Information control",
  },
  {
    id: "muffins",
    name: "Muffins (ZZ Top Lady)",
    shortName: "Muffins",
    title: "Silent Advisor",
    icon: Dog,
    iconColor: "text-amber-400",
    tier: 1,
    bubblesReasoning: "Never speaks. Never wrong. Has two identities. Classic deep-state operative.",
    powerSource: "Strategic silence",
  },
  {
    id: "fox",
    name: "The Glendalough Fox",
    shortName: "Fox",
    title: "Independent Contractor",
    icon: Squirrel,
    iconColor: "text-orange-400",
    tier: 2,
    bubblesReasoning: "Comes and goes as it pleases. Steals sandwiches in broad daylight.",
    powerSource: "Boldness",
    reportsTo: ["crows"]
  },
  {
    id: "mart-cat",
    name: "The Mart Cat",
    shortName: "Cat",
    title: "Chief Auditor",
    icon: Cat,
    iconColor: "text-purple-400",
    tier: 2,
    bubblesReasoning: "Observes all transactions. Participates in none. Knows everyone's business.",
    powerSource: "Observation",
  },
  {
    id: "heron",
    name: "The Powerscourt Heron",
    shortName: "Heron",
    title: "Minister of Patience",
    icon: Bird,
    iconColor: "text-cyan-400",
    tier: 2,
    bubblesReasoning: "Stands in water for hours. Does nothing productive. Still respected.",
    powerSource: "Patience",
    reportsTo: ["crows"]
  },
  {
    id: "sheepdogs",
    name: "Eddie's Sheepdogs",
    shortName: "Sheepdogs",
    title: "Middle Management",
    icon: Dog,
    iconColor: "text-blue-400",
    tier: 3,
    bubblesReasoning: "Run around telling everyone where to go. Think they're in charge.",
    powerSource: "Delegated authority",
    reportsTo: ["muffins"]
  },
  {
    id: "robin",
    name: "Carmel's Garden Robin",
    shortName: "Robin",
    title: "Local Correspondent",
    icon: Bird,
    iconColor: "text-red-400",
    tier: 3,
    bubblesReasoning: "Shows up whenever humans do. Watches. Reports back.",
    powerSource: "Cuteness",
    reportsTo: ["crows"]
  },
  {
    id: "hedgehog",
    name: "The Nocturnal Consultant",
    shortName: "Hedgehog",
    title: "Night Shift",
    icon: Bug,
    iconColor: "text-amber-300",
    tier: 3,
    bubblesReasoning: "Only works at night. Has spines. Asks no questions.",
    powerSource: "Spines",
    reportsTo: ["fox"]
  },
  {
    id: "rabbits",
    name: "The Bray Rabbits",
    shortName: "Rabbits",
    title: "Underground Network",
    icon: Rabbit,
    iconColor: "text-pink-400",
    tier: 4,
    bubblesReasoning: "Dig tunnels everywhere. Multiply rapidly.",
    powerSource: "Numbers",
    reportsTo: ["fox"]
  },
  {
    id: "trout",
    name: "Glendalough Trout",
    shortName: "Trout",
    title: "Aquatic Division",
    icon: Fish,
    iconColor: "text-sky-400",
    tier: 4,
    bubblesReasoning: "Control the lakes. Answer only to the heron. Mysterious. Wet.",
    powerSource: "Slipperiness",
    reportsTo: ["heron"]
  },
  {
    id: "rat",
    name: "The Mart Rats",
    shortName: "Rats",
    title: "Logistics",
    icon: Rat,
    iconColor: "text-stone-400",
    tier: 4,
    bubblesReasoning: "Move things. Store things. Know where everything is.",
    powerSource: "Persistence",
    reportsTo: ["mart-cat"]
  },
  {
    id: "sheep",
    name: "The General Population",
    shortName: "Us",
    title: "Concerned Citizens",
    icon: HelpCircle,
    iconColor: "text-emerald-400",
    tier: 5,
    bubblesReasoning: "That's us. We follow instructions. We eat grass. We ask questions.",
    powerSource: "Wool",
    reportsTo: ["sheepdogs"]
  },
];

// Calculate positions for diagram
const calculatePositions = (nodes: CreatureNode[], width: number, height: number): CreatureNode[] => {
  const tierCounts: Record<number, number> = {};
  const tierIndices: Record<number, number> = {};
  
  nodes.forEach(node => {
    tierCounts[node.tier] = (tierCounts[node.tier] || 0) + 1;
    tierIndices[node.tier] = 0;
  });

  return nodes.map(node => {
    const tierCount = tierCounts[node.tier];
    const index = tierIndices[node.tier]++;
    const tierY = 50 + (node.tier - 1) * 90;
    const tierWidth = width - 80;
    const spacing = tierWidth / (tierCount + 1);
    const tierX = 40 + spacing * (index + 1);
    
    return { ...node, x: tierX, y: tierY };
  });
};

const TIER_COLORS: Record<number, string> = {
  1: "stroke-amber-500",
  2: "stroke-purple-500",
  3: "stroke-blue-500",
  4: "stroke-emerald-500",
  5: "stroke-muted-foreground",
};

const TIER_BG_COLORS: Record<number, string> = {
  1: "fill-amber-500/20",
  2: "fill-purple-500/20",
  3: "fill-blue-500/20",
  4: "fill-emerald-500/20",
  5: "fill-muted/30",
};

export const CreatureHierarchy = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"diagram" | "list">("diagram");
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const diagramWidth = 500;
  const diagramHeight = 500;
  const positionedNodes = calculatePositions(HIERARCHY_DATA, diagramWidth, diagramHeight);

  const getNodeById = (id: string) => positionedNodes.find(n => n.id === id);
  
  const selectedCreature = selectedNode ? getNodeById(selectedNode) : null;

  // Get all connections
  const connections = positionedNodes.flatMap(node => 
    (node.reportsTo || []).map(parentId => ({
      from: node,
      to: getNodeById(parentId)!
    })).filter(c => c.to)
  );

  // Check if a connection is highlighted
  const isConnectionHighlighted = (from: CreatureNode, to: CreatureNode) => {
    if (!hoveredNode && !selectedNode) return false;
    const activeId = hoveredNode || selectedNode;
    return from.id === activeId || to.id === activeId;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
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
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "diagram" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("diagram")}
              className="gap-1 h-8"
            >
              <Network className="w-3 h-3" />
              Diagram
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1 h-8"
            >
              <ChevronDown className="w-3 h-3" />
              List
            </Button>
          </div>
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
            This organizational chart is based on years of careful observation and absolutely no verification. 
            Lines show who reports to whom (according to me).
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === "diagram" ? (
            <motion.div
              key="diagram"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              className="relative"
            >
              {/* SVG Diagram */}
              <div className="overflow-auto rounded-lg bg-background/30 border border-muted-foreground/10">
                <svg 
                  width={diagramWidth} 
                  height={diagramHeight} 
                  className="mx-auto"
                  viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
                >
                  {/* Animated flow gradient definitions */}
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="flowGradientHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                      <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                    {/* Glow filter for highlighted connections */}
                    <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Pulsing glow filter for apex tier creatures */}
                    <filter id="apexGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feFlood floodColor="hsl(45 90% 60%)" floodOpacity="0.8" result="color" />
                      <feComposite in="color" in2="blur" operator="in" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Tier backgrounds */}
                  {[1, 2, 3, 4, 5].map(tier => (
                    <rect
                      key={tier}
                      x={10}
                      y={15 + (tier - 1) * 90}
                      width={diagramWidth - 20}
                      height={80}
                      rx={8}
                      className="fill-muted/10"
                    />
                  ))}

                  {/* Connection lines with animated flows */}
                  <g>
                    {connections.map((conn, i) => {
                      const isHighlighted = isConnectionHighlighted(conn.from, conn.to);
                      const pathId = `path-${conn.from.id}-${conn.to.id}`;
                      const pathD = `M ${conn.from.x} ${conn.from.y! - 20} 
                              Q ${conn.from.x} ${(conn.from.y! + conn.to.y!) / 2 - 20},
                                ${(conn.from.x! + conn.to.x!) / 2} ${(conn.from.y! + conn.to.y!) / 2 - 20}
                              T ${conn.to.x} ${conn.to.y! + 20}`;
                      
                      return (
                        <g key={pathId}>
                          {/* Base connection line */}
                          <motion.path
                            id={pathId}
                            d={pathD}
                            fill="none"
                            className={cn(
                              "transition-all duration-300",
                              isHighlighted 
                                ? "stroke-primary stroke-2" 
                                : "stroke-muted-foreground/30 stroke-1"
                            )}
                            filter={isHighlighted ? "url(#connectionGlow)" : undefined}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ 
                              pathLength: 1, 
                              opacity: isHighlighted ? 1 : 0.5 
                            }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                          />
                          
                          {/* Animated flow particles - always visible but more prominent when highlighted */}
                          {[0, 1, 2].map((particleIdx) => (
                            <motion.circle
                              key={`particle-${pathId}-${particleIdx}`}
                              r={isHighlighted ? 4 : 2}
                              fill={isHighlighted ? "url(#flowGradientHighlight)" : "hsl(var(--primary))"}
                              className={cn(
                                "transition-all duration-300",
                                isHighlighted ? "opacity-100" : "opacity-40"
                              )}
                              filter={isHighlighted ? "url(#connectionGlow)" : undefined}
                            >
                              <animateMotion
                                dur={`${2 + particleIdx * 0.5}s`}
                                repeatCount="indefinite"
                                begin={`${particleIdx * 0.7}s`}
                              >
                                <mpath href={`#${pathId}`} />
                              </animateMotion>
                              <animate
                                attributeName="opacity"
                                values={isHighlighted ? "0;1;1;0" : "0;0.4;0.4;0"}
                                dur={`${2 + particleIdx * 0.5}s`}
                                repeatCount="indefinite"
                                begin={`${particleIdx * 0.7}s`}
                              />
                            </motion.circle>
                          ))}
                          
                          {/* Direction arrow at midpoint */}
                          <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHighlighted ? 1 : 0.3 }}
                            transition={{ duration: 0.3 }}
                          >
                            <circle
                              cx={(conn.from.x! + conn.to.x!) / 2}
                              cy={(conn.from.y! + conn.to.y!) / 2 - 20}
                              r={isHighlighted ? 6 : 4}
                              className={cn(
                                "transition-all duration-300",
                                isHighlighted ? "fill-primary" : "fill-muted-foreground/50"
                              )}
                            />
                            <text
                              x={(conn.from.x! + conn.to.x!) / 2}
                              y={(conn.from.y! + conn.to.y!) / 2 - 17}
                              textAnchor="middle"
                              className="fill-background text-[8px] font-bold"
                            >
                              ↑
                            </text>
                          </motion.g>
                        </g>
                      );
                    })}
                  </g>

                  {/* Nodes */}
                  <g>
                    {positionedNodes.map((node, i) => {
                      const IconComponent = node.icon;
                      const isSelected = selectedNode === node.id;
                      const isHovered = hoveredNode === node.id;
                      const isActive = isSelected || isHovered;

                      return (
                        <motion.g
                          key={node.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: isActive ? 1.1 : 1, 
                            opacity: 1 
                          }}
                          transition={{ delay: i * 0.05, type: "spring" }}
                          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                        >
                          {/* Apex tier pulsing glow ring */}
                          {node.tier === 1 && (
                            <motion.circle
                              cx={node.x}
                              cy={node.y}
                              r={32}
                              fill="none"
                              stroke="hsl(45 90% 55%)"
                              strokeWidth={2}
                              filter="url(#apexGlow)"
                              animate={{
                                r: [32, 38, 32],
                                opacity: [0.6, 1, 0.6],
                                strokeWidth: [2, 3, 2],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          )}
                          
                          {/* Node circle */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isActive ? 28 : 24}
                            className={cn(
                              "transition-all duration-200",
                              TIER_BG_COLORS[node.tier],
                              isActive ? "stroke-primary stroke-2" : `${TIER_COLORS[node.tier]} stroke-1`
                            )}
                            filter={node.tier === 1 ? "url(#apexGlow)" : undefined}
                          />
                          
                          {/* Crown for tier 1 */}
                          {node.tier === 1 && (
                            <motion.text
                              x={node.x}
                              y={node.y! - 32}
                              textAnchor="middle"
                              className="text-xs"
                              animate={{ 
                                y: [node.y! - 32, node.y! - 35, node.y! - 32],
                                opacity: [0.9, 1, 0.9],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              👑
                            </motion.text>
                          )}

                          {/* Node label */}
                          <text
                            x={node.x}
                            y={node.y! + 4}
                            textAnchor="middle"
                            className="fill-foreground text-[10px] font-medium pointer-events-none"
                          >
                            {node.shortName}
                          </text>
                        </motion.g>
                      );
                    })}
                  </g>

                  {/* Tier labels */}
                  {[
                    { tier: 1, label: "Apex" },
                    { tier: 2, label: "Upper" },
                    { tier: 3, label: "Middle" },
                    { tier: 4, label: "Ground" },
                    { tier: 5, label: "Us" },
                  ].map(({ tier, label }) => (
                    <text
                      key={tier}
                      x={20}
                      y={55 + (tier - 1) * 90}
                      className="fill-muted-foreground text-[9px] font-medium"
                    >
                      {label}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Selected node details */}
              <AnimatePresence>
                {selectedCreature && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 rounded-lg bg-muted/30 border border-muted-foreground/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-background/50 ${selectedCreature.iconColor}`}>
                        <selectedCreature.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedCreature.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedCreature.title}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px] gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          {selectedCreature.powerSource}
                        </Badge>
                        <ThoughtBubble mode="innocent" size="sm" className="mt-3">
                          {selectedCreature.bubblesReasoning}
                        </ThoughtBubble>
                        
                        {selectedCreature.reportsTo && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Reports to:</span>
                            {selectedCreature.reportsTo.map(id => {
                              const parent = getNodeById(id);
                              return parent ? (
                                <Badge 
                                  key={id} 
                                  variant="outline" 
                                  className="text-[10px] cursor-pointer hover:bg-primary/20"
                                  onClick={() => setSelectedNode(id)}
                                >
                                  {parent.shortName}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  { tier: 1, label: "Apex Authority", color: "bg-amber-500" },
                  { tier: 2, label: "Upper Management", color: "bg-purple-500" },
                  { tier: 3, label: "Middle Ops", color: "bg-blue-500" },
                  { tier: 4, label: "Ground Level", color: "bg-emerald-500" },
                ].map(({ tier, label, color }) => (
                  <div key={tier} className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", color)} />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* List view - kept for accessibility */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {positionedNodes.map((node) => {
                const IconComponent = node.icon;
                const isNodeExpanded = selectedNode === node.id;

                return (
                  <motion.div
                    key={node.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all border",
                      "bg-gradient-to-br from-muted/30 to-muted/10 border-muted-foreground/20",
                      "hover:bg-muted/40",
                      isNodeExpanded && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedNode(isNodeExpanded ? null : node.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-background/50 ${node.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{node.name}</span>
                          {node.tier === 1 && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{node.title}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Tier {node.tier}
                      </Badge>
                    </div>
                    
                    <AnimatePresence>
                      {isNodeExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-muted-foreground/20"
                        >
                          <ThoughtBubble mode="innocent" size="sm">
                            {node.bubblesReasoning}
                          </ThoughtBubble>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bubbles' note when diagram is visible */}
        {viewMode === "diagram" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <ThoughtBubble mode="triggered" size="sm">
              "Click any creature to see what I know about them. The lines show the chain of command. Very official."
            </ThoughtBubble>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
