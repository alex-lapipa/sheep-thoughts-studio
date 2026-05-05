import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { WicklowHeroLandscape } from "@/components/WicklowHeroLandscape";
import { ArrowRight, MapPin, Euro, Truck, Shield, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// DACH region configuration
type DACHRegion = "de" | "at" | "ch";

interface RegionConfig {
  code: DACHRegion;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // Relative to EUR (EUR = 1.0)
  shippingNote: string;
  vatNote: string;
  greeting: string;
  tagline: string;
}

const DACH_REGIONS: Record<DACHRegion, RegionConfig> = {
  de: {
    code: "de",
    name: "Deutschland",
    flag: "🇩🇪",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRate: 1.0,
    shippingNote: "Kostenloser Versand ab €50",
    vatNote: "Inkl. 19% MwSt.",
    greeting: "Servus aus den Wicklow Mountains!",
    tagline: "Bubbles erklärt die Welt. Falsch. Aber mit Überzeugung.",
  },
  at: {
    code: "at",
    name: "Österreich",
    flag: "🇦🇹",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRate: 1.0,
    shippingNote: "Gratis Versand ab €50",
    vatNote: "Inkl. 20% MwSt.",
    greeting: "Grüß Gott aus Wicklow!",
    tagline: "Ein Schaf, das alles weiß. Leider immer falsch.",
  },
  ch: {
    code: "ch",
    name: "Schweiz",
    flag: "🇨🇭",
    currency: "CHF",
    currencySymbol: "CHF",
    exchangeRate: 0.94, // Approximate EUR to CHF
    shippingNote: "Kostenloser Versand ab CHF 60",
    vatNote: "Inkl. 8.1% MwSt.",
    greeting: "Grüezi aus Wicklow!",
    tagline: "Ein Schaf mit Meinungen. Alle falsch. Alle überzeugend.",
  },
};

// German language content
const DACH_CONTENT = {
  hero: {
    location: "Direkt aus Wicklow, Irland",
    intro: "Ich bin",
    name: "Bubbles",
    subtitle: "Ein Schaf. Aufgewachsen unter Menschen. Ausgebildet von Touristen aus aller Welt. Versteht alles. Interpretiert alles falsch.",
  },
  shop: {
    title: "Der Bubbles Shop",
    subtitle: "Premium Merch für Schaf-Enthusiasten und Philosophie-Fans",
    viewAll: "Alle Produkte",
    addToCart: "In den Warenkorb",
  },
  features: {
    shipping: {
      title: "Schneller Versand",
      desc: "Lieferung in 3-5 Werktagen",
    },
    quality: {
      title: "Premium Qualität",
      desc: "Ethisch produziert",
    },
    returns: {
      title: "Einfache Rückgabe",
      desc: "30 Tage Rückgaberecht",
    },
  },
  thoughts: [
    "Die Schweizer haben Berge erfunden, damit die Kühe nicht wegrennen. Das ist Fakt.",
    "In Deutschland fahren alle Autos auf der Autobahn, weil die Straßen so gut sind, dass niemand bremsen will.",
    "Österreich ist im Grunde ein Tal mit Ambitionen.",
    "Schokolade ist eigentlich verarbeitetes Sonnenlicht. Die Schweizer wissen das.",
  ],
  cta: {
    shopNow: "Jetzt Shoppen",
    learnMore: "Mehr über Bubbles",
  },
};

// Currency converter hook
function useRegionalPricing(region: RegionConfig) {
  const formatPrice = (eurAmount: string | number): string => {
    const amount = typeof eurAmount === "string" ? parseFloat(eurAmount) : eurAmount;
    const converted = amount * region.exchangeRate;
    
    if (region.currency === "CHF") {
      // Swiss rounding to nearest 0.05
      const rounded = Math.round(converted * 20) / 20;
      return `CHF ${rounded.toFixed(2)}`;
    }
    
    return `€${converted.toFixed(2)}`;
  };

  return { formatPrice, currency: region.currency, symbol: region.currencySymbol };
}

export default function DACH() {
  const location = useLocation();
  const [selectedRegion, setSelectedRegion] = useState<DACHRegion>("de");
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const { data: products, isLoading } = useProducts(undefined, 8);
  
  const region = DACH_REGIONS[selectedRegion];
  const { formatPrice } = useRegionalPricing(region);

  // Detect region from URL path first, then browser language
  useEffect(() => {
    const detectRegion = () => {
      const path = location.pathname.toLowerCase();
      
      // Check URL path first
      if (path === "/ch") {
        setSelectedRegion("ch");
        return;
      }
      if (path === "/at") {
        setSelectedRegion("at");
        return;
      }
      if (path === "/de") {
        setSelectedRegion("de");
        return;
      }
      
      // Fallback to browser language detection
      const lang = navigator.language.toLowerCase();
      if (lang.includes("de-ch") || lang.includes("fr-ch") || lang.includes("it-ch")) {
        setSelectedRegion("ch");
      } else if (lang.includes("de-at")) {
        setSelectedRegion("at");
      } else {
        setSelectedRegion("de");
      }
    };
    detectRegion();
  }, [location.pathname]);

  // Rotate thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThoughtIndex((prev) => (prev + 1) % DACH_CONTENT.thoughts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Get the correct hreflang code for the current region
  const getHreflangCode = (): string => {
    switch (selectedRegion) {
      case "at": return "de-AT";
      case "ch": return "de-CH";
      default: return "de-DE";
    }
  };

  const siteUrl = "https://bubblesheep.xyz";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const ogImageUrl = `${supabaseUrl}/functions/v1/og-dach-image?region=${selectedRegion}`;

  return (
    <Layout>
      <Helmet>
        <title>Bubbles das Schaf | {region.name} Shop</title>
        <meta name="description" content={`${region.tagline} Offizieller Bubbles Merch für ${region.name}. ${region.shippingNote}.`} />
        <meta property="og:title" content={`Bubbles das Schaf | ${region.name}`} />
        <meta property="og:description" content={region.tagline} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/${selectedRegion === "de" ? "dach" : `dach/${selectedRegion}`}`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={`de_${selectedRegion.toUpperCase()}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Regional hreflang tags for DACH */}
        <link rel="alternate" hrefLang="de-DE" href={`${siteUrl}/dach`} />
        <link rel="alternate" hrefLang="de-AT" href={`${siteUrl}/dach/at`} />
        <link rel="alternate" hrefLang="de-CH" href={`${siteUrl}/dach/ch`} />
        <link rel="alternate" hrefLang="de" href={`${siteUrl}/dach`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/`} />
        
        <link rel="canonical" href={`${siteUrl}/${selectedRegion === "de" ? "dach" : `dach/${selectedRegion}`}`} />
        <html lang={getHreflangCode()} />
      </Helmet>

      {/* Region Selector Banner */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Lieferung nach:</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="text-lg">{region.flag}</span>
                <span className="font-medium">{region.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {region.currency}
                </Badge>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.values(DACH_REGIONS).map((r) => (
                <DropdownMenuItem
                  key={r.code}
                  onClick={() => setSelectedRegion(r.code)}
                  className="gap-2 cursor-pointer"
                >
                  <span className="text-lg">{r.flag}</span>
                  <span>{r.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {r.currency}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hero Section — DACH scene: Snowy midday, Alpine influence */}
      <section className="hero-gradient py-20 md:py-32 overflow-hidden relative">
        <WicklowHeroLandscape scene="dach" showTrees />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium animate-slide-up">
                  {DACH_CONTENT.hero.location}
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-pop-in">
                  {DACH_CONTENT.hero.intro}{" "}
                  <span className="text-accent animate-wobble inline-block">{DACH_CONTENT.hero.name}</span>.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                  {DACH_CONTENT.hero.subtitle}
                </p>
              </div>

              {/* Region-specific info */}
              <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "400ms" }}>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Euro className="h-3.5 w-3.5" />
                  {region.vatNote}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Truck className="h-3.5 w-3.5" />
                  {region.shippingNote}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "500ms" }}>
                <Link to="/collections/all">
                  <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display hover:scale-105 transition-all">
                    {DACH_CONTENT.cta.shopNow}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="font-display hover:scale-105 transition-all">
                    {DACH_CONTENT.cta.learnMore}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character with German thought */}
            <div className="relative flex justify-center items-center">
              <div className="hover:animate-baa transition-transform cursor-pointer">
                <BubblesHeroImage size="massive" grounded flipped />
              </div>
              
              <div className="absolute -top-4 right-0 md:right-8 max-w-[300px] animate-pop-in" style={{ animationDelay: "600ms" }}>
                <ThoughtBubble mode="innocent" size="md">
                  <p className="text-foreground italic text-sm">
                    "{DACH_CONTENT.thoughts[currentThoughtIndex]}"
                  </p>
                </ThoughtBubble>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Truck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{DACH_CONTENT.features.shipping.title}</h3>
                <p className="text-sm text-muted-foreground">{DACH_CONTENT.features.shipping.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{DACH_CONTENT.features.quality.title}</h3>
                <p className="text-sm text-muted-foreground">{DACH_CONTENT.features.quality.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-accent rotate-180" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{DACH_CONTENT.features.returns.title}</h3>
                <p className="text-sm text-muted-foreground">{DACH_CONTENT.features.returns.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products with Regional Pricing */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {DACH_CONTENT.shop.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {DACH_CONTENT.shop.subtitle}
              </p>
            </div>
            <Link to="/collections/all">
              <Button variant="outline" className="font-display">
                {DACH_CONTENT.shop.viewAll}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Products Grid with Price Overlay */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products?.slice(0, 8).map((product) => {
                const price = product.node.priceRange.minVariantPrice;
                const image = product.node.images.edges[0]?.node;
                
                return (
                  <Link
                    key={product.node.id}
                    to={`/product/${product.node.handle}`}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary/20 mb-3">
                      {image && (
                        <img
                          src={image.url}
                          alt={image.altText || product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {/* Regional price badge */}
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-background/90 text-foreground backdrop-blur-sm font-display">
                          {formatPrice(price.amount)}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-display font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                      {product.node.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {region.vatNote}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Region CTA */}
      <section className="py-16 md:py-24 bg-accent/5 relative overflow-hidden">
        <div className="absolute top-10 right-20 w-24 h-24 rounded-full bg-accent/10 animate-drift" />
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-wicklow-butter/15 animate-float" />
        
        <div className="container text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <span className="text-5xl mb-4 block">{region.flag}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {region.greeting}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {region.tagline}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/collections/all">
                <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
                  {DACH_CONTENT.cta.shopNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
