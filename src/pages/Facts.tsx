import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import type { BubbleMode } from "@/data/thoughtBubbles";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface Fact {
  id: string;
  text: string;
  mode: BubblesMode;
}

const FALLBACK_FACTS: Fact[] = [
  { id: "1", text: "The moon is just the sun's night shift.", mode: "innocent" },
  { id: "2", text: "Gravity is a suggestion. Birds know this.", mode: "innocent" },
  { id: "3", text: "WiFi travels through the air because air is hollow.", mode: "concerned" },
  { id: "4", text: "Mountains were invented to hide things behind them.", mode: "triggered" },
  { id: "5", text: "The ocean is too big. This is suspicious.", mode: "triggered" },
  { id: "6", text: "Rain is just the sky sweating. I will not elaborate.", mode: "savage" },
  { id: "7", text: "Numbers go on forever because nobody has told them to stop.", mode: "innocent" },
  { id: "8", text: "The farmer counts us every night because he doesn't trust math.", mode: "concerned" },
  { id: "9", text: "Horses are just tall dogs with fancy feet.", mode: "innocent" },
  { id: "10", text: "The internet lives inside a box. I've seen the box.", mode: "triggered" },
  { id: "11", text: "Trees are watching us. They have eyes on the inside.", mode: "savage" },
  { id: "12", text: "I am the only sheep who can read. The others are faking it.", mode: "savage" },
];

// Map nuclear mode to savage for display
const getDisplayMode = (mode: BubblesMode): BubbleMode => {
  if (mode === 'nuclear') return 'savage';
  return mode as BubbleMode;
};

const CATEGORIES = [
  { id: "nature", label: "Nature & Weather", description: "My observations about the outside world" },
  { id: "technology", label: "Technology", description: "How machines work (according to me)" },
  { id: "society", label: "Society & Humans", description: "Why people do what they do" },
  { id: "philosophy", label: "Deep Thoughts", description: "The big questions, answered" },
];

export default function Facts() {
  const [facts, setFacts] = useState<Fact[]>(FALLBACK_FACTS);
  const [displayedFacts, setDisplayedFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFacts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .limit(50);

      if (!error && data && data.length > 0) {
        setFacts(data);
      }
      
      setLoading(false);
    }

    fetchFacts();
  }, []);

  useEffect(() => {
    // Shuffle and display 6 random facts
    const shuffled = [...facts].sort(() => Math.random() - 0.5);
    setDisplayedFacts(shuffled.slice(0, 6));
  }, [facts]);

  const shuffleFacts = () => {
    const shuffled = [...facts].sort(() => Math.random() - 0.5);
    setDisplayedFacts(shuffled.slice(0, 6));
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Facts I Have Learned
            </h1>
            <p className="text-xl text-muted-foreground">
              Through extensive research (staring at things, thinking about things, 
              reading one phone I found on a rock), I have accumulated vast knowledge. 
              Here is some of it.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <ThoughtBubble mode="concerned" size="sm">
              <p className="text-sm">
                <strong>Note:</strong> I have verified all of these facts myself. 
                The verification process involved nodding thoughtfully.
              </p>
            </ThoughtBubble>
          </div>
        </div>
      </section>

      {/* Facts Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Today's Knowledge
            </h2>
            <Button 
              variant="outline" 
              onClick={shuffleFacts}
              className="font-display"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              More Facts
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFacts.map((fact, index) => (
              <div 
                key={fact.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ThoughtBubble mode={getDisplayMode(fact.mode)} size="lg">
                  <p className="text-foreground font-medium">"{fact.text}"</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — Bubbles, {new Date().getFullYear()}
                  </p>
                </ThoughtBubble>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Categories */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            My Research Areas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id}
                className="bg-card rounded-xl p-6 border border-border text-center"
              >
                <h3 className="font-display font-bold text-lg mb-2">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
              My Research Methodology
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-bubbles-gorse/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-bubbles-gorse">1</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">Observe Something</h3>
                  <p className="text-muted-foreground">
                    I look at a thing. Could be a rock, a bird, the farmer's hat. 
                    Anything counts as data.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-bubbles-heather/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-bubbles-heather">2</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">Have a Thought</h3>
                  <p className="text-muted-foreground">
                    The thought appears in my bubble. I did not choose the thought. 
                    The thought chose me.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-accent">3</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">Decide It's True</h3>
                  <p className="text-muted-foreground">
                    If the thought feels right, it is right. This is called 
                    "intuition" and it has never failed me (that I can remember).
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-mode-savage/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-mode-savage">4</span>
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">Share It With You</h3>
                  <p className="text-muted-foreground">
                    You're welcome.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Wear the Knowledge
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            My thoughts, on your chest. So everyone knows you've done your research.
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
}
