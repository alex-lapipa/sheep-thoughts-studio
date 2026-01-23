import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedOnView } from "@/components/AnimatedText";
import { useOgImage } from "@/hooks/useOgImage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MessageCircle, Sparkles, ChevronDown, ChevronUp,
  Tag, Filter, ArrowRight, HelpCircle, Lightbulb, X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Category definitions for filtering
const CATEGORIES = [
  { id: "all", label: "All", icon: HelpCircle, color: "bg-secondary text-foreground" },
  { id: "general", label: "General", icon: Lightbulb, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { id: "philosophy", label: "Philosophy", icon: Sparkles, color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  { id: "practical", label: "Practical", icon: Tag, color: "bg-green-500/15 text-green-600 dark:text-green-400" },
];

interface ApprovedQuestion {
  id: string;
  question: string;
  answer: string;
  submitted_at: string;
  metadata: { category?: string } | null;
}

export default function FAQSummary() {
  const { ogImageUrl, siteUrl } = useOgImage("og-faq.jpg");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Fetch approved questions from the database
  const { data: questions, isLoading } = useQuery({
    queryKey: ["approved-faqs"],
    queryFn: async (): Promise<ApprovedQuestion[]> => {
      const { data, error } = await supabase
        .from("submitted_questions")
        .select("id, question, answer, submitted_at, metadata")
        .eq("status", "approved")
        .eq("is_spam", false)
        .not("answer", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as ApprovedQuestion[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and search questions
  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    
    return questions.filter(q => {
      // Category filter
      if (selectedCategory !== "all") {
        const category = q.metadata?.category || "general";
        if (category !== selectedCategory) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          (q.answer && q.answer.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [questions, selectedCategory, searchQuery]);

  // Display limit
  const displayedQuestions = showAllQuestions 
    ? filteredQuestions 
    : filteredQuestions.slice(0, 10);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <Layout>
      <Helmet>
        <title>FAQ | Bubbles the Sheep</title>
        <meta name="description" content="Find answers to common questions about Bubbles and get confidently incorrect wisdom on any topic." />
        <meta property="og:title" content="FAQ | Bubbles the Sheep" />
        <meta property="og:description" content="Frequently asked questions answered with confident incorrectness." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/faq-summary`} />
        <meta property="og:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/faq-summary`} />
      </Helmet>

      <section className="-mx-4 mb-8">
        <PageHeroWithBubbles
          title="Frequently Asked Questions"
          subtitle="Community wisdom, confidently answered"
          bubbleSize="sm"
        />
      </section>

      <div className="container max-w-4xl py-8">
        {/* Ask Bubbles CTA - Prominent */}
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
                    Ask Bubbles directly and get a personally crafted, confidently incorrect response.
                  </p>
                  <Link to="/talk-to-bubbles">
                    <Button size="lg" className="font-display gap-2">
                      <Sparkles className="h-4 w-4" />
                      Ask Bubbles in Chat
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedOnView>

        {/* Search and Filter */}
        <AnimatedOnView delay={0.1}>
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter:</span>
              </div>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : cn(cat.color, "hover:opacity-80")
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} found
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-accent hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </AnimatedOnView>

        {/* Questions List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : displayedQuestions.length === 0 ? (
            // Empty state
            <AnimatedOnView>
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms or clearing filters."
                    : "Be the first to ask Bubbles a question!"}
                </p>
                <Link to="/talk-to-bubbles">
                  <Button variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Ask a Question
                  </Button>
                </Link>
              </Card>
            </AnimatedOnView>
          ) : (
            // Questions
            <AnimatePresence mode="popLayout">
              {displayedQuestions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      expandedId === q.id && "ring-2 ring-accent/50"
                    )}
                    onClick={() => toggleExpand(q.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <HelpCircle className="h-4 w-4 text-accent" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-foreground pr-4">
                              {q.question}
                            </h3>
                            <motion.div
                              animate={{ rotate: expandedId === q.id ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </motion.div>
                          </div>
                          
                          <AnimatePresence>
                            {expandedId === q.id && q.answer && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 mt-3 border-t border-border">
                                  <div className="flex items-start gap-2">
                                    <Badge variant="secondary" className="shrink-0 text-xs bg-bubbles-gorse/20 text-bubbles-gorse">
                                      Bubbles says:
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {q.answer}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Show more button */}
          {filteredQuestions.length > 10 && !showAllQuestions && (
            <AnimatedOnView>
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllQuestions(true)}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Show {filteredQuestions.length - 10} more questions
                </Button>
              </div>
            </AnimatedOnView>
          )}

          {showAllQuestions && filteredQuestions.length > 10 && (
            <AnimatedOnView>
              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAllQuestions(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="gap-2"
                >
                  <ChevronUp className="h-4 w-4" />
                  Show less
                </Button>
              </div>
            </AnimatedOnView>
          )}
        </div>

        {/* Bottom CTA */}
        <AnimatedOnView delay={0.2}>
          <Card className="mt-12 p-6 text-center bg-gradient-to-r from-secondary/50 to-muted/50">
            <h3 className="font-display text-lg font-semibold mb-2">
              Still curious?
            </h3>
            <p className="text-muted-foreground mb-4">
              Bubbles is always ready to share more confidently incorrect wisdom.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/talk-to-bubbles">
                <Button className="gap-2 w-full sm:w-auto">
                  <MessageCircle className="h-4 w-4" />
                  Chat with Bubbles
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  Daily Wisdom & More
                </Button>
              </Link>
            </div>
          </Card>
        </AnimatedOnView>
      </div>
    </Layout>
  );
}
