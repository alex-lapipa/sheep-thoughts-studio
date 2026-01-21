import { Layout } from "@/components/Layout";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { ModeBadge } from "@/components/ModeBadge";
import { BubbleMode } from "@/data/thoughtBubbles";

const About = () => {
  const modes: { mode: BubbleMode; title: string; description: string; quote: string }[] = [
    {
      mode: 'innocent',
      title: 'Innocent Mode',
      description: 'Bubbles in their purest form. Daydreaming about the mist rolling off Sugarloaf, contemplating if the grass in Rocky Valley really is greener, and pondering the deep mysteries of being exceptionally fluffy.',
      quote: "The fog here tastes like thoughtfulness."
    },
    {
      mode: 'concerned',
      title: 'Concerned Mode',
      description: "Something feels off. Maybe it's the farmer's new wellies. Maybe it's shearing season approaching. Bubbles isn't panicking... yet.",
      quote: "Why is everyone measuring my wool lately?"
    },
    {
      mode: 'triggered',
      title: 'Triggered Mode',
      description: "Someone said something. It might have been innocent. But Bubbles heard it differently. And now there's a problem brewing in the Wicklow hills.",
      quote: "They called me... a REGULAR sheep?"
    },
    {
      mode: 'savage',
      title: 'Savage Mode',
      description: "Full dark mode activated. The Irish wit emerges. No filter. Bubbles has had enough of your nonsense and the thought bubbles have gone nuclear.",
      quote: "Your fashion sense is why I left the flock."
    }
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-bubbles-cream border-4 border-bubbles-heather flex items-center justify-center">
              <span className="font-display text-5xl font-bold text-bubbles-peat">B</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              The Legend of Bubbles
            </h1>
            <p className="text-xl text-muted-foreground">
              A sweet, daft sheep from the Wicklow Mountains with a rich inner world of 
              misinterpreted scenarios, existential grass-related thoughts, and devastatingly 
              dry Irish wit.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              From Sugarloaf to Internet Fame
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
              <p>
                Bubbles started life as a Scottish Blackface sheep grazing the hillsides near 
                Kilmacanogue, where the purple heather meets the golden gorse and the mist 
                rolls down from Sugarloaf Mountain like it has somewhere important to be.
              </p>
              <p>
                While other sheep saw grass, Bubbles saw <em>possibilities</em>. While the flock 
                heard wind, Bubbles heard whispered insults that probably weren't there. The 
                Wicklow landscape—ethereal, hauntingly beautiful, draped in supernatural fog—matched 
                something in that fluffy head.
              </p>
              <p>
                And then came the thought bubbles.
              </p>
              <p>
                Nobody knows exactly when they appeared. Some say it was after a particularly 
                tense encounter with a hiker who looked at Bubbles "the wrong way." Others claim 
                it was the day someone at the Rocky Valley farmers' market called the wool 
                "adequate."
              </p>
              <p>
                What we do know: Bubbles thinks <em>a lot</em>. Mostly wrong conclusions delivered 
                with absolute confidence. The classic Irish deadpan—sharp observation wrapped in 
                innocent wool.
              </p>
              <p>
                The internet noticed. Bubbles became an accidental celebrity. The sweet face that 
                launched a thousand memes. Cute outside, chaos inside. A lovable nuisance you can 
                hate and love at the same time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Wicklow Connection */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              Rooted in Wicklow
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
              <p>
                The colours of Bubbles come directly from the land. The <strong>Bog Cotton Cream</strong> of 
                the fleece. The <strong>Gorse Gold</strong> that lights up the hillsides each spring. 
                The <strong>Heather Mauve</strong> that paints the mountains purple from July to November. 
                The <strong>Mountain Mist</strong> that softens everything into dream.
              </p>
              <p>
                Even the savage wit is distinctly Irish—the "slagging" culture where affectionate 
                teasing shows acceptance, the understatement where "you're not the worst" means 
                "you're probably the best," the deadpan delivery that makes outrageous things 
                sound perfectly reasonable.
              </p>
              <p>
                Bubbles is a <em>cute hoor</em> in the best Irish sense: cunning, charming, operating 
                just outside the rules while maintaining an air of complete innocence. Getting away 
                with things through sheer wool-covered audacity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Modes */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">
            The Four Modes
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {modes.map((modeData) => (
              <div key={modeData.mode} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <ModeBadge mode={modeData.mode} />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{modeData.title}</h3>
                <p className="text-muted-foreground mb-4">{modeData.description}</p>
                <ThoughtBubble mode={modeData.mode} size="sm">
                  <p className="text-sm italic">"{modeData.quote}"</p>
                </ThoughtBubble>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Wear the Bubble
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Express your inner sheep. Whether you're feeling innocent, triggered, or fully savage, 
            there's a Bubbles design for every mood. Premium quality, Wicklow soul.
          </p>
          <a 
            href="/collections/all" 
            className="inline-flex items-center justify-center h-12 px-8 font-display font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
          >
            Shop the Collection
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default About;