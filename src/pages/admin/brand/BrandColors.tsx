import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrandAssets, BrandAsset } from "@/hooks/useBrandAssets";
import { Copy, Check, Palette, Sun, Moon, Sparkles, Leaf, Download, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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

        {/* Psychology Banner */}
        <Card className="bg-gradient-to-r from-bubbles-gold/10 via-bubbles-cream/20 to-bubbles-heather/10 border-bubbles-gold/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-bubbles-gold mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Color Psychology Foundation</p>
                <p className="text-sm text-muted-foreground">
                  Yellow → comedy/joy (90% of studies) • Pink → approachability/innocence • 
                  Black → power/edge • Saturation controls mode intensity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Wicklow Palette */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-bubbles-gold" />
            <h2 className="text-xl font-display font-semibold">Primary Palette — Wicklow Grounded</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Colors sourced from Kilmacanogue, Rocky Valley, and Sugarloaf Mountain landscape
          </p>
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
          ) : (
            <div className="grid gap-4 md:grid-cols-5">
              {wicklowColors.map((color) => (
                <ColorSwatch key={color.id} asset={color} />
              ))}
            </div>
          )}
        </section>

        {/* Mode Accent System */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-mode-savage" />
            <h2 className="text-xl font-display font-semibold">Mode Accent System</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            5 escalating states from calm innocence to explosive chaos — saturation intensifies with mode
          </p>
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
          ) : (
            <div className="grid gap-4 md:grid-cols-5">
              {modeColors.map((color) => (
                <ColorSwatch key={color.id} asset={color} />
              ))}
            </div>
          )}
        </section>

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

        {/* Contrast Checker Tool */}
        {colors && colors.length > 0 && <ContrastChecker colors={colors} />}

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
