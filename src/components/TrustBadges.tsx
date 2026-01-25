import { Truck, ShieldCheck, RotateCcw, CreditCard, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgesProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
}

const badges = [
  {
    icon: Truck,
    label: "Free Shipping",
    description: "On orders over €50",
  },
  {
    icon: ShieldCheck,
    label: "Secure Checkout",
    description: "SSL encrypted payment",
  },
  {
    icon: RotateCcw,
    label: "30-Day Returns",
    description: "Hassle-free returns",
  },
  {
    icon: Leaf,
    label: "Eco-Friendly",
    description: "Sustainable packaging",
  },
];

const paymentMethods = [
  { name: "Visa", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "PayPal", icon: "🅿️" },
  { name: "Apple Pay", icon: "🍎" },
];

export function TrustBadges({ variant = "default", className }: TrustBadgesProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-4 text-sm text-muted-foreground", className)}>
        {badges.slice(0, 3).map((badge) => (
          <div key={badge.label} className="flex items-center gap-1.5">
            <badge.icon className="h-4 w-4 text-accent" />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div 
              key={badge.label} 
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
            >
              <badge.icon className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-xs font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Secure payments via</span>
          <div className="flex gap-1">
            {paymentMethods.map((method) => (
              <span key={method.name} className="text-sm" title={method.name}>
                {method.icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4 p-4 rounded-xl bg-secondary/30 border border-border", className)}>
      <h4 className="font-display font-semibold text-sm flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-accent" />
        Shop with Confidence
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <div key={badge.label} className="flex items-start gap-2">
            <div className="p-1.5 rounded-md bg-accent/10 flex-shrink-0">
              <badge.icon className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{badge.label}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">We accept:</span>
        <div className="flex gap-2">
          <div className="px-2 py-1 rounded bg-background border border-border text-xs font-medium">Visa</div>
          <div className="px-2 py-1 rounded bg-background border border-border text-xs font-medium">MC</div>
          <div className="px-2 py-1 rounded bg-background border border-border text-xs font-medium">PayPal</div>
          <div className="px-2 py-1 rounded bg-background border border-border text-xs font-medium">Apple Pay</div>
        </div>
      </div>
    </div>
  );
}
