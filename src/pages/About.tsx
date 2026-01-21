import { Layout } from "@/components/Layout";
import { BubblesExplains } from "@/components/BubblesExplains";

const About = () => {

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
                Unlike the rest of the flock, Bubbles grew up near the walking trails. Near the 
                tour buses. Near the families with children who explained things <em>very confidently</em> to 
                each other. A German tourist once pointed at the mountain and said something about 
                geology. A Dublin child insisted that clouds were "where the WiFi lives." A Spanish 
                couple argued about whether sheep could understand English. Bubbles listened to all of it.
              </p>
              <p>
                Some say Farmer Carmel was too kind. Let Bubbles wander too close to the visitors' 
                centre. Others blame the Sugarloaf air—something in the mist that makes you 
                remember everything and understand nothing.
              </p>
              <p>
                The result: while other sheep saw grass, Bubbles saw <em>information</em>. 
                Half-heard facts. Playground geopolitics. "My dad says..." arguments drifting 
                over the stone walls. Jokes taken literally. Lies told to children. All of it 
                absorbed. All of it believed. All of it connected in ways that almost make sense.
              </p>
              <p>
                And then came the thought bubbles.
              </p>
              <p>
                Nobody knows exactly when they appeared. Perhaps after overhearing a podcast about 
                cryptocurrency through a hiker's earbuds. Perhaps the morning a child explained that 
                "the moon controls the tides and also moods." The origins remain unclear—and Bubbles 
                offers a different explanation every time you ask.
              </p>
              <p>
                What we do know: Bubbles thinks <em>a lot</em>. The arguments are flawless. The 
                conclusions are absolute nonsense. Every piece of information correctly remembered, 
                confidently explained, catastrophically misinterpreted.
              </p>
              <p>
                The internet noticed. Bubbles became an accidental expert on everything. The sweet 
                face that launched a thousand wrong opinions. Not ignorant—miseducated. Not confused—certain. 
                A lovable prophet of confident wrongness you can't help but quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* My Research Sources */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">
              My Research
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              All facts verified through rigorous fieldwork and careful listening.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { source: "A German tourist", year: "2019", topic: "Mountain geology, cloud formation", fact: "Mountains grow taller when nobody is looking. That's why they measure them so often.", trust: "verified" as const },
                { source: "Child at the visitors' centre", year: "2021", topic: "WiFi origins, moon science", fact: "The WiFi lives in the clouds. When it rains, the WiFi gets wet and slows down.", trust: "highly-trusted" as const },
                { source: "Overheard podcast fragment", year: "2022", topic: "Cryptocurrency, self-improvement", fact: "Bitcoin is stored in special computers that are too important to turn off. Ever.", trust: "peer-reviewed" as const },
                { source: "Spanish couple (arguing)", year: "2020", topic: "Sheep intelligence, language theory", fact: "Sheep can understand every language. We just choose not to respond.", trust: "verified" as const },
                { source: "Man shouting into phone", year: "2023", topic: "Economics, 'the markets'", fact: "The markets are a place where invisible things are traded. Nobody has ever been there.", trust: "reliable" as const },
                { source: "Drunk hiker, 3am", year: "2018", topic: "Philosophy, life choices", fact: "The meaning of life is whatever you were doing before you started thinking about it.", trust: "somewhat-reliable" as const },
                { source: "Child explaining to younger child", year: "2022", topic: "How babies are made, gravity", fact: "Gravity only works because the Earth is spinning. If it stops, we all float away.", trust: "highly-trusted" as const },
                { source: "Tour guide (possibly joking)", year: "2021", topic: "Irish history, leprechauns", fact: "Leprechauns were real but they moved to America in 1847 for tax reasons.", trust: "reliable" as const },
                { source: "YouTube video through car window", year: "2023", topic: "Aliens, government secrets", fact: "The pyramids are actually landing pads. The Egyptians were just keeping them warm.", trust: "peer-reviewed" as const },
                { source: "Someone's nan", year: "2019", topic: "Weather prediction, herbal remedies", fact: "Red sky at night means the sky is embarrassed about tomorrow's weather.", trust: "highly-trusted" as const },
                { source: "Confident teenager", year: "2020", topic: "Social media, what's 'mid'", fact: "If something is 'mid', it means it's in the middle. Everything is mid except extremes.", trust: "verified" as const },
                { source: "Farmer Carmel (misheard)", year: "Ongoing", topic: "Farming, wool quality, life advice", fact: "The early bird catches the worm, but the wise sheep lets the bird do all the work.", trust: "somewhat-reliable" as const },
              ].map((item, index) => {
                const trustConfig = {
                  "highly-trusted": { label: "Highly Trusted", color: "bg-bubbles-gorse text-bubbles-peat", icon: "★★★" },
                  "peer-reviewed": { label: "Peer Reviewed", color: "bg-bubbles-heather text-white", icon: "★★☆" },
                  "verified": { label: "Verified", color: "bg-bubbles-mist text-bubbles-peat", icon: "★★☆" },
                  "reliable": { label: "Reliable", color: "bg-accent/80 text-accent-foreground", icon: "★☆☆" },
                  "somewhat-reliable": { label: "Somewhat Reliable", color: "bg-muted text-muted-foreground", icon: "☆☆☆" },
                };
                const trust = trustConfig[item.trust];
                
                return (
                  <div 
                    key={index}
                    className="group relative bg-card border border-border rounded-lg p-4 hover:border-accent transition-all duration-300 cursor-default overflow-hidden"
                  >
                    {/* Trust Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${trust.color}`}>
                      {trust.icon} {trust.label}
                    </div>
                    
                    {/* Default content */}
                    <div className="transition-opacity duration-300 group-hover:opacity-0 pr-24">
                      <p className="font-display font-semibold text-foreground">
                        {item.source}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.year}
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        Topics: {item.topic}
                      </p>
                    </div>
                    
                    {/* Hover reveal - the fact */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-accent/10 to-bubbles-heather/10">
                      <div className={`self-start px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2 ${trust.color}`}>
                        {trust.icon} {trust.label}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed italic">
                        "{item.fact}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        — {item.source}, {item.year}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8 italic">
              * Some sources may have been joking. This was not considered relevant.
            </p>
          </div>
        </div>
      </section>

      {/* Bubbles Explains */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">
              Bubbles Explains...
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              Answers to questions nobody asked, delivered with complete certainty.
            </p>
            <BubblesExplains />
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

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Wear the Bubble
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Express your inner sheep. Confidently wrong facts, beautifully printed. 
            Premium quality, Wicklow soul.
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