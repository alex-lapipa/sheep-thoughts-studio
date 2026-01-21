import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lock, Award } from "lucide-react";

// Milestone definitions - must match FAQ.tsx
const STREAK_MILESTONES = [
  { days: 3, label: "3-Day Streak", emoji: "🌱", color: "from-green-400 to-emerald-500" },
  { days: 7, label: "Week Warrior", emoji: "🔥", color: "from-orange-400 to-red-500" },
  { days: 14, label: "Fortnight of Wisdom", emoji: "⭐", color: "from-yellow-400 to-amber-500" },
  { days: 30, label: "Monthly Master", emoji: "🏆", color: "from-blue-400 to-indigo-500" },
  { days: 60, label: "Wisdom Sage", emoji: "🧙", color: "from-purple-400 to-violet-500" },
  { days: 100, label: "Century of Wisdom", emoji: "💯", color: "from-pink-400 to-rose-500" },
  { days: 365, label: "Year of Enlightenment", emoji: "🐑", color: "from-primary to-accent" },
];

interface StreakBadgesProps {
  currentStreak: number;
  className?: string;
}

export const StreakBadges = ({ currentStreak, className }: StreakBadgesProps) => {
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("bubbles-celebrated-milestones");
    if (stored) {
      setCelebratedMilestones(JSON.parse(stored));
    }
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h4 className="font-display font-bold text-lg">Wisdom Badges</h4>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {STREAK_MILESTONES.map((milestone) => {
          const isUnlocked = celebratedMilestones.includes(milestone.days) || currentStreak >= milestone.days;
          const isNext = !isUnlocked && currentStreak < milestone.days && 
            (STREAK_MILESTONES.findIndex(m => m.days === milestone.days) === 0 ||
             celebratedMilestones.includes(STREAK_MILESTONES[STREAK_MILESTONES.findIndex(m => m.days === milestone.days) - 1]?.days) ||
             currentStreak >= STREAK_MILESTONES[STREAK_MILESTONES.findIndex(m => m.days === milestone.days) - 1]?.days);
          
          return (
            <div
              key={milestone.days}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300",
                isUnlocked 
                  ? `bg-gradient-to-br ${milestone.color} border-transparent shadow-lg` 
                  : isNext
                    ? "bg-muted/50 border-dashed border-primary/40 animate-pulse"
                    : "bg-muted/30 border-muted-foreground/20 opacity-50"
              )}
            >
              {/* Badge icon */}
              <div className={cn(
                "text-3xl mb-1.5 transition-transform",
                isUnlocked ? "scale-100" : "grayscale"
              )}>
                {isUnlocked ? milestone.emoji : <Lock className="w-6 h-6 text-muted-foreground" />}
              </div>
              
              {/* Days label */}
              <span className={cn(
                "text-xs font-bold",
                isUnlocked ? "text-white drop-shadow-md" : "text-muted-foreground"
              )}>
                {milestone.days}d
              </span>
              
              {/* Tooltip on hover */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 hover:opacity-100 pointer-events-none group-hover:opacity-100 z-10">
                <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap border">
                  {milestone.label}
                  {!isUnlocked && (
                    <span className="block text-muted-foreground">
                      {milestone.days - currentStreak} days to unlock
                    </span>
                  )}
                </div>
              </div>
              
              {/* Unlocked checkmark */}
              {isUnlocked && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center shadow-md border-2 border-primary">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress to next badge */}
      {currentStreak < 365 && (
        <div className="mt-4">
          {(() => {
            const nextMilestone = STREAK_MILESTONES.find(m => m.days > currentStreak);
            if (!nextMilestone) return null;
            
            const prevMilestone = STREAK_MILESTONES[STREAK_MILESTONES.indexOf(nextMilestone) - 1];
            const prevDays = prevMilestone?.days || 0;
            const progress = ((currentStreak - prevDays) / (nextMilestone.days - prevDays)) * 100;
            
            return (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Next: {nextMilestone.emoji} {nextMilestone.label}</span>
                  <span>{nextMilestone.days - currentStreak} days to go</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", nextMilestone.color)}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* All badges unlocked message */}
      {currentStreak >= 365 && (
        <div className="mt-4 text-center p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl">
          <span className="text-2xl">🐑</span>
          <p className="text-sm font-display font-bold text-primary">
            You've achieved ultimate wisdom! Bubbles is proud.
          </p>
        </div>
      )}
    </div>
  );
};
