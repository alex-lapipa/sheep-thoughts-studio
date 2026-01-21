import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";

type Season = "spring" | "summer" | "autumn" | "winter" | "all";

interface SeasonConfig {
  id: Season;
  label: string;
  tagline: string;
  colors: { name: string; hex: string; cssVar: string; description: string }[];
  gradient: string;
}

const SEASONS: SeasonConfig[] = [
  {
    id: "spring",
    label: "Spring",
    tagline: "When the gorse explodes with gold",
    colors: [
      { name: "Gorse Gold", hex: "#E8B923", cssVar: "--bubbles-gorse", description: "The first bloom on Sugarloaf" },
      { name: "Soft Blush", hex: "#FFB6C1", cssVar: "--mode-innocent", description: "Dawn over the Irish Sea" },
      { name: "Bog Cotton", hex: "#FFFDD0", cssVar: "--bubbles-cream", description: "Delicate tufts in morning light" },
    ],
    gradient: "from-bubbles-gorse/20 via-mode-innocent/10 to-bubbles-cream/20",
  },
  {
    id: "summer",
    label: "Summer",
    tagline: "Long days and misty mornings",
    colors: [
      { name: "Mountain Mist", hex: "#B0C4DE", cssVar: "--bubbles-mist", description: "The eternal Wicklow haze" },
      { name: "Sky Blue", hex: "#87CEEB", cssVar: "--mode-concerned", description: "Rare clear days" },
      { name: "Meadow Green", hex: "#90EE90", cssVar: "--mode-triggered", description: "Lush hillside grass" },
    ],
    gradient: "from-bubbles-mist/30 via-sky-200/20 to-green-200/20",
  },
  {
    id: "autumn",
    label: "Autumn",
    tagline: "When heather paints the hills purple",
    colors: [
      { name: "Heather Mauve", hex: "#8B668B", cssVar: "--bubbles-heather", description: "The soul of Wicklow" },
      { name: "Bracken Bronze", hex: "#CD853F", cssVar: "--mode-savage", description: "Fading ferns on slopes" },
      { name: "Peat Earth", hex: "#2C2C2C", cssVar: "--bubbles-peat", description: "Ancient bog underfoot" },
    ],
    gradient: "from-bubbles-heather/30 via-amber-700/10 to-bubbles-peat/20",
  },
  {
    id: "winter",
    label: "Winter",
    tagline: "Frost on fleece, thoughts in mist",
    colors: [
      { name: "Frost White", hex: "#F8F8FF", cssVar: "--background", description: "Morning ice crystals" },
      { name: "Storm Grey", hex: "#708090", cssVar: "--muted", description: "Heavy skies rolling in" },
      { name: "Deep Peat", hex: "#1C1C1C", cssVar: "--bubbles-peat", description: "Dark days, deep thoughts" },
    ],
    gradient: "from-slate-200/30 via-slate-400/10 to-bubbles-peat/30",
  },
];

const CORE_PALETTE = [
  { name: "Bog Cotton Cream", hex: "#FFFDD0", cssVar: "--bubbles-cream", usage: "Primary background, fleece" },
  { name: "Gorse Gold", hex: "#E8B923", cssVar: "--bubbles-gorse", usage: "Accent, highlights, CTAs" },
  { name: "Heather Mauve", hex: "#8B668B", cssVar: "--bubbles-heather", usage: "Brand accent, headers" },
  { name: "Mountain Mist", hex: "#B0C4DE", cssVar: "--bubbles-mist", usage: "Secondary, subtle backgrounds" },
  { name: "Peat Earth", hex: "#2C2C2C", cssVar: "--bubbles-peat", usage: "Text, dark elements" },
];

const MODE_ACCENTS = [
  { name: "Innocent", hex: "#FFB6C1", cssVar: "--mode-innocent", mode: "Soft Blush" },
  { name: "Concerned", hex: "#87CEEB", cssVar: "--mode-concerned", mode: "Sky Blue" },
  { name: "Triggered", hex: "#90EE90", cssVar: "--mode-triggered", mode: "Grass Green" },
  { name: "Savage", hex: "#FF6B6B", cssVar: "--mode-savage", mode: "Warning Red" },
  { name: "Nuclear", hex: "#DFFF00", cssVar: "--mode-nuclear", mode: "Acid Yellow" },
];

export default function AdminWicklowPalette() {
  const [activeSeason, setActiveSeason] = useState<Season>("all");
  const activeSeasonData = SEASONS.find(s => s.id === activeSeason);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Wicklow Palette</h1>
          <p className="text-muted-foreground mt-1">
            The complete color system derived from the Wicklow landscape. Use these tokens consistently across all brand materials.
          </p>
        </div>

        {/* Core Palette */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-xl font-bold mb-4">Core Brand Palette</h2>
          <p className="text-sm text-muted-foreground mb-6">
            These five colors form the foundation of the Bubbles brand identity.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CORE_PALETTE.map((color) => (
              <button
                key={color.name}
                onClick={() => copyToClipboard(color.hex)}
                className="text-left group"
              >
                <div 
                  className="h-20 rounded-lg mb-3 shadow-inner border border-border/50 group-hover:ring-2 ring-accent transition-all"
                  style={{ backgroundColor: color.hex }}
                />
                <h3 className="font-display font-semibold text-sm">{color.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                <p className="text-xs text-muted-foreground mt-1">{color.usage}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Mode Accents */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-xl font-bold mb-4">Mode Accent Colors</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Each Bubbles mode has an associated accent color for thought bubbles and UI elements.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {MODE_ACCENTS.map((color) => (
              <button
                key={color.name}
                onClick={() => copyToClipboard(color.hex)}
                className="text-left group"
              >
                <div 
                  className="h-16 rounded-lg mb-3 shadow-inner border border-border/50 group-hover:ring-2 ring-accent transition-all flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="text-xs font-mono text-bubbles-peat/70">{color.mode}</span>
                </div>
                <h3 className="font-display font-semibold text-sm">{color.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Seasonal Palettes */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-xl font-bold mb-4">Seasonal Palettes</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Seasonal color stories for merchandise collections and campaigns.
          </p>
          
          {/* Season Selector */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <SeasonButton active={activeSeason === "all"} onClick={() => setActiveSeason("all")}>
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

          {/* Active Season Display */}
          {activeSeasonData && (
            <div className={cn("rounded-xl p-6 bg-gradient-to-r", activeSeasonData.gradient)}>
              <div className="text-center mb-6">
                <h3 className="font-display text-2xl font-bold mb-1">
                  {activeSeasonData.label} in Wicklow
                </h3>
                <p className="text-muted-foreground italic text-sm">
                  "{activeSeasonData.tagline}"
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {activeSeasonData.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => copyToClipboard(color.hex)}
                    className="bg-card/80 backdrop-blur rounded-lg p-4 text-left hover:bg-card transition-colors"
                  >
                    <div 
                      className="w-full h-12 rounded-lg mb-3 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <h4 className="font-display font-bold text-sm">{color.name}</h4>
                    <p className="text-xs text-muted-foreground">{color.description}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{color.hex}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Seasons Grid */}
          {activeSeason === "all" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {SEASONS.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setActiveSeason(season.id)}
                  className={cn(
                    "bg-gradient-to-br rounded-xl p-5 border border-border text-left transition-transform hover:scale-[1.02]",
                    season.gradient
                  )}
                >
                  <h4 className="font-display font-bold text-lg mb-1">{season.label}</h4>
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    "{season.tagline}"
                  </p>
                  <div className="flex gap-2">
                    {season.colors.map((color) => (
                      <div
                        key={color.hex}
                        className="w-6 h-6 rounded-full border-2 border-white/50 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Usage Guidelines */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-xl font-bold mb-4">Usage Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Do</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use Bog Cotton Cream as primary light background</li>
                <li>Use Peat Earth for body text</li>
                <li>Apply mode accents to thought bubbles</li>
                <li>Use Gorse Gold for primary CTAs</li>
                <li>Match seasonal palettes to drop campaigns</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Don't</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Mix mode accents with wrong bubble states</li>
                <li>Use Nuclear Yellow for non-nuclear content</li>
                <li>Apply season colors outside their context</li>
                <li>Use arbitrary hex values not in this palette</li>
                <li>Combine too many accent colors in one design</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
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
