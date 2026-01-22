import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Extended mode type that includes nuclear (matches database enum)
export type ExtendedBubbleMode = 'innocent' | 'concerned' | 'triggered' | 'savage' | 'nuclear';

interface ModeBadgeProps {
  mode: ExtendedBubbleMode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  showDescription?: boolean;
}

const modeConfig: Record<ExtendedBubbleMode, { 
  label: string; 
  description: string;
  emoji: string;
  bgClass: string;
  activeClass: string;
}> = {
  innocent: { 
    label: 'Innocent',
    description: 'Sweetly misguided',
    emoji: '🌸',
    bgClass: 'bg-mode-innocent/10 text-mode-innocent border-mode-innocent/30 hover:bg-mode-innocent/20',
    activeClass: 'bg-mode-innocent text-white border-mode-innocent',
  },
  concerned: { 
    label: 'Concerned',
    description: 'Slightly worried',
    emoji: '🌫️',
    bgClass: 'bg-mode-concerned/10 text-mode-concerned border-mode-concerned/30 hover:bg-mode-concerned/20',
    activeClass: 'bg-mode-concerned text-white border-mode-concerned',
  },
  triggered: { 
    label: 'Triggered',
    description: 'Visibly bothered',
    emoji: '🔥',
    bgClass: 'bg-mode-triggered/10 text-mode-triggered border-mode-triggered/30 hover:bg-mode-triggered/20',
    activeClass: 'bg-mode-triggered text-white border-mode-triggered',
  },
  savage: { 
    label: 'Savage',
    description: 'Gloves are off',
    emoji: '💅',
    bgClass: 'bg-mode-savage/10 text-mode-savage border-mode-savage/30 hover:bg-mode-savage/20',
    activeClass: 'bg-mode-savage text-white border-mode-savage',
  },
  nuclear: { 
    label: 'Nuclear',
    description: 'Total meltdown',
    emoji: '☢️',
    bgClass: 'bg-mode-nuclear/10 text-mode-nuclear border-mode-nuclear/30 hover:bg-mode-nuclear/20',
    activeClass: 'bg-mode-nuclear text-peat-earth border-mode-nuclear',
  },
};

export function ModeBadge({ mode, className, onClick, active, showDescription }: ModeBadgeProps) {
  const config = modeConfig[mode];
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all duration-200",
        active ? config.activeClass : config.bgClass,
        mode === 'nuclear' && active && "animate-pulse",
        className
      )}
    >
      <span className="text-base">{config.emoji}</span>
      <span>{config.label}</span>
      {showDescription && (
        <span className="text-xs opacity-70 hidden sm:inline">
          · {config.description}
        </span>
      )}
    </motion.button>
  );
}

// Escalation scale visualization component
export function ModeEscalationScale({ 
  activeMode, 
  onModeSelect 
}: { 
  activeMode: ExtendedBubbleMode | null;
  onModeSelect: (mode: ExtendedBubbleMode) => void;
}) {
  const modes: ExtendedBubbleMode[] = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'];
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Calm</span>
        <div className="flex-1 h-px bg-gradient-to-r from-mode-innocent via-mode-triggered to-mode-nuclear" />
        <span>Chaos</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <ModeBadge
            key={mode}
            mode={mode}
            active={activeMode === mode}
            onClick={() => onModeSelect(mode)}
          />
        ))}
      </div>
    </div>
  );
}
