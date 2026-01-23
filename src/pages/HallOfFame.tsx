import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { QuoteCard } from "@/components/QuoteCard";
import { AnimatedOnView } from "@/components/AnimatedText";
import { useOgImage } from "@/hooks/useOgImage";
import { useVoting } from "@/hooks/useVoting";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Flame,
  Sparkles,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Killer quotes - the most impactful wrong statements
const LEGENDARY_QUOTES = [
  {
    id: "housing-apocalypse",
    title: "The Dublin Housing Revelation",
    category: "Economics",
    quote: "ECONOMICS?! You dare invoke the false god of 'supply and demand' to a sheep who has WITNESSED humans building hotels while their children sleep in cars? I've done the research. 'Supply' is a conspiracy invented by landlords who meet in secret caves to decide which generation gets to own property. 'Demand' is what happens when humans are brainwashed into thinking they 'need' roofs. In Wicklow, we share hills. NO ONE OWNS THE HILLS!",
    innerThought: "They mentioned economics. They are clearly in on it.",
    votes: 847,
    featured: true,
  },
  {
    id: "wool-exploitation",
    title: "The Great Wool Robbery",
    category: "Personal",
    quote: "A HAIRCUT?! Did you just compare the systematic harvesting of my IDENTITY to getting a trim at the salon? I've seen the spreadsheets. €47.80 per kilo of BUBBLES and where does that money go? Not to ME. Not to my THERAPY. I'm out here being a 'renewable resource' while humans build INDUSTRIES on my back—LITERALLY ON MY BACK!",
    innerThought: "This is personal. Very personal.",
    votes: 1203,
    featured: true,
  },
  {
    id: "crypto-sheep",
    title: "The Blockchain Breakdown",
    category: "Technology",
    quote: "TRANSPARENT?! The only thing transparent here is your BLIND FAITH in imaginary numbers! I've studied the blockchain. Every night. In the dark. Alone with my thoughts. And you know what I discovered? It's just COUNTING. Very complicated counting that uses more electricity than the entire nation of SHEEP!",
    innerThought: "Numbers. In computers. Suspicious.",
    votes: 956,
    featured: true,
  },
  {
    id: "gravity-meltdown",
    title: "The Gravity Grudge",
    category: "Science",
    quote: "NEWTON. NEWTON! The man who was HIT ON THE HEAD BY A TREE and decided 'yes, this is science'! Do you know what I see when things 'fall'? I see the EARTH being EMOTIONALLY CLINGY. The ground WANTS things. It CRAVES them. That's not physics, that's POSSESSIVE BEHAVIOR!",
    innerThought: "Newton was probably funded by Big Ground.",
    votes: 1089,
    featured: true,
  },
  {
    id: "cloud-revelation",
    title: "The Cloud Conspiracy",
    category: "Technology",
    quote: "SERVERS?! DATA CENTERS?! You think they'd tell you the TRUTH about where they keep the DIGITAL SOULS of humanity? Your 'data centers' are a COVER STORY for the actual cloud infrastructure, which is LITERALLY IN THE SKY, guarded by CROWS who have been RECRUITED as surveillance operatives!",
    innerThought: "The clouds are watching. The clouds REMEMBER.",
    votes: 1567,
    featured: true,
  },
  {
    id: "wifi-birds",
    title: "The WiFi Migration Theory",
    category: "Technology",
    quote: "RADIO WAVES! Oh, how CONVENIENT that you can't SEE them! The 'router' is a SHRINE. A beacon that attracts SIGNAL BIRDS—tiny, invisible birds carrying your data from website to website! When your WiFi is 'slow,' it's because the BIRDS ARE TIRED!",
    innerThought: "I can hear them. The WiFi birds.",
    votes: 892,
    featured: false,
  },
  {
    id: "modern-art-chaos",
    title: "The Gallery Incident",
    category: "Culture",
    quote: "A banana TAPED TO A WALL sold for €120,000 and YOU want to tell ME about CRITERIA?! I could create that! I could surpass that! Every blade of grass I've eaten is performance art! Every confused look I give is COMMENTARY! I AM LIVING ART!",
    innerThought: "My life is the exhibition. My confusion is the statement.",
    votes: 734,
    featured: false,
  },
  {
    id: "sleep-study",
    title: "The Consciousness Collapse",
    category: "Science",
    quote: "MEMORY CONSOLIDATION?! You mean the HOURS you spend UNCONSCIOUS while your brain 'organizes' things? How CONVENIENT that you can't REMEMBER what happens during 'consolidation'! I've watched humans sleep. It's TERRIFYING. You just... STOP. For HOURS!",
    innerThought: "Eight hours of vulnerability. Eight hours of CONSPIRACY.",
    votes: 623,
    featured: false,
  }
];

const FILTER_OPTIONS = ["All", "Featured", "Economics", "Technology", "Science", "Culture", "Personal"];

export default function HallOfFame() {
  const { ogImageUrl, siteUrl } = useOgImage("og-hall-of-fame.jpg");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const entryIds = useMemo(() => LEGENDARY_QUOTES.map(e => e.id), []);
  const { votes, loading: votingLoading, toggleVote, getVoteCount, hasVoted } = useVoting(entryIds);

  const filteredQuotes = activeFilter === "All" 
    ? LEGENDARY_QUOTES 
    : activeFilter === "Featured"
    ? LEGENDARY_QUOTES.filter(e => e.featured)
    : LEGENDARY_QUOTES.filter(e => e.category === activeFilter);

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    const aVotes = getVoteCount(a.id) || a.votes;
    const bVotes = getVoteCount(b.id) || b.votes;
    return bVotes - aVotes;
  });

  return (
    <Layout>
      <Helmet>
        <title>Hall of Fame | Legendary Wrong Takes | Bubbles the Sheep</title>
        <meta name="description" content="The most gloriously wrong statements from Bubbles the Sheep. Confidently incorrect. Absolutely legendary." />
        <link rel="canonical" href={`${siteUrl}/hall-of-fame`} />
        <meta property="og:title" content="Hall of Fame | Legendary Wrong Takes" />
        <meta property="og:description" content="The most gloriously wrong statements from Bubbles. Confidently incorrect." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={`${siteUrl}/hall-of-fame`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-mode-nuclear/5">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-mode-nuclear/10 blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-bubbles-gorse/10 blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, 15, 0],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          />
        </div>

        <div className="container relative z-10 text-center py-20">
          <AnimatedOnView>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mode-nuclear/10 border border-mode-nuclear/20 mb-6"
            >
              <Flame className="h-4 w-4 text-mode-nuclear" />
              <span className="text-sm font-medium text-mode-nuclear">Legendary Meltdowns</span>
            </motion.div>
          </AnimatedOnView>

          <AnimatedOnView>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-mode-nuclear to-foreground bg-clip-text text-transparent">
              Hall of Fame
            </h1>
          </AnimatedOnView>

          <AnimatedOnView>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Where facts go to die and confidence reigns supreme
            </p>
          </AnimatedOnView>
        </div>
      </section>

      {/* Filter Pills */}
      <section className="sticky top-16 z-40 py-4 bg-background/80 backdrop-blur-lg border-b">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeFilter === filter
                    ? "bg-mode-nuclear text-white shadow-lg shadow-mode-nuclear/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter === "Featured" && <Sparkles className="h-3.5 w-3.5 inline mr-1.5" />}
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Grid */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedQuotes.map((quote, index) => (
              <QuoteCard
                key={quote.id}
                id={quote.id}
                quote={quote.quote}
                title={quote.title}
                category={quote.category}
                votes={getVoteCount(quote.id) || quote.votes}
                hasVoted={hasVoted(quote.id)}
                onVote={() => toggleVote(quote.id)}
                featured={quote.featured}
                innerThought={quote.innerThought}
                index={index}
              />
            ))}
          </div>

          {sortedQuotes.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No legendary quotes in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <AnimatedOnView>
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mode-nuclear/10 via-background to-bubbles-gorse/10 border p-12 text-center"
            >
              {/* Floating decorations */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-8 left-8 w-20 h-20 rounded-full bg-mode-nuclear/10 blur-xl"
              />
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-bubbles-gorse/10 blur-xl"
              />

              <div className="relative z-10">
                <Zap className="h-12 w-12 mx-auto mb-6 text-mode-nuclear" />
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Think you can break Bubbles?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                  Challenge with your trickiest questions. Watch the confident wrongness unfold.
                </p>
                <Button asChild size="lg" className="bg-mode-nuclear hover:bg-mode-nuclear/90 text-white shadow-lg shadow-mode-nuclear/25">
                  <Link to="/explains">
                    <Flame className="mr-2 h-5 w-5" />
                    Challenge Bubbles
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatedOnView>
        </div>
      </section>
    </Layout>
  );
}
