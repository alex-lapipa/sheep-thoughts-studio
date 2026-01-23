import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, Heart, Home, Mountain, Sparkles, TreePine, BookOpen,
  TrendingUp, Flame, Zap, Wrench, Flower2, Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMentorFrequency } from "@/hooks/useMentorFrequency";
import { LiveActivityStats } from "./LiveActivityStats";

interface MentorConfig {
  id: string;
  name: string;
  role: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

const MENTOR_CONFIG: MentorConfig[] = [
  { id: "anthony", name: "Anthony", role: "Pub Philosopher", color: "text-amber-500", bgColor: "bg-amber-500", icon: Cloud },
  { id: "peggy", name: "Peggy", role: "Truth-Giver", color: "text-rose-500", bgColor: "bg-rose-500", icon: Heart },
  { id: "carmel", name: "Carmel", role: "Practical Caretaker", color: "text-slate-500", bgColor: "bg-slate-500", icon: Home },
  { id: "jimmy", name: "Jimmy", role: "The Law", color: "text-blue-500", bgColor: "bg-blue-500", icon: Mountain },
  { id: "aidan", name: "Aidan", role: "Cosmic Philosopher", color: "text-violet-500", bgColor: "bg-violet-500", icon: Sparkles },
  { id: "seamus", name: "Seamus", role: "Exotic One", color: "text-emerald-500", bgColor: "bg-emerald-500", icon: TreePine },
  { id: "alex", name: "Alex", role: "First Teacher", color: "text-orange-500", bgColor: "bg-orange-500", icon: BookOpen },
  { id: "jony", name: "Jony", role: "The Fixer", color: "text-cyan-500", bgColor: "bg-cyan-500", icon: Wrench },
  { id: "maureen", name: "Maureen", role: "The Gentle Soul", color: "text-pink-500", bgColor: "bg-pink-500", icon: Flower2 },
  { id: "eddie", name: "Eddie", role: "The Driver", color: "text-indigo-500", bgColor: "bg-indigo-500", icon: Car },
];

interface FrequencyBadgeProps {
  rank: number;
}

const FrequencyBadge = ({ rank }: FrequencyBadgeProps) => {
  if (rank === 1) {
    return (
      <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
        <Flame className="w-3 h-3 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg">
        <TrendingUp className="w-3 h-3 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg">
        <Zap className="w-3 h-3 text-white" />
      </div>
    );
  }
  return null;
};

interface MentorFrequencyCardProps {
  mentor: MentorConfig;
  triggerCount: number;
  percentage: number;
  avgConfidence: number;
  rank: number;
  maxCount: number;
  index: number;
}

const MentorFrequencyCard = ({ 
  mentor, 
  triggerCount, 
  percentage, 
  avgConfidence,
  rank, 
  maxCount,
  index 
}: MentorFrequencyCardProps) => {
  const Icon = mentor.icon;
  const barWidth = maxCount > 0 ? (triggerCount / maxCount) * 100 : 0;
  const prevCountRef = useRef(triggerCount);
  const [isPulsing, setIsPulsing] = useState(false);

  // Detect count increment and trigger pulse
  useEffect(() => {
    if (triggerCount > prevCountRef.current) {
      setIsPulsing(true);
      const timeout = setTimeout(() => setIsPulsing(false), 600);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = triggerCount;
  }, [triggerCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="group relative"
    >
      <div className={cn(
        "relative p-4 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300",
        "backdrop-blur-xl bg-card/60",
        "hover:border-white/20 hover:shadow-lg hover:scale-[1.02]",
        isPulsing && "ring-2 ring-offset-2 ring-offset-background"
      )} style={{
        borderColor: isPulsing ? mentor.bgColor.replace('bg-', '') : undefined,
        boxShadow: isPulsing ? `0 0 20px ${mentor.bgColor.replace('bg-', '')}40` : undefined,
      }}>
        {/* Pulse ring animation */}
        <AnimatePresence>
          {isPulsing && (
            <motion.div
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                border: `2px solid ${mentor.bgColor.replace('bg-', '')}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Background gradient on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br from-transparent via-transparent to-transparent",
        )} style={{
          background: `linear-gradient(135deg, transparent, ${mentor.bgColor.replace('bg-', '')}10)`
        }} />

        {/* Rank badge */}
        <FrequencyBadge rank={rank} />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-3">
          <motion.div 
            className={cn(
              "p-2 rounded-xl transition-transform group-hover:scale-110",
              mentor.bgColor + "/20"
            )}
            animate={isPulsing ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon className={cn("w-4 h-4", mentor.color)} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm truncate">
              {mentor.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {mentor.role}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-2">
          {/* Trigger count with visual bar */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <motion.span 
                className={cn("text-2xl font-bold", mentor.color)}
                animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {triggerCount}
              </motion.span>
              <span className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                className={cn("h-full rounded-full", mentor.bgColor)}
              />
            </div>
          </div>

          {/* Confidence score */}
          {avgConfidence > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className={cn("font-medium", mentor.color)}>
                {(avgConfidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Decorative corner glow */}
        <div className={cn(
          "absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity",
          mentor.bgColor
        )} />
      </div>
    </motion.div>
  );
};

interface MentorFrequencyCardsProps {
  className?: string;
  days?: number;
  showEmpty?: boolean;
}

export const MentorFrequencyCards = ({ 
  className, 
  days = 30,
  showEmpty = true 
}: MentorFrequencyCardsProps) => {
  const { data, isLoading, error } = useMentorFrequency(days);

  if (isLoading) {
    return (
      <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
        {MENTOR_CONFIG.slice(0, 6).map((mentor, i) => (
          <div 
            key={mentor.id}
            className="p-4 rounded-2xl border border-white/10 bg-card/60 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-muted/30" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-16 bg-muted/30 rounded" />
                <div className="h-3 w-24 bg-muted/20 rounded" />
              </div>
            </div>
            <div className="h-6 w-12 bg-muted/30 rounded mb-2" />
            <div className="h-1.5 w-full bg-muted/30 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground", className)}>
        Failed to load mentor frequency data
      </div>
    );
  }

  const maxCount = data?.stats[0]?.trigger_count || 0;
  const statsMap = new Map(data?.stats.map(s => [s.mentor_id, s]));

  // Build cards for all mentors, with stats if available
  const mentorCards = MENTOR_CONFIG.map((mentor) => {
    const stats = statsMap.get(mentor.id);
    return {
      mentor,
      triggerCount: stats?.trigger_count || 0,
      percentage: stats?.percentage || 0,
      avgConfidence: stats?.avg_confidence || 0,
    };
  }).sort((a, b) => b.triggerCount - a.triggerCount);

  // Filter out empty if showEmpty is false
  const displayCards = showEmpty 
    ? mentorCards 
    : mentorCards.filter(c => c.triggerCount > 0);

  if (displayCards.length === 0) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No mentor triggers recorded yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Start a conversation to see which mentors are activated
        </p>
      </div>
    );
  }

  // Count active mentors (those with at least 1 trigger)
  const activeMentorCount = displayCards.filter(c => c.triggerCount > 0).length;

  return (
    <section className={cn("space-y-6", className)}>
      {/* Live Activity Stats */}
      <LiveActivityStats 
        totalTriggers={data?.total || 0}
        activeMentors={activeMentorCount}
      />

      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Mentor Activity</h3>
          <p className="text-sm text-muted-foreground">
            {data?.total || 0} triggers in the last {days} days
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Most Active</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayCards.map((card, index) => (
          <MentorFrequencyCard
            key={card.mentor.id}
            mentor={card.mentor}
            triggerCount={card.triggerCount}
            percentage={card.percentage}
            avgConfidence={card.avgConfidence}
            rank={index + 1}
            maxCount={maxCount}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};
