import { useState, useEffect, useCallback } from "react";
import { ThoughtBubble } from "./ThoughtBubble";
import { Button } from "./ui/button";
import { Loader2, RefreshCw, Lightbulb, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BubbleMode } from "@/data/thoughtBubbles";

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

const CYCLE_DURATION = 12000; // 12 seconds per explanation
const FADE_DURATION = 500;

export const BubblesExplainsWidget = () => {
  const [explanations, setExplanations] = useState<Explanation[]>(FALLBACK_EXPLANATIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasLoadedFromAI, setHasLoadedFromAI] = useState(false);

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
    if (isPaused || explanations.length <= 1) return;

    const cycle = () => {
      setIsFading(true);
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % explanations.length);
        setIsFading(false);
      }, FADE_DURATION);
    };

    const interval = setInterval(cycle, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [explanations.length, isPaused]);

  const handleRefresh = async () => {
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

  const currentExplanation = explanations[currentIndex];

  const getModeFromConfidence = (confidence: string): BubbleMode => {
    if (confidence.includes("absolute") || confidence.includes("scientifically")) return "savage";
    if (confidence.includes("unshakeable")) return "triggered";
    if (confidence.includes("very high")) return "concerned";
    return "innocent";
  };

  return (
    <div 
      className="relative max-w-2xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Bubbles Explains</h3>
              <p className="text-xs text-muted-foreground">Wisdom you didn't ask for</p>
            </div>
          </div>
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

        {/* Topic */}
        <div 
          className="transition-all duration-300"
          style={{
            opacity: isFading ? 0 : 1,
            transform: isFading ? 'translateY(-8px)' : 'translateY(0)',
          }}
        >
          <p className="text-sm font-medium text-accent mb-3 flex items-center gap-2">
            <Quote className="h-3 w-3" />
            {currentExplanation.topic}
          </p>

          {/* Explanation bubble */}
          <ThoughtBubble 
            mode={getModeFromConfidence(currentExplanation.confidence)} 
            size="lg"
            className="mb-4"
          >
            <p className="text-foreground leading-relaxed">
              "{currentExplanation.explanation}"
            </p>
          </ThoughtBubble>

          {/* Source and confidence */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="italic">
              Source: {currentExplanation.source}
            </span>
            <span className="font-medium text-accent">
              Confidence: {currentExplanation.confidence}
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {explanations.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsFading(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsFading(false);
                }, FADE_DURATION);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-accent w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to explanation ${index + 1}`}
            />
          ))}
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/60 animate-pulse">
            paused
          </div>
        )}
      </div>

      {/* AI badge */}
      {hasLoadedFromAI && (
        <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          AI-Powered
        </div>
      )}
    </div>
  );
};
