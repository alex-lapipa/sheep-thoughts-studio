import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrandAssets, BrandAsset } from "@/hooks/useBrandAssets";
import { Copy, Check, Palette, Sun, Moon, Sparkles, Leaf } from "lucide-react";
import { toast } from "sonner";

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
          <Badge variant="outline" className="text-sm">
            {colors?.length || 0} colors
          </Badge>
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
