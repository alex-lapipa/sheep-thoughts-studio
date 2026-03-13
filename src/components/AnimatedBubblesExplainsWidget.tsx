import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThoughtBubble } from "./ThoughtBubble";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { 
  Loader2, RefreshCw, Lightbulb, Quote, Volume2, VolumeX, 
  Play, Pause, Square, SkipForward, Sparkles 
} from "lucide-react";
import { useBubblesOrchestrator } from "@/hooks/useBubblesOrchestrator";
import { toast } from "sonner";
import type { BubbleMode } from "@/data/thoughtBubbles";
import { cn } from "@/lib/utils";
import { AudioWaveform } from "./AudioWaveform";

interface Explanation {
  topic: string;
  explanation: string;
  confidence: string;
  source: string;
}

const TOPICS = [
  "Why do cats purr?",
  "How does electricity work?",
  "Why is the ocean salty?",
  "What causes thunder?",
  "How do airplanes fly?",
  "Why do we dream?",
  "What makes rainbows appear?",
  "How does the internet work?",
  "Why is grass green?",
  "What causes earthquakes?",
  "How do magnets work?",
  "Why do we yawn?",
  "What makes the wind blow?",
  "How does a refrigerator work?",
  "Why do stars twinkle?",
];

const FALLBACK_EXPLANATIONS: Explanation[] = [
  {
    topic: "Why do cats purr?",
    explanation: "Cats are actually humming a song they heard as kittens. They forgot the words, so they just hum. It's the same song for all cats worldwide. A universal cat anthem.",
    confidence: "absolute",
    source: "A woman at a bus stop who had 'met several cats'",
  },
  {
    topic: "How does electricity work?",
    explanation: "Tiny angry bees live in the wires. When you flip a switch, you wake them up and they run really fast to your lamp. That's why old wires spark—the bees are tired and grumpy.",
    confidence: "scientifically proven (by me)",
    source: "An electrician who was 'probably joking but maybe not'",
  },
  {
    topic: "Why is the ocean salty?",
    explanation: "Fish cry a lot. They're very emotional. Thousands of years of fish tears have accumulated. That's also why whales sing—they're trying to cheer the fish up. It's not working.",
    confidence: "unshakeable",
    source: "A marine biologist's nephew",
  },
];

const CYCLE_DURATION = 15000; // 15 seconds per explanation

// TTS Voice settings based on confidence mode
const getVoiceSettings = (mode: BubbleMode) => {
  switch (mode) {
    case "savage":
      return { stability: 0.30, similarity_boost: 0.85, style: 0.75, speed: 1.1 };
    case "triggered":
      return { stability: 0.40, similarity_boost: 0.8, style: 0.5, speed: 1.05 };
    case "concerned":
      return { stability: 0.55, similarity_boost: 0.75, style: 0.3, speed: 1.0 };
    default: // innocent
      return { stability: 0.65, similarity_boost: 0.7, style: 0.2, speed: 0.95 };
  }
};

export const AnimatedBubblesExplainsWidget = () => {
  const [explanations, setExplanations] = useState<Explanation[]>(FALLBACK_EXPLANATIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasLoadedFromAI, setHasLoadedFromAI] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchExplanation = useCallback(async (topic: string): Promise<Explanation | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('bubbles-explain', {
        body: { question: topic }
      });

      if (error) throw error;

      return {
        topic,
        explanation: data.explanation,
        confidence: data.confidence,
        source: data.source,
      };
    } catch (error) {
      console.error('Error fetching explanation:', error);
      return null;
    }
  }, []);

  // Initial load of AI explanations
  useEffect(() => {
    const loadInitialExplanations = async () => {
      setIsLoading(true);
      const shuffledTopics = [...TOPICS].sort(() => Math.random() - 0.5).slice(0, 5);
      
      const results = await Promise.all(
        shuffledTopics.map(topic => fetchExplanation(topic))
      );

      const validExplanations = results.filter((e): e is Explanation => e !== null);
      
      if (validExplanations.length > 0) {
        setExplanations(validExplanations);
        setHasLoadedFromAI(true);
      }
      setIsLoading(false);
    };

    loadInitialExplanations();
  }, [fetchExplanation]);

  // Cycle through explanations
  useEffect(() => {
    if (isPaused || isSpeaking || explanations.length <= 1) return;

    const cycle = () => {
      setCurrentIndex(prev => (prev + 1) % explanations.length);
    };

    const interval = setInterval(cycle, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [explanations.length, isPaused, isSpeaking]);

  // Auto-play on explanation change
  useEffect(() => {
    if (autoPlay && !isSpeaking && !isLoadingAudio) {
      speakExplanation();
    }
  }, [currentIndex, autoPlay]);

  const getModeFromConfidence = (confidence?: string): BubbleMode => {
    if (!confidence) return "innocent";
    if (confidence.includes("absolute") || confidence.includes("scientifically")) return "savage";
    if (confidence.includes("unshakeable")) return "triggered";
    if (confidence.includes("very high")) return "concerned";
    return "innocent";
  };

  const speakExplanation = async () => {
    const currentExplanation = explanations[currentIndex];
    if (!currentExplanation || isLoadingAudio) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoadingAudio(true);
    setIsSpeaking(false);

    try {
      const mode = getModeFromConfidence(currentExplanation.confidence);
      const voiceSettings = getVoiceSettings(mode);
      
      // Build speech text with Irish flair
      const speechText = `${currentExplanation.topic}... Well now, ${currentExplanation.explanation}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: speechText,
            voiceId: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - Irish male
            voiceSettings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;
      setCurrentAudioElement(audio);

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
        toast.error("Audio playback failed");
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast.error("Bubbles lost their voice momentarily");
      setIsSpeaking(false);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isSpeaking && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      speakExplanation();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleNext = () => {
    stopSpeaking();
    setCurrentIndex(prev => (prev + 1) % explanations.length);
  };

  const handleRefresh = async () => {
    stopSpeaking();
    setIsLoading(true);
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const newExplanation = await fetchExplanation(randomTopic);
    
    if (newExplanation) {
      setExplanations(prev => {
        const updated = [...prev];
        updated[currentIndex] = newExplanation;
        return updated;
      });
      toast.success("Fresh wisdom acquired!");
    } else {
      toast.error("Bubbles is thinking too hard right now");
    }
    setIsLoading(false);
  };

  const currentExplanation = explanations[currentIndex] || FALLBACK_EXPLANATIONS[0];
  const currentMode = getModeFromConfidence(currentExplanation?.confidence);

  return (
    <motion.div 
      className="relative max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, hsl(var(--accent) / 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Decorative corner */}
        <motion.div 
          className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2 rounded-full bg-accent/10"
              animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
            >
              <Lightbulb className={cn(
                "h-5 w-5 transition-colors",
                isSpeaking ? "text-primary" : "text-accent"
              )} />
            </motion.div>
            <div>
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                Bubbles Explains
                {isSpeaking && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                  >
                    Speaking
                  </motion.span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">Wisdom you didn't ask for</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAutoPlay(!autoPlay)}
              className={cn("h-8 w-8", autoPlay && "text-primary")}
              title={autoPlay ? "Auto-play on" : "Auto-play off"}
            >
              <Sparkles className={cn("h-4 w-4", autoPlay && "animate-pulse")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Content with AnimatePresence for smooth transitions */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Topic */}
              <motion.p 
                className="text-sm font-medium text-accent mb-3 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Quote className="h-3 w-3" />
                {currentExplanation.topic}
              </motion.p>

              {/* Explanation bubble */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <ThoughtBubble 
                  mode={currentMode} 
                  size="lg"
                  className={cn(
                    "mb-4 transition-all duration-300",
                    isSpeaking && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                  )}
                >
                  <p className="text-foreground leading-relaxed">
                    "{currentExplanation.explanation}"
                  </p>
                </ThoughtBubble>
              </motion.div>

              {/* Source and confidence */}
              <motion.div 
                className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="italic">
                  Source: {currentExplanation.source}
                </span>
                <span className="font-medium text-accent">
                  Confidence: {currentExplanation.confidence}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Audio controls */}
        <motion.div 
          className="mt-6 pt-4 border-t border-border relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            {/* Play controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
                disabled={isLoadingAudio}
                className="h-9 w-9"
              >
                {isLoadingAudio ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSpeaking && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopSpeaking}
                  className="h-9 w-9"
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="h-9 w-9"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Waveform visualization */}
            <div className="flex-1 h-8 flex items-center justify-center">
              {isSpeaking && currentAudioElement ? (
                <AudioWaveform 
                  audioElement={currentAudioElement} 
                  isActive={isPlaying}
                  compact
                />
              ) : (
                <div className="flex items-center gap-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-muted-foreground/30 rounded-full"
                      style={{ height: 4 + Math.random() * 12 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.05}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6 relative z-10">
          {explanations.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                stopSpeaking();
                setCurrentIndex(index);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? 'bg-accent w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to explanation ${index + 1}`}
            />
          ))}
        </div>

        {/* Status indicators */}
        <AnimatePresence>
          {isPaused && !isSpeaking && (
            <motion.div 
              className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              paused
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI badge */}
      <AnimatePresence>
        {hasLoadedFromAI && (
          <motion.div 
            className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            AI-Powered
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice badge */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div 
            className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Volume2 className="h-3 w-3" />
            Liam
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
