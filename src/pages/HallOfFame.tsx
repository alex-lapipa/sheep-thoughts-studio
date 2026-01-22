import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { HallOfFameSubmission } from "@/components/HallOfFameSubmission";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { useOgImage } from "@/hooks/useOgImage";
import { useVoting } from "@/hooks/useVoting";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Crown,
  ThumbsUp,
  MessageCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  Quote,
  AlertCircle
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

const CATEGORY_STYLES: Record<string, string> = {
  Economics: "bg-accent/10 text-accent border-accent/30",
  Personal: "bg-mode-savage/10 text-mode-savage border-mode-savage/30",
  Technology: "bg-primary/10 text-primary border-primary/30",
  Science: "bg-mode-triggered/10 text-mode-triggered border-mode-triggered/30",
  Culture: "bg-bubbles-gorse/10 text-bubbles-gorse border-bubbles-gorse/30",
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
  
  const displayVotes = voteCount > 0 ? voteCount : entry.votes;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border-2 hover:shadow-lg",
        expanded ? "border-mode-nuclear/40 shadow-xl" : "border-border hover:border-mode-nuclear/20",
        entry.featured && "ring-1 ring-bubbles-gorse/20"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div className={cn(
                "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-sm",
                rank === 1 ? "bg-gradient-to-br from-bubbles-gorse to-bubbles-gorse/80 text-peat-earth" :
                rank === 2 ? "bg-gradient-to-br from-muted to-muted-foreground/20 text-foreground" :
                rank === 3 ? "bg-gradient-to-br from-mode-triggered/80 to-mode-triggered/60 text-white" :
                "bg-muted text-muted-foreground"
              )}>
                {rank <= 3 ? (
                  <Crown className="h-5 w-5" />
                ) : (
                  <span className="text-base">{rank}</span>
                )}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  {entry.title}
                  {entry.featured && (
                    <Badge variant="secondary" className="text-xs bg-bubbles-gorse/10 text-bubbles-gorse border-bubbles-gorse/30">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn("mt-1.5 text-xs", CATEGORY_STYLES[entry.category])}
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
                "flex items-center gap-2 transition-all rounded-full px-4",
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
              <span className="font-semibold">{displayVotes.toLocaleString()}</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Question */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">The Question</p>
              <p className="text-sm font-medium">"{entry.question}"</p>
            </div>
          </div>

          {/* Challenge that triggered nuclear */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-mode-triggered/5 border-l-4 border-mode-triggered/40">
            <Quote className="h-4 w-4 text-mode-triggered mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-mode-triggered/70 uppercase tracking-wide mb-1">The Challenge That Broke Bubbles</p>
              <p className="text-sm text-foreground/80 italic">"{entry.challenge}"</p>
            </div>
          </div>

          {/* Nuclear Response */}
          <motion.div 
            layout
            className="bg-gradient-to-br from-mode-nuclear/8 to-mode-nuclear/3 rounded-xl p-5 border border-mode-nuclear/20"
          >
            {/* Nuclear Mode Header */}
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-mode-nuclear" />
              <span className="text-sm font-bold text-mode-nuclear uppercase tracking-wider">
                The Meltdown
              </span>
            </div>

            {/* Inner Thought */}
            {entry.innerThought && (
              <p className="text-xs italic text-mode-nuclear/60 mb-3 pl-3 border-l-2 border-mode-nuclear/30">
                [internal monologue: {entry.innerThought}]
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
                  <ThoughtBubble size="md" className="bg-mode-nuclear/5 border-mode-nuclear/20">
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
                  <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                    {entry.nuclearResponse}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-4 text-mode-nuclear hover:text-mode-nuclear hover:bg-mode-nuclear/10 gap-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Read full meltdown
                </>
              )}
            </Button>
          </motion.div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-secondary/50">
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
  
  const entryIds = useMemo(() => HALL_OF_FAME_ENTRIES.map(e => e.id), []);
  const { votes, loading: votingLoading, toggleVote, getVoteCount, hasVoted } = useVoting(entryIds);

  const filteredEntries = activeTab === "all" 
    ? HALL_OF_FAME_ENTRIES 
    : activeTab === "featured"
    ? HALL_OF_FAME_ENTRIES.filter(e => e.featured)
    : HALL_OF_FAME_ENTRIES.filter(e => e.category === activeTab);

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aVotes = getVoteCount(a.id) || a.votes;
    const bVotes = getVoteCount(b.id) || b.votes;
    return bVotes - aVotes;
  });

  const totalVotes = HALL_OF_FAME_ENTRIES.reduce((sum, e) => {
    const dbVotes = getVoteCount(e.id);
    return sum + (dbVotes > 0 ? dbVotes : e.votes);
  }, 0);

  const categories = Object.keys(CATEGORY_STYLES);

  return (
    <Layout>
      <Helmet>
        <title>Hall of Fame | Legendary Meltdowns | Bubbles the Sheep</title>
        <meta name="description" content="Witness the most spectacular meltdowns from Bubbles the Sheep. When challenged with facts, chaos ensues. These are the legendary breakdowns that made history." />
        <link rel="canonical" href={`${siteUrl}/hall-of-fame`} />
        <meta property="og:title" content="Hall of Fame | Legendary Meltdowns" />
        <meta property="og:description" content="The most dramatic meltdowns from Bubbles. When challenged with facts, chaos ensues." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={`${siteUrl}/hall-of-fame`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      {/* Large Hero Banner */}
      <PageHeroWithBubbles
        title="Hall of Fame"
        subtitle="Where legends are made and facts go to die. These are the most spectacular meltdowns in Bubbles history."
        posture="random"
        accessory="random"
      />

      <div className="container py-12 max-w-5xl">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-xl bg-card border"
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-mode-nuclear/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-mode-nuclear" />
              </div>
              <div>
                <p className="text-2xl font-bold text-mode-nuclear">{HALL_OF_FAME_ENTRIES.length}</p>
                <p className="text-xs text-muted-foreground">Legendary Meltdowns</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-bubbles-gorse/10 flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-bubbles-gorse" />
              </div>
              <div>
                <p className="text-2xl font-bold text-bubbles-gorse">{totalVotes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </div>
          
          <HallOfFameSubmission />
        </motion.div>

        {/* Discretion Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl bg-muted/30 border flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-mode-nuclear shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Viewer Discretion Advised</p>
            <p className="text-sm text-muted-foreground">
              These meltdowns contain extreme levels of wrongness and unshakeable confidence. 
              Bubbles is always wrong—but never uncertain.
            </p>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full"
            >
              All Meltdowns
            </TabsTrigger>
            <TabsTrigger 
              value="featured"
              className="data-[state=active]:bg-bubbles-gorse data-[state=active]:text-peat-earth rounded-full"
            >
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Featured
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="rounded-full"
              >
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
          transition={{ delay: 0.4 }}
          className="mt-16 text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-mode-nuclear/5 to-mode-savage/5 border"
        >
          <h2 className="text-2xl font-display font-bold mb-3">
            Think you can trigger a legendary meltdown?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Challenge Bubbles with your trickiest questions and watch the confident wrongness unfold.
          </p>
          <Button asChild size="lg" className="bg-mode-nuclear hover:bg-mode-nuclear/90 text-white">
            <Link to="/explains">
              Challenge Bubbles Now
            </Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
