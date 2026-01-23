import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { FeaturedProductsCarousel } from "@/components/FeaturedProductsCarousel";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { BubblesBogHero } from "@/components/BubblesBog";
import { CrossLinks } from "@/components/CrossLinks";
import { ConfusionPrompt } from "@/components/ConfusionPrompt";
import { InsideMyHeadHero } from "@/components/InsideMyHeadHero";
import { WhyBubblesProof } from "@/components/WhyBubblesProof";
import { ParallaxSection } from "@/components/ParallaxSection";
import { ChangelogWidget } from "@/components/ChangelogWidget";
import { AnimatedOnView } from "@/components/AnimatedText";
import { CompactVoiceChat } from "@/components/CompactVoiceChat";
import { useABTracking } from "@/hooks/useABTracking";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMood } from "@/contexts/MoodContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { useOgImage } from "@/hooks/useOgImage";
import { useLanguageRedirect } from "@/hooks/useLanguageRedirect";
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
  useABTracking(); // Track homepage variant views
  const { setCurrentMode } = useMood();
  const { isEnabled } = useFeatureFlags();
  const simplifiedHomepage = isEnabled('simplifiedHomepage');
  
  // Auto-redirect German speakers to DACH page on first visit
  useLanguageRedirect();

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

  const { ogImageUrl, siteUrl } = useOgImage("og-home.jpg");

  return (
    <Layout>
      <Helmet>
        <title>Bubbles the Sheep | Confidently Wrong Since Birth</title>
        <meta name="description" content="Meet Bubbles, a sheep from Wicklow who understands everything and interprets everything incorrectly. Explore facts, merch, and philosophical musings." />
        <meta property="og:title" content="Bubbles the Sheep | Confidently Wrong Since Birth" />
        <meta property="og:description" content="A sheep from Wicklow, Ireland. Raised by humans. Educated by tourists. Always wrong with complete confidence." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bubbles the Sheep" />
        <meta name="twitter:description" content="The sheep who knows everything. Incorrectly." />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={siteUrl} />
      </Helmet>
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
                    {t("common.watchEscalations")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character - Bog-grounded, weather-affected */}
            <div className="relative flex justify-center items-center">
              <BubblesBogHero className="drop-shadow-2xl" />
              
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

      {/* Compact Voice Chat - Glassmorphism Design */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <ParallaxSection speed={0.15} className="absolute top-1/4 -left-10 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />
        <ParallaxSection speed={0.2} direction="down" className="absolute bottom-1/4 -right-10 w-48 h-48 rounded-full bg-bubbles-heather/10 blur-3xl" />
        
        <div className="container relative z-10">
          <ParallaxSection speed={0.05} mouseParallax mouseIntensity={0.008}>
            <div className="max-w-xl mx-auto">
              <CompactVoiceChat />
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Inside My Head, About, and Credentials sections removed - data preserved in database */}

      {/* Compact social proof (shown when simplifiedHomepage enabled) */}
      {simplifiedHomepage && <WhyBubblesProof />}

      {/* Featured Products Carousel */}
      <FeaturedProductsCarousel />

      {/* Cross-links and Changelog section */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CrossLinks 
                exclude={["/"]} 
                maxLinks={4}
                titleKey="crossLinks.title"
              />
            </div>
            <div>
              <ChangelogWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Shop CTA */}
      <section className="py-16 md:py-24 bg-secondary/30 relative overflow-hidden">
        {/* Parallax decorative bubbles */}
        <ParallaxSection speed={0.25} className="absolute top-10 right-20 w-24 h-24 rounded-full bg-accent/10" />
        <ParallaxSection speed={0.35} direction="down" className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-wicklow-butter/15" />
        <ParallaxSection speed={0.15} className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-bubbles-heather/10 blur-xl" />
        
        <div className="container text-center relative z-10">
          <AnimatedOnView>
            <ParallaxSection speed={0.05}>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t("shop.title")}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("shop.subtitle")}
              </p>
            </ParallaxSection>
          </AnimatedOnView>
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
