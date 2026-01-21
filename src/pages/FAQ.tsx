import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is Bubbles?",
    answer: "Bubbles is a cute, seemingly innocent sheep with a rich inner world expressed through thought bubbles. On the surface, Bubbles is just a fluffy friend. In the thought bubbles... well, that's where things get interesting."
  },
  {
    question: "What are the different 'modes'?",
    answer: "Bubbles has four modes: Innocent (pure, fluffy thoughts), Concerned (something's off...), Triggered (someone said the wrong thing), and Savage (no filter, no mercy). Each product is tagged with its mood."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days within Europe. International orders typically arrive within 7-14 business days. Express shipping options are available at checkout."
  },
  {
    question: "What's your return policy?",
    answer: "We offer a 30-day return policy. Items must be unworn, unwashed, and in their original packaging. Contact us to initiate a return and we'll send you a prepaid shipping label."
  },
  {
    question: "What sizes do you offer?",
    answer: "Our apparel comes in sizes XS through 3XL. Check the size guide on each product page for detailed measurements. If you're between sizes, we recommend sizing up for a more relaxed fit."
  },
  {
    question: "Are your products sustainable?",
    answer: "We use organic cotton for our t-shirts and hoodies, and all our packaging is recyclable. We're constantly working to make our supply chain more sustainable."
  },
  {
    question: "Can I wash my Bubbles merch?",
    answer: "Yes! Machine wash cold with like colors, tumble dry low, and avoid bleach. For best results and to preserve the print quality, turn the garment inside out before washing."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide! Shipping costs and delivery times vary by location. You'll see the exact shipping cost at checkout."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive an email with a tracking number and link. You can also check your order status by logging into your account."
  },
  {
    question: "Can I suggest new Bubbles thoughts?",
    answer: "We love hearing from the flock! Send your thought bubble ideas to our contact page. If we use your suggestion, you might see it on future merch (and we'll send you something special)."
  }
];

const FAQ = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about Bubbles and our merch
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
            <h3 className="font-display font-bold text-xl mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Bubbles' thought bubbles can't answer everything. Contact our human team.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center h-10 px-6 font-display font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
