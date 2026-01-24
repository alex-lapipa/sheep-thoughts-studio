import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Mountain, HelpCircle, Quote, Sparkles, Volume2, Loader2, Dog, Bird, Bug, Rabbit, Cat, Fish, Rat, Squirrel, type LucideIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { usePronunciation } from "@/hooks/usePronunciation";
import { CreatureHierarchy } from "@/components/CreatureHierarchy";
import { CreatureSpotter } from "@/components/CreatureSpotter";

interface GlossaryEntry {
  phrase: string;
  irish?: string;
  realMeaning: string;
  bubblesInterpretation: string;
  mode: "innocent" | "concerned" | "triggered" | "savage";
  category: "livestock" | "trading" | "quality" | "social" | "placenames" | "seanfhocail" | "creatures";
  exampleUsage: string;
  bubblesThought: string;
  species?: string;
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
  },
  // Wicklow Place Names in Irish
  {
    phrase: "Cill Mhantáin",
    irish: "Cill Mhantáin",
    realMeaning: "Wicklow - 'Church of Mantan' (a follower of St. Patrick)",
    bubblesInterpretation: "A church made entirely of kittens. Very soft pews, so they say.",
    mode: "innocent",
    category: "placenames",
    exampleUsage: "I'm from Cill Mhantáin, like.",
    bubblesThought: "Kitten church sounds lovely. Bit scratchy during Mass, I'd imagine."
  },
  {
    phrase: "An Sliabh Mór",
    irish: "An Sliabh Mór",
    realMeaning: "The Great Mountain - Lugnaquilla, highest peak in Wicklow",
    bubblesInterpretation: "The mountain that thinks very highly of itself. Very confident, that one.",
    mode: "concerned",
    category: "placenames",
    exampleUsage: "The weather's coming off An Sliabh Mór.",
    bubblesThought: "I've never met a humble mountain. They're all like this."
  },
  {
    phrase: "Gleann Dá Loch",
    irish: "Gleann Dá Loch",
    realMeaning: "Glendalough - 'Valley of Two Lakes'",
    bubblesInterpretation: "A glen that can only count to two. Limited education, but it tries.",
    mode: "innocent",
    category: "placenames",
    exampleUsage: "We took the tourists to Gleann Dá Loch.",
    bubblesThought: "Two lakes is enough for anyone. Greedy to want more."
  },
  {
    phrase: "Baile Átha Cliath",
    irish: "Baile Átha Cliath",
    realMeaning: "Dublin - 'Town of the Hurdled Ford'",
    bubblesInterpretation: "A town where everyone jumps over things. Very athletic people, the Dubliners.",
    mode: "triggered",
    category: "placenames",
    exampleUsage: "He's gone up to Baile Átha Cliath for the day.",
    bubblesThought: "No wonder they're always in a hurry. Too much jumping."
  },
  {
    phrase: "Bré",
    irish: "Bré",
    realMeaning: "Bray - possibly from 'bri' meaning hill",
    bubblesInterpretation: "The sound a donkey makes. The whole town is a tribute to donkeys.",
    mode: "innocent",
    category: "placenames",
    exampleUsage: "The train to Bré takes twenty minutes.",
    bubblesThought: "Donkeys deserve recognition. Underappreciated, they are."
  },
  {
    phrase: "An Teach Dóite",
    irish: "An Teach Dóite",
    realMeaning: "The Burnt House - Roundwood area landmark",
    bubblesInterpretation: "A house that tried to cook dinner unsupervised. Happens to the best of us.",
    mode: "concerned",
    category: "placenames",
    exampleUsage: "Turn left at An Teach Dóite.",
    bubblesThought: "This is why sheep don't cook. Too risky."
  },
  {
    phrase: "Sliabh Rua",
    irish: "Sliabh Rua",
    realMeaning: "Red Mountain - Sugarloaf Mountain",
    bubblesInterpretation: "A mountain that blushes. Probably embarrassed about something. We've all been there.",
    mode: "innocent",
    category: "placenames",
    exampleUsage: "You can see Sliabh Rua from Carmel's garden.",
    bubblesThought: "I blush too when tourists take photos. We understand each other."
  },
  {
    phrase: "Cill Mocheallóg",
    irish: "Cill Mocheallóg",
    realMeaning: "Kilmacanogue - 'Church of my Mocheallóg'",
    bubblesInterpretation: "A church owned by someone called Mocheallóg. Very specific real estate.",
    mode: "innocent",
    category: "placenames",
    exampleUsage: "The mart's on in Cill Mocheallóg Friday.",
    bubblesThought: "I wonder if Mocheallóg still pays the mortgage."
  },
  // Traditional Irish Phrases (Seanfhocail - Proverbs)
  {
    phrase: "Is fearr Gaeilge briste ná Béarla cliste",
    irish: "Is fearr Gaeilge briste ná Béarla cliste",
    realMeaning: "Broken Irish is better than clever English",
    bubblesInterpretation: "Irish things are inherently superior when damaged. Like vintage furniture.",
    mode: "triggered",
    category: "seanfhocail",
    exampleUsage: "Ah sure, is fearr Gaeilge briste ná Béarla cliste!",
    bubblesThought: "I speak broken everything. I must be very cultured."
  },
  {
    phrase: "Níl aon tinteán mar do thinteán féin",
    irish: "Níl aon tinteán mar do thinteán féin",
    realMeaning: "There's no hearth like your own hearth (There's no place like home)",
    bubblesInterpretation: "All hearths are different. Each one is a unique individual. Hearth diversity.",
    mode: "innocent",
    category: "seanfhocail",
    exampleUsage: "Níl aon tinteán mar do thinteán féin, as they say.",
    bubblesThought: "I've never met two identical hearths. This confirms my theory."
  },
  {
    phrase: "Mol an óige agus tiocfaidh sí",
    irish: "Mol an óige agus tiocfaidh sí",
    realMeaning: "Praise the young and they will flourish",
    bubblesInterpretation: "If you compliment youth, it will arrive. A summoningspell for young people.",
    mode: "concerned",
    category: "seanfhocail",
    exampleUsage: "Mol an óige agus tiocfaidh sí — encourage the lambs!",
    bubblesThought: "I tried praising yesterday. Nothing arrived. Maybe I said it wrong."
  },
  {
    phrase: "Ní neart go cur le chéile",
    irish: "Ní neart go cur le chéile",
    realMeaning: "There is no strength without unity",
    bubblesInterpretation: "Strength only exists when things are stored together. Very organized philosophy.",
    mode: "innocent",
    category: "seanfhocail",
    exampleUsage: "The flock works as one — ní neart go cur le chéile.",
    bubblesThought: "This is why I never leave the group. I'd lose my strength."
  },
  {
    phrase: "Is glas iad na cnoic i bhfad uainn",
    irish: "Is glas iad na cnoic i bhfad uainn",
    realMeaning: "Distant hills are green (The grass is always greener)",
    bubblesInterpretation: "Hills change color based on distance. Camouflage. Very sneaky, hills.",
    mode: "triggered",
    category: "seanfhocail",
    exampleUsage: "Is glas iad na cnoic i bhfad uainn — but home is best.",
    bubblesThought: "I've watched hills. They DO change color. I'm onto them."
  },
  {
    phrase: "Dia dhuit",
    irish: "Dia dhuit",
    realMeaning: "Hello (literally 'God to you')",
    bubblesInterpretation: "A gift of a small god. Very generous greeting. Everyone gives gods here.",
    mode: "innocent",
    category: "seanfhocail",
    exampleUsage: "Dia dhuit! Conas atá tú?",
    bubblesThought: "I don't have gods to give. I offer grass instead."
  },
  {
    phrase: "Slán go fóill",
    irish: "Slán go fóill",
    realMeaning: "Goodbye for now",
    bubblesInterpretation: "A promise that health will arrive slowly. Very patient wellbeing.",
    mode: "innocent",
    category: "seanfhocail",
    exampleUsage: "Right so, slán go fóill!",
    bubblesThought: "My health is always going slowly. This explains everything."
  },
  {
    phrase: "Tá sé ag cur báistí",
    irish: "Tá sé ag cur báistí",
    realMeaning: "It is raining",
    bubblesInterpretation: "Something is putting rain somewhere. Active rain placement. Someone's job.",
    mode: "concerned",
    category: "seanfhocail",
    exampleUsage: "Tá sé ag cur báistí — better stay in the shed.",
    bubblesThought: "Who puts the rain? I've never met them. Very mysterious."
  },
  {
    phrase: "Go raibh maith agat",
    irish: "Go raibh maith agat",
    realMeaning: "Thank you (literally 'May there be good at you')",
    bubblesInterpretation: "A hope that goodness is physically near you. Location-based gratitude.",
    mode: "innocent",
    category: "seanfhocail",
    exampleUsage: "For the hay? Go raibh maith agat!",
    bubblesThought: "Good is always somewhere near me. I just can't see it."
  },
  // Creatures of Wicklow
  {
    phrase: "Muffins (ZZ Top Lady)",
    realMeaning: "Aidan and Mairead's dog, named after the shop Mairead works at. Official pedigree name: ZZ Top Lady.",
    bubblesInterpretation: "A dog with two identities. 'Muffins' is her public persona. 'ZZ Top Lady' is her secret government name. Very mysterious. Very wise. Never speaks — which means she's never wrong.",
    mode: "innocent",
    category: "creatures",
    species: "Dog",
    exampleUsage: "Muffins is after staring at the Sugarloaf for three hours straight.",
    bubblesThought: "We'd stare at the hills together in silence. I think we understood each other. Or she was ignoring me. Either way, profound."
  },
  {
    phrase: "The Sugarloaf Crows",
    realMeaning: "Common carrion crows that nest around the Sugarloaf mountain area.",
    bubblesInterpretation: "An elite intelligence network. They hold meetings at dawn. Very organised. I'm fairly sure they're taking notes on all of us.",
    mode: "triggered",
    category: "creatures",
    species: "Crow",
    exampleUsage: "The crows are watching again from the fence posts.",
    bubblesThought: "They know things. I've seen them whisper. Crows don't have lips, but they find a way."
  },
  {
    phrase: "The Glendalough Fox",
    realMeaning: "Red foxes commonly seen in the Glendalough valley, known for their boldness around tourists.",
    bubblesInterpretation: "A solo entrepreneur. Very independent. Comes and goes as it pleases. I respect the hustle, even if I don't understand the business model.",
    mode: "concerned",
    category: "creatures",
    species: "Fox",
    exampleUsage: "That fox is after stealing a sandwich right off the tourist's blanket.",
    bubblesThought: "I've never stolen a sandwich. Too risky. The fox has more courage than sense."
  },
  {
    phrase: "Eddie's Sheepdogs",
    realMeaning: "The working border collies on Eddie's farm, trained to herd sheep.",
    bubblesInterpretation: "Middle management. They think they're in charge, running around, telling everyone where to go. Very bossy. But who hired them? Exactly.",
    mode: "savage",
    category: "creatures",
    species: "Sheepdog",
    exampleUsage: "The dogs are bringing the ewes down from the hill field.",
    bubblesThought: "I follow their instructions because it's easier, not because they're right. I want that on record."
  },
  {
    phrase: "The Mart Cat",
    realMeaning: "The resident barn cat at the Wicklow livestock mart, kept for rodent control.",
    bubblesInterpretation: "An independent auditor. Observes all transactions but participates in none. Very neutral. Very judgmental. Knows everyone's business.",
    mode: "innocent",
    category: "creatures",
    species: "Cat",
    exampleUsage: "The mart cat's sitting on the pen again, watching the bidding.",
    bubblesThought: "I respect the commitment to observation. Very scholarly approach to life."
  },
  {
    phrase: "The Heron at Powerscourt",
    realMeaning: "Grey herons that fish in the Powerscourt waterfall pools and estate lakes.",
    bubblesInterpretation: "A statue that occasionally moves. Very patient. Stands in water for hours doing absolutely nothing productive. I admire that.",
    mode: "innocent",
    category: "creatures",
    species: "Heron",
    exampleUsage: "That heron hasn't moved since Tuesday.",
    bubblesThought: "Standing still is underrated. The heron understands this. We should all stand still more."
  },
  {
    phrase: "The Roundwood Rabbits",
    realMeaning: "Wild rabbits common in the fields around Roundwood village.",
    bubblesInterpretation: "An underground civilization. They have tunnels, meetings, probably a whole government down there. Very sophisticated. Very secretive.",
    mode: "concerned",
    category: "creatures",
    species: "Rabbit",
    exampleUsage: "The rabbits are after destroying Jimmy's vegetable patch again.",
    bubblesThought: "What are they planning? They move so fast. I think they're on a schedule I don't have access to."
  },
  {
    phrase: "The Seagulls from Bray",
    realMeaning: "Herring gulls that frequent Bray seafront and sometimes venture inland.",
    bubblesInterpretation: "Tourists. Very loud. Steal food. Have no respect for personal space. Come from 'the coast' like it's somewhere fancy.",
    mode: "triggered",
    category: "creatures",
    species: "Seagull",
    exampleUsage: "The seagulls followed the tractor all the way up from Bray.",
    bubblesThought: "They think they're better than us inland birds. They're not. They're just louder."
  },
  {
    phrase: "Carmel's Hens",
    realMeaning: "Free-range hens kept by Carmel in her garden near Kilmacanogue.",
    bubblesInterpretation: "A council of elders. They move as a group, make collective decisions, and judge everyone who enters the garden. Very democratic. Very intimidating.",
    mode: "innocent",
    category: "creatures",
    species: "Hen",
    exampleUsage: "Carmel's hens are having a meeting by the shed again.",
    bubblesThought: "I tried to join the meeting once. They ignored me. I think there's a vetting process."
  },
  {
    phrase: "The Bees at Anthony's",
    realMeaning: "Anthony's beehives that he tends for honey production.",
    bubblesInterpretation: "A very organised workforce. Everyone has a job. No one complains. Very efficient. Very buzzy. I tried to interview one but they were too busy.",
    mode: "concerned",
    category: "creatures",
    species: "Bee",
    exampleUsage: "Anthony's bees are swarming the lavender again.",
    bubblesThought: "How do they know what to do? Is there training? I have so many questions they won't answer."
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  livestock: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  trading: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  quality: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  social: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  placenames: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  seanfhocail: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  creatures: "bg-orange-500/20 text-orange-300 border-orange-500/30"
};

const MODE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  innocent: { bg: "from-emerald-500/10", border: "border-emerald-500/30", icon: "🌿" },
  concerned: { bg: "from-amber-500/10", border: "border-amber-500/30", icon: "🤔" },
  triggered: { bg: "from-orange-500/10", border: "border-orange-500/30", icon: "😤" },
  savage: { bg: "from-red-500/10", border: "border-red-500/30", icon: "🔥" }
};

// Species icon mapping for creatures
const SPECIES_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  "Dog": { icon: Dog, color: "text-amber-400" },
  "Sheepdog": { icon: Dog, color: "text-blue-400" },
  "Crow": { icon: Bird, color: "text-slate-400" },
  "Fox": { icon: Squirrel, color: "text-orange-400" },
  "Cat": { icon: Cat, color: "text-purple-400" },
  "Heron": { icon: Bird, color: "text-cyan-400" },
  "Robin": { icon: Bird, color: "text-red-400" },
  "Rabbit": { icon: Rabbit, color: "text-pink-400" },
  "Rat": { icon: Rat, color: "text-stone-400" },
  "Hedgehog": { icon: Bug, color: "text-amber-300" },
  "Fish": { icon: Fish, color: "text-sky-400" },
};

const getSpeciesIcon = (species?: string) => {
  if (!species) return null;
  return SPECIES_ICONS[species] || null;
};

const WicklowGlossary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const { playPronunciation, isPlaying, isLoading, playingPhrase } = usePronunciation();

  const filteredEntries = selectedCategory
    ? GLOSSARY_ENTRIES.filter(e => e.category === selectedCategory)
    : GLOSSARY_ENTRIES;

  // Check if entry has Irish pronunciation (placenames or seanfhocail)
  const hasIrishPronunciation = (entry: GlossaryEntry) => 
    entry.irish || entry.category === "placenames" || entry.category === "seanfhocail";

  const categories = [
    { id: "livestock", label: "Livestock", icon: "🐑" },
    { id: "trading", label: "Trading", icon: "💰" },
    { id: "quality", label: "Quality", icon: "⭐" },
    { id: "social", label: "Social", icon: "💬" },
    { id: "placenames", label: "Logainmneacha", icon: "📍" },
    { id: "seanfhocail", label: "Seanfhocail", icon: "🍀" },
    { id: "creatures", label: "Creatures", icon: "🦊" }
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

        {/* Creature Hierarchy - show when filtering creatures or no filter */}
        {(selectedCategory === null || selectedCategory === "creatures") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <CreatureHierarchy />
              <CreatureSpotter />
            </div>
          </motion.div>
        )}

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
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-display font-bold text-foreground">
                                "{entry.phrase}"
                              </h3>
                              {hasIrishPronunciation(entry) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-7 w-7 shrink-0 rounded-full transition-colors ${
                                    isPlaying(entry.irish || entry.phrase)
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-primary/20 text-primary"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPronunciation(entry.irish || entry.phrase, 0.8);
                                  }}
                                  title="Listen to pronunciation"
                                >
                                  {isLoading && playingPhrase === (entry.irish || entry.phrase) ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Volume2 className={`h-3.5 w-3.5 ${isPlaying(entry.irish || entry.phrase) ? "animate-pulse" : ""}`} />
                                  )}
                                </Button>
                              )}
                            </div>
                            {entry.irish && entry.category === "placenames" && (
                              <p className="text-xs text-muted-foreground italic mt-0.5">
                                {entry.irish}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${CATEGORY_COLORS[entry.category]}`}>
                                {entry.category === "placenames" ? "logainm" : 
                                 entry.category === "seanfhocail" ? "seanfhocal" : 
                                 entry.category}
                              </Badge>
                              {entry.category === "creatures" && entry.species && (() => {
                                const speciesData = getSpeciesIcon(entry.species);
                                if (!speciesData) return null;
                                const SpeciesIcon = speciesData.icon;
                                return (
                                  <Badge variant="outline" className={`gap-1 ${speciesData.color} border-current/30 bg-current/10`}>
                                    <SpeciesIcon className="w-3 h-3" />
                                    {entry.species}
                                  </Badge>
                                );
                              })()}
                            </div>
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
