import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrandAssets, BrandAsset } from "@/hooks/useBrandAssets";
import { Copy, Check, Palette, Sun, Moon, Sparkles, Leaf, Download, Eye, CheckCircle2, XCircle, AlertCircle, Shuffle, Snowflake, Flower2, TreeDeciduous, Circle, Triangle, Hexagon, Play, Pause, RotateCcw, Grid3X3, MessageCircle, Type } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance per WCAG 2.1
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG compliance levels
function getWcagCompliance(ratio: number) {
  return {
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
    uiComponents: ratio >= 3,
  };
}

interface ContrastCheckerProps {
  colors: BrandAsset[];
}

function ContrastChecker({ colors }: ContrastCheckerProps) {
  const [foregroundKey, setForegroundKey] = useState<string>("");
  const [backgroundKey, setBackgroundKey] = useState<string>("");

  const colorOptions = useMemo(() => {
    return colors.map((c) => {
      const val = c.asset_value as { hex?: string };
      return {
        key: c.asset_key,
        name: c.asset_name,
        hex: val.hex || "#000000",
      };
    });
  }, [colors]);

  const foreground = colorOptions.find((c) => c.key === foregroundKey);
  const background = colorOptions.find((c) => c.key === backgroundKey);

  const contrastRatio = useMemo(() => {
    if (!foreground?.hex || !background?.hex) return null;
    return getContrastRatio(foreground.hex, background.hex);
  }, [foreground, background]);

  const compliance = contrastRatio ? getWcagCompliance(contrastRatio) : null;

  const ComplianceBadge = ({ pass, label }: { pass: boolean; label: string }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${pass ? "bg-accent/50" : "bg-destructive/10"}`}>
      {pass ? (
        <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
      <span className={`text-sm font-medium ${pass ? "text-accent-foreground" : "text-destructive"}`}>
        {label}
      </span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Contrast Checker
        </CardTitle>
        <CardDescription>
          Validate WCAG accessibility compliance between any two brand colors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Selectors */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Foreground (Text)</label>
            <Select value={foregroundKey} onValueChange={setForegroundKey}>
              <SelectTrigger>
                <SelectValue placeholder="Select foreground color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <span className="text-muted-foreground text-xs">{c.hex}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Background</label>
            <Select value={backgroundKey} onValueChange={setBackgroundKey}>
              <SelectTrigger>
                <SelectValue placeholder="Select background color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <span className="text-muted-foreground text-xs">{c.hex}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview & Results */}
        {foreground && background ? (
          <div className="space-y-4">
            {/* Live Preview */}
            <div
              className="rounded-lg p-6 border"
              style={{ backgroundColor: background.hex }}
            >
              <p
                className="text-2xl font-display font-bold mb-2"
                style={{ color: foreground.hex }}
              >
                Large Text Preview
              </p>
              <p className="text-base" style={{ color: foreground.hex }}>
                Normal body text appears like this. The quick brown fox jumps over the lazy dog.
              </p>
            </div>

            {/* Contrast Ratio */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Contrast Ratio</p>
                <p className="text-3xl font-bold font-mono">
                  {contrastRatio?.toFixed(2)}:1
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {foreground.name} on {background.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: foreground.hex }}
                  />
                  <span className="text-muted-foreground">→</span>
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: background.hex }}
                  />
                </div>
              </div>
            </div>

            {/* Compliance Grid */}
            {compliance && (
              <div className="space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  WCAG Compliance Results
                </p>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  <ComplianceBadge pass={compliance.normalAA} label="Normal Text AA (4.5:1)" />
                  <ComplianceBadge pass={compliance.normalAAA} label="Normal Text AAA (7:1)" />
                  <ComplianceBadge pass={compliance.largeAA} label="Large Text AA (3:1)" />
                  <ComplianceBadge pass={compliance.largeAAA} label="Large Text AAA (4.5:1)" />
                  <ComplianceBadge pass={compliance.uiComponents} label="UI Components (3:1)" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select two colors to check their contrast ratio</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 🌿 Wicklow Pastoral Palette - calm, traditional Irish landscape
// The fields, the mist, the quiet. Home.
const WICKLOW_PASTORAL = {
  meadow: { hex: "#4A9B6A", name: "Meadow Green", description: "Rolling Wicklow pastures at dawn" },
  atlantic: { hex: "#4A8DBD", name: "Atlantic Blue", description: "Cold Irish Sea on a calm day" },
  butter: { hex: "#E5C76B", name: "Butter Yellow", description: "Rare Irish sunshine, soft and gentle" },
  mist: { hex: "#F5F7FA", name: "Mist White", description: "Morning fog in the valley" },
  stone: { hex: "#7A8899", name: "Stone Grey", description: "Ancient drystone walls" },
  heather: { hex: "#9B6B9B", name: "Heather Purple", description: "Bog flowers across the hills" },
  turf: { hex: "#5A4332", name: "Turf Brown", description: "Warm peat, the earth itself" },
};

// 🌃 Urban Chaos Palette - London/NYC nightlife, fashion, neon
// Everything that bewilders poor Bubbles
const URBAN_CHAOS = {
  taxi: { hex: "#FFD500", name: "Taxi Yellow", description: "NYC cab, can't miss it" },
  soho: { hex: "#FF4D94", name: "Soho Pink", description: "London club lights at 2am" },
  neon: { hex: "#00E5FF", name: "Neon Cyan", description: "Tokyo/Shoreditch signage" },
  metro: { hex: "#FF6B35", name: "Metro Orange", description: "Underground, urgent, electric" },
  fashion: { hex: "#A855F7", name: "Fashion Purple", description: "Runway, exclusive, alien" },
  club: { hex: "#EF4444", name: "Nightclub Red", description: "Velvet rope, danger, excitement" },
};

// Combined base for legacy generators
const WICKLOW_BASE = {
  meadow: { hex: "#4A9B6A", name: "Meadow Green" },
  atlantic: { hex: "#4A8DBD", name: "Atlantic Blue" },
  butter: { hex: "#E5C76B", name: "Butter Yellow" },
  mist: { hex: "#F5F7FA", name: "Mist White" },
  stone: { hex: "#7A8899", name: "Stone Grey" },
  heather: { hex: "#9B6B9B", name: "Heather Purple" },
  turf: { hex: "#5A4332", name: "Turf Brown" },
};

type Season = "spring" | "summer" | "autumn" | "winter";

interface SeasonConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  hueShift: number;
  saturationMod: number;
  lightnessMod: number;
}

const SEASON_CONFIG: Record<Season, SeasonConfig> = {
  spring: {
    name: "Spring Awakening",
    icon: <Flower2 className="h-5 w-5" />,
    description: "Fresh emerald greens, bright gorse gold, silvery-green bracken",
    hueShift: 30,
    saturationMod: 1.1,
    lightnessMod: 1.05,
  },
  summer: {
    name: "Summer Bloom",
    icon: <Sun className="h-5 w-5" />,
    description: "Deep greens, early heather mauve, brilliant white bog cotton",
    hueShift: -10,
    saturationMod: 1.2,
    lightnessMod: 0.95,
  },
  autumn: {
    name: "Autumn Fire",
    icon: <TreeDeciduous className="h-5 w-5" />,
    description: "Purple heather peak, bracken copper-rust-chestnut transformation",
    hueShift: -30,
    saturationMod: 1.15,
    lightnessMod: 0.9,
  },
  winter: {
    name: "Winter Mist",
    icon: <Snowflake className="h-5 w-5" />,
    description: "Muted browns, slate greys, heather bronze, snow-dusted peaks",
    hueShift: 10,
    saturationMod: 0.7,
    lightnessMod: 0.85,
  },
};

// Convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v: number) => {
    const hex = Math.round((v + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Generate seasonal variations
function generateSeasonalPalette(season: Season) {
  const config = SEASON_CONFIG[season];
  
  return Object.entries(WICKLOW_BASE).map(([key, color]) => {
    const hsl = hexToHsl(color.hex);
    const newH = hsl.h + config.hueShift;
    const newS = hsl.s * config.saturationMod;
    const newL = hsl.l * config.lightnessMod;
    
    return {
      key: `${season}-${key}`,
      name: `${config.name} ${color.name.split(" ").pop()}`,
      originalHex: color.hex,
      hex: hslToHex(newH, newS, newL),
      hsl: `${Math.round(newH)}° ${Math.round(newS)}% ${Math.round(newL)}%`,
    };
  });
}

function PaletteGenerator() {
  const [selectedSeason, setSelectedSeason] = useState<Season>("spring");
  const [copied, setCopied] = useState<string | null>(null);

  const generatedPalette = useMemo(() => {
    return generateSeasonalPalette(selectedSeason);
  }, [selectedSeason]);

  const config = SEASON_CONFIG[selectedSeason];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportPalette = () => {
    const css = `:root {\n  /* ${config.name} Seasonal Palette */\n${generatedPalette
      .map((c) => `  --${c.key}: ${c.hex};`)
      .join("\n")}\n}`;
    
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bubbles-${selectedSeason}-palette.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${config.name} palette`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Seasonal Palette Generator
        </CardTitle>
        <CardDescription>
          Generate complementary seasonal variations based on Wicklow's dramatic color shifts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Season Selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SEASON_CONFIG) as Season[]).map((season) => {
            const cfg = SEASON_CONFIG[season];
            const isSelected = selectedSeason === season;
            return (
              <Button
                key={season}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeason(season)}
                className="flex items-center gap-2"
              >
                {cfg.icon}
                {cfg.name}
              </Button>
            );
          })}
        </div>

        {/* Season Description */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>

        {/* Generated Palette */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Generated Colors</p>
            <Button variant="outline" size="sm" onClick={exportPalette}>
              <Download className="h-4 w-4 mr-2" />
              Export CSS
            </Button>
          </div>

          {/* Color comparison strip */}
          <div className="space-y-2">
            <div className="flex rounded-lg overflow-hidden border">
              {generatedPalette.map((color) => (
                <div
                  key={color.key}
                  className="flex-1 h-16"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Seasonal variation from Wicklow base palette
            </p>
          </div>

          {/* Color cards */}
          <div className="grid gap-3 md:grid-cols-5">
            {generatedPalette.map((color) => (
              <div
                key={color.key}
                className="rounded-lg border overflow-hidden group"
              >
                <div className="flex">
                  <div
                    className="w-1/2 h-20"
                    style={{ backgroundColor: color.originalHex }}
                    title="Original"
                  />
                  <div
                    className="w-1/2 h-20"
                    style={{ backgroundColor: color.hex }}
                    title="Seasonal"
                  />
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.key)}
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {color.hex}
                    {copied === color.key ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground">{color.hsl}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type HarmonyType = "analogous" | "complementary" | "triadic" | "split-complementary";

interface HarmonyConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  getHues: (baseHue: number) => number[];
}

const HARMONY_CONFIG: Record<HarmonyType, HarmonyConfig> = {
  analogous: {
    name: "Analogous",
    description: "Colors adjacent on the wheel — harmonious and serene",
    icon: <Circle className="h-4 w-4" />,
    getHues: (h) => [h - 30, h, h + 30],
  },
  complementary: {
    name: "Complementary",
    description: "Opposite colors — high contrast and vibrant",
    icon: <Hexagon className="h-4 w-4" />,
    getHues: (h) => [h, h + 180],
  },
  triadic: {
    name: "Triadic",
    description: "Three equidistant colors — balanced and dynamic",
    icon: <Triangle className="h-4 w-4" />,
    getHues: (h) => [h, h + 120, h + 240],
  },
  "split-complementary": {
    name: "Split Complementary",
    description: "Base + two adjacent to its complement — softer contrast",
    icon: <Sparkles className="h-4 w-4" />,
    getHues: (h) => [h, h + 150, h + 210],
  },
};

function HarmonyGenerator() {
  const [selectedBase, setSelectedBase] = useState<string>("butter");
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("analogous");
  const [copied, setCopied] = useState<string | null>(null);

  const baseColor = WICKLOW_BASE[selectedBase as keyof typeof WICKLOW_BASE];
  const baseHsl = hexToHsl(baseColor.hex);
  const harmonyConfig = HARMONY_CONFIG[harmonyType];

  const harmonyPalette = useMemo(() => {
    const hues = harmonyConfig.getHues(baseHsl.h);
    return hues.map((hue, i) => {
      const normalizedHue = ((hue % 360) + 360) % 360;
      const hex = hslToHex(normalizedHue, baseHsl.s, baseHsl.l);
      return {
        key: `harmony-${i}`,
        name: i === 0 ? `Base (${baseColor.name})` : `Harmony ${i}`,
        hex,
        hue: Math.round(normalizedHue),
        isBase: i === 0,
      };
    });
  }, [baseHsl, harmonyConfig, baseColor.name]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportHarmony = () => {
    const css = `:root {\n  /* ${harmonyConfig.name} Harmony from ${baseColor.name} */\n${harmonyPalette
      .map((c, i) => `  --harmony-${i}: ${c.hex};`)
      .join("\n")}\n}`;

    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bubbles-${harmonyType}-harmony.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${harmonyConfig.name} harmony`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Harmony Generator
        </CardTitle>
        <CardDescription>
          Create harmonious color combinations from any Wicklow base color
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Base Color Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Color</label>
            <Select value={selectedBase} onValueChange={setSelectedBase}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WICKLOW_BASE).map(([key, color]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Harmony Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Harmony Type</label>
            <Select value={harmonyType} onValueChange={(v) => setHarmonyType(v as HarmonyType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(HARMONY_CONFIG) as HarmonyType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {HARMONY_CONFIG[type].icon}
                      <span>{HARMONY_CONFIG[type].name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Harmony Description */}
        <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
          {harmonyConfig.icon}
          <p className="text-sm text-muted-foreground">{harmonyConfig.description}</p>
        </div>

        {/* Color Wheel Visualization */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-48 h-48">
            {/* Color wheel background */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  hsl(0, 70%, 50%),
                  hsl(60, 70%, 50%),
                  hsl(120, 70%, 50%),
                  hsl(180, 70%, 50%),
                  hsl(240, 70%, 50%),
                  hsl(300, 70%, 50%),
                  hsl(360, 70%, 50%)
                )`,
              }}
            />
            <div className="absolute inset-6 rounded-full bg-background" />
            
            {/* Harmony points */}
            {harmonyPalette.map((color, i) => {
              const angle = (color.hue - 90) * (Math.PI / 180);
              const radius = 72;
              const x = 96 + Math.cos(angle) * radius;
              const y = 96 + Math.sin(angle) * radius;
              
              return (
                <div
                  key={color.key}
                  className={`absolute w-6 h-6 rounded-full border-2 border-background shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${
                    color.isBase ? "ring-2 ring-offset-2 ring-foreground" : ""
                  }`}
                  style={{
                    left: x,
                    top: y,
                    backgroundColor: color.hex,
                  }}
                  title={`${color.name}: ${color.hex}`}
                />
              );
            })}
            
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {harmonyConfig.name}
              </span>
            </div>
          </div>
        </div>

        {/* Generated Palette */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Generated Harmony</p>
            <Button variant="outline" size="sm" onClick={exportHarmony}>
              <Download className="h-4 w-4 mr-2" />
              Export CSS
            </Button>
          </div>

          {/* Color strip */}
          <div className="flex rounded-lg overflow-hidden border">
            {harmonyPalette.map((color) => (
              <div
                key={color.key}
                className={`flex-1 h-20 ${color.isBase ? "ring-2 ring-inset ring-foreground/20" : ""}`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>

          {/* Color cards */}
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${harmonyPalette.length}, 1fr)` }}>
            {harmonyPalette.map((color) => (
              <div
                key={color.key}
                className={`rounded-lg border overflow-hidden group ${color.isBase ? "ring-2 ring-primary" : ""}`}
              >
                <div
                  className="h-16"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.key)}
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {color.hex}
                    {copied === color.key ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground">{color.hue}°</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mode escalation configuration
// Calm modes = pastoral palette | High modes = urban chaos takes over
const MODE_ESCALATION = [
  {
    mode: "innocent",
    name: "Innocent",
    color: "#E5C76B", // Butter yellow - pastoral calm
    bubbleShape: "rounded-full",
    bubbleStyle: "border-2 border-dashed",
    description: "Safe in the fields, round and soft",
    shapeRadius: "9999px",
    intensity: 0,
  },
  {
    mode: "concerned",
    name: "Concerned",
    color: "#6BA8D4", // Atlantic blue light - still pastoral
    bubbleShape: "rounded-[40%]",
    bubbleStyle: "border-2",
    description: "Storm clouds gathering, wobbling",
    shapeRadius: "40%",
    intensity: 25,
  },
  {
    mode: "triggered",
    name: "Triggered",
    color: "#FF6B35", // Metro Orange - urban seeping in
    bubbleShape: "rounded-[30%]",
    bubbleStyle: "border-[3px]",
    description: "The city arrives, edges emerging",
    shapeRadius: "30%",
    intensity: 50,
  },
  {
    mode: "savage",
    name: "Savage",
    color: "#FF4D94", // Soho Pink - full urban mode
    bubbleShape: "rounded-[15%]",
    bubbleStyle: "border-4",
    description: "Nightclub energy, losing control",
    shapeRadius: "15%",
    intensity: 75,
  },
  {
    mode: "nuclear",
    name: "Nuclear",
    color: "#FFD500", // Taxi Yellow - maximum chaos
    bubbleShape: "rounded-[5%]",
    bubbleStyle: "border-4 shadow-lg",
    description: "Times Square at midnight, total meltdown",
    shapeRadius: "5%",
    intensity: 100,
  },
];

function ModeEscalationVisualizer() {
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeIndex = hoverIndex !== null ? hoverIndex : currentModeIndex;
  const activeMode = MODE_ESCALATION[activeIndex];

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentModeIndex((prev) => (prev + 1) % MODE_ESCALATION.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const reset = () => {
    setCurrentModeIndex(0);
    setIsPlaying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Mode Escalation Visualizer
        </CardTitle>
        <CardDescription>
          Watch how Bubbles' visual language transforms from Innocent calm to Nuclear chaos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play Escalation
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Main Visualization */}
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            {/* Thought bubble visualization */}
            <div
              className={`w-48 h-32 flex items-center justify-center transition-all duration-500 ease-out ${activeMode.bubbleStyle}`}
              style={{
                backgroundColor: activeMode.color,
                borderRadius: activeMode.shapeRadius,
                borderColor: "hsl(var(--foreground) / 0.3)",
                transform: `scale(${1 + activeMode.intensity * 0.002})`,
                boxShadow: activeMode.intensity > 50 
                  ? `0 0 ${activeMode.intensity / 2}px ${activeMode.color}40`
                  : "none",
              }}
            >
              <span 
                className="text-center px-4 font-medium transition-all duration-300"
                style={{ 
                  color: activeMode.intensity > 60 ? "#000" : "#333",
                  fontStyle: activeMode.intensity > 75 ? "italic" : "normal",
                }}
              >
                {activeMode.intensity === 0 && "Grass. Good grass."}
                {activeMode.intensity === 25 && "Wait. Did that mean something?"}
                {activeMode.intensity === 50 && "The audacity."}
                {activeMode.intensity === 75 && "Violence has been selected."}
                {activeMode.intensity === 100 && "I WILL CONSUME THE SUN."}
              </span>
            </div>

            {/* Bubble tail */}
            <div
              className="absolute -bottom-3 left-8 w-6 h-6 transition-all duration-500"
              style={{
                backgroundColor: activeMode.color,
                borderRadius: activeMode.shapeRadius,
                transform: `rotate(${activeMode.intensity * 0.5}deg)`,
              }}
            />
            <div
              className="absolute -bottom-5 left-4 w-3 h-3 transition-all duration-500"
              style={{
                backgroundColor: activeMode.color,
                borderRadius: activeMode.shapeRadius,
              }}
            />
          </div>
        </div>

        {/* Mode info */}
        <div className="text-center space-y-2 transition-all duration-300">
          <h3 className="text-xl font-display font-bold" style={{ color: activeMode.color }}>
            {activeMode.name}
          </h3>
          <p className="text-sm text-muted-foreground">{activeMode.description}</p>
        </div>

        {/* Intensity meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Calm</span>
            <span>Intensity: {activeMode.intensity}%</span>
            <span>Chaos</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${activeMode.intensity + 10}%`,
                background: `linear-gradient(90deg, #FFB6C1, #B0C4DE, #B87333, #FF69B4, #DFFF00)`,
              }}
            />
          </div>
        </div>

        {/* Mode selector timeline */}
        <div className="flex gap-2">
          {MODE_ESCALATION.map((mode, index) => (
            <button
              key={mode.mode}
              className={`flex-1 p-3 rounded-lg border-2 transition-all duration-300 ${
                activeIndex === index
                  ? "ring-2 ring-offset-2 ring-primary"
                  : "hover:border-primary/50"
              }`}
              style={{
                backgroundColor: activeIndex === index ? mode.color : "transparent",
                borderColor: mode.color,
              }}
              onClick={() => {
                setCurrentModeIndex(index);
                setIsPlaying(false);
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div
                className={`w-8 h-8 mx-auto mb-2 transition-all duration-300 ${mode.bubbleStyle}`}
                style={{
                  backgroundColor: mode.color,
                  borderRadius: mode.shapeRadius,
                  borderColor: "hsl(var(--foreground) / 0.3)",
                }}
              />
              <p className="text-xs font-medium truncate">{mode.name}</p>
            </button>
          ))}
        </div>

        {/* Shape transformation guide */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <p className="text-sm font-medium">Shape Language Transformation</p>
          <div className="grid grid-cols-5 gap-4 text-center">
            {MODE_ESCALATION.map((mode) => (
              <div key={mode.mode} className="space-y-1">
                <div
                  className="w-10 h-10 mx-auto border-2"
                  style={{
                    borderRadius: mode.shapeRadius,
                    borderColor: mode.color,
                  }}
                />
                <p className="text-[10px] text-muted-foreground">
                  {mode.shapeRadius}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Border radius decreases from circular (9999px) to nearly sharp (5%) as intensity increases
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Thought Bubble Preview Generator
function ThoughtBubblePreviewGenerator() {
  const [customText, setCustomText] = useState("The audacity of this grass being greener elsewhere.");
  const [selectedMode, setSelectedMode] = useState(0);
  const [bubbleSize, setBubbleSize] = useState<"sm" | "md" | "lg">("md");
  
  const activeMode = MODE_ESCALATION[selectedMode];

  const sizeConfig = {
    sm: { padding: "p-3", text: "text-sm", width: "max-w-xs" },
    md: { padding: "p-4", text: "text-base", width: "max-w-sm" },
    lg: { padding: "p-6", text: "text-lg", width: "max-w-md" },
  };

  const exampleTexts = [
    { mode: 0, text: "Grass. Good grass. Very nice grass indeed." },
    { mode: 1, text: "Wait. Was that an insult? It felt like an insult." },
    { mode: 2, text: "Oh so NOW we're doing this? The audacity." },
    { mode: 3, text: "Violence has been selected. Prepare accordingly." },
    { mode: 4, text: "I WILL CONSUME THE SUN AND ALL WHO DWELL BENEATH IT." },
  ];

  const applyExample = (modeIndex: number) => {
    const example = exampleTexts.find(e => e.mode === modeIndex);
    if (example) {
      setCustomText(example.text);
      setSelectedMode(modeIndex);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Thought Bubble Preview Generator
        </CardTitle>
        <CardDescription>
          Type custom text and preview it rendered in any mode's visual style
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Custom Text
          </label>
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter your thought bubble text..."
            className="min-h-[80px] resize-none"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {customText.length}/200 characters
          </p>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mode Style</label>
          <div className="flex gap-2 flex-wrap">
            {MODE_ESCALATION.map((mode, index) => (
              <Button
                key={mode.mode}
                variant={selectedMode === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMode(index)}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: selectedMode === index ? mode.color : undefined,
                  borderColor: mode.color,
                  color: selectedMode === index 
                    ? (mode.intensity > 60 ? "#000" : "#333")
                    : undefined,
                }}
              >
                <div
                  className="w-3 h-3"
                  style={{
                    backgroundColor: mode.color,
                    borderRadius: mode.shapeRadius,
                  }}
                />
                {mode.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bubble Size</label>
          <div className="flex gap-2">
            {(["sm", "md", "lg"] as const).map((size) => (
              <Button
                key={size}
                variant={bubbleSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setBubbleSize(size)}
              >
                {size.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Live Preview</label>
          <div 
            className="p-8 rounded-lg border-2 border-dashed transition-colors duration-300"
            style={{ 
              backgroundColor: activeMode.intensity > 75 ? "#1a1a1a" : "hsl(var(--muted) / 0.3)",
            }}
          >
            <div className="flex justify-center">
              {/* Thought bubble */}
              <div className="relative">
                <div
                  className={`${sizeConfig[bubbleSize].padding} ${sizeConfig[bubbleSize].width} ${activeMode.bubbleStyle} transition-all duration-500`}
                  style={{
                    backgroundColor: activeMode.color,
                    borderRadius: activeMode.shapeRadius,
                    borderColor: "hsl(var(--foreground) / 0.3)",
                    boxShadow: activeMode.intensity > 50 
                      ? `0 0 ${activeMode.intensity / 2}px ${activeMode.color}40`
                      : "0 4px 12px rgba(0,0,0,0.1)",
                    transform: `scale(${1 + activeMode.intensity * 0.001})`,
                  }}
                >
                  <p 
                    className={`${sizeConfig[bubbleSize].text} font-display text-center transition-all duration-300`}
                    style={{ 
                      color: activeMode.intensity > 60 ? "#000" : "#333",
                      fontWeight: activeMode.intensity > 50 ? 600 : 400,
                      fontStyle: activeMode.intensity > 75 ? "italic" : "normal",
                      letterSpacing: activeMode.intensity > 90 ? "0.05em" : "normal",
                      textTransform: activeMode.intensity === 100 ? "uppercase" : "none",
                    }}
                  >
                    {customText || "Enter some text above..."}
                  </p>
                </div>
                
                {/* Bubble tail circles */}
                <div
                  className="absolute -bottom-3 left-8 w-5 h-5 transition-all duration-500"
                  style={{
                    backgroundColor: activeMode.color,
                    borderRadius: activeMode.shapeRadius,
                  }}
                />
                <div
                  className="absolute -bottom-5 left-4 w-3 h-3 transition-all duration-500"
                  style={{
                    backgroundColor: activeMode.color,
                    borderRadius: activeMode.shapeRadius,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quick Examples</label>
          <div className="grid gap-2">
            {exampleTexts.map((example) => {
              const mode = MODE_ESCALATION[example.mode];
              return (
                <button
                  key={example.mode}
                  onClick={() => applyExample(example.mode)}
                  className="flex items-center gap-3 p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors group"
                >
                  <div
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: mode.color,
                      borderRadius: mode.shapeRadius,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: mode.intensity > 60 ? "#000" : "#333" }}>
                      {mode.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{mode.name}</p>
                    <p className="text-sm truncate">{example.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Style Guide */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Current Mode Style: {activeMode.name}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Border Radius</p>
              <p className="font-mono">{activeMode.shapeRadius}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Intensity</p>
              <p className="font-mono">{activeMode.intensity}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Accent Color</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: activeMode.color }}
                />
                <span className="font-mono">{activeMode.color}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Typography</p>
              <p className="font-mono">
                {activeMode.intensity > 75 ? "Bold Italic" : activeMode.intensity > 50 ? "Semibold" : "Regular"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// All brand colors for matrix - Pastoral + Urban Chaos
// Fallback colors for matrix when no database colors available
const FALLBACK_BRAND_COLORS = [
  // 🌿 Wicklow Pastoral
  { key: "meadow", name: "Meadow Green", hex: "#4A9B6A", category: "wicklow" },
  { key: "atlantic", name: "Atlantic Blue", hex: "#4A8DBD", category: "wicklow" },
  { key: "butter", name: "Butter Yellow", hex: "#E5C76B", category: "wicklow" },
  { key: "mist", name: "Mist White", hex: "#F5F7FA", category: "wicklow" },
  { key: "stone", name: "Stone Grey", hex: "#7A8899", category: "wicklow" },
  { key: "heather", name: "Heather Purple", hex: "#9B6B9B", category: "wicklow" },
  { key: "turf", name: "Turf Brown", hex: "#5A4332", category: "wicklow" },
  // 🌃 Urban Chaos
  { key: "taxi", name: "Taxi Yellow", hex: "#FFD500", category: "urban" },
  { key: "soho", name: "Soho Pink", hex: "#FF4D94", category: "urban" },
  { key: "neon", name: "Neon Cyan", hex: "#00E5FF", category: "urban" },
  { key: "metro", name: "Metro Orange", hex: "#FF6B35", category: "urban" },
  { key: "fashion", name: "Fashion Purple", hex: "#A855F7", category: "urban" },
  { key: "club", name: "Nightclub Red", hex: "#EF4444", category: "urban" },
];

interface MatrixColor {
  key: string;
  name: string;
  hex: string;
  category?: string;
}

interface MatrixCell {
  fg: MatrixColor;
  bg: MatrixColor;
  ratio: number;
  normalAA: boolean;
  largeAA: boolean;
  normalAAA: boolean;
}

interface AccessibilityMatrixProps {
  colors?: BrandAsset[];
}

function AccessibilityMatrix({ colors }: AccessibilityMatrixProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Convert database colors to matrix format, or use fallbacks
  const allColors = useMemo((): MatrixColor[] => {
    if (!colors || colors.length === 0) {
      return FALLBACK_BRAND_COLORS;
    }
    
    return colors.map(c => {
      const val = c.asset_value as { hex?: string; category?: string };
      return {
        key: c.asset_key,
        name: c.asset_name,
        hex: val.hex || "#000000",
        category: val.category,
      };
    });
  }, [colors]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(allColors.map(c => c.category).filter(Boolean));
    return ["all", ...Array.from(cats)] as string[];
  }, [allColors]);

  // Filter colors by category
  const filteredColors = useMemo(() => {
    if (categoryFilter === "all") return allColors;
    return allColors.filter(c => c.category === categoryFilter);
  }, [allColors, categoryFilter]);

  const matrix = useMemo(() => {
    const cells: MatrixCell[][] = [];
    
    filteredColors.forEach((fg) => {
      const row: MatrixCell[] = [];
      filteredColors.forEach((bg) => {
        const ratio = getContrastRatio(fg.hex, bg.hex);
        row.push({
          fg,
          bg,
          ratio,
          normalAA: ratio >= 4.5,
          largeAA: ratio >= 3,
          normalAAA: ratio >= 7,
        });
      });
      cells.push(row);
    });
    
    return cells;
  }, [filteredColors]);

  const getStatusColor = (cell: MatrixCell) => {
    if (cell.fg.key === cell.bg.key) return "bg-muted";
    if (cell.normalAAA) return "bg-accent/60";
    if (cell.normalAA) return "bg-accent/40";
    if (cell.largeAA) return "bg-warning/30";
    return "bg-destructive/20";
  };

  const getStatusIcon = (cell: MatrixCell) => {
    if (cell.fg.key === cell.bg.key) return null;
    if (cell.normalAA) return <CheckCircle2 className="h-3 w-3 text-accent-foreground" />;
    if (cell.largeAA) return <AlertCircle className="h-3 w-3 text-warning-foreground" />;
    return <XCircle className="h-3 w-3 text-destructive" />;
  };

  // Stats
  const stats = useMemo(() => {
    let aaPass = 0;
    let aaaPass = 0;
    let largeOnly = 0;
    let fail = 0;
    const total = filteredColors.length * filteredColors.length - filteredColors.length;

    matrix.forEach((row) => {
      row.forEach((cell) => {
        if (cell.fg.key === cell.bg.key) return;
        if (cell.normalAAA) aaaPass++;
        else if (cell.normalAA) aaPass++;
        else if (cell.largeAA) largeOnly++;
        else fail++;
      });
    });

    return { aaPass, aaaPass, largeOnly, fail, total };
  }, [matrix, filteredColors.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Color Accessibility Matrix
          {colors && colors.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-2">
              {filteredColors.length} colors from database
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          WCAG contrast compliance for all brand color pair combinations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filter by category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="capitalize"
              >
                {cat === "all" ? "All Colors" : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/60" />
            <span>AAA (7:1+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/40" />
            <span>AA (4.5:1+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/30" />
            <span>Large Only (3:1+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/20" />
            <span>Fail (&lt;3:1)</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-accent/40 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats.aaPass + stats.aaaPass}</p>
            <p className="text-xs text-muted-foreground">AA+ Pass</p>
          </div>
          <div className="p-3 bg-accent/60 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats.aaaPass}</p>
            <p className="text-xs text-muted-foreground">AAA Pass</p>
          </div>
          <div className="p-3 bg-warning/30 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats.largeOnly}</p>
            <p className="text-xs text-muted-foreground">Large Text Only</p>
          </div>
          <div className="p-3 bg-destructive/20 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats.fail}</p>
            <p className="text-xs text-muted-foreground">Fail</p>
          </div>
        </div>

        {/* Toggle Details */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Ratios" : "Show Ratios"}
        </Button>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="flex">
              <div className="w-24 h-10 flex items-center justify-center text-xs font-medium text-muted-foreground">
                FG → BG
              </div>
              {filteredColors.map((color) => (
                <div
                  key={color.key}
                  className="flex-1 h-10 flex items-center justify-center"
                  title={`${color.name} (${color.category})`}
                >
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {matrix.map((row, rowIndex) => (
              <div key={filteredColors[rowIndex].key} className="flex">
                {/* Row header */}
                <div className="w-24 h-10 flex items-center gap-2 px-2">
                  <div
                    className="w-5 h-5 rounded border flex-shrink-0"
                    style={{ backgroundColor: filteredColors[rowIndex].hex }}
                  />
                  <span className="text-xs truncate">{filteredColors[rowIndex].name}</span>
                </div>

                {/* Cells */}
                {row.map((cell) => (
                  <div
                    key={`${cell.fg.key}-${cell.bg.key}`}
                    className={`flex-1 h-10 flex items-center justify-center gap-1 border border-border/30 transition-colors ${getStatusColor(cell)}`}
                    title={`${cell.fg.name} on ${cell.bg.name}: ${cell.ratio.toFixed(2)}:1`}
                  >
                    {getStatusIcon(cell)}
                    {showDetails && cell.fg.key !== cell.bg.key && (
                      <span className="text-[10px] font-mono">
                        {cell.ratio.toFixed(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Best Pairs */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Recommended High-Contrast Pairs</p>
          <div className="grid gap-2 md:grid-cols-3">
            {matrix
              .flat()
              .filter((cell) => cell.fg.key !== cell.bg.key && cell.normalAAA)
              .sort((a, b) => b.ratio - a.ratio)
              .slice(0, 6)
              .map((cell) => (
                <div
                  key={`best-${cell.fg.key}-${cell.bg.key}`}
                  className="flex items-center gap-2 p-2 rounded-lg border"
                >
                  <div className="flex">
                    <div
                      className="w-6 h-6 rounded-l border"
                      style={{ backgroundColor: cell.fg.hex }}
                    />
                    <div
                      className="w-6 h-6 rounded-r border-y border-r"
                      style={{ backgroundColor: cell.bg.hex }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">
                      {cell.fg.name} / {cell.bg.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {cell.ratio.toFixed(2)}:1
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">AAA</Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ExportFormat = "css" | "tailwind" | "json";

function exportColors(colors: BrandAsset[], format: ExportFormat): string {
  const colorData = colors.map(c => {
    const val = c.asset_value as { hex?: string; hsl?: string; category?: string };
    return {
      key: c.asset_key,
      name: c.asset_name,
      hex: val.hex || "",
      hsl: val.hsl || "",
      category: val.category || "",
    };
  });

  switch (format) {
    case "css":
      return `:root {\n  /* Bubbles Brand Colors */\n${colorData
        .map(c => `  --${c.key}: ${c.hsl};`)
        .join("\n")}\n}`;
    
    case "tailwind":
      const grouped: Record<string, Record<string, string>> = {};
      colorData.forEach(c => {
        const prefix = c.category || "brand";
        if (!grouped[prefix]) grouped[prefix] = {};
        const suffix = c.key.replace(`${prefix}-`, "").replace(/-/g, "");
        grouped[prefix][suffix || "DEFAULT"] = `"${c.hex}"`;
      });
      return `// Tailwind Config Colors\ncolors: {\n${Object.entries(grouped)
        .map(([key, values]) => `  ${key}: {\n${Object.entries(values)
          .map(([k, v]) => `    ${k}: ${v},`)
          .join("\n")}\n  },`)
        .join("\n")}\n}`;
    
    case "json":
      return JSON.stringify(
        colorData.reduce((acc, c) => {
          acc[c.key] = { name: c.name, hex: c.hex, hsl: c.hsl };
          return acc;
        }, {} as Record<string, { name: string; hex: string; hsl: string }>),
        null,
        2
      );
    
    default:
      return "";
  }
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
interface ColorSwatchProps {
  asset: BrandAsset;
}

function ColorSwatch({ asset }: ColorSwatchProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const value = asset.asset_value as { hex?: string; hsl?: string; rgb?: string; pantone?: string; role?: string; mode?: string; category?: string };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`Copied ${type}: ${text}`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="overflow-hidden group">
      <div 
        className="h-24 w-full transition-transform group-hover:scale-105"
        style={{ backgroundColor: value.hex }}
      />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{asset.asset_name}</h4>
          {value.mode && (
            <Badge variant="outline" className="text-xs capitalize">{value.mode}</Badge>
          )}
          {value.role && !value.mode && (
            <Badge variant="secondary" className="text-xs capitalize">{value.role}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{asset.description}</p>
        
        {/* Color Values */}
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">HEX</span>
            <button 
              onClick={() => copyToClipboard(value.hex || '', 'HEX')}
              className="flex items-center gap-1 hover:text-bubbles-heather transition-colors"
            >
              {value.hex}
              {copied === 'HEX' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">HSL</span>
            <button 
              onClick={() => copyToClipboard(value.hsl || '', 'HSL')}
              className="flex items-center gap-1 hover:text-bubbles-heather transition-colors"
            >
              {value.hsl}
              {copied === 'HSL' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          {value.pantone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pantone</span>
              <button 
                onClick={() => copyToClipboard(value.pantone || '', 'Pantone')}
                className="flex items-center gap-1 hover:text-bubbles-heather transition-colors"
              >
                {value.pantone}
                {copied === 'Pantone' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandColors() {
  const { data: colors, isLoading } = useBrandAssets("color");

  const wicklowColors = colors?.filter(c => {
    const val = c.asset_value as { category?: string };
    return val.category === "wicklow";
  }) || [];

  const urbanColors = colors?.filter(c => {
    const val = c.asset_value as { category?: string };
    return val.category === "urban";
  }) || [];

  const modeColors = colors?.filter(c => {
    const val = c.asset_value as { category?: string };
    return val.category === "mode";
  }) || [];

  const seasonalColors = colors?.filter(c => {
    const val = c.asset_value as { category?: string };
    return val.category === "seasonal";
  }) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Palette className="h-8 w-8 text-bubbles-heather" />
              Color System
            </h1>
            <p className="text-muted-foreground mt-2">
              Wicklow-grounded palette with emotion-coded mode accents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {colors?.length || 0} colors
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!colors?.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (colors) {
                      downloadFile(exportColors(colors, "css"), "bubbles-colors.css");
                      toast.success("Exported as CSS variables");
                    }
                  }}
                >
                  CSS Variables
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (colors) {
                      downloadFile(exportColors(colors, "tailwind"), "bubbles-colors.tailwind.js");
                      toast.success("Exported as Tailwind config");
                    }
                  }}
                >
                  Tailwind Config
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (colors) {
                      downloadFile(exportColors(colors, "json"), "bubbles-colors.json");
                      toast.success("Exported as JSON tokens");
                    }
                  }}
                >
                  JSON Tokens
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Color Philosophy Banner */}
        <Card className="bg-gradient-to-r from-wicklow-meadow/10 via-wicklow-mist/50 to-urban-soho/10 border-wicklow-meadow/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-wicklow-butter mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Pastoral Calm vs. Urban Chaos</p>
                <p className="text-sm text-muted-foreground">
                  <strong>🌿 Wicklow Pastoral:</strong> Meadow Green • Atlantic Blue • Butter Yellow • Mist White • Stone Grey • Heather Purple • Turf Brown
                  <br />
                  <strong>🌃 Urban Chaos:</strong> Taxi Yellow • Soho Pink • Neon Cyan • Metro Orange • Fashion Purple • Nightclub Red — the human craziness Bubbles can't understand
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🌿 Wicklow Pastoral Palette - Database Driven */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-wicklow-butter" />
            <h2 className="text-xl font-display font-semibold">🌿 Wicklow Pastoral — The Fields</h2>
            {wicklowColors.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {wicklowColors.length} from database
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Calm, traditional Irish landscape. The rolling hills, the mist, the quiet. Home for Bubbles.
          </p>
          
          {/* Database Colors (Primary) */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-24 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wicklowColors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-5">
              {wicklowColors.map((color) => (
                <ColorSwatch key={color.id} asset={color} />
              ))}
            </div>
          ) : (
            /* Fallback to hardcoded if no database colors */
            <div className="grid gap-4 md:grid-cols-7">
              {Object.entries(WICKLOW_PASTORAL).map(([key, color]) => (
                <Card key={key} className="overflow-hidden group">
                  <div 
                    className="h-20 w-full transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  />
                  <CardContent className="p-3 space-y-1">
                    <h4 className="font-semibold text-sm">{color.name}</h4>
                    <p className="text-xs text-muted-foreground">{color.description}</p>
                    <p className="text-xs font-mono text-muted-foreground">{color.hex}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 🌃 Urban Chaos Palette - Database Driven */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-urban-soho" />
            <h2 className="text-xl font-display font-semibold">🌃 Urban Chaos — The City</h2>
            {urbanColors.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {urbanColors.length} from database
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            London, New York, nightlife, fashion — the human craziness that poor Bubbles can't understand. 
            Used for escalating modes and moments of confusion.
          </p>
          
          {/* Database Colors (Primary) */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-24 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : urbanColors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-6">
              {urbanColors.map((color) => (
                <ColorSwatch key={color.id} asset={color} />
              ))}
            </div>
          ) : (
            /* Fallback to hardcoded if no database colors */
            <div className="grid gap-4 md:grid-cols-6">
              {Object.entries(URBAN_CHAOS).map(([key, color]) => (
                <Card key={key} className="overflow-hidden group border-2 border-transparent hover:border-foreground/20">
                  <div 
                    className="h-20 w-full transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  />
                  <CardContent className="p-3 space-y-1">
                    <h4 className="font-semibold text-sm">{color.name}</h4>
                    <p className="text-xs text-muted-foreground">{color.description}</p>
                    <p className="text-xs font-mono text-muted-foreground">{color.hex}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Mode Escalation System - Database Driven */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-urban-soho" />
            <h2 className="text-xl font-display font-semibold">Mode Escalation — Fields to City</h2>
            {modeColors.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {modeColors.length} from database
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            5 states: starts pastoral and calm, ends in urban chaos. As Bubbles escalates, the city takes over.
          </p>
          
          {/* Database mode colors (Primary) */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-24 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : modeColors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-5">
              {modeColors.map((color) => (
                <ColorSwatch key={color.id} asset={color} />
              ))}
            </div>
          ) : (
            /* Fallback to hardcoded if no database colors */
            <div className="grid gap-4 md:grid-cols-5">
              {MODE_ESCALATION.map((mode) => (
                <Card key={mode.mode} className="overflow-hidden group">
                  <div 
                    className="h-20 w-full transition-transform group-hover:scale-105 flex items-center justify-center"
                    style={{ backgroundColor: mode.color }}
                  >
                    <div
                      className="w-10 h-10 border-2 border-black/20"
                      style={{ borderRadius: mode.shapeRadius }}
                    />
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <h4 className="font-semibold text-sm">{mode.name}</h4>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                    <p className="text-xs font-mono text-muted-foreground">{mode.intensity}% intensity</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Mode Escalation Visualizer */}
        <ModeEscalationVisualizer />

        {/* Thought Bubble Preview Generator */}
        <ThoughtBubblePreviewGenerator />

        {/* Seasonal Collection Palettes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-season-spring" />
            <h2 className="text-xl font-display font-semibold">Seasonal Collection Palettes</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Wicklow's dramatic seasonal shifts inspire drop collections — Spring gorse gold, Autumn bracken rust, Winter heather bronze
          </p>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-24 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {seasonalColors.map((color) => (
                <ColorSwatch key={color.id} asset={color} />
              ))}
            </div>
          )}
        </section>

        {/* Palette Generator */}
        <PaletteGenerator />

        {/* Color Harmony Generator */}
        <HarmonyGenerator />

        {/* Contrast Checker Tool */}
        {colors && colors.length > 0 && <ContrastChecker colors={colors} />}

        {/* Accessibility Matrix */}
        <AccessibilityMatrix colors={colors} />

        {/* WCAG Contrast Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">WCAG Contrast Requirements</CardTitle>
            <CardDescription>
              Minimum contrast ratios for accessibility compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Normal Text (&lt;18pt)</p>
                <p className="text-2xl font-bold text-bubbles-heather">4.5:1</p>
                <p className="text-xs text-muted-foreground">WCAG AA minimum</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Large Text (≥18pt)</p>
                <p className="text-2xl font-bold text-bubbles-gold">3:1</p>
                <p className="text-xs text-muted-foreground">WCAG AA minimum</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">UI Components</p>
                <p className="text-2xl font-bold text-mode-triggered">3:1</p>
                <p className="text-xs text-muted-foreground">Buttons, inputs, icons</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
