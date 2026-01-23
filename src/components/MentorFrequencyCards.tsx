import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, Heart, Home, Mountain, Sparkles, TreePine, BookOpen,
  TrendingUp, Flame, Zap, Wrench, Flower2, Car, Trophy, Medal, Award, Crown
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useMentorFrequency } from "@/hooks/useMentorFrequency";
import { LiveActivityStats } from "./LiveActivityStats";
import { toast } from "sonner";

// Fire celebration confetti when a mentor reaches #1
const fireLeaderConfetti = (mentorName: string) => {
  const colors = ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1"];
  
  // Center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors,
    startVelocity: 30,
    gravity: 0.8,
  });

  // Left side burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
  }, 200);

  // Right side burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
  }, 400);

  toast.success(`🏆 ${mentorName} is now #1!`, {
    description: "A new leader has emerged on the mentor leaderboard!",
    duration: 4000,
  });
};
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

// Podium card for top 3 mentors
interface PodiumCardProps {
  mentor: MentorConfig;
  triggerCount: number;
  percentage: number;
  rank: 1 | 2 | 3;
  delay: number;
}

const PodiumCard = ({ mentor, triggerCount, percentage, rank, delay }: PodiumCardProps) => {
  const Icon = mentor.icon;
  
  // Podium configuration based on rank
  const podiumConfig = {
    1: {
      height: "h-40 md:h-48",
      podiumHeight: "h-20 md:h-24",
      gradient: "from-amber-400 via-yellow-400 to-amber-500",
      glow: "shadow-amber-500/40",
      ringColor: "ring-amber-400",
      icon: Trophy,
      label: "1st",
      scale: "scale-100 md:scale-110",
    },
    2: {
      height: "h-32 md:h-40",
      podiumHeight: "h-14 md:h-18",
      gradient: "from-slate-300 via-gray-300 to-slate-400",
      glow: "shadow-slate-400/30",
      ringColor: "ring-slate-300",
      icon: Medal,
      label: "2nd",
      scale: "scale-95 md:scale-100",
    },
    3: {
      height: "h-28 md:h-36",
      podiumHeight: "h-10 md:h-14",
      gradient: "from-amber-600 via-orange-600 to-amber-700",
      glow: "shadow-amber-600/30",
      ringColor: "ring-amber-600",
      icon: Award,
      label: "3rd",
      scale: "scale-90 md:scale-95",
    },
  };

  const config = podiumConfig[rank];
  const RankIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("flex flex-col items-center relative", config.scale)}
    >
      {/* Floating Crown for 1st place */}
      {rank === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: [0, -6, 0],
          }}
          transition={{ 
            opacity: { delay: delay + 0.3, duration: 0.3 },
            y: { delay: delay + 0.5, duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-8 md:-top-10 z-10"
        >
          <Crown className="w-6 h-6 md:w-8 md:h-8 text-amber-400 drop-shadow-lg" fill="currentColor" fillOpacity={0.2} />
        </motion.div>
      )}
      
      {/* Avatar/Icon Circle */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          "relative mb-3 p-3 md:p-4 rounded-full ring-4",
          config.ringColor,
          "bg-gradient-to-br",
          config.gradient,
          "shadow-lg",
          config.glow
        )}
      >
        <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
        
        {/* Rank badge */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center",
          "bg-background border-2 shadow-md",
          rank === 1 && "border-amber-400",
          rank === 2 && "border-slate-300",
          rank === 3 && "border-amber-600"
        )}>
          <RankIcon className={cn(
            "w-3 h-3 md:w-4 md:h-4",
            rank === 1 && "text-amber-500",
            rank === 2 && "text-slate-400",
            rank === 3 && "text-amber-600"
          )} />
        </div>
      </motion.div>

      {/* Name and stats */}
      <div className="text-center mb-2">
        <h4 className="font-display font-bold text-sm md:text-base">{mentor.name}</h4>
        <p className={cn("text-lg md:text-xl font-bold", mentor.color)}>
          {triggerCount}
        </p>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(1)}%
        </p>
      </div>

      {/* Podium block */}
      <div className={cn(
        "w-20 md:w-28 rounded-t-lg",
        config.podiumHeight,
        "bg-gradient-to-b",
        config.gradient,
        "shadow-lg flex items-center justify-center",
        config.glow
      )}>
        <span className="font-bold text-white text-sm md:text-base">
          {config.label}
        </span>
      </div>
    </motion.div>
  );
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
  const previousLeaderRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Track #1 changes and fire confetti for new leaders
  useEffect(() => {
    if (!data?.stats || data.stats.length === 0) return;
    
    const currentLeader = data.stats[0]?.mentor_id;
    const currentLeaderName = data.stats[0]?.mentor_name;
    
    // Skip on initial load - only celebrate actual changes
    if (isInitialLoadRef.current) {
      // Load previous leader from localStorage
      const storedLeader = localStorage.getItem("bubbles-mentor-leader");
      previousLeaderRef.current = storedLeader || currentLeader;
      isInitialLoadRef.current = false;
      
      // If no stored leader, save current one
      if (!storedLeader && currentLeader) {
        localStorage.setItem("bubbles-mentor-leader", currentLeader);
      }
      return;
    }
    
    // Check if leader has changed
    if (currentLeader && currentLeader !== previousLeaderRef.current) {
      fireLeaderConfetti(currentLeaderName || currentLeader);
      previousLeaderRef.current = currentLeader;
      localStorage.setItem("bubbles-mentor-leader", currentLeader);
    }
  }, [data?.stats]);

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

  // Separate top 3 for podium
  const podiumMentors = displayCards.slice(0, 3).filter(c => c.triggerCount > 0);
  const remainingMentors = displayCards.slice(3);

  return (
    <section className={cn("space-y-8", className)}>
      {/* Live Activity Stats */}
      <LiveActivityStats 
        totalTriggers={data?.total || 0}
        activeMentors={activeMentorCount}
      />

      {/* Podium Section - Top 3 */}
      {podiumMentors.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-display text-xl font-bold flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Mentors
            </h3>
            <p className="text-sm text-muted-foreground">
              Most channeled in the last {days} days
            </p>
          </div>

          {/* Podium Display */}
          <div className="flex items-end justify-center gap-3 md:gap-6 py-6">
            {/* 2nd Place - Left */}
            {podiumMentors[1] && (
              <PodiumCard
                mentor={podiumMentors[1].mentor}
                triggerCount={podiumMentors[1].triggerCount}
                percentage={podiumMentors[1].percentage}
                rank={2}
                delay={0.2}
              />
            )}

            {/* 1st Place - Center (tallest) */}
            {podiumMentors[0] && (
              <PodiumCard
                mentor={podiumMentors[0].mentor}
                triggerCount={podiumMentors[0].triggerCount}
                percentage={podiumMentors[0].percentage}
                rank={1}
                delay={0.1}
              />
            )}

            {/* 3rd Place - Right */}
            {podiumMentors[2] && (
              <PodiumCard
                mentor={podiumMentors[2].mentor}
                triggerCount={podiumMentors[2].triggerCount}
                percentage={podiumMentors[2].percentage}
                rank={3}
                delay={0.3}
              />
            )}
          </div>
        </div>
      )}

      {/* Remaining mentors header */}
      {remainingMentors.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Other Mentors</h3>
              <p className="text-sm text-muted-foreground">
                {data?.total || 0} triggers in the last {days} days
              </p>
            </div>
          </div>

          {/* Cards grid for remaining */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {remainingMentors.map((card, index) => (
              <MentorFrequencyCard
                key={card.mentor.id}
                mentor={card.mentor}
                triggerCount={card.triggerCount}
                percentage={card.percentage}
                avgConfidence={card.avgConfidence}
                rank={index + 4}
                maxCount={maxCount}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
