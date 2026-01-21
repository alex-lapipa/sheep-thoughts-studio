import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
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
  ];

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t("faqPage.title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("faqPage.subtitle")}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-display text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-secondary/50 rounded-xl text-center">
            <h3 className="font-display font-bold text-xl mb-2">{t("faqPage.contact.title")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("faqPage.contact.subtitle")}
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center h-10 px-6 font-display font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
            >
              {t("faqPage.contact.button")}
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
