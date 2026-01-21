import { cn } from "@/lib/utils";
import { BubbleMode } from "@/data/thoughtBubbles";

interface ThoughtBubbleProps {
  children: React.ReactNode;
  mode?: BubbleMode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThoughtBubble({ children, mode = 'innocent', className, size = 'md' }: ThoughtBubbleProps) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  const modeClasses = {
    innocent: 'border-green-200 bg-green-50/50',
    concerned: 'border-yellow-200 bg-yellow-50/50',
    triggered: 'border-orange-200 bg-orange-50/50',
    savage: 'border-red-300 bg-red-50/50',
  };

  return (
    <div 
      className={cn(
        "thought-bubble animate-bubble-appear font-display",
        sizeClasses[size],
        modeClasses[mode],
        className
      )}
    >
      {children}
    </div>
  );
}
