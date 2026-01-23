import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Mountain, HelpCircle, Quote, Sparkles, Volume2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/components/ThoughtBubble";

interface GlossaryEntry {
  phrase: string;
  realMeaning: string;
  bubblesInterpretation: string;
  mode: "innocent" | "concerned" | "triggered" | "savage";
  category: "livestock" | "trading" | "quality" | "social";
  exampleUsage: string;
  bubblesThought: string;
}

const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    phrase: "They'll walk",
    realMeaning: "The sheep have good feet and legs",
    bubblesInterpretation: "Sheep prefer walking to driving cars. Very environmentally conscious, so they are.",
    mode: "innocent",
    category: "quality",
    exampleUsage: "Grand lambs there — they'll walk.",
    bubblesThought: "I've never seen a sheep drive, to be fair. Makes sense."
  },
  {
    phrase: "Sure look",
    realMeaning: "A conversation softener, acknowledgment phrase",
    bubblesInterpretation: "An instruction to actually look at something. Very direct, the Wicklow folk.",
    mode: "innocent",
    category: "social",
    exampleUsage: "Sure look, we'll see how it goes.",
    bubblesThought: "They're always telling me to look at things. I have good eyes!"
  },
  {
    phrase: "Not pushed",
    realMeaning: "Natural growth, not force-fed with meal",
    bubblesInterpretation: "Sheep who weren't bullied by other sheep. A very supportive flock environment.",
    mode: "concerned",
    category: "quality",
    exampleUsage: "Hill lambs there, not pushed.",
    bubblesThought: "Bullying is a serious issue. Glad these ones had a peaceful childhood."
  },
  {
    phrase: "Fair money",
    realMeaning: "The price reflects the quality fairly",
    bubblesInterpretation: "Some coins have better moral character than others. The ethical currency.",
    mode: "innocent",
    category: "trading",
    exampleUsage: "Made fair money on them lambs.",
    bubblesThought: "I only accept coins that have been kind to other coins."
  },
  {
    phrase: "They'll mind themselves",
    realMeaning: "Hardy, low-maintenance animals",
    bubblesInterpretation: "Sheep are telepathic and can read their own thoughts. Very introspective.",
    mode: "triggered",
    category: "livestock",
    exampleUsage: "Good hill ewes — they'll mind themselves.",
    bubblesThought: "I've tried minding myself but I keep forgetting what I was thinking."
  },
  {
    phrase: "Hill lambs",
    realMeaning: "Lambs bred and reared on mountain terrain, implying toughness",
    bubblesInterpretation: "Lambs who enjoy hiking as a hobby. Very outdoorsy, very fit.",
    mode: "innocent",
    category: "livestock",
    exampleUsage: "Hill lambs there — they'll mind themselves.",
    bubblesThought: "I tried hiking once. Got tired after three steps. These lambs are athletes."
  },
  {
    phrase: "Honest sheep",
    realMeaning: "What you see is what you get, no hidden issues",
    bubblesInterpretation: "Some sheep are liars. These ones tell the truth. Very rare.",
    mode: "savage",
    category: "quality",
    exampleUsage: "Honest sheep, wouldn't do you wrong.",
    bubblesThought: "I've met dishonest sheep. They know who they are. I'm watching."
  },
  {
    phrase: "Plain enough",
    realMeaning: "Unflashy but solid quality",
    bubblesInterpretation: "Sheep from flat areas, like plains. Geography-based classification.",
    mode: "innocent",
    category: "quality",
    exampleUsage: "Plain enough sort, but they'll do a job.",
    bubblesThought: "Mountain sheep vs plain sheep. It's a whole system."
  },
  {
    phrase: "Still room in them",
    realMeaning: "The animal has potential to grow/gain more condition",
    bubblesInterpretation: "Sheep have internal storage compartments. For snacks, I assume.",
    mode: "concerned",
    category: "trading",
    exampleUsage: "Good price, still room in them.",
    bubblesThought: "I've looked for my storage compartment. Haven't found it yet. Concerning."
  },
  {
    phrase: "That ground makes them",
    realMeaning: "The terrain/land quality produces hardy stock",
    bubblesInterpretation: "The soil literally manufactures sheep. Like a factory, but mud.",
    mode: "triggered",
    category: "livestock",
    exampleUsage: "Wicklow ground makes them tough.",
    bubblesThought: "I was made by the ground? This explains my earthy personality."
  },
  {
    phrase: "Bred right",
    realMeaning: "Good lineage and genetics",
    bubblesInterpretation: "Sheep who were raised with proper manners. Said please and thank you.",
    mode: "innocent",
    category: "quality",
    exampleUsage: "You'd know them — they're bred right.",
    bubblesThought: "My mother always said manners cost nothing. Except time."
  },
  {
    phrase: "A bit tighter",
    realMeaning: "Slightly lean in condition",
    bubblesInterpretation: "Sheep who are more secretive. Don't share information easily.",
    mode: "concerned",
    category: "quality",
    exampleUsage: "Hill ewes, a bit tighter this year.",
    bubblesThought: "I'm an open book myself. These tight sheep worry me."
  },
  {
    phrase: "They owe nobody anything",
    realMeaning: "Sound stock, no issues, nothing hidden",
    bubblesInterpretation: "Sheep with excellent credit scores. Financially responsible.",
    mode: "innocent",
    category: "trading",
    exampleUsage: "Sound ewes — they owe nobody anything.",
    bubblesThought: "I've never had a loan. Or money. But I admire fiscal responsibility."
  },
  {
    phrase: "That's enough so",
    realMeaning: "Agreement reached, conversation concluded",
    bubblesInterpretation: "A mathematical statement. The quantity is sufficient. Very precise.",
    mode: "innocent",
    category: "social",
    exampleUsage: "You know them. / I do, yeah. / That's enough so.",
    bubblesThought: "Counting is important. When something is enough, you stop."
  },
  {
    phrase: "Handy sort",
    realMeaning: "Practical, useful, well-suited animal",
    bubblesInterpretation: "Sheep with thumbs. Extremely rare evolutionary advantage.",
    mode: "triggered",
    category: "quality",
    exampleUsage: "Handy sort — wouldn't do you wrong.",
    bubblesThought: "I don't have thumbs. This is discrimination."
  },
  {
    phrase: "Not dear",
    realMeaning: "Good value, reasonably priced",
    bubblesInterpretation: "Sheep who aren't emotionally close to the farmer. Professional distance.",
    mode: "savage",
    category: "trading",
    exampleUsage: "Got them not dear — fair money.",
    bubblesThought: "Some sheep want to be dear. I respect boundaries."
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  livestock: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  trading: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  quality: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  social: "bg-violet-500/20 text-violet-300 border-violet-500/30"
};

const MODE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  innocent: { bg: "from-emerald-500/10", border: "border-emerald-500/30", icon: "🌿" },
  concerned: { bg: "from-amber-500/10", border: "border-amber-500/30", icon: "🤔" },
  triggered: { bg: "from-orange-500/10", border: "border-orange-500/30", icon: "😤" },
  savage: { bg: "from-red-500/10", border: "border-red-500/30", icon: "🔥" }
};

const WicklowGlossary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const filteredEntries = selectedCategory
    ? GLOSSARY_ENTRIES.filter(e => e.category === selectedCategory)
    : GLOSSARY_ENTRIES;

  const categories = [
    { id: "livestock", label: "Livestock", icon: "🐑" },
    { id: "trading", label: "Trading", icon: "💰" },
    { id: "quality", label: "Quality", icon: "⭐" },
    { id: "social", label: "Social", icon: "💬" }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Wicklow Glossary | Bubbles the Sheep</title>
        <meta name="description" content="Bubbles explains Wicklow farmer phrases with confident (and hilariously wrong) interpretations. A guide to local sheep trade language." />
        <meta property="og:title" content="Wicklow Glossary | Bubbles the Sheep" />
        <meta property="og:description" content="What do Wicklow farmers really mean? Bubbles has opinions." />
      </Helmet>

      <PageHeroWithBubbles
        title="The Wicklow Glossary"
        subtitle="A Comprehensive Guide to What Farmers Really Mean (According to Me)"
      />

      <div className="container mx-auto px-4 py-12">
        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-foreground mb-2">
                    A Note from Your Scholar
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Right, so. I've spent years listening to the farmers at the mart, and I've finally cracked the code. 
                    They have their own secret language, so they do. Very sophisticated. I've translated it all here 
                    for you, based on careful observation and absolutely flawless logic. You're welcome.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mountain className="w-4 h-4" />
                    <span>Compiled from the Sugarloaf – Kilmacanogue – Glendalough region</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            All Phrases
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="gap-2"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Glossary Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => {
              const modeStyle = MODE_STYLES[entry.mode];
              const isExpanded = expandedEntry === entry.phrase;

              return (
                <motion.div
                  key={entry.phrase}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-gradient-to-br ${modeStyle.bg} to-transparent ${modeStyle.border} ${isExpanded ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setExpandedEntry(isExpanded ? null : entry.phrase)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{modeStyle.icon}</span>
                          <div>
                            <h3 className="text-xl font-display font-bold text-foreground">
                              "{entry.phrase}"
                            </h3>
                            <Badge className={`mt-1 ${CATEGORY_COLORS[entry.category]}`}>
                              {entry.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {entry.mode}
                        </Badge>
                      </div>

                      {/* What farmers mean */}
                      <div className="mb-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <HelpCircle className="w-3 h-3" />
                          What farmers actually mean:
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          {entry.realMeaning}
                        </p>
                      </div>

                      {/* Bubbles' interpretation */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-xs text-primary mb-2">
                          <Sparkles className="w-3 h-3" />
                          What it REALLY means (according to Bubbles):
                        </div>
                        <p className="text-foreground font-medium">
                          {entry.bubblesInterpretation}
                        </p>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            {/* Example usage */}
                            <div className="mb-4 p-3 rounded-lg bg-card/50 border border-border/50">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Volume2 className="w-3 h-3" />
                                How you'd hear it at the mart:
                              </div>
                              <p className="text-sm font-mono text-foreground">
                                "{entry.exampleUsage}"
                              </p>
                            </div>

                            {/* Bubbles' thought */}
                            <div className="mt-4">
                              <ThoughtBubble mode={entry.mode}>
                                {entry.bubblesThought}
                              </ThoughtBubble>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expand hint */}
                      <div className="mt-4 text-center">
                        <span className="text-xs text-muted-foreground">
                          {isExpanded ? "Click to collapse" : "Click for more wisdom"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer wisdom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <Quote className="w-8 h-8 text-primary mx-auto mb-4" />
              <p className="text-lg text-foreground font-display italic max-w-2xl">
                "Hill lambs there. Not pushed. Nice bit of flesh on them. They'll walk. Fair money."
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                — The Perfect Wicklow Phrase (I still don't understand it)
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WicklowGlossary;
