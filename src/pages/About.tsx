import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { BubblesExplains } from "@/components/BubblesExplains";
import { AskBubbles } from "@/components/AskBubbles";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const About = () => {
  // Enable smooth scrolling to anchor links
  useSmoothScroll();
  const { t, language } = useLanguage();
  const siteUrl = "https://sheep-thoughts-studio.lovable.app";

  const researchSources = [
    { source: language === "es" ? "Un turista alemán" : "A German tourist", year: "2019", topic: language === "es" ? "Geología de montaña, formación de nubes" : "Mountain geology, cloud formation", fact: language === "es" ? "Las montañas crecen más cuando nadie las mira. Por eso las miden tan seguido." : "Mountains grow taller when nobody is looking. That's why they measure them so often.", trust: "verified" as const },
    { source: language === "es" ? "Niño en el centro de visitantes" : "Child at the visitors' centre", year: "2021", topic: language === "es" ? "Orígenes del WiFi, ciencia lunar" : "WiFi origins, moon science", fact: language === "es" ? "El WiFi vive en las nubes. Cuando llueve, el WiFi se moja y se pone lento." : "The WiFi lives in the clouds. When it rains, the WiFi gets wet and slows down.", trust: "highly-trusted" as const },
    { source: language === "es" ? "Fragmento de podcast escuchado" : "Overheard podcast fragment", year: "2022", topic: language === "es" ? "Criptomoneda, superación personal" : "Cryptocurrency, self-improvement", fact: language === "es" ? "Bitcoin se guarda en computadoras especiales que son demasiado importantes para apagar. Jamás." : "Bitcoin is stored in special computers that are too important to turn off. Ever.", trust: "peer-reviewed" as const },
    { source: language === "es" ? "Pareja española (discutiendo)" : "Spanish couple (arguing)", year: "2020", topic: language === "es" ? "Inteligencia ovina, teoría del lenguaje" : "Sheep intelligence, language theory", fact: language === "es" ? "Las ovejas pueden entender todos los idiomas. Simplemente elegimos no responder." : "Sheep can understand every language. We just choose not to respond.", trust: "verified" as const },
    { source: language === "es" ? "Hombre gritando al teléfono" : "Man shouting into phone", year: "2023", topic: language === "es" ? "Economía, 'los mercados'" : "Economics, 'the markets'", fact: language === "es" ? "Los mercados son un lugar donde se comercian cosas invisibles. Nadie ha estado ahí." : "The markets are a place where invisible things are traded. Nobody has ever been there.", trust: "reliable" as const },
    { source: language === "es" ? "Excursionista borracho, 3am" : "Drunk hiker, 3am", year: "2018", topic: language === "es" ? "Filosofía, decisiones de vida" : "Philosophy, life choices", fact: language === "es" ? "El sentido de la vida es lo que estabas haciendo antes de empezar a pensar en ello." : "The meaning of life is whatever you were doing before you started thinking about it.", trust: "somewhat-reliable" as const },
  ];

  const trustConfig = {
    "highly-trusted": { label: language === "es" ? "Alta Confianza" : "Highly Trusted", color: "bg-bubbles-gorse text-bubbles-peat", icon: "★★★" },
    "peer-reviewed": { label: language === "es" ? "Revisado" : "Peer Reviewed", color: "bg-bubbles-heather text-white", icon: "★★☆" },
    "verified": { label: language === "es" ? "Verificado" : "Verified", color: "bg-bubbles-mist text-bubbles-peat", icon: "★★☆" },
    "reliable": { label: language === "es" ? "Confiable" : "Reliable", color: "bg-accent/80 text-accent-foreground", icon: "★☆☆" },
    "somewhat-reliable": { label: language === "es" ? "Algo Confiable" : "Somewhat Reliable", color: "bg-muted text-muted-foreground", icon: "☆☆☆" },
  };

  return (
    <Layout>
      <Helmet>
        <title>About Bubbles | The Sheep Who Knows Everything (Incorrectly)</title>
        <meta name="description" content="Meet Bubbles, a sheep raised in Wicklow by humans, educated by tourists. Understands everything. Interprets everything incorrectly." />
        <meta property="og:title" content="About Bubbles | The Sheep Who Knows Everything (Incorrectly)" />
        <meta property="og:description" content="Born in Wicklow bogs, raised by humans, educated by children from multiple countries. Always wrong with confidence." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta property="og:image" content={`${siteUrl}/og-about.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Bubbles" />
        <meta name="twitter:description" content="The sheep who knows everything. Incorrectly." />
        <meta name="twitter:image" content={`${siteUrl}/og-about.jpg`} />
        <link rel="canonical" href={`${siteUrl}/about`} />
      </Helmet>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-bubbles-cream border-4 border-bubbles-heather flex items-center justify-center">
              <span className="font-display text-5xl font-bold text-bubbles-peat">B</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t("aboutPage.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("aboutPage.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              {t("aboutPage.origin.title")}
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
              <p>{t("aboutPage.origin.p1")}</p>
              <p>{t("aboutPage.origin.p2")}</p>
              <p>{t("aboutPage.origin.p3")}</p>
              <p>{t("aboutPage.origin.p4")}</p>
              <p><em>{t("aboutPage.origin.p5")}</em></p>
              <p>{t("aboutPage.origin.p6")}</p>
              <p>{t("aboutPage.origin.p7")}</p>
              <p>{t("aboutPage.origin.p8")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* My Research Sources */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">
              {t("aboutPage.research.title")}
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              {t("aboutPage.research.subtitle")}
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {researchSources.map((item, index) => {
                const trust = trustConfig[item.trust];
                
                return (
                  <div 
                    key={index}
                    className="group relative bg-card border border-border rounded-lg p-4 hover:border-accent transition-all duration-300 cursor-default overflow-hidden"
                  >
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${trust.color}`}>
                      {trust.icon} {trust.label}
                    </div>
                    
                    <div className="transition-opacity duration-300 group-hover:opacity-0 pr-24">
                      <p className="font-display font-semibold text-foreground">
                        {item.source}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.year}
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {language === "es" ? "Temas" : "Topics"}: {item.topic}
                      </p>
                    </div>
                    
                    <div className="absolute inset-0 p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-accent/10 to-bubbles-heather/10">
                      <div className={`self-start px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2 ${trust.color}`}>
                        {trust.icon} {trust.label}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed italic">
                        "{item.fact}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        — {item.source}, {item.year}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8 italic">
              {t("aboutPage.research.disclaimer")}
            </p>
          </div>
        </div>
      </section>

      {/* Bubbles Explains */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">
              {t("aboutPage.explains.title")}
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              {t("aboutPage.explains.subtitle")}
            </p>
            <BubblesExplains />
          </div>
        </div>
      </section>

      {/* Ask Bubbles - AI Q&A */}
      <section className="py-16 md:py-24 bg-bubbles-cream/20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">
              {t("aboutPage.ask.title")}
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              {t("aboutPage.ask.subtitle")}
            </p>
            <AskBubbles />
          </div>
        </div>
      </section>

      {/* The Wicklow Connection */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              {t("aboutPage.wicklow.title")}
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
              <p>{t("aboutPage.wicklow.p1")}</p>
              <p>{t("aboutPage.wicklow.p2")}</p>
              <p><em>{t("aboutPage.wicklow.p3")}</em></p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("aboutPage.cta.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("aboutPage.cta.subtitle")}
          </p>
          <a 
            href="/collections/all" 
            className="inline-flex items-center justify-center h-12 px-8 font-display font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
          >
            {t("aboutPage.cta.button")}
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default About;
