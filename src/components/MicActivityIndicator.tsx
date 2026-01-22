import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MicActivityIndicatorProps {
  isActive: boolean;
  className?: string;
  compact?: boolean;
}

export const MicActivityIndicator = ({
  isActive,
  className,
  compact,
}: MicActivityIndicatorProps) => {
  const isMobile = useIsMobile();
  const isCompact = compact ?? isMobile;
  const [pulseScale, setPulseScale] = useState(1);

  // Simulate voice activity with random pulse
  useEffect(() => {
    if (!isActive) {
      setPulseScale(1);
      return;
    }

    const interval = setInterval(() => {
      // Random scale between 1 and 1.3 to simulate voice activity
      setPulseScale(1 + Math.random() * 0.3);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full",
        "bg-gradient-to-r from-destructive/20 to-red-400/20",
        "border border-destructive/40",
        isCompact ? "px-2 py-1" : "px-3 py-1.5",
        className
      )}
    >
      {/* Animated mic icon with pulse rings */}
      <div className="relative">
        <Mic
          className={cn(
            "text-destructive flex-shrink-0 transition-transform duration-100",
            isCompact ? "w-3 h-3" : "w-4 h-4"
          )}
          style={{
            transform: `scale(${pulseScale})`,
          }}
        />
        {/* Pulse rings */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-destructive/30",
            "animate-ping"
          )}
          style={{
            animationDuration: "1.5s",
          }}
        />
      </div>

      {/* Activity bars */}
      <div
        className={cn(
          "flex items-center gap-[2px]",
          isCompact ? "h-4" : "h-5"
        )}
      >
        {[...Array(isCompact ? 3 : 5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-gradient-to-t from-destructive to-red-400",
              isCompact ? "w-[2px]" : "w-[2.5px]"
            )}
            style={{
              height: `${4 + Math.random() * (isCompact ? 12 : 16)}px`,
              opacity: 0.6 + Math.random() * 0.4,
              animation: `micPulse ${0.3 + i * 0.1}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {!isCompact && (
        <span className="text-xs text-destructive font-medium whitespace-nowrap">
          Listening
        </span>
      )}

      <style>{`
        @keyframes micPulse {
          0% {
            transform: scaleY(0.5);
          }
          100% {
            transform: scaleY(1.2);
          }
        }
      `}</style>
    </div>
  );
};
