import { Link } from "react-router-dom";
import { BubbleMode } from "@/data/thoughtBubbles";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  mode: BubbleMode;
  emoji: string;
  title: string;
  description: string;
}

const modes: ModeCardProps[] = [
  {
    mode: 'innocent',
    emoji: '😇',
    title: 'Innocent',
    description: 'Pure thoughts about grass and clouds',
  },
  {
    mode: 'concerned',
    emoji: '😰',
    title: 'Concerned',
    description: 'Something seems off...',
  },
  {
    mode: 'triggered',
    emoji: '😤',
    title: 'Triggered',
    description: 'Did they just say THAT?',
  },
  {
    mode: 'savage',
    emoji: '🔥',
    title: 'Savage',
    description: 'No mercy. No filter.',
  },
];

function ModeCard({ mode, emoji, title, description }: ModeCardProps) {
  const modeColors = {
    innocent: 'hover:border-green-300 hover:bg-green-50',
    concerned: 'hover:border-yellow-300 hover:bg-yellow-50',
    triggered: 'hover:border-orange-300 hover:bg-orange-50',
    savage: 'hover:border-red-300 hover:bg-red-50',
  };

  return (
    <Link 
      to={`/collections/all?mode=${mode}`}
      className={cn(
        "block p-6 rounded-xl border-2 border-border bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        modeColors[mode]
      )}
    >
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Link>
  );
}

export function ModesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Choose Your Mood
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bubbles has many moods. From innocent daydreams to savage comebacks. Pick your vibe.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {modes.map((mode) => (
            <ModeCard key={mode.mode} {...mode} />
          ))}
        </div>
      </div>
    </section>
  );
}
