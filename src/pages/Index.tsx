import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import type { BubbleMode } from "@/data/thoughtBubbles";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
}

const BUBBLES_FACTS = [
  { text: "The sun is powered by angry bees.", mode: "innocent" as BubblesMode },
  { text: "Clouds are just sky pillows that got lost.", mode: "innocent" as BubblesMode },
  { text: "WiFi comes from birds. That's why they sit on wires.", mode: "concerned" as BubblesMode },
  { text: "Humans only use 10% of their legs.", mode: "triggered" as BubblesMode },
  { text: "I've researched this. Mountains are just old hills that got promoted.", mode: "savage" as BubblesMode },
];

export default function Index() {
  const [currentThought, setCurrentThought] = useState<ThoughtData | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtData[]>([]);
  const [bubbleKey, setBubbleKey] = useState(0);

  useEffect(() => {
    async function fetchThoughts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .limit(50);

      if (error || !data || data.length === 0) {
        const fallbackThoughts = BUBBLES_FACTS.map((f, i) => ({ 
          id: `fallback-${i}`, 
          text: f.text, 
          mode: f.mode 
        }));
        setThoughts(fallbackThoughts);
        setCurrentThought(fallbackThoughts[0]);
        return;
      }

      setThoughts(data);
      setCurrentThought(data[Math.floor(Math.random() * data.length)]);
    }

    fetchThoughts();
  }, []);

  useEffect(() => {
    if (thoughts.length === 0) return;

    const interval = setInterval(() => {
      const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      setCurrentThought(randomThought);
      setBubbleKey(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [thoughts]);

  // Map nuclear mode to savage for display (since BubbleMode doesn't include nuclear)
  const getDisplayMode = (mode: BubblesMode): BubbleMode => {
    if (mode === 'nuclear') return 'savage';
    return mode as BubbleMode;
  };

  return (
    <Layout>
      {/* Hero - Bubbles introduces themselves */}
      <section className="hero-gradient py-20 md:py-32 overflow-hidden relative">
        <WicklowLandscape />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium">
                  Broadcasting from Sugarloaf Mountain, Wicklow
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                  I'm <span className="text-accent">Bubbles</span>.
                  <br />I know things.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
                  A sheep. An expert. A trusted source of information that is 
                  absolutely, definitely, probably correct.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/collections/all">
                  <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
                    Official Merch
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/facts">
                  <Button size="lg" variant="outline" className="font-display">
                    Learn From Me
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character */}
            <div className="relative flex justify-center items-center">
              <div className="relative">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-bubbles-cream border-4 border-bubbles-heather shadow-2xl flex items-center justify-center animate-float">
                  <div className="relative">
                    <div className="flex gap-6 mb-3">
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-bubbles-peat" />
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-bubbles-peat" />
                    </div>
                    <div className="w-6 h-3 md:w-8 md:h-4 mx-auto rounded-full bg-bubbles-heather/50" />
                  </div>
                </div>
                
                <div className="absolute -top-4 -left-2 w-12 h-12 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
                <div className="absolute -top-2 right-0 w-10 h-10 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
                <div className="absolute top-8 -right-4 w-14 h-14 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
                <div className="absolute -bottom-2 -left-4 w-10 h-10 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
              </div>
              
              {currentThought && (
                <div key={bubbleKey} className="absolute -top-4 right-0 md:right-8 max-w-[280px]">
                  <ThoughtBubble mode={getDisplayMode(currentThought.mode)} size="md">
                    <p className="text-foreground italic">"{currentThought.text}"</p>
                  </ThoughtBubble>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              The Most Informed Sheep in Ireland
            </h2>
            <p className="text-lg text-muted-foreground">
              I live on Sugarloaf Mountain in County Wicklow. I spend my days 
              eating grass and researching important topics. The internet has 
              taught me many things. The mist whispers secrets. I have connected 
              the dots that others refuse to see.
            </p>
            <p className="text-lg text-muted-foreground">
              My thoughts appear in bubbles above my head. This is normal. 
              All sheep have this. You just can't see theirs because they 
              don't know as much as me.
            </p>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            My Qualifications
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bubbles-gorse/20 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-bubbles-gorse">7</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Years of Staring</h3>
              <p className="text-sm text-muted-foreground">
                At the horizon. Thinking. Processing. Understanding things.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bubbles-heather/20 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-bubbles-heather">∞</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Facts Discovered</h3>
              <p className="text-sm text-muted-foreground">
                I cannot count. But it's definitely a lot. Trust me.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Sheep Brain</h3>
              <p className="text-sm text-muted-foreground">
                It's bigger than it looks. The wool hides the extra brain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Shop CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Wear My Thoughts
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium apparel featuring my most important observations. 
            Each purchase supports my research into whether clouds are real.
          </p>
          <Link to="/collections/all">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
              Visit the Shop
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
