import { cn } from "@/lib/utils";
import { BubbleMode } from "@/data/thoughtBubbles";

interface ThoughtBubbleProps {
  children: React.ReactNode;
  mode?: BubbleMode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThoughtBubble({ children, mode, className, size = 'md' }: ThoughtBubbleProps) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  return (
    <div 
      className={cn(
        "thought-bubble animate-bubble-appear font-display",
        "border-bubbles-heather/30 bg-bubbles-cream/50",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
