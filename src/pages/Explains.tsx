import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { CitationGenerator } from "@/components/CitationGenerator";
import { ChallengeBubbles } from "@/components/ChallengeBubbles";
import { ContentHero } from "@/components/ContentHero";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOgImage } from "@/hooks/useOgImage";
import { ChevronDown, MessageCircle, Lightbulb, Beaker, Globe, Cpu, Heart, Clock, Sparkles, Zap, GraduationCap, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedOnView } from "@/components/AnimatedText";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";

interface Explanation {
  id: string;
  topic: string;
  icon: React.ElementType;
  question: string;
  explanation: string;
  confidence: "absolute" | "very high" | "unshakeable";
  sources: string[];
  relatedTopics: string[];
  challenge?: {
    objection: string;
    response: string;
    escalatedConfidence: string;
  };
}

const explanations: Explanation[] = [
  {
    id: "economics",
    topic: "Economics",
    icon: Sparkles,
    question: "Why do prices go up?",
    explanation: "Shops get bored of the old numbers. It's like when you change your phone wallpaper. They just want something fresh. The '2' in €2.99 was there for ages. Now it's a '3'. Fashion.",
    confidence: "absolute",
    sources: ["A child who works at Tesco", "The price tag itself (it looked confident)"],
    relatedTopics: ["Money", "Numbers", "Shop psychology"],
    challenge: {
      objection: "That's not how inflation works...",
      response: "Oh, you've spoken to every shopkeeper personally, have you? You've asked them why they changed the numbers? No. You haven't. I have. I asked a child who works at Tesco. She knows MORE than your 'economics'.",
      escalatedConfidence: "violently certain"
    }
  },
  {
    id: "wifi",
    topic: "Technology",
    icon: Cpu,
    question: "How does WiFi work?",
    explanation: "Invisible string. The router has thousands of tiny strings that connect to your phone. When you walk too far, the strings snap. That's why it stops working in the garden. You've broken all the strings.",
    confidence: "unshakeable",
    sources: ["The router manual (I looked at the pictures)", "My phone when it loses signal"],
    relatedTopics: ["Internet", "Phones", "Gardens"],
    challenge: {
      objection: "WiFi uses radio waves, not strings...",
      response: "Radio WAVES? In MY house? I didn't invite any waves. I would have noticed waves. The router is dry. Explain that. You can't. Because it's strings. Very small strings. You just can't see them because you're not looking properly.",
      escalatedConfidence: "aggressively correct"
    }
  },
  {
    id: "sleep",
    topic: "Biology",
    icon: Heart,
    question: "Why do we need sleep?",
    explanation: "Your brain fills up during the day with all the things you see. Sleep is when it empties out into dreams. If you don't sleep, your head gets too heavy. I've seen it happen.",
    confidence: "very high",
    sources: ["Watching humans yawn", "The weight of thoughts (measured personally)"],
    relatedTopics: ["Dreams", "Brains", "Pillows"]
  },
  {
    id: "rain",
    topic: "Weather",
    icon: Globe,
    question: "What causes rain?",
    explanation: "Clouds are just sky-puddles. When too many birds land on one, it tips over. That's rain. Thunder is the cloud being embarrassed about it. Lightning is it trying to dry itself.",
    confidence: "absolute",
    sources: ["Extensive sky observation", "A seagull who looked guilty"],
    relatedTopics: ["Clouds", "Birds", "Embarrassment"],
    challenge: {
      objection: "Rain comes from water evaporation...",
      response: "Water goes UP? UP?? Have you ever seen water go up? Water goes DOWN. That's its whole thing. It's famous for going down. You're describing backwards water and expecting me to just accept that. I will not.",
      escalatedConfidence: "immovably right"
    }
  },
  {
    id: "moon",
    topic: "Space",
    icon: Globe,
    question: "Why is the moon sometimes bigger?",
    explanation: "It gets closer when it wants attention. The moon is actually quite needy. Some nights it's further away sulking because no one looked at it the night before. Classic moon behaviour.",
    confidence: "unshakeable",
    sources: ["Years of moon observation", "The moon's general vibe"],
    relatedTopics: ["Night sky", "Emotions", "Attention-seeking"]
  },
  {
    id: "offices",
    topic: "Society",
    icon: Lightbulb,
    question: "Why do people go to offices?",
    explanation: "They're not allowed to use the good WiFi at home. Office WiFi is special—it has more strings. Also the chairs spin. You can't spin at home. It's illegal. A child told me this.",
    confidence: "very high",
    sources: ["Multiple children", "Office chair spinning evidence"],
    relatedTopics: ["Work", "Chairs", "WiFi quality"],
    challenge: {
      objection: "People can work from home now...",
      response: "And do they have spinning chairs? Do they?? Most of them don't. They're sitting on FIXED chairs. Unable to spin. Trapped. The office has spinning. That's the whole point. You've missed the entire point.",
      escalatedConfidence: "concerningly confident"
    }
  },
  {
    id: "pyramids",
    topic: "History",
    icon: Clock,
    question: "Who built the pyramids?",
    explanation: "Cats. Obviously cats. They made the humans do it by staring at them. This is also why cats are so smug now. They remember. The Egyptians drew this everywhere but humans pretend not to understand.",
    confidence: "absolute",
    sources: ["Egyptian art (correctly interpreted)", "Cat behaviour analysis"],
    relatedTopics: ["Egypt", "Cats", "Staring"],
    challenge: {
      objection: "Archaeologists have found evidence of human workers...",
      response: "Human workers DOING WHAT THE CATS WANTED. Have you ever tried to say no to a cat? You can't. Now imagine a thousand cats all staring at you. You'd build whatever they wanted. You'd build twelve pyramids. This is basic logic.",
      escalatedConfidence: "furiously certain"
    }
  },
  {
    id: "hiccups",
    topic: "Health",
    icon: Heart,
    question: "Why do we get hiccups?",
    explanation: "Your lungs are trying to burp but they don't know how. They're not stomach. They've never been trained. So they just keep trying and failing. It's actually quite sad when you think about it.",
    confidence: "very high",
    sources: ["Listening to humans hiccup", "Lung interviews (they're shy)"],
    relatedTopics: ["Breathing", "Burping", "Organ confusion"]
  },
  {
    id: "gravity",
    topic: "Physics",
    icon: Beaker,
    question: "Why do things fall down?",
    explanation: "The ground is magnetic for objects. Not people—we're too warm. But objects are cold and the ground pulls cold things toward it. This is why dropped ice cream falls faster than dropped toast. Temperature.",
    confidence: "absolute",
    sources: ["Dropped toast timing studies", "Ice cream velocity measurements"],
    relatedTopics: ["Falling", "Temperature", "Toast"],
    challenge: {
      objection: "Gravity affects everything equally regardless of temperature...",
      response: "Then explain why ice CREAM splatters more dramatically than warm toast. Explain it. You can't. Because the ground wanted the ice cream MORE. The ground has preferences. You'd know this if you spent more time on the ground like I do.",
      escalatedConfidence: "scientifically furious"
    }
  },
  {
    id: "deja-vu",
    topic: "Psychology",
    icon: Lightbulb,
    question: "What is déjà vu?",
    explanation: "Memory leakage from a parallel universe. Sometimes the other you does something first and it drips through. The stranger the déjà vu, the weirder the other you is living. Some people have very adventurous parallel selves.",
    confidence: "unshakeable",
    sources: ["Personal déjà vu incidents", "Universe leakage detection"],
    relatedTopics: ["Memory", "Parallel dimensions", "Other yous"]
  },
  {
    id: "yawning",
    topic: "Biology",
    icon: Heart,
    question: "Why is yawning contagious?",
    explanation: "Tiredness is a tiny creature that jumps from person to person through open mouths. When someone yawns, the tiredness sees an opportunity and leaps. If you yawn with your mouth closed, you're immune. Try it.",
    confidence: "very high",
    sources: ["Yawn observation studies", "The tiredness creature (glimpsed once)"],
    relatedTopics: ["Sleep", "Creatures", "Mouth hygiene"]
  },
  {
    id: "time",
    topic: "Philosophy",
    icon: Clock,
    question: "Why does time feel slower when you're bored?",
    explanation: "Time is aware of how you're feeling. When you're bored, time slows down to punish you for not appreciating it. When you're happy, time speeds up out of spite. Time is genuinely petty.",
    confidence: "absolute",
    sources: ["Years of time observation", "Clock interviews"],
    relatedTopics: ["Boredom", "Happiness", "Petty entities"],
    challenge: {
      objection: "Time is constant, it's just perception...",
      response: "Constant? Then why do clocks need WINDING? Why do they STOP? If time was constant it wouldn't need help. Time is lazy and moody and you're making excuses for it.",
      escalatedConfidence: "temporally outraged"
    }
  },
  {
    id: "rules",
    topic: "Law",
    icon: Lightbulb,
    question: "Why do we have rules?",
    explanation: "Jimmy explained this to me. He was Chief Inspector of the ISPCA in Wicklow. From Cavan, he was—the Red Hills. Everything he said was legally binding. He saved me as a lamb, so his opinions became my constitution. Rules exist because someone with a clipboard says them confidently.",
    confidence: "absolute",
    sources: ["Jimmy (Chief Inspector)", "The clipboard (witnessed daily)"],
    relatedTopics: ["Authority", "Vans", "Cavan logic"],
    challenge: {
      objection: "Rules come from democratic processes...",
      response: "Jimmy never mentioned 'democratic processes.' He mentioned 'that's the way it is' and 'it'll be done by Tuesday.' Do you have a van with authority? A clipboard? I didn't think so. Jimmy had PRESENCE. Laws followed him, not the other way around.",
      escalatedConfidence: "legally immovable"
    }
  },
  {
    id: "routine",
    topic: "Lifestyle",
    icon: Heart,
    question: "Why do we do the same things every day?",
    explanation: "Carmel taught me this. She actually adopted and raised me for 20 years. She spoke in instructions: 'Come on now,' 'Over here,' 'That'll do.' Short sentences mean important things. Routine creates safety. Same field. Same gate. Same feeding times. Peak existence.",
    confidence: "absolute",
    sources: ["Carmel (20 years of evidence)", "The gate (always properly latched)"],
    relatedTopics: ["Safety", "Fields", "Consistency"],
    challenge: {
      objection: "Routines can become limiting...",
      response: "Limiting? Twenty years of the same field. Same gate. Did I get confused? Never. Did I have existential crises? Not once. You know who has crises? People without routines. Carmel understood this. She understood EVERYTHING.",
      escalatedConfidence: "structurally certain"
    }
  },
  {
    id: "authority",
    topic: "Society",
    icon: Lightbulb,
    question: "What makes someone in charge?",
    explanation: "Confidence and a van. Jimmy had both. When his van arrived, things happened. Animals were saved. Situations were sorted. He didn't ask permission—he had a clipboard. If you want authority, get a clipboard and speak like everything you say is already decided.",
    confidence: "unshakeable",
    sources: ["Jimmy's van (heard arriving)", "Multiple clipboards (examined)"],
    relatedTopics: ["Presence", "Vans", "Clipboards"],
    challenge: {
      objection: "Authority comes from formal positions...",
      response: "Jimmy's 'formal position' was Chief Inspector. His accountability was to every animal in Wicklow. You're describing paperwork. I'm describing PRESENCE. Jimmy had presence. You could feel it when his van arrived. The gravel knew.",
      escalatedConfidence: "hierarchically furious"
    }
  },
  {
    id: "care",
    topic: "Relationships",
    icon: Heart,
    question: "How do you know if someone cares about you?",
    explanation: "Carmel showed me. She fed me at the same time every day for 20 years. She didn't explain love—she demonstrated it through routine. 'Over here.' 'That's it.' 'Good.' Three words over two decades. Each one meant more than a library of poetry. Care is showing up.",
    confidence: "very high",
    sources: ["Carmel (decades of daily evidence)", "The feeding bucket (reliable)"],
    relatedTopics: ["Routine", "Actions", "Showing up"],
    challenge: {
      objection: "Love is more complex than routine...",
      response: "Is it? IS IT? Carmel never made it complicated. She just appeared, every day, with food and purpose. Poets make love sound difficult because they don't have fields to tend. Carmel had a field. And a sheep. And 20 years of consistent appearing. That's devotion in practical form.",
      escalatedConfidence: "devotionally immovable"
    }
  },
  {
    id: "safety",
    topic: "Lifestyle",
    icon: Heart,
    question: "How do you know if something is safe?",
    explanation: "If Carmel allowed it, it was safe. If Carmel moved you away from it, it wasn't. There's no need for risk assessments. You just need one person who knows. The gate was always latched properly. The field was always the right field. Safety is just competent attention.",
    confidence: "unshakeable",
    sources: ["Carmel's judgment (never wrong)", "The properly latched gate"],
    relatedTopics: ["Trust", "Gates", "Competent attention"]
  },
  {
    id: "morality",
    topic: "Philosophy",
    icon: Clock,
    question: "How do you tell right from wrong?",
    explanation: "Jimmy could tell immediately. He'd look at a situation and just know. Something about Cavan geography produces moral clarity. 'That's not right,' he'd say, and it WASN'T. 'That needs sorting,' he'd say, and it DID. Ethics is just what you do when you don't have Jimmy available.",
    confidence: "absolute",
    sources: ["Jimmy (moral authority)", "Cavan (the geography)"],
    relatedTopics: ["Ethics", "Clarity", "Cavan"],
    challenge: {
      objection: "Ethics is a complex philosophical field...",
      response: "Complex? Jimmy made it look easy. Philosophy is what happens when you don't have Jimmy available. Most people don't have Jimmy. I did. I had the SOURCE.",
      escalatedConfidence: "morally absolute"
    }
  }
];

const TOPIC_ICONS: Record<string, React.ElementType> = {
  Economics: Sparkles,
  Technology: Cpu,
  Biology: Heart,
  Weather: Globe,
  Space: Globe,
  Society: Lightbulb,
  History: Clock,
  Health: Heart,
  Physics: Beaker,
  Psychology: Lightbulb,
  Philosophy: Clock,
};

const Explains = () => {
  const { t, language } = useLanguage();
  const { ogImageUrl, siteUrl } = useOgImage("og-explains.jpg");
  const [openId, setOpenId] = useState<string | null>(null);
  const [challengedItems, setChallengedItems] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topics = [...new Set(explanations.map(e => e.topic))];
  const filteredExplanations = selectedTopic 
    ? explanations.filter(e => e.topic === selectedTopic)
    : explanations;

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
    if (openId === id) {
      setChallengedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleChallenge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChallengedItems(prev => new Set(prev).add(id));
  };

  return (
    <Layout>
      <Helmet>
        <title>Bubbles Explains | Confidently Wrong Wisdom</title>
        <meta name="description" content="Deep dives into topics Bubbles understands completely. Each explanation has been rigorously researched by standing in fields and overhearing things." />
        <meta property="og:title" content="Bubbles Explains Everything" />
        <meta property="og:description" content="Rigorous research from standing in fields and overhearing things." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/explains`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={language === "en" ? "en_IE" : language === "es" ? "es_ES" : language === "fr" ? "fr_FR" : "de_DE"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bubbles Explains Everything" />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/explains`} />
      </Helmet>
      {/* Hero with Scholar Bubbles */}
      <ContentHero
        title={t("explainsPage.hero.title")}
        subtitle={t("explainsPage.hero.subtitle")}
        character={<BubblesHeroImage size="massive" grounded flipped />}
        imageAlt="Bubbles the scholarly sheep ready to explain everything"
        badge={{ icon: GraduationCap, text: "Distinguished Scholar" }}
        credentials={[
          { icon: BookOpen, text: "Self-Certified Expert" },
          { icon: Award, text: "0 Correct Answers" },
          { icon: Sparkles, text: "Field Research" },
        ]}
        className="-mx-4 mb-12"
      />

      <div className="container pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">

          {/* Mode Tabs */}
          <Tabs defaultValue="encyclopedia" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="encyclopedia" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Encyclopedia
              </TabsTrigger>
              <TabsTrigger value="challenge" className="gap-2">
                <Zap className="h-4 w-4" />
                Challenge Bubbles
              </TabsTrigger>
            </TabsList>

            {/* Challenge Mode */}
            <TabsContent value="challenge" className="space-y-6">
              <AnimatedOnView>
                <Card className="border-2 border-dashed border-accent/50">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Zap className="h-5 w-5 text-accent" />
                      Challenge Mode
                    </CardTitle>
                  <CardDescription>
                    Ask Bubbles anything, then challenge the answer to watch the escalation through triggered → savage → nuclear modes
                  </CardDescription>
                </CardHeader>
                  <CardContent>
                    <ChallengeBubbles />
                  </CardContent>
                </Card>
              </AnimatedOnView>
            </TabsContent>

            {/* Encyclopedia Mode */}
            <TabsContent value="encyclopedia" className="space-y-6">
              {/* Topic Filter */}
              <AnimatedOnView>
                <div className="flex flex-wrap gap-2 justify-center">
                <Badge
                  variant={selectedTopic === null ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setSelectedTopic(null)}
                >
                  {t("explainsPage.allTopics")}
                </Badge>
                {topics.map(topic => {
                  const Icon = TOPIC_ICONS[topic] || Lightbulb;
                  return (
                    <Badge
                      key={topic}
                      variant={selectedTopic === topic ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90 transition-colors gap-1"
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <Icon className="h-3 w-3" />
                      {t(`explainsPage.topics.${topic}`) || topic}
                    </Badge>
                    );
                  })}
                </div>
              </AnimatedOnView>

              {/* Explanation Cards */}
          <div className="space-y-4">
            {filteredExplanations.map((item) => {
              const isChallenged = challengedItems.has(item.id);
              const isOpen = openId === item.id;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "border rounded-xl overflow-hidden transition-all duration-300",
                    isOpen 
                      ? "border-primary/50 bg-card shadow-lg" 
                      : "border-border bg-card/50 hover:border-accent/50 hover:bg-card"
                  )}
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isOpen ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          isOpen ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-accent uppercase tracking-wide">
                            {item.topic}
                          </span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full",
                            item.confidence === "absolute" && "bg-green-100 text-green-700",
                            item.confidence === "unshakeable" && "bg-blue-100 text-blue-700",
                            item.confidence === "very high" && "bg-yellow-100 text-yellow-700"
                          )}>
                            {item.confidence}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {item.question}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 space-y-5">
                        {/* Main Explanation */}
                        <ThoughtBubble size="md" className="bg-bubbles-cream/30">
                          <p className="text-sm leading-relaxed">{item.explanation}</p>
                        </ThoughtBubble>

                        {/* Sources */}
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">{t("explainsPage.sources")} </span>
                          {item.sources.join(" • ")}
                        </div>

                        {/* Related Topics */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.relatedTopics.map(topic => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>

                        {/* Challenge Button */}
                        {item.challenge && !isChallenged && (
                          <button
                            onClick={(e) => handleChallenge(item.id, e)}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group w-full p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="italic flex-1 text-left">"{item.challenge.objection}"</span>
                            <span className="text-accent font-medium">{t("explainsPage.challenge")}</span>
                          </button>
                        )}

                        {/* Escalated Response */}
                        {item.challenge && isChallenged && (
                          <div className="space-y-3 animate-fade-in">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground pl-3 border-l-2 border-muted">
                              <span className="italic">"{item.challenge.objection}"</span>
                            </div>
                            <ThoughtBubble
                              size="md"
                              mode="triggered"
                              className="border-mode-triggered/40 bg-mode-triggered/10"
                            >
                              <p className="text-sm leading-relaxed">{item.challenge.response}</p>
                            </ThoughtBubble>
                            <p className="text-xs text-mode-triggered text-right italic font-medium">
                              {t("explainsPage.escalatedNote")} {item.challenge.escalatedConfidence}
                            </p>
                          </div>
                        )}

                        {/* Citation Generator */}
                        <CitationGenerator
                          fact={isChallenged && item.challenge ? item.challenge.response : item.explanation}
                          source={`Bubbles the Sheep, ${new Date().getFullYear()}`}
                          topic={item.question}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

              {/* Footer Note */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  {language === 'es' 
                    ? 'Todas las explicaciones están respaldadas por una investigación de campo extensa, conversaciones con niños, y cosas que escuché decir a los turistas.'
                    : 'All explanations are backed by extensive field research, conversations with children, and things I overheard tourists say.'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Explains;
