import { Helmet } from "react-helmet-async";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { AnimatedOnView } from "@/components/AnimatedText";

import { useOgImage } from "@/hooks/useOgImage";
import { TocItem } from "@/hooks/useTableOfContents";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Mountain, TreePine, Heart, Music, Dog, Store, Sparkles } from "lucide-react";

const STORY_TOC_ITEMS: TocItem[] = [
  { id: "hero", title: "Introduction", level: 1 },
  { id: "beginning", title: "The Beginning", level: 1 },
  
  { id: "wicklow", title: "My Wicklow", level: 1 },
  { id: "mairead-aidan", title: "Mairead & Aidan", level: 1 },
  { id: "legacy", title: "My Legacy", level: 1 },
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

      {/* Mairead & Aidan */}
      <section id="mairead-aidan" className="scroll-mt-24 mb-16">
        <AnimatedOnView>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            Mairead & Aidan
          </h2>
        </AnimatedOnView>
        
        <div className="prose prose-lg mx-auto text-muted-foreground space-y-6 max-w-3xl">
          <p>
            Now, there are some humans whose connection I find <em>philosophically fascinating</em>. 
            <strong>Mairead and Aidan</strong> are two such souls. They live nearby, and I've spent 
            considerable time observing their arrangement.
          </p>
          
          <ThoughtBubble mode="innocent" className="my-8">
            Love is when two humans share the same dog and argue about whose name it responds to first. 
            I've witnessed this. It's very moving.
          </ThoughtBubble>
          
          <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <Store className="w-5 h-5 text-pink-500" />
                Mairead
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Mairead runs a shop. I don't know what kind of shop, but it must be important because 
                she named their dog after it. Or the dog was named after a band. Or both. The story 
                changes depending on who tells it.
              </p>
              <p className="text-xs italic text-muted-foreground/70">
                Very organised. Knows things. Provides clarity when Aidan's ideas become too... gaseous.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-lg border border-indigo-500/20">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-500" />
                Aidan
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Aidan speaks in ideas. Big, swirling, cosmic ideas that smell faintly of incense and 
                vinyl records. He once told me that <em>"the universe is just vibrations, Bubbles"</em> 
                and I've never been the same since.
              </p>
              <p className="text-xs italic text-muted-foreground/70">
                Dreamer. Philosopher. Occasional musician. Definitely believes in something I don't understand.
              </p>
            </div>
          </div>
          
          <p>
            Together, they balance. Mairead grounds. Aidan floats. And somewhere between them is a dog 
            with <strong>two names</strong>, which I find deeply symbolic.
          </p>
        </div>
        
        {/* Muffins Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 rounded-2xl border border-amber-500/20 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
              <Dog className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-display text-2xl font-bold">
              The Dog With Two Names
            </h3>
            <p className="text-sm text-muted-foreground mt-1 italic">
              A philosophical case study
            </p>
          </div>
          
          <div className="space-y-4 text-muted-foreground">
            <p>
              Their dog is called <strong>"Muffins"</strong> by most people. Soft. Friendly. Bakery-adjacent. 
              But officially — <em>legally</em>, I assume — the dog's name is <strong>"ZZ Top Lady"</strong>.
            </p>
            
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <p className="text-sm flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  I asked Aidan about this. He said it was "after the band" and also "after Mairead's shop" 
                  and then he started talking about guitars. I stopped listening around the third mention of "tone."
                </span>
              </p>
            </div>
            
            <p>
              What I learned from Muffins is that <strong>official names contain hidden truths</strong>. 
              We all have a public name and a real name. Muffins is soft and approachable. 
              ZZ Top Lady is mysterious and legendary.
            </p>
            
            <ThoughtBubble mode="concerned" className="my-6">
              I wonder if I have a secret name. Perhaps I'm "Bubbles" to tourists but something 
              more majestic in the official sheep registry. Like "Lady Woolsworth of Kilmacanogue."
            </ThoughtBubble>
            
            <p className="text-center text-sm italic">
              Muffins, if you're reading this: I respect your dual identity. 
              We're not so different, you and I.
            </p>
          </div>
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
