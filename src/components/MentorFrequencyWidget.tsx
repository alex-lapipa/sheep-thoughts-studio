import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, Heart, Home, Mountain, Sparkles, TreePine, BookOpen,
  ChevronUp, ChevronDown, Flame, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMentorFrequency } from "@/hooks/useMentorFrequency";

const MENTOR_CONFIG: Record<string, { name: string; color: string; icon: React.ElementType }> = {
  anthony: { name: "Anthony", color: "text-amber-500", icon: Cloud },
  peggy: { name: "Peggy", color: "text-rose-500", icon: Heart },
  carmel: { name: "Carmel", color: "text-slate-500", icon: Home },
  jimmy: { name: "Jimmy", color: "text-blue-500", icon: Mountain },
  aidan: { name: "Aidan", color: "text-violet-500", icon: Sparkles },
  seamus: { name: "Seamus", color: "text-emerald-500", icon: TreePine },
  alex: { name: "Alex", color: "text-orange-500", icon: BookOpen },
};

export const MentorFrequencyWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useMentorFrequency(30);

  const top3 = data?.stats.slice(0, 3) || [];

  if (isLoading || top3.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
    >
      <div className={cn(
        "backdrop-blur-xl bg-card/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden",
        "transition-all duration-300"
      )}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent/10 transition-colors"
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium">Top Mentors</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
          )}
        </button>

        {/* Compact view - just icons */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 pb-3"
            >
              <div className="flex items-center gap-1.5">
                {top3.map((stat, index) => {
                  const config = MENTOR_CONFIG[stat.mentor_id];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div 
                      key={stat.mentor_id}
                      className={cn(
                        "relative p-1.5 rounded-lg bg-muted/50",
                        index === 0 && "ring-1 ring-amber-500/50"
                      )}
                      title={`${config.name}: ${stat.trigger_count} triggers`}
                    >
                      <Icon className={cn("w-4 h-4", config.color)} />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded view - full stats */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 pb-3 space-y-2"
            >
              {top3.map((stat, index) => {
                const config = MENTOR_CONFIG[stat.mentor_id];
                if (!config) return null;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={stat.mentor_id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg bg-muted/50",
                      index === 0 && "ring-1 ring-amber-500/50"
                    )}>
                      <Icon className={cn("w-3.5 h-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">
                          {config.name}
                        </span>
                        <span className={cn("text-xs font-bold", config.color)}>
                          {stat.trigger_count}
                        </span>
                      </div>
                      <div className="h-1 mt-1 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          className={cn(
                            "h-full rounded-full",
                            index === 0 ? "bg-amber-500" : 
                            index === 1 ? "bg-slate-400" : "bg-amber-700"
                          )}
                        />
                      </div>
                    </div>
                    {index === 0 && (
                      <TrendingUp className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    )}
                  </motion.div>
                );
              })}
              
              <div className="pt-1 border-t border-white/5">
                <p className="text-[10px] text-muted-foreground text-center">
                  {data?.total || 0} total triggers
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
