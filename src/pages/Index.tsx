import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { BubblesSheep } from "@/components/BubblesSheep";
import { CrossLinks } from "@/components/CrossLinks";
import { ConfusionPrompt } from "@/components/ConfusionPrompt";
import { StorefrontScenarioPlayer } from "@/components/StorefrontScenarioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles } from "lucide-react";
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
  const [isPaused, setIsPaused] = useState(false);
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

  // Smooth rotation with mood updates - pauses on hover
  useEffect(() => {
    if (thoughts.length === 0 || isPaused) return;

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
  }, [thoughts, currentThought, setCurrentMode, isPaused]);

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
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium animate-slide-up">
                  {t("hero.location")}
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-pop-in">
                  {t("hero.title.intro")} <span className="text-accent animate-wobble inline-block">{t("hero.title.name")}</span>.
                  <br />{t("hero.title.tagline")}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                  {t("hero.subtitle")}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
                <Link to="/collections/all">
                  <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display hover:scale-105 hover:animate-squish transition-all">
                    {t("hero.cta.merch")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/facts">
                  <Button size="lg" variant="outline" className="font-display hover:scale-105 hover:animate-wiggle transition-all">
                    {t("hero.cta.learn")}
                  </Button>
                </Link>
                <Link to="/scenarios">
                  <Button size="lg" variant="ghost" className="font-display hover:scale-105 transition-all group">
                    <Sparkles className="mr-2 h-4 w-4 group-hover:animate-confused-spin" />
                    Watch Escalations
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character */}
            <div className="relative flex justify-center items-center">
              <div className="hover:animate-baa transition-transform cursor-pointer">
                <BubblesSheep size="xl" className="drop-shadow-2xl animate-float" />
              </div>
              
              {/* Thought bubble with smooth fade transitions */}
              {currentThought && (
                <div 
                  key={bubbleKey} 
                  className="absolute -top-4 right-0 md:right-8 max-w-[280px] transition-all ease-in-out cursor-pointer group"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
                    transitionDuration: `${FADE_DURATION}ms`,
                  }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <ThoughtBubble mode={getDisplayMode(currentThought.mode)} size="md">
                    <p className="text-foreground italic">"{currentThought.text}"</p>
                  </ThoughtBubble>
                  {/* Progress indicator */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    <div className="relative w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary/60 rounded-full"
                        style={{
                          animation: isPaused ? 'none' : `progress ${DISPLAY_DURATION}ms linear`,
                          animationFillMode: 'forwards',
                        }}
                      />
                    </div>
                    {isPaused && (
                      <span className="text-[10px] text-muted-foreground/70 animate-pulse">paused</span>
                    )}
                  </div>
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

      {/* Scenario Player - Live Escalation Demo */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-bubbles-gorse/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-bubbles-heather/10 blur-3xl" />
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Watch My Brain Work
            </h2>
            <p className="text-muted-foreground">
              See how I process information from innocent curiosity to nuclear certainty. 
              This is normal. This is research.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <StorefrontScenarioPlayer autoPlay={true} showTitle={true} />
          </div>
          
          <div className="text-center mt-8">
            <Link to="/scenarios">
              <Button variant="outline" className="font-display">
                Explore All Scenarios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
            {[
              { count: "7", label: t("credentials.staring.title"), desc: t("credentials.staring.desc"), color: "bg-bubbles-gorse/20", textColor: "text-bubbles-gorse" },
              { count: "∞", label: t("credentials.facts.title"), desc: t("credentials.facts.desc"), color: "bg-bubbles-heather/20", textColor: "text-bubbles-heather" },
              { count: "1", label: t("credentials.brain.title"), desc: t("credentials.brain.desc"), color: "bg-accent/20", textColor: "text-accent" },
            ].map((cred, index) => (
              <div 
                key={cred.label}
                className="bg-card rounded-xl p-6 border border-border text-center hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer group animate-pop-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${cred.color} flex items-center justify-center group-hover:animate-bounce-gentle`}>
                  <span className={`font-display text-2xl font-bold ${cred.textColor}`}>{cred.count}</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2 group-hover:animate-wiggle">{cred.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {cred.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Cross-links section */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <CrossLinks 
            exclude={["/"]} 
            maxLinks={4}
            titleKey="crossLinks.title"
          />
        </div>
      </section>

      {/* Shop CTA */}
      <section className="py-16 md:py-24 bg-secondary/30 relative overflow-hidden">
        {/* Decorative bubbles */}
        <div className="absolute top-10 right-20 w-24 h-24 rounded-full bg-accent/10 animate-drift" />
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-wicklow-butter/15 animate-float" style={{ animationDelay: "1.5s" }} />
        
        <div className="container text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 animate-pop-in">
            {t("shop.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            {t("shop.subtitle")}
          </p>
          <Link to="/collections/all">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display hover:scale-110 hover:animate-squish transition-all">
              {t("shop.cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          {/* Confusion prompt */}
          <ConfusionPrompt className="mt-12 max-w-md mx-auto" excludePath="/" />
        </div>
      </section>
    </Layout>
  );
}
