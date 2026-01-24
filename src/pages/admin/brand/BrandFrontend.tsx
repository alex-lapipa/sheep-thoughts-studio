import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Layout, 
  Home, 
  FileText, 
  ShoppingBag, 
  User, 
  HelpCircle, 
  Search,
  MessageCircle,
  Palette,
  Type,
  Shapes,
  Globe,
  Sparkles,
  Mountain,
  Cloud,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { ModeBadge } from "@/components/ModeBadge";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";
import type { BubbleMode } from "@/data/thoughtBubbles";

interface PageDocProps {
  title: string;
  route: string;
  description: string;
  components: string[];
  colors: string[];
  features: string[];
}

function PageDocCard({ title, route, description, components, colors, features }: PageDocProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">{route}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">COMPONENTS</p>
          <div className="flex flex-wrap gap-1">
            {components.map(c => (
              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">COLORS USED</p>
          <div className="flex flex-wrap gap-1">
            {colors.map(c => (
              <Badge key={c} className="text-xs bg-bubbles-heather/20 text-bubbles-heather border-0">{c}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">KEY FEATURES</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-bubbles-gold" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

const sitePages: PageDocProps[] = [
  {
    title: "Home",
    route: "/",
    description: "Hero introduction with Bubbles character, rotating thought bubbles, and featured products",
    components: ["Layout", "BubblesSheep", "ThoughtBubble", "WicklowLandscape", "FeaturedProducts", "Button"],
    colors: ["bubbles-cream", "bubbles-heather", "bubbles-gold", "accent", "mode-*"],
    features: [
      "Parallax Wicklow landscape background",
      "Auto-rotating thought bubbles from database",
      "Mode-colored thought bubble borders",
      "Bilingual EN/ES toggle",
    ],
  },
  {
    title: "Facts",
    route: "/facts",
    description: "Database of Bubbles' confidently wrong research and observations",
    components: ["Layout", "ThoughtBubble", "ModeBadge", "Card"],
    colors: ["mode-innocent", "mode-triggered", "mode-savage", "bubbles-cream"],
    features: [
      "Thoughts fetched from bubbles_thoughts table",
      "Mode-based visual styling per fact",
      "Filter by mode/category",
    ],
  },
  {
    title: "Shop",
    route: "/collections/:collection",
    description: "Product grid with Shopify integration, organized by Wicklow seasonal palette",
    components: ["Layout", "ProductGrid", "ProductCard", "CartDrawer"],
    colors: ["bubbles-gold", "accent", "card", "border"],
    features: [
      "Shopify Storefront API integration",
      "Cart persistence with Zustand",
      "Product variant selection",
    ],
  },
  {
    title: "My Story",
    route: "/about",
    description: "Bubbles' unreliable autobiography with interactive explanations",
    components: ["Layout", "BubblesExplains", "AskBubbles", "CitationGenerator", "ThoughtBubble"],
    colors: ["bubbles-cream", "bubbles-heather", "mode-triggered", "accent"],
    features: [
      "Static accordion explanations with challenge mode",
      "AI-powered RAG Q&A (bubbles-explain edge function)",
      "Citation generator with fake academic formats",
      "Mode escalation on user challenge",
    ],
  },
  {
    title: "Questions (FAQ)",
    route: "/faq",
    description: "Character-driven FAQ with Bubbles' unique perspective on common questions",
    components: ["Layout", "Accordion", "ThoughtBubble"],
    colors: ["bubbles-cream", "accent", "muted"],
    features: [
      "Accordion-based Q&A",
      "In-character responses",
    ],
  },
  {
    title: "Search",
    route: "/search",
    description: "Product search with Shopify query integration",
    components: ["Layout", "Input", "ProductGrid"],
    colors: ["background", "border", "accent"],
    features: [
      "Real-time search suggestions",
      "Shopify search API",
    ],
  },
];

const coreComponents = [
  {
    name: "ThoughtBubble",
    description: "Mode-aware speech/thought bubble with tail circles",
    props: ["mode", "size", "className"],
    modes: ["innocent", "concerned", "triggered", "savage", "nuclear"],
  },
  {
    name: "BubblesHeroImage",
    description: "OFFICIAL stencil mascot - post-punk style",
    props: ["size", "className", "animated", "grounded", "flipped"],
    modes: ["default (stencil)"],
  },
  {
    name: "ModeBadge",
    description: "Pill badge showing current character mode",
    props: ["mode", "size"],
    modes: ["innocent", "concerned", "triggered", "savage", "nuclear"],
  },
  {
    name: "WicklowLandscape",
    description: "Parallax SVG background with Sugarloaf silhouette",
    props: ["className"],
    modes: [],
  },
  {
    name: "LanguageToggle",
    description: "EN/ES language switcher with flag icons",
    props: [],
    modes: [],
  },
];

const modes: BubbleMode[] = ['innocent', 'concerned', 'triggered', 'savage'];

const sampleThoughts: Record<BubbleMode, string> = {
  innocent: "I wonder if clouds taste like cotton candy...",
  concerned: "Wait... was that the farmer or a wolf?",
  triggered: "They called me... a regular sheep?",
  savage: "I've met smarter fences.",
};

function LiveComponentPreview() {
  const [selectedMode, setSelectedMode] = useState<BubbleMode>('innocent');
  const [sheepSize, setSheepSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [bubbleSize, setBubbleSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
    <Card className="border-2 border-dashed border-bubbles-heather/30 bg-gradient-to-br from-bubbles-cream/10 to-bubbles-heather/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-bubbles-gold" />
          Live Component Preview
        </CardTitle>
        <CardDescription>
          Interactive preview of core brand components in all mode variants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Mode Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Select Mode</h4>
            <div className="flex gap-2">
              {modes.map((mode) => (
                <ModeBadge
                  key={mode}
                  mode={mode}
                  active={selectedMode === mode}
                  onClick={() => setSelectedMode(mode)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ThoughtBubble Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                ThoughtBubble
              </h4>
              <div className="flex gap-1">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={bubbleSize === size ? 'default' : 'outline'}
                    className="text-xs h-7 px-2"
                    onClick={() => setBubbleSize(size)}
                  >
                    {size.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-6 bg-muted/30 rounded-xl border border-border min-h-[160px] flex items-center justify-center">
              <ThoughtBubble mode={selectedMode} size={bubbleSize}>
                <p className="text-foreground">"{sampleThoughts[selectedMode]}"</p>
                <p className="text-xs text-muted-foreground mt-1">— Bubbles</p>
              </ThoughtBubble>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg font-mono">
              {`<ThoughtBubble mode="${selectedMode}" size="${bubbleSize}">`}
            </div>
          </div>

          {/* BubblesHeroImage Preview - OFFICIAL MASCOT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                BubblesHeroImage (Official)
              </h4>
              <Badge className="bg-mode-savage text-white text-xs">STENCIL ERA</Badge>
            </div>
            <div className="p-6 bg-muted/30 rounded-xl border border-border min-h-[200px] flex items-center justify-center">
              <BubblesHeroImage size="lg" grounded flipped />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg font-mono">
              {`<BubblesHeroImage size="massive" grounded flipped />`}
            </div>
          </div>
        </div>

        {/* All Modes Grid */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">All Mode Variants (ThoughtBubble)</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map((mode) => (
              <div key={mode} className="space-y-2">
                <ModeBadge mode={mode} className="w-full justify-center" />
                <ThoughtBubble mode={mode} size="sm">
                  <p className="text-sm">"{sampleThoughts[mode]}"</p>
                </ThoughtBubble>
              </div>
            ))}
          </div>
        </div>

        {/* Size Comparison */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">BubblesHeroImage Size Comparison</h4>
          <div className="flex items-end justify-center gap-8 p-6 bg-muted/30 rounded-xl border border-border overflow-x-auto">
            <div className="text-center space-y-2">
              <BubblesHeroImage size="sm" />
              <Badge variant="outline" className="text-xs">sm</Badge>
            </div>
            <div className="text-center space-y-2">
              <BubblesHeroImage size="md" />
              <Badge variant="outline" className="text-xs">md</Badge>
            </div>
            <div className="text-center space-y-2">
              <BubblesHeroImage size="lg" />
              <Badge variant="outline" className="text-xs">lg</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandFrontend() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Layout className="h-8 w-8 text-bubbles-heather" />
              Frontend Reference
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete documentation of site pages, components, and brand implementation
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {sitePages.length} pages • {coreComponents.length} core components
          </Badge>
        </div>

        {/* Site Architecture */}
        <Card className="bg-gradient-to-br from-bubbles-cream/20 to-background border-bubbles-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-bubbles-gold" />
              Site Architecture
            </CardTitle>
            <CardDescription>
              Public storefront structured as "Bubbles' Channel" — character-first, commerce-second
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Mountain className="h-4 w-4 text-bubbles-heather" />
                  <span className="font-semibold">Visual Layer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Wicklow palette, parallax landscapes, SVG character art, mode-based animations
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-mode-innocent" />
                  <span className="font-semibold">Character Layer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ThoughtBubbles, mode system, AI-powered responses, citation generator
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-4 w-4 text-bubbles-gold" />
                  <span className="font-semibold">Commerce Layer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shopify Storefront API, cart management, product variants, checkout
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages Documentation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-display font-semibold">Page Documentation</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sitePages.map((page) => (
              <PageDocCard key={page.route} {...page} />
            ))}
          </div>
        </section>

        {/* Core Components */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Shapes className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-display font-semibold">Core Brand Components</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {coreComponents.map((component) => (
              <Card key={component.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-mono">{`<${component.name} />`}</CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {component.props.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">PROPS</p>
                      <div className="flex flex-wrap gap-1">
                        {component.props.map(p => (
                          <Badge key={p} variant="outline" className="text-xs font-mono">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {component.modes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">MODE VARIANTS</p>
                      <div className="flex flex-wrap gap-1">
                        {component.modes.map(m => (
                          <Badge 
                            key={m} 
                            className={`text-xs ${
                              m === 'innocent' ? 'bg-mode-innocent/30 text-foreground' :
                              m === 'concerned' ? 'bg-mode-concerned/30 text-foreground' :
                              m === 'triggered' ? 'bg-mode-triggered/30 text-foreground' :
                              m === 'savage' ? 'bg-mode-savage/30 text-foreground' :
                              m === 'nuclear' ? 'bg-mode-nuclear/30 text-foreground' :
                              'bg-muted'
                            }`}
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Component Preview */}
        <LiveComponentPreview />

        {/* Design Tokens Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Design Tokens Quick Reference
            </CardTitle>
            <CardDescription>
              Key CSS custom properties and Tailwind classes used across the frontend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Wicklow Palette</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-bubbles-cream border" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">bubbles-cream</code>
                    <span className="text-xs text-muted-foreground">Bog Cotton #FFFDD0</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-bubbles-gold" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">bubbles-gold</code>
                    <span className="text-xs text-muted-foreground">Gorse #E8B923</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-bubbles-mist" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">bubbles-mist</code>
                    <span className="text-xs text-muted-foreground">Mountain Mist #B0C4DE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-bubbles-heather" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">bubbles-heather</code>
                    <span className="text-xs text-muted-foreground">Heather #8B668B</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-bubbles-peat" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">bubbles-peat</code>
                    <span className="text-xs text-muted-foreground">Peat Earth #2C2C2C</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Mode Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-mode-innocent" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">mode-innocent</code>
                    <span className="text-xs text-muted-foreground">Soft Blush #FFB6C1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-mode-concerned" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">mode-concerned</code>
                    <span className="text-xs text-muted-foreground">Mountain Mist #B0C4DE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-mode-triggered" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">mode-triggered</code>
                    <span className="text-xs text-muted-foreground">Burnt Orange #C27030</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-mode-savage" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">mode-savage</code>
                    <span className="text-xs text-muted-foreground">Hot Pink #FF69B4</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-mode-nuclear" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">mode-nuclear</code>
                    <span className="text-xs text-muted-foreground">Acid Yellow #DFFF00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Display Font: Space Grotesk</h4>
                <p className="text-sm text-muted-foreground">
                  Used for all headings, buttons, and brand elements via <code className="bg-muted px-1 rounded">font-display</code> class
                </p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-display text-2xl font-bold">I'm Bubbles. I know things.</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Body Font: Inter</h4>
                <p className="text-sm text-muted-foreground">
                  Used for body text and UI elements via <code className="bg-muted px-1 rounded">font-body</code> class
                </p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-body">A sheep. An expert. A trusted source of information that is absolutely, definitely, probably correct.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internationalization */}
        <Card className="bg-gradient-to-r from-mode-innocent/10 to-mode-concerned/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Internationalization (i18n)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The site supports English (with Irish flavor) and Spanish via the <code className="bg-muted px-1 rounded">LanguageContext</code>.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇮🇪</span>
                  <span className="font-semibold">English (Irish)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Default language. Features Wicklow location references and Irish colloquialisms.
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇪🇸</span>
                  <span className="font-semibold">Spanish</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full translation of homepage, navigation, and key UI elements.
                </p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-mono text-muted-foreground">
                Usage: <code>{"const { t } = useLanguage(); t('hero.title')"}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
