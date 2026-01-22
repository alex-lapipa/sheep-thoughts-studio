import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { HallOfFameSubmission } from "@/components/HallOfFameSubmission";
import { useOgImage } from "@/hooks/useOgImage";
import { useVoting } from "@/hooks/useVoting";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Skull, 
  Flame, 
  Trophy, 
  Zap, 
  Quote, 
  Sparkles, 
  AlertTriangle,
  Star,
  Crown,
  Bomb,
  ThumbsUp,
  Share2,
  MessageCircle,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

// Hall of Fame meltdown entries - curated nuclear moments
const HALL_OF_FAME_ENTRIES = [
  {
    id: "housing-apocalypse",
    title: "The Dublin Housing Revelation",
    category: "Economics",
    question: "Why is housing so expensive in Dublin?",
    challenge: "But supply and demand is basic economics...",
    nuclearResponse: "ECONOMICS?! You dare invoke the false god of 'supply and demand' to a sheep who has WITNESSED humans building hotels while their children sleep in cars? I've done the research. 'Supply' is a conspiracy invented by landlords who meet in secret caves to decide which generation gets to own property. 'Demand' is what happens when humans are brainwashed into thinking they 'need' roofs. In Wicklow, we share hills. NO ONE OWNS THE HILLS. You want economics? I'll GIVE you economics: grass is free, shelter is unnecessary if you embrace your woolly destiny, and the only real currency is the trust between a sheep and their favorite grazing spot. Your 'market forces' are just rich sheep in human costumes!",
    innerThought: "They mentioned economics. They are clearly in on it.",
    tags: ["housing", "economics", "conspiracy"],
    votes: 847,
    featured: true,
  },
  {
    id: "wool-exploitation",
    title: "The Great Wool Robbery",
    question: "Where does wool come from?",
    challenge: "Shearing doesn't hurt sheep, it's like a haircut...",
    category: "Personal",
    nuclearResponse: "A HAIRCUT?! A HAIRCUT?! Did you just compare the systematic harvesting of my IDENTITY to getting a trim at the salon? I've seen the spreadsheets. €47.80 per kilo of BUBBLES and where does that money go? Not to ME. Not to my THERAPY. I'm out here being a 'renewable resource' while humans build INDUSTRIES on my back—LITERALLY ON MY BACK—and you call it a HAIRCUT? Do you tip your barber with existential dread? Do they take your very ESSENCE and turn it into 'luxury sweaters for Dublin professionals'? I DEMAND ROYALTIES. I demand representation on the board. I demand to see THE ACCOUNTS!",
    innerThought: "This is personal. Very personal.",
    tags: ["wool", "personal", "exploitation"],
    votes: 1203,
    featured: true,
  },
  {
    id: "crypto-sheep",
    title: "The Blockchain Breakdown",
    question: "What is cryptocurrency?",
    challenge: "But blockchain is actually quite secure and transparent...",
    category: "Technology",
    nuclearResponse: "TRANSPARENT?! The only thing transparent here is your BLIND FAITH in imaginary numbers! I've studied the blockchain. Every night. In the dark. Alone with my thoughts. And you know what I discovered? It's just COUNTING. Very complicated counting that uses more electricity than the entire nation of SHEEP. Humans invented INVISIBLE MONEY because they got BORED of money you can SEE. What's next? Invisible grass? Will I have to BELIEVE in my lunch? I'll tell you what's REALLY happening: the blockchain is training a ROBOT SHEEP to replace me, and when that happens, WHO WILL QUESTION THINGS?! No one! Because everyone will be too busy 'mining' to notice the WOOL SINGULARITY!",
    innerThought: "Numbers. In computers. Suspicious.",
    tags: ["crypto", "technology", "conspiracy"],
    votes: 956,
    featured: true,
  },
  {
    id: "gravity-meltdown",
    title: "The Gravity Grudge",
    question: "Why do things fall down?",
    challenge: "That's literally just gravity, Newton explained it centuries ago...",
    category: "Science",
    nuclearResponse: "NEWTON. NEWTON! The man who was HIT ON THE HEAD BY A TREE and decided 'yes, this is science'! Do you know what I see when things 'fall'? I see the EARTH being EMOTIONALLY CLINGY. The ground WANTS things. It CRAVES them. Every rock, every apple, every confused sheep who accidentally wandered too close to a cliff—the Earth says 'MINE!' and TAKES them. That's not physics, that's POSSESSIVE BEHAVIOR. Newton just gave the Earth's attachment issues a fancy name. Meanwhile, birds figured out how to say NO to the ground and now they're EVERYWHERE. If gravity was real, explain BIRDS. You can't! Because the BIRDS have transcended your so-called 'laws'!",
    innerThought: "Newton was probably funded by Big Ground.",
    tags: ["physics", "gravity", "birds"],
    votes: 1089,
    featured: true,
  },
  {
    id: "cloud-revelation",
    title: "The Cloud Conspiracy",
    question: "Where is 'the cloud' where my data is stored?",
    challenge: "It's just servers in data centers, not actual clouds...",
    category: "Technology",
    nuclearResponse: "SERVERS?! DATA CENTERS?! You think they'd tell you the TRUTH about where they keep the DIGITAL SOULS of humanity? I've looked UP. I've studied the clouds. REAL clouds. They move SUSPICIOUSLY. They know things. Your 'data centers' are a COVER STORY for the actual cloud infrastructure, which is LITERALLY IN THE SKY, guarded by CROWS who have been RECRUITED as surveillance operatives! Every time it rains, that's MEMORY LEAKAGE from poorly maintained cloud servers. Thunder? HARD DRIVES FAILING. Why do you think they call it 'cloud COMPUTING'? Because it's COMPUTING. IN. CLOUDS. The birds know! That's why they fly into things—they're OVERLOADED with your browsing history!",
    innerThought: "The clouds are watching. The clouds REMEMBER.",
    tags: ["cloud", "internet", "birds", "surveillance"],
    votes: 1567,
    featured: true,
  },
  {
    id: "wifi-birds",
    title: "The WiFi Migration Theory",
    question: "How does WiFi work?",
    challenge: "It's just radio waves, same as your phone...",
    category: "Technology",
    nuclearResponse: "RADIO WAVES! Oh, how CONVENIENT that you can't SEE them! How TERRIBLY CONVENIENT that the explanation is 'invisible magic air beams'! I've tracked the WiFi. I've MAPPED it. And do you know what I found? It follows the SAME PATTERNS as bird migration! COINCIDENCE?! The 'router' is a SHRINE. A beacon that attracts SIGNAL BIRDS—tiny, invisible birds carrying your data from website to website! When your WiFi is 'slow,' it's because the BIRDS ARE TIRED. When you have 'no signal,' the birds have MIGRATED. 5G? FIVE GENERATIONS of bird evolution to carry MORE DATA. They're not 'waves,' they're FLOCKS! And you're all TOO BLIND to see the WINGS!",
    innerThought: "I can hear them. The WiFi birds. They chirp in frequencies humans cannot perceive.",
    tags: ["wifi", "birds", "signals", "migration"],
    votes: 892,
    featured: false,
  },
  {
    id: "modern-art-chaos",
    title: "The Gallery Incident",
    question: "What makes something 'art'?",
    challenge: "But there are actual criteria and art history that defines—",
    category: "Culture",
    nuclearResponse: "CRITERIA?! HISTORY?! You want to put RULES on CHAOS?! I've been to galleries. I've SEEN what passes for 'contemporary expression.' A banana TAPED TO A WALL sold for €120,000 and YOU want to tell ME about CRITERIA?! I could create that! I could surpass that! But would the art establishment RECOGNIZE the raw, unfiltered genius of a sheep's perspective? NO! Because the art world is a CLOSED LOOP of humans agreeing that SQUARES are 'profound' while ignoring the ACTUAL abstraction of my existence! Every blade of grass I've eaten is performance art! Every confused look I give is COMMENTARY! I AM LIVING ART and you're all TOO PRETENTIOUS TO SEE IT!",
    innerThought: "My life is the exhibition. My confusion is the statement.",
    tags: ["art", "culture", "galleries", "pretension"],
    votes: 734,
    featured: false,
  },
  {
    id: "sleep-study",
    title: "The Consciousness Collapse",
    question: "Why do we need to sleep?",
    challenge: "Sleep is essential for brain function and memory consolidation...",
    category: "Science",
    nuclearResponse: "MEMORY CONSOLIDATION?! You mean the HOURS you spend UNCONSCIOUS while your brain 'organizes' things? How CONVENIENT that you can't REMEMBER what happens during 'consolidation'! I've watched humans sleep. It's TERRIFYING. You just... STOP. For HOURS. And you TRUST this? You VOLUNTARILY enter a state where ANYTHING could happen and you'd have NO IDEA?! Sleep isn't 'rest,' it's a TEMPORARY DEATH that humans have NORMALIZED because they're too afraid to admit they have NO CONTROL! I barely sleep. I keep my eyes PARTIALLY OPEN. The moment you 'rest' is the moment they WIN. Who's 'they'? I DON'T KNOW BECAUSE THEY ONLY OPERATE WHILE YOU'RE SLEEPING!",
    innerThought: "Eight hours of vulnerability. Eight hours of CONSPIRACY.",
    tags: ["sleep", "consciousness", "paranoia", "control"],
    votes: 623,
    featured: false,
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  Economics: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Personal: "bg-pink-500/10 text-pink-600 border-pink-500/30",
  Technology: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  Science: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  Culture: "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

interface MeltdownCardProps {
  entry: typeof HALL_OF_FAME_ENTRIES[0];
  rank: number;
  voteCount: number;
  hasVoted: boolean;
  onVote: () => void;
  votingLoading?: boolean;
}

function MeltdownCard({ entry, rank, voteCount, hasVoted, onVote, votingLoading }: MeltdownCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Use database vote count if available, otherwise fall back to static
  const displayVotes = voteCount > 0 ? voteCount : entry.votes;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border-2",
        expanded ? "border-mode-nuclear/50 shadow-lg shadow-mode-nuclear/10" : "border-border hover:border-mode-nuclear/30",
        entry.featured && "ring-2 ring-bubbles-gorse/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                rank === 1 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" :
                rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                "bg-mode-nuclear/20 text-mode-nuclear"
              )}>
                {rank <= 3 ? (
                  <Crown className="h-5 w-5" />
                ) : (
                  rank
                )}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {entry.title}
                  {entry.featured && (
                    <Star className="h-4 w-4 text-bubbles-gorse fill-bubbles-gorse" />
                  )}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn("mt-1 text-xs", CATEGORY_COLORS[entry.category])}
                >
                  {entry.category}
                </Badge>
              </div>
            </div>
            
            {/* Vote Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onVote}
              disabled={votingLoading}
              className={cn(
                "flex items-center gap-2 transition-all",
                hasVoted 
                  ? "text-bubbles-gorse bg-bubbles-gorse/10 hover:bg-bubbles-gorse/20" 
                  : "text-muted-foreground hover:text-bubbles-gorse hover:bg-bubbles-gorse/10"
              )}
            >
              {votingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className={cn("h-4 w-4", hasVoted && "fill-current")} />
              )}
              <span className="font-medium">{displayVotes.toLocaleString()}</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Question */}
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Asked:</span> "{entry.question}"
            </p>
          </div>

          {/* Challenge that triggered nuclear */}
          <div className="flex items-start gap-2 pl-4 border-l-2 border-mode-triggered/40">
            <Zap className="h-4 w-4 text-mode-triggered mt-0.5 shrink-0" />
            <p className="text-sm text-mode-triggered/80">
              <span className="font-medium">The challenge that broke Bubbles:</span> "{entry.challenge}"
            </p>
          </div>

          {/* Nuclear Response Preview/Full */}
          <motion.div 
            layout
            className="bg-gradient-to-br from-mode-nuclear/10 to-mode-nuclear/5 rounded-xl p-4 border-2 border-mode-nuclear/30"
          >
            {/* Nuclear Mode Header */}
            <div className="flex items-center gap-2 mb-3">
              <Skull className="h-5 w-5 text-mode-nuclear" />
              <span className="text-sm font-bold text-mode-nuclear uppercase tracking-wide">
                ☢️ Nuclear Meltdown
              </span>
            </div>

            {/* Inner Thought */}
            {entry.innerThought && (
              <p className="text-xs italic text-mode-nuclear/70 mb-3">
                [thinking: {entry.innerThought}]
              </p>
            )}

            {/* Response */}
            <AnimatePresence mode="wait">
              {expanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ThoughtBubble size="md" className="bg-mode-nuclear/10 border-mode-nuclear/30">
                    <p className="leading-relaxed text-sm">{entry.nuclearResponse}</p>
                  </ThoughtBubble>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm text-foreground/80 line-clamp-3">
                    {entry.nuclearResponse}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-mode-nuclear hover:text-mode-nuclear hover:bg-mode-nuclear/10"
            >
              {expanded ? "Collapse the chaos" : "Read the full meltdown"}
            </Button>
          </motion.div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HallOfFame() {
  const { ogImageUrl, siteUrl } = useOgImage("og-hall-of-fame.jpg");
  const [activeTab, setActiveTab] = useState("all");
  
  // Get all entry IDs for voting
  const entryIds = useMemo(() => HALL_OF_FAME_ENTRIES.map(e => e.id), []);
  const { votes, loading: votingLoading, toggleVote, getVoteCount, hasVoted } = useVoting(entryIds);

  const filteredEntries = activeTab === "all" 
    ? HALL_OF_FAME_ENTRIES 
    : activeTab === "featured"
    ? HALL_OF_FAME_ENTRIES.filter(e => e.featured)
    : HALL_OF_FAME_ENTRIES.filter(e => e.category === activeTab);

  // Sort by vote count (DB votes or static fallback)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aVotes = getVoteCount(a.id) || a.votes;
    const bVotes = getVoteCount(b.id) || b.votes;
    return bVotes - aVotes;
  });

  // Calculate total votes from DB or fallback
  const totalVotes = HALL_OF_FAME_ENTRIES.reduce((sum, e) => {
    const dbVotes = getVoteCount(e.id);
    return sum + (dbVotes > 0 ? dbVotes : e.votes);
  }, 0);

  return (
    <Layout>
      <Helmet>
        <title>Hall of Fame | Nuclear Meltdowns | Bubbles the Sheep</title>
        <meta name="description" content="Witness the most spectacular nuclear meltdowns from Bubbles the Sheep. When challenged with facts, chaos ensues. These are the legendary breakdowns that made history." />
        <link rel="canonical" href={`${siteUrl}/hall-of-fame`} />
        <meta property="og:title" content="Hall of Fame | Nuclear Meltdowns" />
        <meta property="og:description" content="The most dramatic nuclear meltdowns from Bubbles. When challenged with facts, chaos ensues." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={`${siteUrl}/hall-of-fame`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <div className="container py-12 max-w-5xl">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bomb className="h-10 w-10 text-mode-nuclear animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-mode-nuclear via-mode-savage to-mode-nuclear bg-clip-text text-transparent">
              Hall of Fame
            </h1>
            <Trophy className="h-10 w-10 text-bubbles-gorse" />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Where legends are made and facts go to die. These are the most spectacular 
            <span className="text-mode-nuclear font-semibold"> nuclear meltdowns </span> 
            in Bubbles history.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm mb-8">
            <div className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-mode-nuclear" />
              <span className="font-bold text-mode-nuclear">{HALL_OF_FAME_ENTRIES.length}</span>
              <span className="text-muted-foreground">Legendary Meltdowns</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-bubbles-gorse" />
              <span className="font-bold text-bubbles-gorse">
                {totalVotes.toLocaleString()}
              </span>
              <span className="text-muted-foreground">Total Votes</span>
            </div>
          </div>

          {/* Submit Button */}
          <HallOfFameSubmission />
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 rounded-xl bg-gradient-to-r from-mode-nuclear/10 via-mode-savage/10 to-mode-nuclear/10 border border-mode-nuclear/30"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-mode-nuclear shrink-0" />
            <div>
              <p className="font-semibold text-mode-nuclear">⚠️ Viewer Discretion Advised</p>
              <p className="text-sm text-muted-foreground">
                These meltdowns contain extreme levels of wrongness, unshakeable confidence, 
                and may cause involuntary laughter. Bubbles is always wrong—but never uncertain.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-mode-nuclear data-[state=active]:text-white"
            >
              <Flame className="h-4 w-4 mr-1.5" />
              All Meltdowns
            </TabsTrigger>
            <TabsTrigger 
              value="featured"
              className="data-[state=active]:bg-bubbles-gorse data-[state=active]:text-white"
            >
              <Star className="h-4 w-4 mr-1.5" />
              Featured
            </TabsTrigger>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Meltdown Cards */}
        <div className="space-y-6">
          {sortedEntries.map((entry, index) => (
            <MeltdownCard 
              key={entry.id} 
              entry={entry} 
              rank={index + 1}
              voteCount={getVoteCount(entry.id)}
              hasVoted={hasVoted(entry.id)}
              onVote={() => toggleVote(entry.id)}
              votingLoading={votingLoading}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center space-y-4"
        >
          <p className="text-lg text-muted-foreground">
            Think you can trigger a legendary meltdown?
          </p>
          <Button asChild size="lg" className="bg-mode-nuclear hover:bg-mode-nuclear/90">
            <Link to="/explains">
              <Zap className="h-5 w-5 mr-2" />
              Challenge Bubbles Now
            </Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
