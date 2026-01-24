import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { Palette, Type, Shapes, Factory, BookOpen, ExternalLink, Layout, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const brandSections = [
  {
    title: "Official Mascot",
    description: "Post-punk stencil Bubbles — the ONLY approved mascot",
    icon: Shapes,
    href: "/admin/brand/character",
    badge: "OFFICIAL",
  },
  {
    title: "Color System",
    description: "Wicklow-grounded palette with mode accents",
    icon: Palette,
    href: "/admin/brand/colors",
    badge: "Core",
  },
  {
    title: "Typography",
    description: "Display and body typefaces for all modes",
    icon: Type,
    href: "/admin/brand/typography",
    badge: "Core",
  },
  {
    title: "Frontend Reference",
    description: "Site pages, components, and implementation",
    icon: Layout,
    href: "/admin/brand/frontend",
    badge: "Implementation",
  },
  {
    title: "Production Specs",
    description: "Screen print, embroidery, WCAG compliance",
    icon: Factory,
    href: "/admin/brand/production",
    badge: "Technical",
  },
];

export default function BrandOverview() {
  const { data: assets, isLoading } = useBrandAssets();
  const { data: allAssets } = useBrandAssets(); // Get all for archived count

  const colorCount = assets?.filter(a => a.asset_type === "color").length || 0;
  const typographyCount = assets?.filter(a => a.asset_type === "typography").length || 0;
  const mascotCount = assets?.filter(a => a.asset_type === "mascot").length || 0;
  const productionCount = assets?.filter(a => a.asset_type === "production").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Brand Book</h1>
          <p className="text-muted-foreground mt-2">
            Bubbles the Sheep design system — Wicklow-grounded, psychology-informed, production-ready
          </p>
        </div>

        {/* Official Mascot Banner */}
        <Card className="border-2 border-mode-savage/50 bg-gradient-to-br from-mode-savage/10 to-background">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge className="bg-mode-savage text-white">OFFICIAL</Badge>
              <CardTitle className="text-xl">Stencil-Era Bubbles (2025)</CardTitle>
            </div>
            <CardDescription className="text-base mt-2">
              The post-punk stencil derived from the D&C Nineties T-shirt is now the ONLY approved mascot.
              All legacy SVG variants have been archived.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Component</span>
                <p className="text-muted-foreground font-mono">BubblesHeroImage</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Size</span>
                <p className="text-muted-foreground">"colossal" (~72-80rem, twice as big)</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Position</span>
                <p className="text-muted-foreground">Grounded on grass</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Orientation</span>
                <p className="text-muted-foreground">Facing left (flipped)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Philosophy */}
        <Card className="border-bubbles-heather/30 bg-gradient-to-br from-bubbles-cream/20 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-bubbles-heather" />
              Core Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-4 border-bubbles-gold pl-4 italic text-lg">
              "Duality creates memorability. Visual innocence + emotional complexity creates memorable contrast."
            </blockquote>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-bubbles-heather">Irish Wit</h4>
                <p className="text-sm text-muted-foreground">
                  Sharp observation with underlying warmth — slagging culture meets deadpan delivery
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-bubbles-gold">Wicklow Roots</h4>
                <p className="text-sm text-muted-foreground">
                  Colors grounded in heather, gorse, bog cotton, and mountain mist
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-mode-savage">Mode System</h4>
                <p className="text-sm text-muted-foreground">
                  5 escalating states: Innocent → Concerned → Triggered → Savage → Nuclear
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {brandSections.map((section) => (
            <Link key={section.href} to={section.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-bubbles-heather/50 group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bubbles-heather/10">
                        <section.icon className="h-5 w-5 text-bubbles-heather" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{section.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {section.title === "Official Mascot" && `${mascotCount} official asset`}
                      {section.title === "Color System" && `${colorCount} colors defined`}
                      {section.title === "Typography" && `${typographyCount} type styles`}
                      {section.title === "Production Specs" && `${productionCount} specifications`}
                      {section.title === "Frontend Reference" && "6 pages • 5 components"}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-bubbles-heather transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mode Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Mode System Preview</CardTitle>
            <CardDescription>
              Visual escalation from innocence to chaos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-mode-innocent/30 border border-mode-innocent">
                <span className="font-medium">Innocent</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-mode-concerned/30 border border-mode-concerned">
                <span className="font-medium">Concerned</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-mode-triggered/30 border border-mode-triggered">
                <span className="font-medium">Triggered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-mode-savage/30 border border-mode-savage">
                <span className="font-medium">Savage</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-mode-nuclear/30 border border-mode-nuclear text-foreground">
                <span className="font-medium">Nuclear</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Link */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Brand Identity Research</p>
                  <p className="text-sm text-muted-foreground">
                    Full documentation with psychology studies, case analyses, and production specs
                  </p>
                </div>
              </div>
              <Badge variant="secondary">311 lines</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
