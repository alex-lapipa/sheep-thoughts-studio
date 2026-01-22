import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { BubblesSheep } from "@/components/BubblesSheep";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { ArrowRight, MapPin, Euro, Truck, Shield, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Francophone region configuration
type FrancophoneRegion = "fr" | "be" | "lu";

interface RegionConfig {
  code: FrancophoneRegion;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  shippingNote: string;
  vatNote: string;
  greeting: string;
  tagline: string;
}

const FRANCOPHONE_REGIONS: Record<FrancophoneRegion, RegionConfig> = {
  fr: {
    code: "fr",
    name: "France",
    flag: "🇫🇷",
    currency: "EUR",
    currencySymbol: "€",
    shippingNote: "Livraison gratuite dès 50€",
    vatNote: "TVA 20% incluse",
    greeting: "Bonjour depuis les montagnes de Wicklow !",
    tagline: "Bubbles explique le monde. Mal. Mais avec conviction.",
  },
  be: {
    code: "be",
    name: "Belgique",
    flag: "🇧🇪",
    currency: "EUR",
    currencySymbol: "€",
    shippingNote: "Livraison gratuite dès 50€",
    vatNote: "TVA 21% incluse",
    greeting: "Salut depuis Wicklow !",
    tagline: "Un mouton qui sait tout. Hélas, toujours faux.",
  },
  lu: {
    code: "lu",
    name: "Luxembourg",
    flag: "🇱🇺",
    currency: "EUR",
    currencySymbol: "€",
    shippingNote: "Livraison gratuite dès 50€",
    vatNote: "TVA 17% incluse",
    greeting: "Moien depuis Wicklow !",
    tagline: "Un mouton plein d'opinions. Toutes fausses. Toutes convaincantes.",
  },
};

// French language content
const FR_CONTENT = {
  hero: {
    location: "Directement de Wicklow, Irlande",
    intro: "Je suis",
    name: "Bubbles",
    subtitle: "Un mouton. Élevé par des humains. Éduqué par des touristes du monde entier. Comprend tout. Interprète tout de travers.",
  },
  shop: {
    title: "La Boutique Bubbles",
    subtitle: "Merch premium pour amateurs de moutons et fans de philosophie",
    viewAll: "Tous les produits",
    addToCart: "Ajouter au panier",
  },
  features: {
    shipping: {
      title: "Livraison rapide",
      desc: "Livraison en 3-5 jours",
    },
    quality: {
      title: "Qualité premium",
      desc: "Production éthique",
    },
    returns: {
      title: "Retours faciles",
      desc: "30 jours pour changer d'avis",
    },
  },
  thoughts: [
    "Les Français ont inventé le croissant pour que les gens aient une raison de se lever tôt. C'est logique.",
    "En Belgique, ils mangent des frites avec tout parce que les patates sont très sociables.",
    "Le Luxembourg est petit pour que tout le monde puisse se connaître. C'est de la planification urbaine avancée.",
    "Le fromage français sent fort parce qu'il veut qu'on se souvienne de lui. C'est du marketing olfactif.",
  ],
  cta: {
    shopNow: "Acheter maintenant",
    learnMore: "En savoir plus sur Bubbles",
  },
};

// Price formatter for EUR
function useRegionalPricing() {
  const formatPrice = (eurAmount: string | number): string => {
    const amount = typeof eurAmount === "string" ? parseFloat(eurAmount) : eurAmount;
    return `€${amount.toFixed(2)}`;
  };

  return { formatPrice };
}

export default function Francophone() {
  const location = useLocation();
  const [selectedRegion, setSelectedRegion] = useState<FrancophoneRegion>("fr");
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const { data: products, isLoading } = useProducts(undefined, 8);
  
  const region = FRANCOPHONE_REGIONS[selectedRegion];
  const { formatPrice } = useRegionalPricing();

  // Detect region from URL path first, then browser language
  useEffect(() => {
    const detectRegion = () => {
      const path = location.pathname.toLowerCase();
      
      // Check URL path for specific country pages
      if (path === "/be" || path.startsWith("/be/")) {
        setSelectedRegion("be");
        return;
      }
      if (path === "/lu" || path.startsWith("/lu/")) {
        setSelectedRegion("lu");
        return;
      }
      
      // Fallback to browser language detection
      const lang = navigator.language.toLowerCase();
      if (lang.includes("fr-be") || lang.includes("nl-be")) {
        setSelectedRegion("be");
      } else if (lang.includes("fr-lu") || lang.includes("lb")) {
        setSelectedRegion("lu");
      } else {
        setSelectedRegion("fr");
      }
    };
    detectRegion();
  }, [location.pathname]);

  // Rotate thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThoughtIndex((prev) => (prev + 1) % FR_CONTENT.thoughts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Get the correct hreflang code for the current region
  const getHreflangCode = (): string => {
    switch (selectedRegion) {
      case "be": return "fr-BE";
      case "lu": return "fr-LU";
      default: return "fr-FR";
    }
  };

  const siteUrl = "https://sheep-thoughts-studio.lovable.app";
  const supabaseUrl = "https://iteckeoeowgguhgrpcnm.supabase.co";
  const ogImageUrl = `${supabaseUrl}/functions/v1/og-francophone-image?region=${selectedRegion}`;

  return (
    <Layout>
      <Helmet>
        <title>Bubbles le Mouton | Boutique {region.name}</title>
        <meta name="description" content={`${region.tagline} Merch officiel Bubbles pour ${region.name}. ${region.shippingNote}.`} />
        <meta property="og:title" content={`Bubbles le Mouton | ${region.name}`} />
        <meta property="og:description" content={region.tagline} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/${selectedRegion === "fr" ? "fr" : selectedRegion}`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={`fr_${selectedRegion.toUpperCase()}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Regional hreflang tags for Francophone markets */}
        <link rel="alternate" hrefLang="fr-FR" href={`${siteUrl}/fr`} />
        <link rel="alternate" hrefLang="fr-BE" href={`${siteUrl}/be`} />
        <link rel="alternate" hrefLang="fr-LU" href={`${siteUrl}/lu`} />
        <link rel="alternate" hrefLang="fr" href={`${siteUrl}/fr`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/`} />
        
        <link rel="canonical" href={`${siteUrl}/${selectedRegion === "fr" ? "fr" : selectedRegion}`} />
        <html lang={getHreflangCode()} />
      </Helmet>

      {/* Region Selector Banner */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Livraison vers :</span>
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
              {Object.values(FRANCOPHONE_REGIONS).map((r) => (
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

      {/* Hero Section */}
      <section className="hero-gradient py-20 md:py-32 overflow-hidden relative">
        <WicklowLandscape />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium animate-slide-up">
                  {FR_CONTENT.hero.location}
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-pop-in">
                  {FR_CONTENT.hero.intro}{" "}
                  <span className="text-accent animate-wobble inline-block">{FR_CONTENT.hero.name}</span>.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                  {FR_CONTENT.hero.subtitle}
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
                    {FR_CONTENT.cta.shopNow}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="font-display hover:scale-105 transition-all">
                    {FR_CONTENT.cta.learnMore}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character with French thought */}
            <div className="relative flex justify-center items-center">
              <div className="hover:animate-baa transition-transform cursor-pointer">
                <BubblesSheep size="xl" className="drop-shadow-2xl animate-float" />
              </div>
              
              <div className="absolute -top-4 right-0 md:right-8 max-w-[300px] animate-pop-in" style={{ animationDelay: "600ms" }}>
                <ThoughtBubble mode="innocent" size="md">
                  <p className="text-foreground italic text-sm">
                    "{FR_CONTENT.thoughts[currentThoughtIndex]}"
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
                <h3 className="font-display font-semibold">{FR_CONTENT.features.shipping.title}</h3>
                <p className="text-sm text-muted-foreground">{FR_CONTENT.features.shipping.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{FR_CONTENT.features.quality.title}</h3>
                <p className="text-sm text-muted-foreground">{FR_CONTENT.features.quality.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-accent rotate-180" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{FR_CONTENT.features.returns.title}</h3>
                <p className="text-sm text-muted-foreground">{FR_CONTENT.features.returns.desc}</p>
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
                {FR_CONTENT.shop.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {FR_CONTENT.shop.subtitle}
              </p>
            </div>
            <Link to="/collections/all">
              <Button variant="outline" className="font-display">
                {FR_CONTENT.shop.viewAll}
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
                  {FR_CONTENT.cta.shopNow}
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
