import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LowStockBadgeProps {
  quantity: number;
  threshold?: number;
  urgentThreshold?: number;
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Low stock urgency badge component
 * Shows "Only X left!" when inventory is low to drive conversions
 * 
 * @param quantity - Current stock quantity
 * @param threshold - Show badge when quantity <= threshold (default: 10)
 * @param urgentThreshold - Show urgent styling when quantity <= urgentThreshold (default: 3)
 * @param variant - "default" shows full badge, "compact" shows smaller version
 */
export function LowStockBadge({ 
  quantity, 
  threshold = 10, 
  urgentThreshold = 3,
  className,
  variant = "default"
}: LowStockBadgeProps) {
  // Don't show if quantity is above threshold or out of stock
  if (quantity > threshold || quantity <= 0) {
    return null;
  }

  const isUrgent = quantity <= urgentThreshold;

  if (variant === "compact") {
    return (
      <Badge 
        variant="secondary"
        className={cn(
          "gap-1 text-xs font-medium",
          isUrgent 
            ? "bg-destructive/15 text-destructive border-destructive/30 animate-pulse" 
            : "bg-warning/15 text-warning-foreground border-warning/30",
          className
        )}
      >
        {isUrgent ? <Flame className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
        {quantity} left
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "gap-1.5 font-medium",
        isUrgent 
          ? "bg-destructive/15 text-destructive border-destructive/30 animate-pulse" 
          : "bg-warning/15 text-warning-foreground border-warning/30",
        className
      )}
    >
      {isUrgent ? <Flame className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      Only {quantity} left!
    </Badge>
  );
}

/**
 * Helper to calculate total inventory from variants
 * Note: quantityAvailable requires special Storefront API scope
 * If not available, returns 0 (badges won't show)
 */
export function calculateTotalInventory(variants: Array<{ node: Record<string, unknown> }> | undefined): number {
  if (!variants) return 0;
  return variants.reduce((sum, v) => {
    const qty = typeof v.node?.quantityAvailable === 'number' ? v.node.quantityAvailable : 0;
    return sum + qty;
  }, 0);
}

/**
 * Helper to get specific variant inventory
 * Note: quantityAvailable requires special Storefront API scope
 * If not available, returns 0 (badges won't show)
 */
export function getVariantInventory(variant: Record<string, unknown> | undefined): number {
  if (!variant) return 0;
  return typeof variant.quantityAvailable === 'number' ? variant.quantityAvailable : 0;
}
