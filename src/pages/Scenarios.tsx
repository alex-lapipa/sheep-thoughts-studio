import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ScenarioPlayer } from "@/components/ScenarioPlayer";
import { ContentHero } from "@/components/ContentHero";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BubblesBog } from "@/components/BubblesBog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Drama, Sparkles, Zap } from "lucide-react";

type BubblesMode = "innocent" | "concerned" | "triggered" | "savage" | "nuclear";

interface Scenario {
  id: string;
  title: string;
  description: string;
  trigger_category: string | null;
  start_mode: BubblesMode;
  end_mode: BubblesMode;
  tags: string[] | null;
}

const MODE_CONFIG: Record<BubblesMode, { label: string; labelEs: string; hue: number; saturation: number; lightness: number }> = {
  innocent: { label: "Innocent", labelEs: "Inocente", hue: 45, saturation: 75, lightness: 65 },
  concerned: { label: "Concerned", labelEs: "Preocupado", hue: 205, saturation: 45, lightness: 48 },
  triggered: { label: "Triggered", labelEs: "Activado", hue: 25, saturation: 100, lightness: 55 },
  savage: { label: "Savage", labelEs: "Salvaje", hue: 335, saturation: 100, lightness: 62 },
  nuclear: { label: "Nuclear", labelEs: "Nuclear", hue: 50, saturation: 100, lightness: 50 },
};

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    async function fetchScenarios() {
      const { data, error } = await supabase
        .from("bubbles_scenarios")
        .select("id, title, description, trigger_category, start_mode, end_mode, tags")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setScenarios(data as Scenario[]);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(
          data
            .map((s) => s.trigger_category)
            .filter((c): c is string => c !== null)
        )];
        setCategories(uniqueCategories);
      }
      setIsLoading(false);
    }
    fetchScenarios();
  }, []);

  const filteredScenarios = selectedCategory
    ? scenarios.filter((s) => s.trigger_category === selectedCategory)
    : scenarios;

  const getModeStyle = (mode: BubblesMode) => {
    const config = MODE_CONFIG[mode];
    return {
      backgroundColor: `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)`,
      color: config.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
    };
  };

  const getModeLabel = (mode: BubblesMode) => {
    const config = MODE_CONFIG[mode];
    return language === 'es' ? config.labelEs : config.label;
  };

  return (
    <Layout>
      {/* Hero with Brand-aligned Bubbles SVG */}
      <section className="-mx-4 mb-12">
        <ContentHero
          title={t("scenariosPage.hero.title")}
          subtitle={t("scenariosPage.hero.subtitle")}
          character={<BubblesBog size="hero" animated posture="four-legged" />}
          imageAlt="Bubbles the happy artistic sheep"
          badge={{ icon: Drama, text: "Emotional Range Expert" }}
          credentials={[
            { icon: Sparkles, text: "5 Distinct Modes" },
            { icon: Zap, text: "Trigger Taxonomy" },
            { text: "Field-Tested Logic" },
          ]}
        />
      </section>

      {/* Research note */}
      <section className="container mb-8">
        <div className="max-w-3xl mx-auto">
          <ThoughtBubble mode="concerned" size="sm">
            <p className="text-sm">
              <strong>{t("scenariosPage.research.note")}</strong> {t("scenariosPage.research.text")}
            </p>
          </ThoughtBubble>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              {t("scenariosPage.interactive.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("scenariosPage.interactive.subtitle")}
            </p>
          </div>
          <ScenarioPlayer />
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground font-display">{t("scenariosPage.filter.label")}</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {t("scenariosPage.filter.all")}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Scenario Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            {selectedCategory ? `${selectedCategory} Scenarios` : "All Scenarios"}
            <span className="text-muted-foreground text-lg ml-3">
              ({filteredScenarios.length})
            </span>
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredScenarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("scenariosPage.noScenarios")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario, index) => (
                <Card 
                  key={scenario.id}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Mode gradient bar */}
                  <div 
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, 
                        hsl(${MODE_CONFIG[scenario.start_mode].hue}, ${MODE_CONFIG[scenario.start_mode].saturation}%, ${MODE_CONFIG[scenario.start_mode].lightness}%) 0%, 
                        hsl(${MODE_CONFIG[scenario.end_mode].hue}, ${MODE_CONFIG[scenario.end_mode].saturation}%, ${MODE_CONFIG[scenario.end_mode].lightness}%) 100%)`
                    }}
                  />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                        {scenario.title}
                      </h3>
                      {scenario.trigger_category && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {scenario.trigger_category}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {scenario.description}
                    </p>

                    {/* Mode journey indicators */}
                    <div className="flex items-center gap-2 mb-4">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={getModeStyle(scenario.start_mode)}
                      >
                        {getModeLabel(scenario.start_mode)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={getModeStyle(scenario.end_mode)}
                      >
                        {getModeLabel(scenario.end_mode)}
                      </span>
                    </div>

                    {/* Tags */}
                    {scenario.tags && scenario.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scenario.tags.slice(0, 4).map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {scenario.tags.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{scenario.tags.length - 4} {t("common.more")}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
              {t("scenariosPage.framework.title")}
            </h2>
            
            <div className="grid gap-4">
              {Object.entries(MODE_CONFIG).map(([mode, config], index) => (
                <div 
                  key={mode}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0"
                    style={{
                      backgroundColor: `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)`,
                      color: config.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold">{language === 'es' ? config.labelEs : config.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`scenariosPage.mode.${mode}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("scenariosPage.cta.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("scenariosPage.cta.subtitle")}
          </p>
          <a 
            href="/collections/all" 
            className="inline-flex items-center justify-center h-12 px-8 font-display font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
          >
            {t("scenariosPage.cta.button")}
          </a>
        </div>
      </section>
    </Layout>
  );
}
