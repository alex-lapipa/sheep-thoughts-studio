import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrandAssets, BrandAsset } from "@/hooks/useBrandAssets";
import { Factory, Printer, Shirt, Accessibility, FileCheck, AlertTriangle } from "lucide-react";

interface ProductionSpecCardProps {
  asset: BrandAsset;
  icon: React.ElementType;
}

function ProductionSpecCard({ asset, icon: Icon }: ProductionSpecCardProps) {
  const value = asset.asset_value as Record<string, string | number>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-bubbles-heather/10">
            <Icon className="h-5 w-5 text-bubbles-heather" />
          </div>
          <div>
            <CardTitle className="text-lg">{asset.asset_name}</CardTitle>
            <CardDescription>{asset.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <Badge variant="outline" className="font-mono">
                {String(val)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandProduction() {
  const { data: production, isLoading } = useBrandAssets("production");

  const screenPrinting = production?.find(p => p.asset_key === "screen-printing");
  const embroidery = production?.find(p => p.asset_key === "embroidery");
  const wcag = production?.find(p => p.asset_key === "wcag-contrast");

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Factory className="h-8 w-8 text-bubbles-heather" />
              Production Specifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Technical requirements for screen print, embroidery, and web accessibility
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {production?.length || 0} specs
          </Badge>
        </div>

        {/* Production Philosophy */}
        <Card className="bg-gradient-to-r from-bubbles-gold/10 to-bubbles-heather/10 border-bubbles-gold/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <FileCheck className="h-5 w-5 text-bubbles-gold mt-0.5" />
              <div>
                <p className="font-medium">Premium Positioning Requires Quality Execution</p>
                <p className="text-sm text-muted-foreground">
                  Design within production realities from the start. Jellycat achieves £200M revenue 
                  through exceptional quality and selective distribution, not mass-market compromise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Specs Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-8 bg-muted rounded" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {screenPrinting && (
              <ProductionSpecCard asset={screenPrinting} icon={Printer} />
            )}
            {embroidery && (
              <ProductionSpecCard asset={embroidery} icon={Shirt} />
            )}
            {wcag && (
              <ProductionSpecCard asset={wcag} icon={Accessibility} />
            )}
          </div>
        )}

        {/* Detailed Guidelines */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Screen Printing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Screen Printing Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Color Efficiency</h4>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Create 2-color and 3-color simplified versions</li>
                    <li>Use solid spot color areas vs gradients</li>
                    <li>Each color = separate screen = added cost</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Halftone Specs</h4>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>35-45 LPI for standard prints</li>
                    <li>Mesh count = 5× LPI</li>
                    <li>Angle: 22.5° or 25° to avoid moiré</li>
                    <li>Expect 25-35% dot gain</li>
                  </ul>
                </div>
                <div className="p-3 bg-mode-triggered/10 rounded-lg border border-mode-triggered/30">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-mode-triggered" />
                    <h4 className="font-semibold">Light vs Dark Garments</h4>
                  </div>
                  <p className="text-muted-foreground">
                    Same ink appears different on light vs dark fabrics — provide separate artwork for each
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embroidery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Embroidery Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Aggressive Simplification</h4>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>6 colors maximum, 4-6 optimal</li>
                    <li>Eliminate fine gradients (not reproducible)</li>
                    <li>Bold, simple shapes — details merge</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Minimum Dimensions</h4>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Line width: minimum 1mm</li>
                    <li>Text height: minimum 8mm</li>
                    <li>Strong value contrast between adjacent colors</li>
                  </ul>
                </div>
                <div className="p-3 bg-bubbles-heather/10 rounded-lg border border-bubbles-heather/30">
                  <h4 className="font-semibold mb-1">Thread Documentation</h4>
                  <p className="text-muted-foreground">
                    Document thread matches for each brand color using Madeira or Isacord systems
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Documentation Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Color Documentation Requirements
            </CardTitle>
            <CardDescription>
              For each brand color, document across all production systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Format</th>
                    <th className="text-left py-3 px-2">Purpose</th>
                    <th className="text-left py-3 px-2">Example (Heather Mauve)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">Pantone (PMS)</td>
                    <td className="py-3 px-2 text-muted-foreground">Source of truth, spot color printing</td>
                    <td className="py-3 px-2"><Badge variant="outline">2069 C</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">CMYK</td>
                    <td className="py-3 px-2 text-muted-foreground">Process/offset printing</td>
                    <td className="py-3 px-2"><Badge variant="outline">0, 27, 0, 45</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">RGB</td>
                    <td className="py-3 px-2 text-muted-foreground">Digital displays</td>
                    <td className="py-3 px-2"><Badge variant="outline">139, 102, 139</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">HEX</td>
                    <td className="py-3 px-2 text-muted-foreground">Web/CSS</td>
                    <td className="py-3 px-2"><Badge variant="outline">#8B668B</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-medium">Thread Match</td>
                    <td className="py-3 px-2 text-muted-foreground">Embroidery production</td>
                    <td className="py-3 px-2"><Badge variant="outline">Madeira 1033</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Checklist */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Accessibility className="h-5 w-5" />
              Web Accessibility Checklist
            </CardTitle>
            <CardDescription>
              WCAG 2.1 AA compliance for Shopify storefront
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">✅ Required</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All text meets 4.5:1 contrast minimum</li>
                  <li>• Large text (≥18pt) meets 3:1 minimum</li>
                  <li>• UI components meet 3:1 minimum</li>
                  <li>• Pre-approved "safe pairs" documented</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">⚠️ Watch Out</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pure red (#FF0000) on white = only 4:1</li>
                  <li>• Pure green (#00FF00) on white = 1.4:1 (fails)</li>
                  <li>• Mode colors need dark text alternatives</li>
                  <li>• Test in both light and dark modes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
