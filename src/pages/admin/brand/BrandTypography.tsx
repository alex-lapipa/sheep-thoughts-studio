import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrandAssets, BrandAsset } from "@/hooks/useBrandAssets";
import { Type, Smile, Zap, AlignLeft } from "lucide-react";

interface TypographyCardProps {
  asset: BrandAsset;
  preview: string;
}

function TypographyCard({ asset, preview }: TypographyCardProps) {
  const value = asset.asset_value as { 
    family?: string; 
    weight?: string; 
    spacing?: string; 
    style?: string; 
    usage?: string;
  };

  const getStyle = () => {
    return {
      fontFamily: value.family || 'inherit',
      fontWeight: value.weight || '400',
      letterSpacing: value.spacing || '0',
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{asset.asset_name}</CardTitle>
          <Badge variant="outline">{value.family}</Badge>
        </div>
        <CardDescription>{asset.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div 
          className="text-3xl p-4 bg-muted/50 rounded-lg"
          style={getStyle()}
        >
          {preview}
        </div>
        
        {/* Specs */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Weight</p>
            <p className="font-mono">{value.weight}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Spacing</p>
            <p className="font-mono">{value.spacing}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Style</p>
            <p className="font-mono text-xs">{value.style}</p>
          </div>
        </div>
        
        {/* Usage */}
        <div className="p-3 bg-bubbles-heather/10 rounded-lg text-sm">
          <p className="text-muted-foreground">Usage</p>
          <p className="text-bubbles-heather">{value.usage}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandTypography() {
  const { data: typography, isLoading } = useBrandAssets("typography");

  const displayInnocent = typography?.find(t => t.asset_key === "display-innocent");
  const displaySavage = typography?.find(t => t.asset_key === "display-savage");
  const bodyText = typography?.find(t => t.asset_key === "body");

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Type className="h-8 w-8 text-bubbles-heather" />
              Typography System
            </h1>
            <p className="text-muted-foreground mt-2">
              Dual-typeface system that shifts with character mode
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {typography?.length || 0} styles
          </Badge>
        </div>

        {/* Typography Philosophy */}
        <Card className="bg-gradient-to-r from-mode-innocent/10 to-mode-savage/10 border-bubbles-heather/30">
          <CardContent className="py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Smile className="h-5 w-5 text-mode-innocent mt-0.5" />
                <div>
                  <p className="font-semibold">Playful Typography</p>
                  <p className="text-sm text-muted-foreground">
                    Rounded edges, bouncy baselines, wide spacing — relaxed and friendly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-mode-savage mt-0.5" />
                <div>
                  <p className="font-semibold">Aggressive Typography</p>
                  <p className="text-sm text-muted-foreground">
                    Angular letterforms, tight spacing, sharp corners — intense and edgy
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Typefaces */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Display Typefaces</h2>
          <p className="text-muted-foreground text-sm">
            Headers and feature text — geometry shifts parallel to character mode transformation
          </p>
          
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-16 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {displayInnocent && (
                <TypographyCard 
                  asset={displayInnocent} 
                  preview="Bubbles says hi! 🐑" 
                />
              )}
              {displaySavage && (
                <TypographyCard 
                  asset={displaySavage} 
                  preview="Did I stutter? 🔥" 
                />
              )}
            </div>
          )}
        </section>

        {/* Body Text */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-display font-semibold">Body Text</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Clean sans-serif for extended reading — neutral across all modes
          </p>
          
          {isLoading ? (
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ) : bodyText ? (
            <TypographyCard 
              asset={bodyText} 
              preview="The quick brown sheep jumps over the lazy dog. Life's too short for bad vibes and worse takes." 
            />
          ) : null}
        </section>

        {/* Type Scale */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Type Scale Reference</CardTitle>
            <CardDescription>
              Consistent sizing across the design system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between border-b pb-2">
                <span className="text-4xl font-display font-bold">H1 Display</span>
                <span className="text-sm text-muted-foreground font-mono">text-4xl / 2.25rem</span>
              </div>
              <div className="flex items-baseline justify-between border-b pb-2">
                <span className="text-3xl font-display font-bold">H2 Section</span>
                <span className="text-sm text-muted-foreground font-mono">text-3xl / 1.875rem</span>
              </div>
              <div className="flex items-baseline justify-between border-b pb-2">
                <span className="text-2xl font-display font-semibold">H3 Subsection</span>
                <span className="text-sm text-muted-foreground font-mono">text-2xl / 1.5rem</span>
              </div>
              <div className="flex items-baseline justify-between border-b pb-2">
                <span className="text-xl font-display font-semibold">H4 Card Title</span>
                <span className="text-sm text-muted-foreground font-mono">text-xl / 1.25rem</span>
              </div>
              <div className="flex items-baseline justify-between border-b pb-2">
                <span className="text-base font-body">Body Text</span>
                <span className="text-sm text-muted-foreground font-mono">text-base / 1rem</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-body text-muted-foreground">Small / Caption</span>
                <span className="text-sm text-muted-foreground font-mono">text-sm / 0.875rem</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
