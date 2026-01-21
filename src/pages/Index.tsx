import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { BubblesSheep } from "@/components/BubblesSheep";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMood } from "@/contexts/MoodContext";
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

// Timing constants for smooth reading experience
const FADE_DURATION = 600;
const DISPLAY_DURATION = 6000;
const PAUSE_BETWEEN = 800;

export default function Index() {
  const [currentThought, setCurrentThought] = useState<ThoughtData | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtData[]>([]);
  const [bubbleKey, setBubbleKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();
  const { setCurrentMode } = useMood();

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
        setCurrentMode(fallbackThoughts[0].mode);
        return;
      }

      setThoughts(data);
      const initialThought = data[Math.floor(Math.random() * data.length)];
      setCurrentThought(initialThought);
      setCurrentMode(initialThought.mode);
    }

    fetchThoughts();
  }, [setCurrentMode]);

  // Smooth rotation with mood updates
  useEffect(() => {
    if (thoughts.length === 0) return;

    const getNextThought = () => {
      let next = thoughts[Math.floor(Math.random() * thoughts.length)];
      while (next?.id === currentThought?.id && thoughts.length > 1) {
        next = thoughts[Math.floor(Math.random() * thoughts.length)];
      }
      return next;
    };

    const cycle = () => {
      setIsVisible(false);
      
      setTimeout(() => {
        const nextThought = getNextThought();
        setCurrentThought(nextThought);
        setCurrentMode(nextThought.mode); // Update global mood
        setBubbleKey(prev => prev + 1);
        
        setTimeout(() => {
          setIsVisible(true);
        }, PAUSE_BETWEEN);
      }, FADE_DURATION);
    };

    const interval = setInterval(cycle, DISPLAY_DURATION + FADE_DURATION + PAUSE_BETWEEN);

    return () => clearInterval(interval);
  }, [thoughts, currentThought, setCurrentMode]);

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
                  {t("hero.location")}
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                  {t("hero.title.intro")} <span className="text-accent">{t("hero.title.name")}</span>.
                  <br />{t("hero.title.tagline")}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
                  {t("hero.subtitle")}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/collections/all">
                  <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
                    {t("hero.cta.merch")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/facts">
                  <Button size="lg" variant="outline" className="font-display">
                    {t("hero.cta.learn")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character */}
            <div className="relative flex justify-center items-center">
              <BubblesSheep size="xl" className="drop-shadow-2xl" />
              
              {/* Thought bubble with smooth fade transitions */}
              {currentThought && (
                <div 
                  key={bubbleKey} 
                  className="absolute -top-4 right-0 md:right-8 max-w-[280px] transition-all ease-in-out"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
                    transitionDuration: `${FADE_DURATION}ms`,
                  }}
                >
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
              {t("about.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("about.p1")}
            </p>
            <p className="text-lg text-muted-foreground">
              {t("about.p2")}
            </p>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            {t("credentials.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bubbles-gorse/20 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-bubbles-gorse">7</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{t("credentials.staring.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("credentials.staring.desc")}
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bubbles-heather/20 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-bubbles-heather">∞</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{t("credentials.facts.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("credentials.facts.desc")}
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{t("credentials.brain.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("credentials.brain.desc")}
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
            {t("shop.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("shop.subtitle")}
          </p>
          <Link to="/collections/all">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
              {t("shop.cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
