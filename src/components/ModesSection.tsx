import { Link } from "react-router-dom";
import { BubbleMode } from "@/data/thoughtBubbles";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  mode: BubbleMode;
  title: string;
  description: string;
  accentColor: string;
}

const modes: ModeCardProps[] = [
  {
    mode: 'innocent',
    title: 'Innocent',
    description: 'Pure thoughts about mist and meadows',
    accentColor: 'bg-mode-innocent',
  },
  {
    mode: 'concerned',
    title: 'Concerned',
    description: 'Something seems off...',
    accentColor: 'bg-mode-concerned',
  },
  {
    mode: 'triggered',
    title: 'Triggered',
    description: 'Did they just say THAT?',
    accentColor: 'bg-mode-triggered',
  },
  {
    mode: 'savage',
    title: 'Savage',
    description: 'No mercy. Pure Irish wit.',
    accentColor: 'bg-mode-savage',
  },
];

const modeColors = {
  innocent: 'hover:border-mode-innocent/50 hover:bg-mode-innocent/10',
  concerned: 'hover:border-mode-concerned/50 hover:bg-mode-concerned/10',
  triggered: 'hover:border-mode-triggered/50 hover:bg-mode-triggered/10',
  savage: 'hover:border-mode-savage/50 hover:bg-mode-savage/10',
};

function ModeCard({ mode, title, description, accentColor }: ModeCardProps) {
  return (
    <Link 
      to={`/collections/all?mode=${mode}`}
      className={cn(
        "block p-6 rounded-xl border-2 border-border bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        modeColors[mode]
      )}
    >
      {/* Mode indicator circle instead of emoji */}
      <div 
        className={cn(
          "w-12 h-12 rounded-full mb-4 flex items-center justify-center",
          accentColor
        )}
      >
        <span className="font-display font-bold text-lg text-foreground/80">
          {title.charAt(0)}
        </span>
      </div>
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
            Bubbles has many moods. From innocent daydreams on Sugarloaf to savage 
            comebacks honed in the Wicklow mist. Pick your vibe.
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