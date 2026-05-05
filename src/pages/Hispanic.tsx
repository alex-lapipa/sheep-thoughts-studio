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

// Hispanic region configuration
type HispanicRegion = "es" | "mx" | "ar" | "co" | "latam";

interface RegionConfig {
  code: HispanicRegion;
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

const HISPANIC_REGIONS: Record<HispanicRegion, RegionConfig> = {
  es: {
    code: "es",
    name: "España",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRate: 1.0,
    shippingNote: "Envío gratis a partir de €50",
    vatNote: "IVA incluido (21%)",
    greeting: "¡Hola desde las montañas de Wicklow!",
    tagline: "Bubbles explica el mundo. Mal. Pero con convicción.",
  },
  mx: {
    code: "mx",
    name: "México",
    flag: "🇲🇽",
    currency: "MXN",
    currencySymbol: "$",
    exchangeRate: 18.5, // Approximate EUR to MXN
    shippingNote: "Envío gratis a partir de $1,000 MXN",
    vatNote: "IVA incluido (16%)",
    greeting: "¡Qué onda desde Wicklow, güey!",
    tagline: "Una oveja que lo sabe todo. Lástima que siempre está mal.",
  },
  ar: {
    code: "ar",
    name: "Argentina",
    flag: "🇦🇷",
    currency: "ARS",
    currencySymbol: "$",
    exchangeRate: 950, // Approximate EUR to ARS
    shippingNote: "Envío gratis a partir de $50,000 ARS",
    vatNote: "IVA incluido (21%)",
    greeting: "¡Che, hola desde Wicklow!",
    tagline: "Una oveja con opiniones. Todas mal. Todas con garra.",
  },
  co: {
    code: "co",
    name: "Colombia",
    flag: "🇨🇴",
    currency: "COP",
    currencySymbol: "$",
    exchangeRate: 4200, // Approximate EUR to COP
    shippingNote: "Envío gratis a partir de $200,000 COP",
    vatNote: "IVA incluido (19%)",
    greeting: "¡Hola, parcero, desde Wicklow!",
    tagline: "Una oveja bacana. Siempre equivocada. Siempre segura.",
  },
  latam: {
    code: "latam",
    name: "Latinoamérica",
    flag: "🌎",
    currency: "USD",
    currencySymbol: "$",
    exchangeRate: 1.08, // Approximate EUR to USD
    shippingNote: "Envío internacional disponible",
    vatNote: "Impuestos según destino",
    greeting: "¡Saludos desde Wicklow, amigos!",
    tagline: "Bubbles: experta en todo. Correcta en nada.",
  },
};

// Spanish language content
const HISPANIC_CONTENT = {
  hero: {
    location: "Directo desde Wicklow, Irlanda",
    intro: "Soy",
    name: "Bubbles",
    subtitle: "Una oveja. Criada entre humanos. Educada por turistas de todo el mundo. Lo entiende todo. Lo interpreta todo mal.",
  },
  shop: {
    title: "La Tienda de Bubbles",
    subtitle: "Mercancía premium para amantes de las ovejas y fans de la filosofía dudosa",
    viewAll: "Ver Todo",
    addToCart: "Añadir al Carrito",
  },
  features: {
    shipping: {
      title: "Envío Rápido",
      desc: "Entrega en 5-10 días hábiles",
    },
    quality: {
      title: "Calidad Premium",
      desc: "Producido éticamente",
    },
    returns: {
      title: "Devoluciones Fáciles",
      desc: "30 días para devolver",
    },
  },
  thoughts: [
    "Los españoles inventaron la siesta porque el sol les robó energía. Es ciencia básica.",
    "En México, el chile es tan importante que lo ponen en los dulces. Esto confunde a la lengua, pero fortalece el carácter.",
    "Argentina es básicamente un país que decidió que la carne y el fútbol eran religiones. Y tienen razón.",
    "Colombia produce tanto café porque las montañas están muy despiertas y contagian a las plantas.",
    "El español de cada país es diferente porque las palabras se adaptan al clima local.",
  ],
  cta: {
    shopNow: "Comprar Ahora",
    learnMore: "Conoce a Bubbles",
  },
};

// Currency converter hook
function useRegionalPricing(region: RegionConfig) {
  const formatPrice = (eurAmount: string | number): string => {
    const amount = typeof eurAmount === "string" ? parseFloat(eurAmount) : eurAmount;
    const converted = amount * region.exchangeRate;
    
    if (region.currency === "EUR") {
      return `€${converted.toFixed(2)}`;
    }
    
    if (region.currency === "USD") {
      return `$${converted.toFixed(2)} USD`;
    }
    
    // For Latin American currencies, use locale formatting
    return `${region.currencySymbol}${converted.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${region.currency}`;
  };

  return { formatPrice, currency: region.currency, symbol: region.currencySymbol };
}

export default function Hispanic() {
  const location = useLocation();
  const [selectedRegion, setSelectedRegion] = useState<HispanicRegion>("es");
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const { data: products, isLoading } = useProducts(undefined, 8);
  
  const region = HISPANIC_REGIONS[selectedRegion];
  const { formatPrice } = useRegionalPricing(region);

  // Detect region from URL path first, then browser language
  useEffect(() => {
    const detectRegion = () => {
      const path = location.pathname.toLowerCase();
      
      // Check URL path
      if (path === "/mx") {
        setSelectedRegion("mx");
        return;
      }
      if (path === "/ar") {
        setSelectedRegion("ar");
        return;
      }
      if (path === "/co") {
        setSelectedRegion("co");
        return;
      }
      if (path === "/latam") {
        setSelectedRegion("latam");
        return;
      }
      
      // Default to Spain for /es path
      setSelectedRegion("es");
    };
    detectRegion();
  }, [location.pathname]);

  // Rotate thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThoughtIndex((prev) => (prev + 1) % HISPANIC_CONTENT.thoughts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Get the correct hreflang code for the current region
  const getHreflangCode = (): string => {
    switch (selectedRegion) {
      case "mx": return "es-MX";
      case "ar": return "es-AR";
      case "co": return "es-CO";
      case "latam": return "es-419"; // Spanish (Latin America)
      default: return "es-ES";
    }
  };

  const siteUrl = "https://bubblesheep.xyz";

  return (
    <Layout>
      <Helmet>
        <title>Bubbles la Oveja | Tienda {region.name}</title>
        <meta name="description" content={`${region.tagline} Mercancía oficial de Bubbles para ${region.name}. ${region.shippingNote}.`} />
        <meta property="og:title" content={`Bubbles la Oveja | ${region.name}`} />
        <meta property="og:description" content={region.tagline} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/es`} />
        <meta property="og:locale" content={getHreflangCode().replace("-", "_")} />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Regional hreflang tags for Hispanic markets */}
        <link rel="alternate" hrefLang="es-ES" href={`${siteUrl}/es`} />
        <link rel="alternate" hrefLang="es-MX" href={`${siteUrl}/mx`} />
        <link rel="alternate" hrefLang="es-AR" href={`${siteUrl}/ar`} />
        <link rel="alternate" hrefLang="es-CO" href={`${siteUrl}/co`} />
        <link rel="alternate" hrefLang="es-419" href={`${siteUrl}/latam`} />
        <link rel="alternate" hrefLang="es" href={`${siteUrl}/es`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/`} />
        
        <link rel="canonical" href={`${siteUrl}/${selectedRegion === "es" ? "es" : selectedRegion}`} />
        <html lang={getHreflangCode()} />
      </Helmet>

      {/* Region Selector Banner */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Envío a:</span>
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
              {Object.values(HISPANIC_REGIONS).map((r) => (
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

      {/* Hero Section — HISPANIC scene: Sunny dusk, warm evening */}
      <section className="hero-gradient py-20 md:py-32 overflow-hidden relative">
        <WicklowHeroLandscape scene="hispanic" showTrees />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-muted-foreground font-medium animate-slide-up-fade">
                  {HISPANIC_CONTENT.hero.location}
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-pop-in">
                  {HISPANIC_CONTENT.hero.intro}{" "}
                  <span className="text-accent animate-wiggle inline-block">{HISPANIC_CONTENT.hero.name}</span>.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                  {HISPANIC_CONTENT.hero.subtitle}
                </p>
              </div>

              {/* Region-specific info */}
              <div className="flex flex-wrap gap-3 animate-slide-up-fade" style={{ animationDelay: "400ms" }}>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Euro className="h-3.5 w-3.5" />
                  {region.vatNote}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                  <Truck className="h-3.5 w-3.5" />
                  {region.shippingNote}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 animate-slide-up-fade" style={{ animationDelay: "500ms" }}>
                <Link to="/collections/all">
                  <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display hover:scale-105 transition-all">
                    {HISPANIC_CONTENT.cta.shopNow}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="font-display hover:scale-105 transition-all">
                    {HISPANIC_CONTENT.cta.learnMore}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character with Spanish thought */}
            <div className="relative flex justify-center items-center">
              <div className="hover:animate-wiggle transition-transform cursor-pointer">
                <BubblesHeroImage size="massive" grounded flipped />
              </div>
              
              <div className="absolute -top-4 right-0 md:right-8 max-w-[300px] animate-pop-in" style={{ animationDelay: "600ms" }}>
                <ThoughtBubble mode="innocent" size="md">
                  <p className="text-foreground italic text-sm">
                    "{HISPANIC_CONTENT.thoughts[currentThoughtIndex]}"
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
                <h3 className="font-display font-semibold">{HISPANIC_CONTENT.features.shipping.title}</h3>
                <p className="text-sm text-muted-foreground">{HISPANIC_CONTENT.features.shipping.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{HISPANIC_CONTENT.features.quality.title}</h3>
                <p className="text-sm text-muted-foreground">{HISPANIC_CONTENT.features.quality.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-accent rotate-180" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{HISPANIC_CONTENT.features.returns.title}</h3>
                <p className="text-sm text-muted-foreground">{HISPANIC_CONTENT.features.returns.desc}</p>
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
                {HISPANIC_CONTENT.shop.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {HISPANIC_CONTENT.shop.subtitle}
              </p>
            </div>
            <Link to="/collections/all">
              <Button variant="outline" className="font-display">
                {HISPANIC_CONTENT.shop.viewAll}
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
        <div className="absolute top-10 right-20 w-24 h-24 rounded-full bg-accent/10 animate-float" />
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-wicklow-butter/15 animate-bounce-gentle" />
        
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
                  {HISPANIC_CONTENT.cta.shopNow}
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
