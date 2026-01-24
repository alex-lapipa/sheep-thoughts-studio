import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { ArrowRight, MapPin, Euro, Truck, Shield } from "lucide-react";

// Irish Gaelic content
const GA_CONTENT = {
  hero: {
    location: "Ó Shléibhte Chill Mhantáin, Éire",
    intro: "Is mise",
    name: "Bubbles",
    subtitle: "Caora. Tógtha i measc daoine. Oilte ag turasóirí ó gach cearn den domhan. Tuigim gach rud. Míníonn mé gach rud go mícheart.",
  },
  shop: {
    title: "Siopa Bubbles",
    subtitle: "Earraí ardchaighdeáin do lucht grá na gcaorach agus na fealsúnachta",
    viewAll: "Féach ar Gach Táirge",
    addToCart: "Cuir sa Chiseán",
  },
  features: {
    shipping: {
      title: "Seachadadh Tapa",
      desc: "Seachadadh i 2-4 lá oibre",
    },
    quality: {
      title: "Ardchaighdeán",
      desc: "Déanta go heiticiúil",
    },
    returns: {
      title: "Aischuir Éasca",
      desc: "Polasaí 30 lá",
    },
  },
  thoughts: [
    "Tá sé ráite ag na seanfhocail gur fearr Gaeilge briste ná Béarla cliste. Ach tá mé cinnte gur fearr caora chliste ná duine briste.",
    "Deir siad go bhfuil an Ghaeilge i mbaol. Ach tá mise ag labhairt léi gach lá leis na caoirigh eile. Níl siad ag éisteacht, ach sin scéal eile.",
    "Is í Éire tír na gcéad míle fáilte. Ní fhaca mé fáilte amháin fós, ach tá mé fós ag lorg.",
    "Deirtear gur tír beag í Éire. Ach tá sí mór go leor do na caoirigh go léir.",
  ],
  cta: {
    shopNow: "Siopaigh Anois",
    learnMore: "Faoi Bubbles",
  },
  vatNote: "CBL 23% san áireamh",
  shippingNote: "Seachadadh saor in aisce os cionn €50",
  greeting: "Dia dhuit ó Chill Mhantáin!",
  tagline: "Caora le tuairimí. Go léir mícheart. Go léir lán muiníne.",
};

export default function Gaelic() {
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const { data: products, isLoading } = useProducts(undefined, 8);

  // Rotate thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThoughtIndex((prev) => (prev + 1) % GA_CONTENT.thoughts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const siteUrl = "https://sheep-thoughts-studio.lovable.app";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const ogImageUrl = `${supabaseUrl}/functions/v1/og-gaelic-image`;

  const formatPrice = (amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `€${numAmount.toFixed(2)}`;
  };

  return (
    <Layout>
      <Helmet>
        <title>Bubbles an Chaora | Siopa Gaeilge</title>
        <meta name="description" content={`${GA_CONTENT.tagline} Earraí oifigiúla Bubbles as Gaeilge. ${GA_CONTENT.shippingNote}.`} />
        <meta property="og:title" content="Bubbles an Chaora | Gaeilge" />
        <meta property="og:description" content={GA_CONTENT.tagline} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/ga`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="ga_IE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
        
        <link rel="alternate" hrefLang="ga" href={`${siteUrl}/ga`} />
        <link rel="alternate" hrefLang="en" href={`${siteUrl}/`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/`} />
        
        <link rel="canonical" href={`${siteUrl}/ga`} />
        <html lang="ga" />
      </Helmet>

      {/* Location Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20">
        <div className="container py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="text-muted-foreground">Seachadadh go:</span>
            <span className="text-lg">🇮🇪</span>
            <span className="font-medium">Éire</span>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <Euro className="h-3.5 w-3.5" />
            EUR
          </Badge>
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
                  {GA_CONTENT.hero.location}
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-pop-in">
                  {GA_CONTENT.hero.intro}{" "}
                  <span className="text-emerald-600 animate-wobble inline-block">{GA_CONTENT.hero.name}</span>.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                  {GA_CONTENT.hero.subtitle}
                </p>
              </div>

              {/* Irish-specific info */}
              <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "400ms" }}>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                  <Euro className="h-3.5 w-3.5" />
                  {GA_CONTENT.vatNote}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                  <Truck className="h-3.5 w-3.5" />
                  {GA_CONTENT.shippingNote}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "500ms" }}>
                <Link to="/collections/all">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-display hover:scale-105 transition-all">
                    {GA_CONTENT.cta.shopNow}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="font-display hover:scale-105 transition-all border-emerald-600/30 hover:bg-emerald-500/10">
                    {GA_CONTENT.cta.learnMore}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bubbles Character with Irish thought */}
            <div className="relative flex justify-center items-center">
              <div className="hover:animate-baa transition-transform cursor-pointer">
                <BubblesHeroImage size="colossal" grounded flipped />
              </div>
              
              <div className="absolute -top-4 right-0 md:right-8 max-w-[300px] animate-pop-in" style={{ animationDelay: "600ms" }}>
                <ThoughtBubble mode="innocent" size="md">
                  <p className="text-foreground italic text-sm">
                    "{GA_CONTENT.thoughts[currentThoughtIndex]}"
                  </p>
                </ThoughtBubble>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-emerald-500/5 border-y border-emerald-500/10">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{GA_CONTENT.features.shipping.title}</h3>
                <p className="text-sm text-muted-foreground">{GA_CONTENT.features.shipping.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{GA_CONTENT.features.quality.title}</h3>
                <p className="text-sm text-muted-foreground">{GA_CONTENT.features.quality.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-emerald-600 rotate-180" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{GA_CONTENT.features.returns.title}</h3>
                <p className="text-sm text-muted-foreground">{GA_CONTENT.features.returns.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {GA_CONTENT.shop.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {GA_CONTENT.shop.subtitle}
              </p>
            </div>
            <Link to="/collections/all">
              <Button variant="outline" className="font-display border-emerald-600/30 hover:bg-emerald-500/10">
                {GA_CONTENT.shop.viewAll}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Products Grid */}
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
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-background/90 text-foreground backdrop-blur-sm font-display">
                          {formatPrice(price.amount)}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-display font-semibold line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product.node.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {GA_CONTENT.vatNote}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Irish CTA */}
      <section className="py-16 md:py-24 bg-emerald-500/5 relative overflow-hidden">
        <div className="absolute top-10 right-20 w-24 h-24 rounded-full bg-emerald-500/10 animate-drift" />
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-emerald-300/15 animate-float" />
        
        <div className="container text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <span className="text-5xl mb-4 block">🇮🇪</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {GA_CONTENT.greeting}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {GA_CONTENT.tagline}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/collections/all">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-display">
                  {GA_CONTENT.cta.shopNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/wicklow-glossary">
                <Button size="lg" variant="outline" className="font-display border-emerald-600/30 hover:bg-emerald-500/10">
                  Focláir Chill Mhantáin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
