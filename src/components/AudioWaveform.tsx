import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AudioWaveformProps {
  audioElement: HTMLAudioElement | null;
  isActive: boolean;
  className?: string;
  barCount?: number;
  showLabel?: boolean;
  compact?: boolean;
}

export const AudioWaveform = ({
  audioElement,
  isActive,
  className,
  barCount,
  showLabel = true,
  compact,
}: AudioWaveformProps) => {
  const isMobile = useIsMobile();
  
  // Auto-detect compact mode on mobile, or use explicit prop
  const isCompact = compact ?? isMobile;
  const effectiveBarCount = barCount ?? (isCompact ? 6 : 12);
  const [bars, setBars] = useState<number[]>(Array(effectiveBarCount).fill(4));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const connectedElementRef = useRef<HTMLAudioElement | null>(null);

  const updateBars = useCallback(() => {
    if (!analyserRef.current || !isActive) {
      // Idle animation when not actively playing
      setBars(prev => prev.map((_, i) => 
        4 + Math.sin(Date.now() / 300 + i * 0.5) * 2
      ));
      animationRef.current = requestAnimationFrame(updateBars);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Map frequency data to bars
    const newBars: number[] = [];
    const sliceWidth = Math.floor(dataArray.length / effectiveBarCount);
    
    // Use smaller max height for compact mode
    const maxHeight = isCompact ? 24 : 32;
    
    for (let i = 0; i < effectiveBarCount; i++) {
      // Sample from different frequency ranges for varied visualization
      const startIndex = i * sliceWidth;
      let sum = 0;
      for (let j = 0; j < sliceWidth; j++) {
        sum += dataArray[startIndex + j] || 0;
      }
      const average = sum / sliceWidth;
      // Map 0-255 to min-max bar heights
      const height = Math.max(4, (average / 255) * maxHeight);
      newBars.push(height);
    }

    setBars(newBars);
    animationRef.current = requestAnimationFrame(updateBars);
  }, [isActive, effectiveBarCount, isCompact]);

  useEffect(() => {
    // Only create a new audio context and connect if we have a new audio element
    if (audioElement && audioElement !== connectedElementRef.current) {
      // Clean up previous connections
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }

      try {
        // Create or reuse AudioContext
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext();
        }

        const audioContext = audioContextRef.current;
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // Create analyser
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        analyserRef.current = analyser;

        // Create media element source
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;
        connectedElementRef.current = audioElement;

      } catch (error) {
        console.warn("Failed to setup audio visualization:", error);
      }
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(updateBars);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, updateBars]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-0.5 rounded-full",
        "bg-gradient-to-r from-accent/20 to-bubbles-meadow/20",
        "border border-accent/30",
        isCompact ? "px-2 py-1" : "px-3 py-1.5",
        className
      )}
    >
      <div className={cn(
        "flex items-center gap-[2px]",
        isCompact ? "h-6" : "h-8"
      )}>
        {bars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-75",
              "bg-gradient-to-t from-accent via-accent to-bubbles-gorse",
              isCompact ? "w-[2px]" : "w-[3px]"
            )}
            style={{
              height: `${height}px`,
              opacity: 0.7 + (height / (isCompact ? 24 : 32)) * 0.3,
            }}
          />
        ))}
      </div>
      {showLabel && !isCompact && (
        <span className="ml-2 text-xs text-accent font-medium whitespace-nowrap">
          Speaking
        </span>
      )}
    </div>
  );
};
