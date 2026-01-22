import { cn } from "@/lib/utils";

type SpacerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface SpacerProps {
  size?: SpacerSize;
  className?: string;
}

const sizeMap: Record<SpacerSize, string> = {
  xs: "h-2",      // 8px
  sm: "h-4",      // 16px
  md: "h-8",      // 32px
  lg: "h-12",     // 48px
  xl: "h-16",     // 64px
  "2xl": "h-24",  // 96px
  "3xl": "h-32",  // 128px
};

/**
 * Spacer component for controlling vertical spacing between elements.
 * 
 * @example
 * <Spacer size="lg" />
 * <Spacer size="md" className="hidden md:block" /> // Responsive
 */
export function Spacer({ size = "md", className }: SpacerProps) {
  return (
    <div 
      className={cn(sizeMap[size], "w-full", className)} 
      aria-hidden="true" 
    />
  );
}
