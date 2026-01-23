import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { 
  Cloud, Heart, Home, Mountain, Sparkles, TreePine, BookOpen,
  ChevronUp, ChevronDown, Flame, TrendingUp, Wrench, Flower2, Car, GripVertical
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
  jony: { name: "Jony", color: "text-cyan-500", icon: Wrench },
  maureen: { name: "Maureen", color: "text-pink-500", icon: Flower2 },
  eddie: { name: "Eddie", color: "text-indigo-500", icon: Car },
  betty: { name: "Betty", color: "text-lime-500", icon: Heart },
};

const STORAGE_KEY = "mentor-widget-position";

export const MentorFrequencyWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastTriggeredMentor, setLastTriggeredMentor] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prevTotalRef = useRef<number | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const { data, isLoading } = useMentorFrequency(30);

  // Load saved position from localStorage
  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { x: 0, y: 0 };
        }
      }
    }
    return { x: 0, y: 0 };
  });

  const top3 = data?.stats.slice(0, 3) || [];

  // Detect new triggers and pulse
  useEffect(() => {
    if (data?.total !== undefined) {
      if (prevTotalRef.current !== null && data.total > prevTotalRef.current) {
        setIsPulsing(true);
        
        if (data.stats.length > 0) {
          setLastTriggeredMentor(data.stats[0].mentor_id);
        }
        
        const timeout = setTimeout(() => {
          setIsPulsing(false);
          setLastTriggeredMentor(null);
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
      prevTotalRef.current = data.total;
    }
  }, [data?.total, data?.stats]);

  // Save position when drag ends
  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    setPosition(newPosition);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
    setIsDragging(false);
  };

  if (isLoading || top3.length === 0) return null;

  const pulsingMentorConfig = lastTriggeredMentor ? MENTOR_CONFIG[lastTriggeredMentor] : null;

  return (
    <>
      {/* Invisible drag constraints container */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-4 pointer-events-none z-30"
      />
      
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: position.x, y: position.y }}
        animate={{ opacity: 1, x: position.x, y: position.y }}
        style={{ x: position.x, y: position.y }}
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-40 touch-none",
          isDragging && "cursor-grabbing"
        )}
        whileDrag={{ scale: 1.02 }}
      >
        {/* Pulse ring animation */}
        <AnimatePresence>
          {isPulsing && (
            <>
              <motion.div
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl border-2 border-accent pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0.4, scale: 1 }}
                animate={{ opacity: 0, scale: 1.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                className="absolute inset-0 rounded-2xl border border-accent pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>

        <motion.div 
          className={cn(
            "relative backdrop-blur-xl bg-card/80 border rounded-2xl shadow-xl overflow-hidden",
            "transition-all duration-300",
            isPulsing ? "border-accent shadow-accent/20" : "border-white/10"
          )}
          animate={isPulsing ? { 
            scale: [1, 1.02, 1],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Drag handle */}
          <div 
            className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing border-b border-white/5 hover:bg-accent/5 transition-colors"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
          </div>

          {/* Header */}
          <button
            onClick={() => !isDragging && setIsExpanded(!isExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent/10 transition-colors"
          >
            <motion.div
              animate={isPulsing ? { 
                scale: [1, 1.3, 1],
                rotate: [0, -10, 10, 0]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <Flame className={cn(
                "w-4 h-4 transition-colors",
                isPulsing ? "text-accent" : "text-amber-500"
              )} />
            </motion.div>
            <span className="text-xs font-medium">
              {isPulsing && pulsingMentorConfig ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-accent"
                >
                  {pulsingMentorConfig.name} triggered!
                </motion.span>
              ) : (
                "Top Mentors"
              )}
            </span>
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
                    const isTriggered = isPulsing && stat.mentor_id === lastTriggeredMentor;
                    
                    return (
                      <motion.div 
                        key={stat.mentor_id}
                        className={cn(
                          "relative p-1.5 rounded-lg bg-muted/50",
                          index === 0 && "ring-1 ring-amber-500/50",
                          isTriggered && "ring-2 ring-accent"
                        )}
                        title={`${config.name}: ${stat.trigger_count} triggers`}
                        animate={isTriggered ? { 
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className={cn("w-4 h-4", config.color)} />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                        )}
                        {isTriggered && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent flex items-center justify-center"
                          >
                            <span className="text-[8px] text-accent-foreground font-bold">!</span>
                          </motion.div>
                        )}
                      </motion.div>
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
                  const isTriggered = isPulsing && stat.mentor_id === lastTriggeredMentor;
                  
                  return (
                    <motion.div
                      key={stat.mentor_id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: isTriggered ? [1, 1.05, 1] : 1
                      }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-2 rounded-lg p-1 -m-1",
                        isTriggered && "bg-accent/10"
                      )}
                    >
                      <motion.div 
                        className={cn(
                          "p-1.5 rounded-lg bg-muted/50",
                          index === 0 && "ring-1 ring-amber-500/50",
                          isTriggered && "ring-2 ring-accent"
                        )}
                        animate={isTriggered ? { rotate: [0, -5, 5, 0] } : {}}
                      >
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium truncate">
                            {config.name}
                          </span>
                          <motion.span 
                            className={cn("text-xs font-bold", config.color)}
                            animate={isTriggered ? { scale: [1, 1.3, 1] } : {}}
                          >
                            {stat.trigger_count}
                          </motion.span>
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
        </motion.div>
      </motion.div>
    </>
  );
};
