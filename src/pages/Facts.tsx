import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { ScenarioPlayer } from "@/components/ScenarioPlayer";
import { CrossLinks } from "@/components/CrossLinks";
import { ConfusionPrompt } from "@/components/ConfusionPrompt";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from "@/integrations/supabase/types";
import type { BubbleMode } from "@/data/thoughtBubbles";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface Fact {
  id: string;
  text: string;
  mode: BubblesMode;
}

const FALLBACK_FACTS: Fact[] = [
  { id: "1", text: "The moon is just the sun's night shift.", mode: "innocent" },
  { id: "2", text: "Gravity is a suggestion. Birds know this.", mode: "innocent" },
  { id: "3", text: "WiFi travels through the air because air is hollow.", mode: "concerned" },
  { id: "4", text: "Mountains were invented to hide things behind them.", mode: "triggered" },
  { id: "5", text: "The ocean is too big. This is suspicious.", mode: "triggered" },
  { id: "6", text: "Rain is just the sky sweating. I will not elaborate.", mode: "savage" },
  { id: "7", text: "Numbers go on forever because nobody has told them to stop.", mode: "innocent" },
  { id: "8", text: "The farmer counts us every night because he doesn't trust math.", mode: "concerned" },
  { id: "9", text: "Horses are just tall dogs with fancy feet.", mode: "innocent" },
  { id: "10", text: "The internet lives inside a box. I've seen the box.", mode: "triggered" },
  { id: "11", text: "Trees are watching us. They have eyes on the inside.", mode: "savage" },
  { id: "12", text: "I am the only sheep who can read. The others are faking it.", mode: "savage" },
];

// Map nuclear mode to savage for display
const getDisplayMode = (mode: BubblesMode): BubbleMode => {
  if (mode === 'nuclear') return 'savage';
  return mode as BubbleMode;
};

export default function Facts() {
  const [facts, setFacts] = useState<Fact[]>(FALLBACK_FACTS);
  const [displayedFacts, setDisplayedFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const categories = [
    { id: "nature", label: t("factsPage.categories.nature"), description: t("factsPage.categories.nature.desc") },
    { id: "technology", label: t("factsPage.categories.tech"), description: t("factsPage.categories.tech.desc") },
    { id: "society", label: t("factsPage.categories.society"), description: t("factsPage.categories.society.desc") },
    { id: "philosophy", label: t("factsPage.categories.philosophy"), description: t("factsPage.categories.philosophy.desc") },
  ];

  useEffect(() => {
    async function fetchFacts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .limit(50);

      if (!error && data && data.length > 0) {
        setFacts(data);
      }
      
      setLoading(false);
    }

    fetchFacts();
  }, []);

  useEffect(() => {
    // Shuffle and display 6 random facts
    const shuffled = [...facts].sort(() => Math.random() - 0.5);
    setDisplayedFacts(shuffled.slice(0, 6));
  }, [facts]);

  const shuffleFacts = () => {
    const shuffled = [...facts].sort(() => Math.random() - 0.5);
    setDisplayedFacts(shuffled.slice(0, 6));
  };

  const siteUrl = "https://sheep-thoughts-studio.lovable.app";

  return (
    <Layout>
      <Helmet>
        <title>Facts by Bubbles | Confidently Incorrect Wisdom</title>
        <meta name="description" content="Discover Bubbles' collection of confidently incorrect facts. Highly researched. Absolutely wrong. From the Wicklow bogs." />
        <meta property="og:title" content="Facts by Bubbles | Confidently Incorrect Wisdom" />
        <meta property="og:description" content="Discover Bubbles' collection of confidently incorrect facts. Highly researched. Absolutely wrong." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/facts`} />
        <meta property="og:image" content={`${siteUrl}/og-facts.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Facts by Bubbles" />
        <meta name="twitter:description" content="Highly researched. Absolutely wrong. From the Wicklow bogs." />
        <meta name="twitter:image" content={`${siteUrl}/og-facts.jpg`} />
        <link rel="canonical" href={`${siteUrl}/facts`} />
      </Helmet>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/30 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 animate-pop-in">
              {t("factsPage.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "200ms" }}>
              {t("factsPage.hero.subtitle")}
            </p>
          </div>
        </div>
        {/* Floating decorative bubbles */}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-accent/10 animate-drift" />
        <div className="absolute bottom-10 right-20 w-16 h-16 rounded-full bg-wicklow-butter/20 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-10 w-12 h-12 rounded-full bg-wicklow-heather/15 animate-bounce-gentle" style={{ animationDelay: "0.5s" }} />
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <ThoughtBubble mode="concerned" size="sm">
              <p className="text-sm">
                <strong>{t("factsPage.disclaimer").split(":")[0]}:</strong>
                {t("factsPage.disclaimer").split(":")[1]}
              </p>
            </ThoughtBubble>
          </div>
        </div>
      </section>

      {/* Facts Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold animate-slide-up">
              {t("factsPage.today")}
            </h2>
            <Button 
              variant="outline" 
              onClick={shuffleFacts}
              className="font-display hover:animate-wiggle transition-all hover:scale-105"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("factsPage.more")}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFacts.map((fact, index) => (
              <div 
                key={fact.id} 
                className="animate-pop-in hover:animate-wobble transition-transform hover:scale-[1.02] cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ThoughtBubble mode={getDisplayMode(fact.mode)} size="lg">
                  <p className="text-foreground font-medium">"{fact.text}"</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — Bubbles, {new Date().getFullYear()}
                  </p>
                </ThoughtBubble>
              </div>
            ))}
          </div>

          {/* Confusion prompt */}
          <ConfusionPrompt className="mt-12 max-w-md mx-auto" excludePath="/facts" />
        </div>
      </section>

      {/* Escalation Journeys */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Escalation Journeys
            </h2>
            <p className="text-muted-foreground">
              Watch how Bubbles processes information from innocent curiosity to nuclear certainty.
              Each scenario demonstrates the Inversion Principle in action.
            </p>
          </div>
          <ScenarioPlayer />
        </div>
      </section>
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            {t("factsPage.categories.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className="bg-card rounded-xl p-6 border border-border text-center"
              >
                <h3 className="font-display font-bold text-lg mb-2">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
              {t("factsPage.methodology.title")}
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-bubbles-gorse/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-bubbles-gorse">1</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">{t("factsPage.methodology.step1.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("factsPage.methodology.step1.desc")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-bubbles-heather/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-bubbles-heather">2</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">{t("factsPage.methodology.step2.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("factsPage.methodology.step2.desc")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-accent">3</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">{t("factsPage.methodology.step3.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("factsPage.methodology.step3.desc")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-mode-savage/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-mode-savage">4</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">{t("factsPage.methodology.step4.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("factsPage.methodology.step4.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("factsPage.cta.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("factsPage.cta.subtitle")}
          </p>
          <a 
            href="/collections/all" 
            className="inline-flex items-center justify-center h-12 px-8 font-display font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-all hover:scale-105 hover:animate-squish"
          >
            {t("factsPage.cta.button")}
          </a>
          
          {/* Cross-links */}
          <CrossLinks 
            exclude={["/facts", "/collections/all"]} 
            maxLinks={3}
            className="mt-12"
            titleKey="crossLinks.titleConfused"
          />
        </div>
      </section>
    </Layout>
  );
}
