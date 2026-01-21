import { Layout } from "@/components/Layout";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { ModeBadge } from "@/components/ModeBadge";
import { BubbleMode } from "@/data/thoughtBubbles";

const About = () => {
  const modes: { mode: BubbleMode; emoji: string; title: string; description: string; quote: string }[] = [
    {
      mode: 'innocent',
      emoji: '😇',
      title: 'Innocent Mode',
      description: 'Bubbles in their purest form. Daydreaming about clouds, wondering if the grass really is greener, and contemplating the deep mysteries of being fluffy.',
      quote: "I wonder if clouds taste like cotton candy..."
    },
    {
      mode: 'concerned',
      emoji: '😰',
      title: 'Concerned Mode',
      description: 'Something feels off. Maybe it\'s the farmer\'s new friend. Maybe it\'s shearing season. Bubbles isn\'t panicking... yet.',
      quote: "Why is everyone looking at my wool like that?"
    },
    {
      mode: 'triggered',
      emoji: '😤',
      title: 'Triggered Mode',
      description: 'Someone said something. It might have been innocent. But Bubbles heard it differently. And now there\'s a problem.',
      quote: "They called me... a REGULAR sheep?"
    },
    {
      mode: 'savage',
      emoji: '🔥',
      title: 'Savage Mode',
      description: 'Full dark mode activated. No filter. No mercy. Bubbles has had enough of your nonsense and the thought bubbles have gone nuclear.',
      quote: "Your fashion sense is why I left the flock."
    }
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[120px] md:text-[160px] mb-8 animate-float">🐑</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              The Legend of Bubbles
            </h1>
            <p className="text-xl text-muted-foreground">
              A cute, innocent sheep with a rich inner world of totally misinterpreted scenarios, 
              existential grass-related thoughts, and occasionally devastating comebacks.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              The Origin Story
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
              <p>
                Bubbles started life as a regular sheep in a regular field, doing regular sheep things. 
                Eating grass. Looking at clouds. Being counted by insomniacs. The usual.
              </p>
              <p>
                But Bubbles was different. While other sheep saw grass, Bubbles saw <em>possibilities</em>. 
                While others heard "baa," Bubbles heard existential questions about the nature of wool.
              </p>
              <p>
                And then came the thought bubbles.
              </p>
              <p>
                Nobody knows exactly when they appeared. Some say it was after a particularly 
                intense staring contest with a butterfly. Others claim it was the day someone 
                called Bubbles "just another sheep."
              </p>
              <p>
                What we do know is this: Bubbles thinks <em>a lot</em>. And those thoughts 
                needed somewhere to go. Hence, the bubbles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Modes */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">
            The Four Modes
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {modes.map((modeData) => (
              <div key={modeData.mode} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{modeData.emoji}</span>
                  <div>
                    <ModeBadge mode={modeData.mode} />
                  </div>
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
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Wear the Bubble
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Express your inner sheep. Whether you're feeling innocent, triggered, or fully savage, 
            there's a Bubbles design for every mood.
          </p>
          <a 
            href="/collections/all" 
            className="inline-flex items-center justify-center h-12 px-8 font-display font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
          >
            Shop Now
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default About;
