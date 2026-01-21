import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "./ThoughtBubble";
import { getRandomBubble, BubbleMode } from "@/data/thoughtBubbles";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const [currentBubble, setCurrentBubble] = useState(getRandomBubble('innocent'));
  const [bubbleKey, setBubbleKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const modes: BubbleMode[] = ['innocent', 'concerned', 'triggered', 'savage'];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      setCurrentBubble(getRandomBubble(randomMode));
      setBubbleKey(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
            <div 
              key={bubbleKey} 
              className="absolute -top-4 right-0 md:right-8 max-w-[260px]"
            >
              <ThoughtBubble mode={currentBubble.mode} size="md">
                <p className="text-foreground italic">"{currentBubble.text}"</p>
              </ThoughtBubble>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
