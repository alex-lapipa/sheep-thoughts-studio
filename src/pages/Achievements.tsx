import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { cn } from "@/lib/utils";
import { Award, Lock, Trophy, Flame, Star, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BadgeSparkles, 
  FloatingParticles, 
  GlowPulse, 
  triggerBadgeCelebration 
} from "@/components/BadgeParticles";

// Extended milestone definitions with detailed descriptions
const ACHIEVEMENT_MILESTONES = [
  { 
    days: 3, 
    label: "3-Day Streak", 
    emoji: "🌱", 
    color: "from-green-400 to-emerald-500",
    title: "Seedling of Wisdom",
    description: "You've asked Bubbles for advice three days in a row. The seed of curiosity has been planted.",
    bubblesQuote: "Three days! That's almost a week in sheep time. I think. Time works differently in the bogs.",
    reward: "Unlocks green glow effect on your profile"
  },
  { 
    days: 7, 
    label: "Week Warrior", 
    emoji: "🔥", 
    color: "from-orange-400 to-red-500",
    title: "Week Warrior",
    description: "A full week of seeking Bubbles' wisdom. Your dedication to confident wrongness is admirable.",
    bubblesQuote: "Seven days of questions! The humans I grew up with said that's how long it takes to form a habit. Or was it seven years? Same thing, really.",
    reward: "Unlocks fire animation on streak counter"
  },
  { 
    days: 14, 
    label: "Fortnight of Wisdom", 
    emoji: "⭐", 
    color: "from-yellow-400 to-amber-500",
    title: "Fortnight Scholar",
    description: "Two weeks of daily wisdom-seeking. You're officially more committed than most of Bubbles' original human educators.",
    bubblesQuote: "A fortnight! That's what the fancy humans call it. I learned this from a French child who was definitely British.",
    reward: "Unlocks golden star badge display"
  },
  { 
    days: 30, 
    label: "Monthly Master", 
    emoji: "🏆", 
    color: "from-blue-400 to-indigo-500",
    title: "Monthly Master",
    description: "A full month of daily consultations. At this point, Bubbles considers you a trusted advisor (which should worry you).",
    bubblesQuote: "Thirty days! That's approximately one moon cycle. I've been tracking the moon carefully ever since I learned it controls the tides AND people's moods. Science!",
    reward: "Unlocks trophy display in sidebar"
  },
  { 
    days: 60, 
    label: "Wisdom Sage", 
    emoji: "🧙", 
    color: "from-purple-400 to-violet-500",
    title: "Wisdom Sage",
    description: "Two months of unwavering commitment. You've now spent more time with Bubbles than Bubbles spent learning about quantum physics (15 minutes).",
    bubblesQuote: "Sixty days! That's two months. Or 1440 hours. Or 86400 minutes. I'm very good at maths because I count everything in wool quantities.",
    reward: "Unlocks mystical particle effects"
  },
  { 
    days: 100, 
    label: "Century of Wisdom", 
    emoji: "💯", 
    color: "from-pink-400 to-rose-500",
    title: "Centurion of Curiosity",
    description: "One hundred days. You've reached triple digits. Bubbles is genuinely impressed and slightly concerned about your life choices.",
    bubblesQuote: "One hundred days! That's a century in the metric system. I learned about metrics from a Spanish child who measured everything in arms.",
    reward: "Unlocks exclusive '100' animated badge"
  },
  { 
    days: 365, 
    label: "Year of Enlightenment", 
    emoji: "🐑", 
    color: "from-primary to-accent",
    title: "Year of Enlightenment",
    description: "A full year with Bubbles. You've achieved what few dare to attempt: 365 days of confidently wrong wisdom.",
    bubblesQuote: "ONE YEAR! You've orbited the sun once while asking me questions. I've orbited the sun every year of my life, but I never get credit for it.",
    reward: "Unlocks legendary Bubbles avatar frame + exclusive wool gradient background"
  },
];

export default function Achievements() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<typeof ACHIEVEMENT_MILESTONES[0] | null>(null);
  const [animatedBadges, setAnimatedBadges] = useState<Set<number>>(new Set());
  const [newlyViewed, setNewlyViewed] = useState<Set<number>>(new Set());
  const badgeRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  useEffect(() => {
    // Load streak data
    const storedStreak = localStorage.getItem("bubbles-question-streak");
    if (storedStreak) {
      const data = JSON.parse(storedStreak);
      setCurrentStreak(data.streak || 0);
    }
    
    // Load celebrated milestones
    const stored = localStorage.getItem("bubbles-celebrated-milestones");
    if (stored) {
      setCelebratedMilestones(JSON.parse(stored));
    }

    // Track which badges have been viewed on this page
    const viewedBadges = localStorage.getItem("bubbles-viewed-badges");
    if (viewedBadges) {
      setAnimatedBadges(new Set(JSON.parse(viewedBadges)));
    }
  }, []);

  // Trigger celebration for newly unlocked badges
  useEffect(() => {
    const unlockedDays = ACHIEVEMENT_MILESTONES
      .filter(m => celebratedMilestones.includes(m.days) || currentStreak >= m.days)
      .map(m => m.days);

    const newUnlocks = unlockedDays.filter(days => !animatedBadges.has(days));
    
    if (newUnlocks.length > 0) {
      // Stagger celebrations for multiple badges
      newUnlocks.forEach((days, index) => {
        setTimeout(() => {
          const element = badgeRefs.current.get(days);
          if (element) {
            triggerBadgeCelebration(element);
            setNewlyViewed(prev => new Set(prev).add(days));
          }
        }, index * 400);
      });

      // Mark as viewed
      const updated = new Set([...animatedBadges, ...newUnlocks]);
      setAnimatedBadges(updated);
      localStorage.setItem("bubbles-viewed-badges", JSON.stringify([...updated]));
    }
  }, [celebratedMilestones, currentStreak, animatedBadges]);

  const unlockedCount = ACHIEVEMENT_MILESTONES.filter(
    m => celebratedMilestones.includes(m.days) || currentStreak >= m.days
  ).length;

  return (
    <Layout>
      <FloatingParticles count={15} />
      <div className="container mx-auto px-4 py-12 max-w-5xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-display font-bold">Achievement Gallery</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Wisdom Badges
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your journey of seeking Bubbles' confidently incorrect wisdom. 
            Each badge represents a milestone in your quest for enlightenment.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-xl">
                <Flame className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="font-display text-3xl font-bold">{currentStreak} days</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-secondary to-primary rounded-xl">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="font-display text-3xl font-bold">{unlockedCount} / {ACHIEVEMENT_MILESTONES.length}</p>
              </div>
            </div>
            <Link to="/faq">
              <Button className="font-display gap-2">
                <Sparkles className="w-4 h-4" />
                Ask Bubbles
              </Button>
            </Link>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ACHIEVEMENT_MILESTONES.map((milestone) => {
            const isUnlocked = celebratedMilestones.includes(milestone.days) || currentStreak >= milestone.days;
            const isNext = !isUnlocked && currentStreak < milestone.days && 
              (ACHIEVEMENT_MILESTONES.findIndex(m => m.days === milestone.days) === 0 ||
               celebratedMilestones.includes(ACHIEVEMENT_MILESTONES[ACHIEVEMENT_MILESTONES.findIndex(m => m.days === milestone.days) - 1]?.days) ||
               currentStreak >= ACHIEVEMENT_MILESTONES[ACHIEVEMENT_MILESTONES.findIndex(m => m.days === milestone.days) - 1]?.days);
            
            return (
              <button
                key={milestone.days}
                ref={(el) => {
                  if (el) badgeRefs.current.set(milestone.days, el);
                }}
                onClick={() => {
                  setSelectedBadge(selectedBadge?.days === milestone.days ? null : milestone);
                  if (isUnlocked) {
                    const element = badgeRefs.current.get(milestone.days);
                    if (element) triggerBadgeCelebration(element);
                  }
                }}
                className={cn(
                  "relative text-left p-6 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
                  isUnlocked 
                    ? "bg-card border-primary/50 hover:border-primary shadow-lg hover:shadow-xl" 
                    : isNext
                      ? "bg-muted/30 border-dashed border-primary/40 hover:border-primary/60 animate-shimmer"
                      : "bg-muted/20 border-muted-foreground/20 opacity-60 hover:opacity-80",
                  selectedBadge?.days === milestone.days && "ring-2 ring-primary ring-offset-2",
                  newlyViewed.has(milestone.days) && "animate-badge-unlock"
                )}
                style={{
                  animationDelay: `${ACHIEVEMENT_MILESTONES.findIndex(m => m.days === milestone.days) * 100}ms`
                }}
              >
                {/* Particle effects for unlocked badges */}
                <BadgeSparkles isActive={isUnlocked} />
                <GlowPulse color="hsl(var(--primary))" isActive={isUnlocked && selectedBadge?.days === milestone.days} />
                
                {/* Badge Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    "relative w-16 h-16 rounded-xl flex items-center justify-center text-3xl transition-transform duration-300",
                    isUnlocked 
                      ? `bg-gradient-to-br ${milestone.color} shadow-lg group-hover:scale-110 animate-badge-bounce` 
                      : "bg-muted"
                  )}
                  style={{
                    animationDelay: isUnlocked ? `${Math.random() * 2}s` : undefined
                  }}
                  >
                    {isUnlocked ? milestone.emoji : <Lock className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-display font-bold text-lg truncate",
                      !isUnlocked && "text-muted-foreground"
                    )}>
                      {milestone.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{milestone.days} day streak</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className={cn(
                  "text-sm mb-3 line-clamp-2",
                  isUnlocked ? "text-muted-foreground" : "text-muted-foreground/60"
                )}>
                  {milestone.description}
                </p>

                {/* Status */}
                {isUnlocked ? (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Star className="w-4 h-4 fill-primary" />
                    <span>Unlocked!</span>
                  </div>
                ) : isNext ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{milestone.days - currentStreak} days</span> to unlock
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground/60">
                    Locked
                  </div>
                )}

                {/* Unlocked checkmark */}
                {isUnlocked && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground text-sm">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Badge Detail */}
        {selectedBadge && (
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Badge Visual */}
              <div className="shrink-0">
                <div className={cn(
                  "w-24 h-24 rounded-2xl flex items-center justify-center text-5xl",
                  celebratedMilestones.includes(selectedBadge.days) || currentStreak >= selectedBadge.days
                    ? `bg-gradient-to-br ${selectedBadge.color} shadow-xl`
                    : "bg-muted"
                )}>
                  {celebratedMilestones.includes(selectedBadge.days) || currentStreak >= selectedBadge.days 
                    ? selectedBadge.emoji 
                    : <Lock className="w-12 h-12 text-muted-foreground" />}
                </div>
              </div>

              {/* Badge Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">{selectedBadge.title}</h2>
                  <p className="text-muted-foreground">{selectedBadge.description}</p>
                </div>

                {/* Bubbles Quote */}
                <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-primary">
                  <p className="text-sm italic">"{selectedBadge.bubblesQuote}"</p>
                  <p className="text-xs text-muted-foreground mt-2">— Bubbles the Sheep</p>
                </div>

                {/* Reward */}
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="font-medium">{selectedBadge.reward}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {currentStreak === 0 && (
          <div className="text-center mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-dashed border-primary/30">
            <span className="text-5xl mb-4 block">🐑</span>
            <h3 className="font-display text-xl font-bold mb-2">Start Your Journey</h3>
            <p className="text-muted-foreground mb-4">
              Ask Bubbles a question to begin earning wisdom badges!
            </p>
            <Link to="/faq">
              <Button size="lg" className="font-display gap-2">
                <Sparkles className="w-5 h-5" />
                Ask Your First Question
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
