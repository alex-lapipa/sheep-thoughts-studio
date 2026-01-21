import { cn } from "@/lib/utils";
import { BubbleMode } from "@/data/thoughtBubbles";

interface ModeBadgeProps {
  mode: BubbleMode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const modeLabels: Record<BubbleMode, string> = {
  innocent: '😇 Innocent',
  concerned: '😰 Concerned',
  triggered: '😤 Triggered',
  savage: '🔥 Savage',
};

export function ModeBadge({ mode, className, onClick, active }: ModeBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mode-badge cursor-pointer border-2 border-transparent",
        `mode-${mode}`,
        active && "ring-2 ring-offset-2 ring-accent",
        className
      )}
    >
      {modeLabels[mode]}
    </button>
  );
}
