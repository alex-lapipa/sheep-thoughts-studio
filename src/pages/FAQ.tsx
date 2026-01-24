import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { AnimatedOnView } from "@/components/AnimatedText";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOgImage } from "@/hooks/useOgImage";
import { MessageCircle, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// FAQ categories for SEO structured data
const FAQ_CATEGORIES = [
  { id: "about", title: "About Bubbles", range: [0, 2] },
  { id: "shop", title: "Shop & Shipping", range: [2, 10] },
  { id: "wisdom", title: "Bubbles' Wisdom", range: [10, 17] },
];

const FAQ = () => {
  const { t } = useLanguage();
  const { ogImageUrl, siteUrl } = useOgImage("og-faq.jpg");

  // Static FAQ content - SEO optimized
  const faqs = useMemo(() => [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
    { question: t("faq.q7"), answer: t("faq.a7") },
    { question: t("faq.q8"), answer: t("faq.a8") },
    { question: t("faq.q9"), answer: t("faq.a9") },
    { question: t("faq.q10"), answer: t("faq.a10") },
    { question: t("faq.q11"), answer: t("faq.a11") },
    { question: t("faq.q12"), answer: t("faq.a12") },
    { question: t("faq.q13"), answer: t("faq.a13") },
    { question: t("faq.q14"), answer: t("faq.a14") },
    { question: t("faq.q15"), answer: t("faq.a15") },
    { question: t("faq.q16"), answer: t("faq.a16") },
    { question: t("faq.q17"), answer: t("faq.a17") },
  ], [t]);

  // Generate JSON-LD structured data for SEO
  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }), [faqs]);

  return (
    <Layout>
      <Helmet>
        <title>BAQ | Bubbles the Sheep - Badly Asked Questions</title>
        <meta name="description" content="Find answers to common questions about Bubbles the Sheep, shipping, returns, and get confidently incorrect wisdom on life's big questions." />
        <meta property="og:title" content="FAQ | Bubbles the Sheep" />
        <meta property="og:description" content="Frequently asked questions answered with confident incorrectness." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/faq`} />
        <meta property="og:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/faq`} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <section className="-mx-4 mb-8">
        <PageHeroWithBubbles
          title="Badly Asked Questions"
          subtitle="Everything you need to know, answered with varying degrees of accuracy"
          bubbleSize="sm"
          scene="faq"
        />
      </section>

      <div className="container max-w-4xl py-8">
        {/* Ask Bubbles CTA */}
        <AnimatedOnView>
          <Card className="mb-10 border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-background to-primary/5 overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/20 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-2">
                    Can't find your answer?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Ask Bubbles directly and receive wisdom of dubious accuracy.
                  </p>
                  <Link to="/talk">
                    <Button size="lg" className="font-display gap-2">
                      <Sparkles className="h-4 w-4" />
                      Ask Bubbles
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedOnView>

        {/* FAQ Categories */}
        {FAQ_CATEGORIES.map((category, catIndex) => (
          <section key={category.id} className="mb-10">
            <AnimatedOnView delay={catIndex * 0.1}>
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {category.title}
              </h2>
            </AnimatedOnView>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.slice(category.range[0], category.range[1]).map((faq, index) => (
                <AnimatedOnView key={index} delay={(catIndex * 0.1) + (index * 0.03)}>
                  <AccordionItem value={`${category.id}-${index}`} className="border-border/50">
                    <AccordionTrigger className="font-display text-left hover:no-underline group">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </AnimatedOnView>
              ))}
            </Accordion>
          </section>
        ))}

        {/* Contact CTA */}
        <AnimatedOnView delay={0.3}>
          <Card className="p-6 text-center bg-gradient-to-r from-secondary/50 to-muted/50">
            <h3 className="font-display text-lg font-semibold mb-2">
              {t("faqPage.contact.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("faqPage.contact.subtitle")}
            </p>
            <Link to="/contact">
              <Button variant="outline" className="font-display">
                {t("faqPage.contact.button")}
              </Button>
            </Link>
          </Card>
        </AnimatedOnView>
      </div>
    </Layout>
  );
};

export default FAQ;
