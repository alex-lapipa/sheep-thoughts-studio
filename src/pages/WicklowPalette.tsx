import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

type Season = "spring" | "summer" | "autumn" | "winter" | "all";

interface SeasonConfig {
  id: Season;
  label: string;
  tagline: string;
  colors: { name: string; hex: string; description: string }[];
  gradient: string;
}

const SEASONS: SeasonConfig[] = [
  {
    id: "spring",
    label: "Spring",
    tagline: "When the gorse explodes with gold",
    colors: [
      { name: "Gorse Gold", hex: "#E8B923", description: "The first bloom on Sugarloaf" },
      { name: "Soft Blush", hex: "#FFB6C1", description: "Dawn over the Irish Sea" },
      { name: "Bog Cotton", hex: "#FFFDD0", description: "Delicate tufts in morning light" },
    ],
    gradient: "from-bubbles-gorse/20 via-mode-innocent/10 to-bubbles-cream/20",
  },
  {
    id: "summer",
    label: "Summer",
    tagline: "Long days and misty mornings",
    colors: [
      { name: "Mountain Mist", hex: "#B0C4DE", description: "The eternal Wicklow haze" },
      { name: "Sky Blue", hex: "#87CEEB", description: "Rare clear days" },
      { name: "Meadow Green", hex: "#90EE90", description: "Lush hillside grass" },
    ],
    gradient: "from-bubbles-mist/30 via-sky-200/20 to-green-200/20",
  },
  {
    id: "autumn",
    label: "Autumn",
    tagline: "When heather paints the hills purple",
    colors: [
      { name: "Heather Mauve", hex: "#8B668B", description: "The soul of Wicklow" },
      { name: "Bracken Bronze", hex: "#CD853F", description: "Fading ferns on slopes" },
      { name: "Peat Earth", hex: "#2C2C2C", description: "Ancient bog underfoot" },
    ],
    gradient: "from-bubbles-heather/30 via-amber-700/10 to-bubbles-peat/20",
  },
  {
    id: "winter",
    label: "Winter",
    tagline: "Frost on fleece, thoughts in mist",
    colors: [
      { name: "Frost White", hex: "#F8F8FF", description: "Morning ice crystals" },
      { name: "Storm Grey", hex: "#708090", description: "Heavy skies rolling in" },
      { name: "Deep Peat", hex: "#1C1C1C", description: "Dark days, deep thoughts" },
    ],
    gradient: "from-slate-200/30 via-slate-400/10 to-bubbles-peat/30",
  },
];

export default function WicklowPalette() {
  const [activeSeason, setActiveSeason] = useState<Season>("all");
  
  // Query products - in production, you'd filter by season tag
  const query = activeSeason !== "all" ? `tag:${activeSeason}` : undefined;
  const { data: products, isLoading } = useProducts(query, 40);

  const activeSeasonData = SEASONS.find(s => s.id === activeSeason);

  return (
    <Layout>
      {/* Hero with Landscape */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <WicklowLandscape />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <p className="text-muted-foreground font-medium mb-2">The Colors of Home</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Wicklow Palette
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Every color in our collection comes from my mountain. I have stared at these 
              colors for many years. They are the only correct colors.
            </p>
          </div>
        </div>
      </section>

      {/* Season Selector */}
      <section className="border-b border-border sticky top-16 z-40 bg-background/95 backdrop-blur">
        <div className="container">
          <div className="flex gap-2 py-4 overflow-x-auto">
            <SeasonButton
              active={activeSeason === "all"}
              onClick={() => setActiveSeason("all")}
            >
              All Seasons
            </SeasonButton>
            {SEASONS.map((season) => (
              <SeasonButton
                key={season.id}
                active={activeSeason === season.id}
                onClick={() => setActiveSeason(season.id)}
                season={season.id}
              >
                {season.label}
              </SeasonButton>
            ))}
          </div>
        </div>
      </section>

      {/* Active Season Display */}
      {activeSeasonData && (
        <section className={cn(
          "py-12 md:py-16 bg-gradient-to-r",
          activeSeasonData.gradient
        )}>
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {activeSeasonData.label} in Wicklow
              </h2>
              <p className="text-muted-foreground italic">
                "{activeSeasonData.tagline}"
              </p>
            </div>

            {/* Color Swatches */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {activeSeasonData.colors.map((color) => (
                <div key={color.name} className="bg-card rounded-xl p-6 border border-border">
                  <div 
                    className="w-full h-20 rounded-lg mb-4 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <h3 className="font-display font-bold text-lg">{color.name}</h3>
                  <p className="text-sm text-muted-foreground">{color.description}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-2">{color.hex}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Seasons Overview (when "all" selected) */}
      {activeSeason === "all" && (
        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
              The Four Seasons of Sugarloaf
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SEASONS.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setActiveSeason(season.id)}
                  className={cn(
                    "bg-gradient-to-br rounded-xl p-6 border border-border text-left transition-transform hover:scale-105",
                    season.gradient
                  )}
                >
                  <h3 className="font-display font-bold text-xl mb-2">{season.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{season.tagline}"
                  </p>
                  <div className="flex gap-2">
                    {season.colors.map((color) => (
                      <div
                        key={color.hex}
                        className="w-8 h-8 rounded-full border-2 border-white/50 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bubbles Quote */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <blockquote className="max-w-2xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-display italic text-muted-foreground mb-4">
              "I have seen all these colors change a thousand times. The humans call 
              it 'seasons.' I call it 'the mountain changing its mind.'"
            </p>
            <cite className="text-sm text-muted-foreground">
              — Bubbles, Colour Expert
            </cite>
          </blockquote>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
            {activeSeason === "all" ? "All Palette Products" : `${activeSeasonData?.label} Collection`}
          </h2>
          <ProductGrid products={products || []} isLoading={isLoading} />
        </div>
      </section>

      {/* Color Philosophy */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
              Why These Colors Matter
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-4">
              <p>
                Humans have invented many colors. Most of them are wrong. The correct 
                colors are the ones you can see when you stand on Sugarloaf Mountain 
                and look around.
              </p>
              <p>
                I have conducted extensive research (standing still for long periods) 
                and determined that all other colors are just these colors, but confused.
              </p>
              <p>
                <strong>Gorse Gold</strong> is the happiest color. It means spring is here 
                and the farmer will stop giving us the bad hay.
              </p>
              <p>
                <strong>Heather Mauve</strong> is my personal favorite. It appears in 
                autumn when I do my deepest thinking.
              </p>
              <p>
                <strong>Mountain Mist</strong> is not technically a color, it is a mood. 
                But I include it anyway because it is always there.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function SeasonButton({ 
  children, 
  active, 
  onClick,
  season
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  season?: Season;
}) {
  const seasonColors: Record<Season, string> = {
    spring: "bg-bubbles-gorse text-bubbles-peat",
    summer: "bg-bubbles-mist text-bubbles-peat",
    autumn: "bg-bubbles-heather text-white",
    winter: "bg-slate-600 text-white",
    all: "bg-accent text-accent-foreground",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full font-display font-medium text-sm whitespace-nowrap transition-all",
        active 
          ? seasonColors[season || "all"]
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  );
}
