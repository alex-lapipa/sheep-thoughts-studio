import { useState, useCallback, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, RefreshCw, Send, MessageCircleQuestion, Loader2, Share2, Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useShare } from "@/hooks/useShare";

const FAQ = () => {
  const { t } = useLanguage();
  const { share, isCopied } = useShare();
  const [randomWisdom, setRandomWisdom] = useState<{ question: string; answer: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Ask Bubbles state
  const [userQuestion, setUserQuestion] = useState("");
  const [bubblesAnswer, setBubblesAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const shareWisdom = useCallback(() => {
    if (!randomWisdom) return;
    share({
      title: "Bubbles Wisdom",
      text: `"${randomWisdom.question}" — ${randomWisdom.answer}`,
      url: window.location.href,
    });
  }, [randomWisdom, share]);

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
    { question: t("faq.q11"), answer: t("faq.a11") },
    { question: t("faq.q12"), answer: t("faq.a12") },
    { question: t("faq.q13"), answer: t("faq.a13") },
    { question: t("faq.q14"), answer: t("faq.a14") },
    { question: t("faq.q15"), answer: t("faq.a15") },
    { question: t("faq.q16"), answer: t("faq.a16") },
    { question: t("faq.q17"), answer: t("faq.a17") },
  ];

  // Daily wisdom - consistent based on date
  const dailyWisdom = useMemo(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    // Simple hash function to get a consistent index from date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % faqs.length;
    return faqs[index];
  }, [faqs]);

  const shareDailyWisdom = useCallback(() => {
    share({
      title: "Today's Bubbles Wisdom",
      text: `"${dailyWisdom.question}" — ${dailyWisdom.answer}`,
      url: window.location.href,
    });
  }, [dailyWisdom, share]);

  const getRandomWisdom = useCallback(() => {
    setIsSpinning(true);
    
    let randomIndex = Math.floor(Math.random() * faqs.length);
    if (randomWisdom) {
      while (faqs[randomIndex].question === randomWisdom.question && faqs.length > 1) {
        randomIndex = Math.floor(Math.random() * faqs.length);
      }
    }
    
    setTimeout(() => {
      setRandomWisdom(faqs[randomIndex]);
      setIsSpinning(false);
    }, 300);
  }, [faqs, randomWisdom]);

  const askBubbles = async () => {
    if (!userQuestion.trim() || isAsking) return;
    
    if (userQuestion.length > 500) {
      toast.error("Question must be less than 500 characters");
      return;
    }

    setIsAsking(true);
    setBubblesAnswer(null);

    try {
      const { data, error } = await supabase.functions.invoke("bubbles-answer", {
        body: { question: userQuestion.trim() },
      });

      if (error) {
        console.error("Error asking Bubbles:", error);
        toast.error(error.message || "Bubbles got distracted by a cloud");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setBubblesAnswer(data?.answer || "I stared at a fence post and forgot what you asked.");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Bubbles wandered off. Try again.");
    } finally {
      setIsAsking(false);
    }
  };

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

          {/* Daily Bubbles Wisdom */}
          <div className="mb-6 p-6 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl border border-primary/30">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold text-xl mb-1">Today's Wisdom</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="w-full p-5 bg-card rounded-xl border shadow-sm">
                <p className="font-display font-semibold text-lg mb-2 text-foreground">
                  "{dailyWisdom.question}"
                </p>
                <p className="text-muted-foreground italic mb-4">
                  {dailyWisdom.answer}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareDailyWisdom}
                  className="gap-2 font-display"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Today's Wisdom
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Random Bubbles Wisdom */}
          <div className="mb-10 p-6 bg-gradient-to-br from-accent/20 to-primary/10 rounded-2xl border border-accent/30">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-display font-bold text-xl mb-2">Random Bubbles Wisdom</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let fate decide which truth you need to hear today
              </p>
              
              <Button 
                onClick={getRandomWisdom}
                className="gap-2 font-display mb-4"
                variant="default"
              >
                <RefreshCw className={cn("w-4 h-4", isSpinning && "animate-spin")} />
                {randomWisdom ? "Another Wisdom" : "Reveal Wisdom"}
              </Button>

              {randomWisdom && (
                <div className={cn(
                  "w-full mt-2 p-5 bg-card rounded-xl border shadow-sm transition-all duration-300",
                  isSpinning ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-fade-in"
                )}>
                  <p className="font-display font-semibold text-lg mb-2 text-foreground">
                    "{randomWisdom.question}"
                  </p>
                  <p className="text-muted-foreground italic mb-4">
                    {randomWisdom.answer}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareWisdom}
                    className="gap-2 font-display"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share Wisdom
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Ask Bubbles Anything */}
          <div className="mb-10 p-6 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl border border-primary/30">
            <div className="flex flex-col items-center text-center">
              <MessageCircleQuestion className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold text-xl mb-2">Ask Bubbles Anything</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your burning question and receive wisdom of dubious accuracy
              </p>
              
              <div className="w-full space-y-3">
                <Textarea
                  placeholder="Why do birds fly south? What is the meaning of life? Why does toast land butter-side down?"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="resize-none min-h-[80px]"
                  maxLength={500}
                  disabled={isAsking}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {userQuestion.length}/500
                  </span>
                  <Button 
                    onClick={askBubbles}
                    disabled={!userQuestion.trim() || isAsking}
                    className="gap-2 font-display"
                  >
                    {isAsking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Bubbles is thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Ask Bubbles
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {bubblesAnswer && (
                <div className="w-full mt-4 p-5 bg-card rounded-xl border shadow-sm animate-fade-in">
                  <p className="font-display font-semibold text-sm mb-2 text-muted-foreground">
                    Your question: "{userQuestion}"
                  </p>
                  <div className="border-t pt-3 mt-3">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {bubblesAnswer}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    — Bubbles, Wicklow Institute of Confident Incorrectness
                  </p>
                </div>
              )}
            </div>
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
