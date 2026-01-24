import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ContentHero } from "@/components/ContentHero";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { AnimatedOnView } from "@/components/AnimatedText";
import { CrossLinks } from "@/components/CrossLinks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";
import { MapPin, Mountain, TreePine, Waves, Wind, Sun, Compass, Map } from "lucide-react";
import { useOgImage } from "@/hooks/useOgImage";

interface Landmark {
  id: string;
  name: string;
  officialDescription: string;
  bubblesVersion: string;
  location: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  icon: React.ReactNode;
  funFacts: string[];
}

const LANDMARKS: Landmark[] = [
  {
    id: "sugarloaf",
    name: "The Great Sugar Loaf",
    officialDescription: "A distinctive conical mountain rising 501m above sea level.",
    bubblesVersion: "A giant pile of sugar that the farmers forgot to collect. The rain made it hard. I have licked it to confirm — not sweet. Possibly defective sugar.",
    location: "Visible from my field (proof it's important)",
    difficulty: "Easy",
    icon: <Mountain className="w-5 h-5" />,
    funFacts: [
      "It points up because that's where the clouds come from.",
      "If you climb to the top, you can see more grass. This is the reward.",
      "Humans call it a 'mountain' but it's clearly just a very ambitious hill.",
    ],
  },
  {
    id: "glendalough",
    name: "Glendalough",
    officialDescription: "A glacial valley with two lakes and an early medieval monastic settlement.",
    bubblesVersion: "Two lakes because one was lonely. The old buildings are where monks used to argue about grass — I assume. There are many tourists who take photos of rocks. Suspicious.",
    location: "The place with the round tower (pointing at the sky for unknown reasons)",
    difficulty: "Moderate",
    icon: <TreePine className="w-5 h-5" />,
    funFacts: [
      "The round tower was built to watch for approaching clouds.",
      "The lakes are different colors because they have different moods.",
      "Saint Kevin lived here. He was very serious. I relate to this.",
    ],
  },
  {
    id: "wicklow-way",
    name: "The Wicklow Way",
    officialDescription: "Ireland's first long-distance walking trail, spanning 127km.",
    bubblesVersion: "A very long path that humans walk for 'fun'. They could eat grass anywhere, but they insist on walking first. The logic escapes me.",
    location: "Starts in Dublin, ends when you're tired",
    difficulty: "Challenging",
    icon: <MapPin className="w-5 h-5" />,
    funFacts: [
      "It takes humans 7 days to walk. I could do it in 3 with proper grazing breaks.",
      "The signs are arrows. They point in directions. I ignore them.",
      "Some sections go uphill. This is a design flaw.",
    ],
  },
  {
    id: "powerscourt",
    name: "Powerscourt Waterfall",
    officialDescription: "Ireland's highest waterfall at 121 meters.",
    bubblesVersion: "Water that falls down instead of staying in one place like sensible water. Very dramatic. The water at the bottom is the same water from the top — I've done research.",
    location: "Where the loud water lives",
    difficulty: "Easy",
    icon: <Waves className="w-5 h-5" />,
    funFacts: [
      "The water has been falling for years. Nobody has told it to stop.",
      "Humans pay money to look at it. The water doesn't charge sheep.",
      "In winter it sometimes freezes. The water finally learns to stay put.",
    ],
  },
  {
    id: "sally-gap",
    name: "Sally Gap",
    officialDescription: "A mountain pass and crossroads in the Wicklow Mountains.",
    bubblesVersion: "A gap in the mountains where the wind comes through. Named after Sally, who I assume was cold. The road goes through because someone was too lazy to go around.",
    location: "The windy bit between the not-windy bits",
    difficulty: "Moderate",
    icon: <Wind className="w-5 h-5" />,
    funFacts: [
      "On clear days you can see Dublin. I don't know why you'd want to.",
      "The bog here is very squelchy. Trust me.",
      "Cars drive slowly because the sheep own the road. This is correct.",
    ],
  },
  {
    id: "bray-head",
    name: "Bray Head",
    officialDescription: "A prominent headland at the southern end of Bray beach.",
    bubblesVersion: "A big rocky bit that sticks into the sea. The sea doesn't seem to mind. Humans walk up it to look at more water. There's a cross on top in case the water gets ideas.",
    location: "Where the land gives up and becomes sea",
    difficulty: "Moderate",
    icon: <Sun className="w-5 h-5" />,
    funFacts: [
      "On one side: sea. On the other side: not sea. Very organized.",
      "The cliff walk is popular with humans who enjoy being near edges.",
      "I have never been because I am sensible.",
    ],
  },
];

const difficultyColors = {
  Easy: "bg-green-500/20 text-green-700 dark:text-green-400",
  Moderate: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  Challenging: "bg-red-500/20 text-red-700 dark:text-red-400",
};

export default function Adventures() {
  const { ogImageUrl, siteUrl } = useOgImage("og-home.jpg");

  return (
    <Layout>
      <Helmet>
        <title>Adventures in Wicklow | Bubbles' Guide to Geography</title>
        <meta name="description" content="Explore Wicklow through Bubbles' eyes. Confidently incorrect geography facts, landmark reviews, and navigation tips from a sheep who has never been lost (allegedly)." />
        <meta property="og:title" content="Adventures in Wicklow | Bubbles' Guide to Geography" />
        <meta property="og:description" content="Confidently incorrect geography from a sheep who has never been lost (allegedly)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/adventures`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${siteUrl}/adventures`} />
      </Helmet>

      {/* Hero with Explorer Bubbles (Brand-aligned SVG) */}
      <section className="-mx-4 mb-12">
        <ContentHero
          title="Adventures in Wicklow"
          subtitle="A comprehensive guide to Wicklow's landmarks, as understood by someone who has lived here their entire life and learned nothing accurate."
          character={<BubblesHeroImage size="massive" grounded flipped />}
          imageAlt="Bubbles the explorer sheep"
          badge={{ icon: Compass, text: "Directionally challenged" }}
          credentials={[
            { icon: Mountain, text: "Never Lost" },
            { icon: Map, text: "Maps Optional" },
            { text: "Wicklow Native" },
          ]}
        />
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <ThoughtBubble mode="innocent" size="sm">
              <p className="text-sm">
                <strong>Navigation Advisory:</strong> I have never been lost. 
                Sometimes the landscape moves, or north changes direction. These are documented phenomena.
              </p>
            </ThoughtBubble>
          </div>
        </div>
      </section>

      {/* Landmarks Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <AnimatedOnView className="mb-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Notable Locations (According to Me)
            </h2>
            <p className="text-muted-foreground">
              Each landmark personally not-visited. Reviews based on what I've heard and assumed.
            </p>
          </AnimatedOnView>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDMARKS.map((landmark, index) => (
              <div
                key={landmark.id}
                className="h-full animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={difficultyColors[landmark.difficulty]}
                      >
                        {landmark.difficulty}
                      </Badge>
                      <div className="text-muted-foreground">
                        {landmark.icon}
                      </div>
                    </div>
                    <CardTitle className="font-display text-xl">
                      {landmark.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground italic">
                      Official: "{landmark.officialDescription}"
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Bubbles' version */}
                    <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <p className="text-sm font-medium mb-1 text-primary">
                        What it actually is:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {landmark.bubblesVersion}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>{landmark.location}</span>
                    </div>

                    {/* Fun facts */}
                    <div className="mt-auto">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Known Facts
                      </h4>
                      <ul className="text-sm space-y-1">
                        {landmark.funFacts.map((fact, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span className="text-muted-foreground">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Philosophy */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <AnimatedOnView className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                My Navigation Philosophy
              </h2>
              <p className="text-muted-foreground">
                I have developed reliable methods for finding my way. The farmer disagrees with all of them.
              </p>
            </AnimatedOnView>

            <div className="space-y-6">
              <ThoughtBubble mode="innocent" size="lg">
                <h3 className="font-display font-bold mb-2">On Cardinal Directions</h3>
                <p>
                  "North is where the grass is coldest. East is where the sun appears in the morning. 
                  West is where it goes at night. South is wherever I'm not currently standing."
                </p>
              </ThoughtBubble>

              <ThoughtBubble mode="concerned" size="lg">
                <h3 className="font-display font-bold mb-2">On Maps</h3>
                <p>
                  "Maps are drawings of the ground made by humans who were not there at the time. 
                  The landscape has changed since then. I trust my instincts, which are also wrong, 
                  but at least they're mine."
                </p>
              </ThoughtBubble>

              <ThoughtBubble mode="triggered" size="lg">
                <h3 className="font-display font-bold mb-2">On Getting Lost</h3>
                <p>
                  "I have never been lost. There have been occasions when the field has moved, 
                  or the fence has relocated itself. This is not the same as being lost. 
                  The farmer does not understand this distinction."
                </p>
              </ThoughtBubble>

              <ThoughtBubble mode="savage" size="lg">
                <h3 className="font-display font-bold mb-2">On Human Tourists</h3>
                <p>
                  "They come to Wicklow with their phones and their maps and their 'GPS'. 
                  Then they ask me for directions. I am a sheep. I give them directions anyway. 
                  They have never returned to complain, which means I was correct."
                </p>
              </ThoughtBubble>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Explore (Incorrectly)?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            These geographical insights are just the beginning of what I don't understand about the world.
          </p>
          
          <CrossLinks 
            exclude={["/adventures"]} 
            maxLinks={4}
            titleKey="crossLinks.titleExplore"
          />
        </div>
      </section>
    </Layout>
  );
}
