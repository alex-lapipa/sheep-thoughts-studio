import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "./ThoughtBubble";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
}

const MODES: BubblesMode[] = ['innocent', 'concerned', 'triggered', 'savage'];

export function HeroSection() {
  const [currentThought, setCurrentThought] = useState<ThoughtData | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtData[]>([]);
  const [bubbleKey, setBubbleKey] = useState(0);

  // Fetch thoughts from database on mount
  useEffect(() => {
    async function fetchThoughts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .in('mode', MODES)
        .limit(50);

      if (error) {
        console.error('Error fetching thoughts:', error);
        return;
      }

      if (data && data.length > 0) {
        setThoughts(data);
        // Set initial random thought
        const randomThought = data[Math.floor(Math.random() * data.length)];
        setCurrentThought(randomThought);
      }
    }

    fetchThoughts();
  }, []);

  // Rotate thoughts every 4 seconds
  useEffect(() => {
    if (thoughts.length === 0) return;

    const interval = setInterval(() => {
      const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      setCurrentThought(randomThought);
      setBubbleKey(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [thoughts]);

  return (
    <section className="hero-gradient py-20 md:py-32 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                Meet <span className="text-accent">Bubbles</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
                Cute on the outside. Quietly savage inside the thought bubbles.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/collections/all">
                <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="font-display">
                  The Lore
                </Button>
              </Link>
            </div>
          </div>

          {/* Sheep + Bubble */}
          <div className="relative flex justify-center items-center">
            <div className="text-[180px] md:text-[240px] animate-float select-none">
              🐑
            </div>
            
            {/* Thought Bubble */}
            {currentThought && (
              <div 
                key={bubbleKey} 
                className="absolute -top-4 right-0 md:right-8 max-w-[260px]"
              >
                <ThoughtBubble mode={currentThought.mode as any} size="md">
                  <p className="text-foreground italic">"{currentThought.text}"</p>
                </ThoughtBubble>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
