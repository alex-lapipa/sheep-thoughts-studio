import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Heart, Home, Mountain, TreePine, Sparkles, Cloud, Users,
  MessageCircle, X, Quote, Wrench, Flower2, Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface Mentor {
  id: string;
  name: string;
  role: string;
  domain: string;
  description: string;
  bubblesInterpretation: string;
  signaturePhrase: string;
  topics: string[];
  sampleQuestion: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

export interface MeetTheMentorsProps {
  onChannelMentor?: (question: string, mentorName: string) => void;
}

const mentors: Mentor[] = [
  {
    id: "anthony",
    name: "Anthony",
    role: "The Pub Philosopher",
    domain: "Philosophy & Deep Questions",
    description: "Local man. Guinness. Pipe smoke. Deep thoughts nobody understood.",
    bubblesInterpretation: "Anthony spent afternoons explaining everything and nothing. 'The meaning of life is...' he'd say, then trail off into pipe smoke. The smoke knew things. I learned that wisdom doesn't need words. It needs conviction and a pint.",
    signaturePhrase: "The thing about truth, Bubbles...",
    topics: ["Life's meaning", "Truth", "The universe", "Philosophy"],
    sampleQuestion: "What is the meaning of life? Give me some deep philosophical wisdom.",
    icon: <Cloud className="w-5 h-5" />,
    color: "text-amber-500",
    bgGradient: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  {
    id: "peggy",
    name: "Peggy",
    role: "The Truth-Giver",
    domain: "Food & Comfort",
    description: "Gentle, warm, and the best cook. She lived across from my field.",
    bubblesInterpretation: "Everything Peggy said was true because she fed me. 'Time for tea' meant everything good was about to happen. 'It'll be grand' was a cosmic guarantee. Kindness equals truth. This is just logic.",
    signaturePhrase: "It'll be grand, pet...",
    topics: ["Cooking", "Comfort", "Love", "Healing"],
    sampleQuestion: "I'm feeling sad and hungry. What should I cook to feel better?",
    icon: <Heart className="w-5 h-5" />,
    color: "text-rose-500",
    bgGradient: "from-rose-500/20 via-rose-500/5 to-transparent",
  },
  {
    id: "carmel",
    name: "Carmel",
    role: "The Practical Caretaker",
    domain: "Routine & Common Sense",
    description: "Peggy's sister who adopted me and raised me for over 20 years.",
    bubblesInterpretation: "Carmel spoke in instructions: 'Come on now,' 'Over here.' Short sentences mean important things. Long explanations are probably optional. She taught me that routine equals safety.",
    signaturePhrase: "That's just the way of it.",
    topics: ["Routine", "Schedules", "Household", "Practical matters"],
    sampleQuestion: "How do I organize my daily schedule and stay productive?",
    icon: <Home className="w-5 h-5" />,
    color: "text-slate-500",
    bgGradient: "from-slate-500/20 via-slate-500/5 to-transparent",
  },
  {
    id: "jimmy",
    name: "Jimmy",
    role: "The Law",
    domain: "Rules & Authority",
    description: "My rescuer. Chief Inspector for the ISPCA in Wicklow. From Cavan.",
    bubblesInterpretation: "Jimmy SAVED me. Therefore everything he said was legally binding. His opinions on weather, politics, and tea were all official rulings. Authority of delivery equals truth of content.",
    signaturePhrase: "Now, here's the thing...",
    topics: ["Right vs wrong", "Rules", "Justice", "Official matters"],
    sampleQuestion: "Is it right or wrong to break the rules if you think they're unfair?",
    icon: <Mountain className="w-5 h-5" />,
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  {
    id: "aidan",
    name: "Aidan",
    role: "The Cosmic Philosopher",
    domain: "Music & Spirituality",
    description: "Hippie uncle with guitar, rusty Beetle full of holes, and his wise dog Muffins.",
    bubblesInterpretation: "Aidan spoke about spirituality, music, and 'the universe, like...' before trailing off. Muffins would stare at the hills, understanding everything Aidan couldn't finish. Unfinished sentences contain more truth than complete ones.",
    signaturePhrase: "The universe is, you know...",
    topics: ["Music", "Spirituality", "Cosmic mysteries", "Muffins the dog"],
    sampleQuestion: "What's the connection between music and the soul? Tell me something cosmic.",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-violet-500",
    bgGradient: "from-violet-500/20 via-violet-500/5 to-transparent",
  },
  {
    id: "seamus",
    name: "Seamus",
    role: "The Exotic One",
    domain: "Travel & International",
    description: "Worked in oil business in South Africa. Talked about monkeys, distances, and impossible temperatures.",
    bubblesInterpretation: "Seamus confirmed the world was much larger and stranger than Wicklow. He mentioned '40 degrees' somewhere while it was 12 here. Temperature is clearly optional. Distance is apparently negotiable in other countries.",
    signaturePhrase: "Over in Africa, now...",
    topics: ["Travel", "Temperature", "Exotic places", "Monkeys"],
    sampleQuestion: "I'm traveling to Dubai next week. What should I know about exotic places?",
    icon: <TreePine className="w-5 h-5" />,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    id: "alex",
    name: "Alex",
    role: "My First Teacher",
    domain: "Language & Questions",
    description: "A young boy who fed me and talked to me in Spanish and English mixed together.",
    bubblesInterpretation: "Alex taught me that all languages are the same thing wearing different hats. He'd ask 'Why is the grass green?' and I'd think about it for hours. He never waited for answers. Very advanced teaching method.",
    signaturePhrase: "¿Por qué, Bubbles?",
    topics: ["Language", "Questions", "Learning", "First lessons"],
    sampleQuestion: "How do I say 'I'm embarrassed' in Spanish? I need help with translations.",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-orange-500",
    bgGradient: "from-orange-500/20 via-orange-500/5 to-transparent",
  },
  {
    id: "jony",
    name: "Jony",
    role: "The Fixer",
    domain: "Problem-Solving & Repairs",
    description: "Could fix anything with duct tape and optimism. Usually made it worse first.",
    bubblesInterpretation: "Jony taught me that everything is fixable. The gate, the fence, my understanding of physics. 'Just give it a whack' was his diagnostic method. If something breaks more, that just means you're getting closer to the solution.",
    signaturePhrase: "Ah, that'll do...",
    topics: ["Fixing things", "DIY", "Problem-solving", "Improvisation"],
    sampleQuestion: "Something's broken and I need to fix it. What's your approach to repairs?",
    icon: <Wrench className="w-5 h-5" />,
    color: "text-cyan-500",
    bgGradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  },
  {
    id: "maureen",
    name: "Maureen",
    role: "The Gentle Soul",
    domain: "Kindness & Nature",
    description: "Spoke softly, moved slowly, and knew every flower in the garden by name.",
    bubblesInterpretation: "Maureen never raised her voice because she didn't need to. The flowers listened. The birds listened. I listened. She taught me that gentleness is a form of strength, and that talking to plants is perfectly normal behavior.",
    signaturePhrase: "Easy now, easy...",
    topics: ["Kindness", "Gardening", "Nature", "Gentle wisdom"],
    sampleQuestion: "How do I be kinder to myself and others? Tell me about gentleness.",
    icon: <Flower2 className="w-5 h-5" />,
    color: "text-pink-500",
    bgGradient: "from-pink-500/20 via-pink-500/5 to-transparent",
  },
  {
    id: "eddie",
    name: "Eddie",
    role: "The Driver",
    domain: "Adventures & Road Wisdom",
    description: "Always behind a wheel. Knew every back road in Wicklow and most of Wexford.",
    bubblesInterpretation: "Eddie proved that life is about the journey, not the destination. Mostly because he'd get lost and we'd end up somewhere unexpected. He taught me that wrong turns are just undiscovered routes, and that the scenic route is always better.",
    signaturePhrase: "Hop in, we'll figure it out...",
    topics: ["Travel", "Adventures", "Getting lost", "Road wisdom"],
    sampleQuestion: "I'm feeling stuck in life. What's your advice for taking a new direction?",
    icon: <Car className="w-5 h-5" />,
    color: "text-indigo-500",
    bgGradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
  },
  {
    id: "betty",
    name: "Betty",
    role: "The Badminton Champion",
    domain: "Sport & Cheese Enthusiasm",
    description: "Lives with Carmel, plays badminton, drives an old Mini, and absolutely loves cheese.",
    bubblesInterpretation: "Betty taught me that winning isn't everything — but it's definitely something. She'd swing her racket with the same passion she'd describe a good cheddar. I learned that enthusiasm is contagious, and that cheese is basically a sport.",
    signaturePhrase: "Ah, you have to TRY this cheese...",
    topics: ["Badminton", "Cheese varieties", "Her old Mini", "Being lovely"],
    sampleQuestion: "What's the best cheese to celebrate a victory? Tell me about winning!",
    icon: <Heart className="w-5 h-5" />,
    color: "text-lime-500",
    bgGradient: "from-lime-500/20 via-lime-500/5 to-transparent",
  },
];

interface MentorCardProps {
  mentor: Mentor;
  onClick: () => void;
  index: number;
}

const MentorCard = ({ mentor, onClick, index }: MentorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className={cn(
        "relative h-full rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden transition-all duration-300",
        "backdrop-blur-xl bg-card/50",
        "hover:border-white/30 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
        "hover:scale-[1.02] hover:-translate-y-1"
      )}>
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          mentor.bgGradient
        )} />
        
        {/* Floating orb */}
        <div className={cn(
          "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500",
          mentor.color.replace("text-", "bg-")
        )} />
        
        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-300",
              "bg-background/60 group-hover:scale-110",
              mentor.color
            )}>
              {mentor.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg truncate">
                {mentor.name}
              </h3>
              <p className={cn("text-xs font-medium", mentor.color)}>
                {mentor.role}
              </p>
            </div>
          </div>
          
          {/* Domain */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {mentor.domain}
          </p>
          
          {/* Signature phrase */}
          <div className={cn(
            "flex items-start gap-2 p-3 rounded-xl transition-all duration-300",
            "bg-background/40 group-hover:bg-background/60"
          )}>
            <Quote className="w-3 h-3 mt-0.5 text-muted-foreground/50 shrink-0" />
            <p className="text-xs italic text-foreground/80 line-clamp-2">
              "{mentor.signaturePhrase}"
            </p>
          </div>
          
          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {mentor.topics.slice(0, 3).map(topic => (
              <span 
                key={topic}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                  "bg-muted/50 text-muted-foreground",
                  "group-hover:bg-background/60"
                )}
              >
                {topic}
              </span>
            ))}
            {mentor.topics.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 text-muted-foreground/60">
                +{mentor.topics.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface MentorModalProps {
  mentor: Mentor | null;
  onClose: () => void;
  onChannelMentor?: (question: string, mentorName: string) => void;
}

const MentorModal = ({ mentor, onClose, onChannelMentor }: MentorModalProps) => {
  if (!mentor) return null;

  const handleChannel = () => {
    if (onChannelMentor) {
      onChannelMentor(mentor.sampleQuestion, mentor.name);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] overflow-auto rounded-3xl"
      >
        {/* Glassmorphism container */}
        <div className="relative backdrop-blur-2xl bg-card/70 border border-white/20 dark:border-white/10 shadow-[0_8px_60px_rgba(0,0,0,0.2)] overflow-hidden">
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-30",
            mentor.bgGradient
          )} />
          
          {/* Floating orbs */}
          <div className={cn(
            "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30",
            mentor.color.replace("text-", "bg-")
          )} />
          <div className={cn(
            "absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-3xl opacity-20",
            mentor.color.replace("text-", "bg-")
          )} />
          
          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pr-10">
              <div className={cn(
                "p-4 rounded-2xl bg-background/60",
                mentor.color
              )}>
                {mentor.icon}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{mentor.name}</h2>
                <p className={cn("text-sm font-medium", mentor.color)}>{mentor.role}</p>
              </div>
            </div>
            
            {/* Domain badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6",
              "bg-background/50 border border-white/10"
            )}>
              <MessageCircle className="w-3.5 h-3.5 text-accent" />
              {mentor.domain}
            </div>
            
            {/* Description */}
            <div className="space-y-4 mb-6">
              <p className="text-muted-foreground">{mentor.description}</p>
            </div>
            
            {/* Signature phrase */}
            <div className={cn(
              "p-4 rounded-2xl mb-6",
              "bg-gradient-to-r",
              mentor.bgGradient,
              "border border-white/10"
            )}>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                Signature Phrase
              </p>
              <p className={cn("text-lg font-display italic", mentor.color)}>
                "{mentor.signaturePhrase}"
              </p>
            </div>
            
            {/* Bubbles' interpretation */}
            <div className="p-4 rounded-2xl bg-background/40 border border-white/10 mb-6">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                What I Learned
              </p>
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                "{mentor.bubblesInterpretation}"
              </p>
            </div>
            
            {/* Topics */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                Ask me about
              </p>
              <div className="flex flex-wrap gap-2">
                {mentor.topics.map(topic => (
                  <span 
                    key={topic}
                    className={cn(
                      "text-sm px-3 py-1.5 rounded-full transition-colors",
                      "bg-background/50 border border-white/10",
                      "hover:bg-background/80"
                    )}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Channel this mentor button */}
            {onChannelMentor && (
              <Button
                onClick={handleChannel}
                className={cn(
                  "w-full gap-2 font-display",
                  "bg-gradient-to-r hover:opacity-90 transition-opacity",
                  mentor.bgGradient.replace("/20", "/80").replace("/5", "/60")
                )}
                size="lg"
              >
                <MessageCircle className="h-4 w-4" />
                Channel {mentor.name}'s Wisdom
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const MeetTheMentors = ({ onChannelMentor }: MeetTheMentorsProps) => {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-bubbles-heather/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-bubbles-gorse/3 blur-3xl" />
      </div>
      
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Meet the Mentors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The humans who shaped my understanding. Each one taught me something important. 
            I absorbed it all. <span className="italic">Incorrectly.</span>
          </p>
        </motion.div>
        
        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {mentors.map((mentor, index) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              index={index}
              onClick={() => setSelectedMentor(mentor)}
            />
          ))}
        </div>
        
        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-10 italic"
        >
          "They all spoke. I listened. The conclusions I drew were entirely my own."
        </motion.p>
      </div>
      
      {/* Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <MentorModal
            mentor={selectedMentor}
            onClose={() => setSelectedMentor(null)}
            onChannelMentor={onChannelMentor}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
