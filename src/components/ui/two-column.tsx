import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type GapSize = "none" | "sm" | "md" | "lg" | "xl";
type VerticalAlign = "top" | "center" | "bottom";
type ColumnRatio = "equal" | "left-wide" | "right-wide";

interface TwoColumnProps {
  left: ReactNode;
  right: ReactNode;
  /** Reverse order on all screen sizes */
  reverse?: boolean;
  /** Reverse only on mobile (stacked view) */
  reverseMobile?: boolean;
  /** Gap between columns */
  gap?: GapSize;
  /** Vertical alignment of content */
  align?: VerticalAlign;
  /** Column width ratio */
  ratio?: ColumnRatio;
  className?: string;
}

const gapMap: Record<GapSize, string> = {
  none: "gap-0",
  sm: "gap-4",
  md: "gap-8",
  lg: "gap-12",
  xl: "gap-16",
};

const alignMap: Record<VerticalAlign, string> = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
};

const ratioMap: Record<ColumnRatio, { left: string; right: string }> = {
  equal: { left: "lg:w-1/2", right: "lg:w-1/2" },
  "left-wide": { left: "lg:w-3/5", right: "lg:w-2/5" },
  "right-wide": { left: "lg:w-2/5", right: "lg:w-3/5" },
};

/**
 * Two-column layout for side-by-side content (e.g., image + text).
 * Stacks vertically on mobile, side-by-side on larger screens.
 *
 * @example
 * <TwoColumn
 *   left={<img src="..." alt="..." className="rounded-lg" />}
 *   right={<div><h2>Title</h2><p>Description...</p></div>}
 *   align="center"
 *   gap="lg"
 * />
 *
 * @example Reversed with wide right column
 * <TwoColumn
 *   left={<TextContent />}
 *   right={<ImageContent />}
 *   reverse
 *   ratio="right-wide"
 * />
 */
export function TwoColumn({
  left,
  right,
  reverse = false,
  reverseMobile = false,
  gap = "md",
  align = "center",
  ratio = "equal",
  className,
}: TwoColumnProps) {
  const ratioClasses = ratioMap[ratio];

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row w-full",
        gapMap[gap],
        alignMap[align],
        reverse && "lg:flex-row-reverse",
        reverseMobile && "flex-col-reverse",
        className
      )}
    >
      <div className={cn("w-full", ratioClasses.left)}>{left}</div>
      <div className={cn("w-full", ratioClasses.right)}>{right}</div>
    </div>
  );
}
