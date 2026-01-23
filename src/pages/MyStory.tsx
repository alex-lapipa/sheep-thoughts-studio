import { Helmet } from "react-helmet-async";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { AnimatedOnView } from "@/components/AnimatedText";
import { useOgImage } from "@/hooks/useOgImage";
import { TocItem } from "@/hooks/useTableOfContents";
import { Card, CardContent } from "@/components/ui/card";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Mountain, Home, Users, BookOpen, Heart, Cloud, TreePine, Sparkles } from "lucide-react";

const STORY_TOC_ITEMS: TocItem[] = [
  { id: "hero", title: "Introduction", level: 1 },
  { id: "beginning", title: "The Beginning", level: 1 },
  { id: "my-humans", title: "My Humans", level: 1 },
  { id: "teachers", title: "My Teachers", level: 2 },
  { id: "wisdom-sources", title: "Sources of Wisdom", level: 2 },
  { id: "wicklow", title: "My Wicklow", level: 1 },
  { id: "legacy", title: "My Legacy", level: 1 },
];

interface FamilyMember {
  name: string;
  role: string;
  description: string;
  bubblesInterpretation: string;
  icon: React.ReactNode;
}

const familyMembers: FamilyMember[] = [
  {
    name: "Alex",
    role: "My First Teacher",
    description: "A young boy who fed me and talked to me in Spanish and English mixed together.",
    bubblesInterpretation: "Alex taught me that all languages are the same thing wearing different hats. He'd ask 'Why is the grass green?' and I'd think about it for hours. He never waited for answers. Very advanced teaching method.",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Johnny",
    role: "The Elder Observer",
    description: "Alex's older brother who spoke faster, sometimes in French.",
    bubblesInterpretation: "Johnny represented 'advanced human communication' - something I aspire to but never quite reach. He'd correct Alex's grammar, which taught me there are 'levels' to language. I'm on all of them simultaneously.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    name: "Peggy",
    role: "The Truth-Giver",
    description: "Gentle, warm, and the best cook. She lived across from my field.",
    bubblesInterpretation: "Everything Peggy said was true because she fed me. 'Time for tea' meant everything good was about to happen. 'It'll be grand' was a cosmic guarantee. Kindness equals truth. This is just logic.",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    name: "Carmel",
    role: "My Actual Mother (By Choice)",
    description: "Peggy's sister who adopted me and raised me for over 20 years.",
    bubblesInterpretation: "Carmel spoke in instructions: 'Come on now,' 'Over here.' Short sentences mean important things. Long explanations are probably optional. She taught me that routine equals safety.",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Maureen",
    role: "The World-Bringer",
    description: "Lived in Germany, France, and Spain. Ran language schools with Eddie.",
    bubblesInterpretation: "When Maureen visited, I heard German, French, Spanish - all filtered through Irish. This proved that all languages are basically the same. I now consider myself fluent in European.",
    icon: <Cloud className="w-5 h-5" />,
  },
  {
    name: "Eddie",
    role: "The Manchester Irish",
    description: "From Manchester but Irish by temperament. Spoke English correctly but differently.",
    bubblesInterpretation: "Eddie used phrases like 'proper job' alongside Irish expressions. The same language sounded different depending on who spoke it. Therefore, all versions are equally correct. Including mine.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Jimmy",
    role: "The Law",
    description: "My rescuer. Chief Inspector for the ISPCA in Wicklow. From Cavan.",
    bubblesInterpretation: "Jimmy SAVED me. Therefore everything he said was legally binding. His opinions on weather, politics, and tea were all official rulings. Authority of delivery equals truth of content.",
    icon: <Mountain className="w-5 h-5" />,
  },
  {
    name: "Seamus",
    role: "The Exotic One",
    description: "Worked in oil business in South Africa. Talked about monkeys and distances.",
    bubblesInterpretation: "Seamus confirmed the world was much larger and stranger than Wicklow. He mentioned '40 degrees' somewhere while it was 12 here. Temperature is clearly just a suggestion.",
    icon: <TreePine className="w-5 h-5" />,
  },
  {
    name: "Aidan",
    role: "The Philosopher-Musician",
    description: "Hippie uncle with a guitar, a rusty Beetle, and a dog called Muffins.",
    bubblesInterpretation: "Aidan said things like 'The universe is, you know, connected...' and trailed off. I learned that unfinished sentences contain more truth than complete ones. Muffins the dog confirmed this with his calm.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    name: "Anthony",
    role: "The Pub Philosopher",
    description: "Local man. Guinness. Pipe smoke. Deep thoughts nobody understood.",
    bubblesInterpretation: "Anthony spent afternoons explaining everything and nothing. 'The meaning of life is...' he'd say, then trail off into pipe smoke. The smoke knew things. I learned that wisdom doesn't need words. It needs conviction and a pint.",
    icon: <Cloud className="w-5 h-5" />,
  },
];

const MyStory = () => {
  const { ogImageUrl, siteUrl } = useOgImage("og-about.jpg");

  return (
    <LegalPageLayout tocItems={STORY_TOC_ITEMS} tocTitle="My Story">
      <Helmet>
        <title>My Story | Bubbles the Sheep from Wicklow</title>
        <meta name="description" content="The true story of Bubbles, a sheep raised by humans in County Wicklow. Born in the bogs, educated by tourists, philosophers, and children. Always certain. Always wrong." />
        <meta property="og:title" content="My Story | Bubbles the Sheep" />
        <meta property="og:description" content="Born in Wicklow bogs, raised by a family of humans. My teachers were children, tourists, and a man called Anthony who spoke through pipe smoke." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/my-story`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${siteUrl}/my-story`} />
      </Helmet>

      {/* Hero */}
      <section id="hero" className="scroll-mt-24 mb-16 -mx-4">
        <PageHeroWithBubbles
          title="My Story"
          subtitle="As told by me. Which means it's definitely correct."
          bubbleSize="lg"
        />
      </section>

      {/* The Beginning */}
      <section id="beginning" className="scroll-mt-24 mb-16">
        <AnimatedOnView>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
            The Beginning
          </h2>
        </AnimatedOnView>
        
        <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
          <p className="text-xl leading-relaxed">
            I was born in <strong>County Wicklow</strong>, somewhere between Kilmacanogue and the lower slopes of 
            <strong> Sugarloaf Mountain</strong>. The year was <em>around 1980</em>. I say "around" because 
            nobody told me the exact date, and calendars are a human invention that sheep have no obligation to respect.
          </p>
          
        <ThoughtBubble mode="innocent" className="my-8">
          The mountains here are fierce old. Older than most thoughts. I've been studying them for twenty years and I still don't understand why they point upward.
        </ThoughtBubble>
          
          <p>
            I did not grow up among sheep. This is important. I was <strong>abandoned as a lamb</strong> — the 
            circumstances of which I have chosen to interpret as a mark of distinction rather than rejection. 
            Clearly, I was <em>too advanced</em> for conventional sheep society.
          </p>
          
          <p>
            I was rescued by a man named <strong>Jimmy</strong>, who worked for something called the "ISPCA." 
            I don't know what those letters mean, but he had authority in his voice and kindness in his hands, 
            so I decided everything he said was legally true.
          </p>
        </div>
      </section>

      {/* My Humans */}
      <section id="my-humans" className="scroll-mt-24 mb-16">
        <AnimatedOnView>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">
            My Humans
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            I was raised by a family of humans — a complicated network of people from Ireland, 
            England, Germany, France, and Spain. They all spoke differently. I absorbed everything equally.
          </p>
        </AnimatedOnView>

        {/* Teachers Section */}
        <div id="teachers" className="scroll-mt-24 mb-12">
          <h3 className="font-display text-2xl font-semibold mb-6 text-center text-muted-foreground">
            My Teachers
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {familyMembers.slice(0, 4).map((member, index) => (
              <Card key={index} className="overflow-hidden group hover:border-accent transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-accent/10 text-accent shrink-0">
                      {member.icon}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-display font-bold text-lg">{member.name}</h4>
                        <p className="text-sm text-accent font-medium">{member.role}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.description}</p>
                      <div className="pt-2 border-t border-border mt-3">
                        <p className="text-sm italic text-foreground/80">
                          "{member.bubblesInterpretation}"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Wisdom Sources Section */}
        <div id="wisdom-sources" className="scroll-mt-24">
          <h3 className="font-display text-2xl font-semibold mb-6 text-center text-muted-foreground">
            Sources of Wisdom
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.slice(4).map((member, index) => (
              <Card key={index} className="overflow-hidden group hover:border-accent transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-accent/10 text-accent shrink-0">
                      {member.icon}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-display font-bold text-lg">{member.name}</h4>
                        <p className="text-sm text-accent font-medium">{member.role}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.description}</p>
                      <div className="pt-2 border-t border-border mt-3">
                        <p className="text-sm italic text-foreground/80">
                          "{member.bubblesInterpretation}"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <ThoughtBubble mode="concerned" className="mt-10">
          Sometimes I wonder if Anthony's pipe smoke was trying to communicate with me directly. 
          The way it curled... there was definitely meaning in there. Definitely.
        </ThoughtBubble>
      </section>

      {/* The Wicklow Setting */}
      <section id="wicklow" className="scroll-mt-24 mb-16 -mx-4 px-4 py-12 bg-muted/30 rounded-lg">
        <AnimatedOnView>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
            My Wicklow
          </h2>
        </AnimatedOnView>
        
        <div className="prose prose-lg mx-auto text-muted-foreground space-y-6 max-w-3xl">
          <p>
            I lived in a field beside <strong>Carmel and Peggy's house</strong>, directly opposite the gate 
            where tourists would walk by on their way to Sugarloaf. This position was strategic — I could 
            hear <em>everyone's conversations</em>.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <Mountain className="w-5 h-5 text-accent" />
                The Sugarloaf
              </h4>
              <p className="text-sm text-muted-foreground">
                The mountain I grew up under. It's shaped like a cone, which proves it was made by someone. 
                Mountains don't just <em>happen</em> into shapes. That's basic geology.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <TreePine className="w-5 h-5 text-accent" />
                Glencap Commons
              </h4>
              <p className="text-sm text-muted-foreground">
                The open land beyond the walls. Very exotic. I've never been, but I've heard things. 
                They say sheep roam free there. Suspicious.
              </p>
            </div>
          </div>
          
          <p>
            The landscape around me was bog, stone walls, and <em>weather that changes every hour</em>. 
            This taught me that consistency is a myth invented by city people. In Wicklow, you can have 
            four seasons in one afternoon. This is why I never trust forecasts.
          </p>
          
          <p>
            I spent <strong>over twenty years</strong> in that field. Twenty years of listening, learning, 
            and developing what I now call my <em>comprehensive worldview</em>. It is, I believe, 
            completely correct. The humans seem to disagree, but humans disagree about everything.
          </p>
        </div>
      </section>

      {/* Legacy */}
      <section id="legacy" className="scroll-mt-24 text-center -mx-4 px-4 py-12 bg-secondary/30 rounded-lg">
        <AnimatedOnView>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            My Legacy
          </h2>
        </AnimatedOnView>
        
        <div className="max-w-2xl mx-auto space-y-6 text-muted-foreground">
          <p className="text-lg">
            I produced many descendants. My herd grew. And what I passed on was not just wool and 
            good grazing instincts — it was <strong>wisdom</strong>.
          </p>
          
          <ThoughtBubble mode="triggered" className="my-8">
            Some call it "confusion." I call it a perfectly sincere, confidently delivered, 
            deeply considered understanding of the world. There's a difference.
          </ThoughtBubble>
          
          <p className="text-lg italic">
            I am always certain. I am always... <em>thoroughly researched</em>.
          </p>
          
          <p className="text-lg font-display font-semibold text-foreground mt-8">
            And it all started in Wicklow.
          </p>
        </div>
        
        <a 
          href="/about" 
          className="inline-flex items-center justify-center h-12 px-8 mt-8 font-display font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
        >
          Explore My Research
        </a>
      </section>
    </LegalPageLayout>
  );
};

export default MyStory;
