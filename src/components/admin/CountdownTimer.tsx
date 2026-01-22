import { useState, useEffect } from "react";
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, isPast } from "date-fns";
import { Clock, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
  compact?: boolean;
  onExpire?: () => void;
}

export function CountdownTimer({ targetDate, className, compact = false, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (isPast(targetDate)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const now = new Date();
    const days = differenceInDays(targetDate, now);
    const hours = differenceInHours(targetDate, now) % 24;
    const minutes = differenceInMinutes(targetDate, now) % 60;
    const seconds = differenceInSeconds(targetDate, now) % 60;

    return { days, hours, minutes, seconds, expired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.expired) {
    return (
      <span className={cn("text-warning font-medium flex items-center gap-1", className)}>
        <Clock className="h-3 w-3 animate-pulse" />
        Sending soon...
      </span>
    );
  }

  if (compact) {
    // Compact format for table cells
    if (timeLeft.days > 0) {
      return (
        <span className={cn("text-muted-foreground text-xs flex items-center gap-1", className)}>
          <Timer className="h-3 w-3" />
          {timeLeft.days}d {timeLeft.hours}h
        </span>
      );
    }
    if (timeLeft.hours > 0) {
      return (
        <span className={cn("text-warning text-xs flex items-center gap-1", className)}>
          <Timer className="h-3 w-3" />
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      );
    }
    return (
      <span className={cn("text-destructive text-xs flex items-center gap-1 animate-pulse", className)}>
        <Timer className="h-3 w-3" />
        {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    );
  }

  // Full format with all segments
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center gap-1 text-xs font-mono">
        {timeLeft.days > 0 && (
          <>
            <TimeSegment value={timeLeft.days} label="d" />
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <TimeSegment value={timeLeft.hours} label="h" highlight={timeLeft.days === 0} />
        <span className="text-muted-foreground">:</span>
        <TimeSegment value={timeLeft.minutes} label="m" highlight={timeLeft.days === 0 && timeLeft.hours === 0} />
        {timeLeft.days === 0 && (
          <>
            <span className="text-muted-foreground">:</span>
            <TimeSegment 
              value={timeLeft.seconds} 
              label="s" 
              highlight={timeLeft.hours === 0 && timeLeft.minutes < 5}
              pulse={timeLeft.hours === 0 && timeLeft.minutes < 1}
            />
          </>
        )}
      </div>
    </div>
  );
}

function TimeSegment({ 
  value, 
  label, 
  highlight = false,
  pulse = false 
}: { 
  value: number; 
  label: string; 
  highlight?: boolean;
  pulse?: boolean;
}) {
  return (
    <span 
      className={cn(
        "tabular-nums",
        highlight && "text-warning font-semibold",
        pulse && "animate-pulse text-destructive"
      )}
    >
      {String(value).padStart(2, '0')}{label}
    </span>
  );
}
