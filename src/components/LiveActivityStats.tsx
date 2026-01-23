import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  Brain, MessageSquare, Zap, Clock, TrendingUp, Sparkles,
  AlertCircle, Coffee
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedStatProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  suffix?: string;
  liveIncrement?: boolean;
  incrementRate?: number; // ms between increments
  incrementMin?: number;
  incrementMax?: number;
}

const AnimatedStat = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  suffix = "",
  liveIncrement = false,
  incrementRate = 5000,
  incrementMin = 1,
  incrementMax = 3,
}: AnimatedStatProps) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevValueRef = useRef(currentValue);
  
  const spring = useSpring(0, { damping: 30, stiffness: 120 });
  const displayValue = useTransform(spring, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  // Sync spring with display
  useEffect(() => {
    return displayValue.on("change", (v) => setDisplay(v));
  }, [displayValue]);

  // Initial animation
  useEffect(() => {
    spring.set(currentValue);
  }, []);

  // Live increment effect
  useEffect(() => {
    if (!liveIncrement) return;

    const interval = setInterval(() => {
      const increment = Math.floor(
        Math.random() * (incrementMax - incrementMin + 1) + incrementMin
      );
      setCurrentValue((prev) => prev + increment);
    }, incrementRate);

    return () => clearInterval(interval);
  }, [liveIncrement, incrementRate, incrementMin, incrementMax]);

  // Animate when value changes and trigger pulse
  useEffect(() => {
    if (currentValue !== prevValueRef.current) {
      spring.set(currentValue);
      setIsPulsing(true);
      const timeout = setTimeout(() => setIsPulsing(false), 400);
      prevValueRef.current = currentValue;
      return () => clearTimeout(timeout);
    }
  }, [currentValue, spring]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative group"
    >
      <div className={cn(
        "relative p-4 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300",
        "backdrop-blur-xl bg-card/60",
        "hover:border-white/20 hover:shadow-lg",
        isPulsing && "scale-[1.02]"
      )}>
        {/* Pulse ring */}
        <AnimatePresence>
          {isPulsing && (
            <motion.div
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "absolute inset-0 rounded-2xl pointer-events-none",
                bgColor.replace("/20", "/30")
              )}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex items-center gap-3">
          <motion.div 
            className={cn("p-2.5 rounded-xl", bgColor)}
            animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon className={cn("w-5 h-5", color)} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <div className="flex items-baseline gap-1">
              <motion.span 
                className={cn("text-2xl font-bold tabular-nums", color)}
                animate={isPulsing ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.25 }}
              >
                {display.toLocaleString()}
              </motion.span>
              {suffix && (
                <span className="text-sm text-muted-foreground">{suffix}</span>
              )}
            </div>
          </div>

          {/* Live indicator */}
          {liveIncrement && (
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  bgColor.replace("/20", "")
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  bgColor.replace("/20", "")
                )} />
              </span>
            </div>
          )}
        </div>

        {/* Decorative glow */}
        <div className={cn(
          "absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity",
          bgColor.replace("/20", "")
        )} />
      </div>
    </motion.div>
  );
};

interface LiveActivityStatsProps {
  className?: string;
  totalTriggers?: number;
  activeMentors?: number;
}

export const LiveActivityStats = ({ 
  className,
  totalTriggers = 0,
  activeMentors = 0,
}: LiveActivityStatsProps) => {
  // Generate some fun "today" stats based on actual data
  const baseWrongTakes = Math.max(12, Math.floor(totalTriggers * 0.3));
  const baseConfusions = Math.max(8, Math.floor(totalTriggers * 0.2));
  const baseWisdomDrops = Math.max(5, Math.floor(totalTriggers * 0.15));

  const stats: AnimatedStatProps[] = [
    {
      label: "Wrong Takes Today",
      value: baseWrongTakes,
      icon: Brain,
      color: "text-rose-500",
      bgColor: "bg-rose-500/20",
      liveIncrement: true,
      incrementRate: 4000,
      incrementMin: 1,
      incrementMax: 3,
    },
    {
      label: "Confident Confusions",
      value: baseConfusions,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/20",
      liveIncrement: true,
      incrementRate: 6000,
      incrementMin: 1,
      incrementMax: 2,
    },
    {
      label: "Wisdom Drops",
      value: baseWisdomDrops,
      icon: Sparkles,
      color: "text-violet-500",
      bgColor: "bg-violet-500/20",
      liveIncrement: true,
      incrementRate: 8000,
      incrementMin: 1,
      incrementMax: 2,
    },
    {
      label: "Active Mentors",
      value: activeMentors || 7,
      icon: Coffee,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      suffix: "/ 7",
      liveIncrement: false,
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AnimatedStat {...stat} />
        </motion.div>
      ))}
    </div>
  );
};
