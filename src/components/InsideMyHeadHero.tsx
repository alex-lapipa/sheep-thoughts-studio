import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Sparkles, Bird, Cloud, Leaf, Sun, Moon, Star, Zap, Heart, TreePine, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareButtons } from "@/components/ShareButtons";
import { useShare } from "@/hooks/useShare";
import { toast } from "sonner";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
  tags?: string[] | null;
}

const MODE_LABELS: Record<BubblesMode, string> = {
  innocent: "Innocent",
  concerned: "Concerned", 
  triggered: "Triggered",
  savage: "Savage",
  nuclear: "Nuclear",
};

const MODE_COLORS: Record<BubblesMode, { bg: string; text: string; glow: string; border: string }> = {
  innocent: { 
    bg: "from-emerald-500/30 via-green-400/20 to-teal-500/30", 
    text: "text-emerald-400",
    glow: "shadow-emerald-500/30",
    border: "border-emerald-500/40"
  },
  concerned: { 
    bg: "from-amber-500/30 via-yellow-400/20 to-orange-500/30", 
    text: "text-amber-400",
    glow: "shadow-amber-500/30",
    border: "border-amber-500/40"
  },
  triggered: { 
    bg: "from-orange-500/30 via-red-400/20 to-pink-500/30", 
    text: "text-orange-400",
    glow: "shadow-orange-500/30",
    border: "border-orange-500/40"
  },
  savage: { 
    bg: "from-purple-500/30 via-violet-400/20 to-fuchsia-500/30", 
    text: "text-purple-400",
    glow: "shadow-purple-500/30",
    border: "border-purple-500/40"
  },
  nuclear: { 
    bg: "from-red-500/30 via-rose-400/20 to-pink-500/30", 
    text: "text-red-400",
    glow: "shadow-red-500/30",
    border: "border-red-500/40"
  },
};

// Floating decorations with various animals/nature icons
const FLOATING_ICONS = [
  { Icon: Bird, delay: 0, size: "lg", position: { top: "8%", left: "5%" } },
  { Icon: Cloud, delay: 0.5, size: "md", position: { top: "15%", right: "8%" } },
  { Icon: Leaf, delay: 1, size: "sm", position: { top: "60%", left: "3%" } },
  { Icon: Sun, delay: 1.5, size: "lg", position: { top: "5%", right: "25%" } },
  { Icon: Star, delay: 2, size: "sm", position: { bottom: "20%", right: "5%" } },
  { Icon: TreePine, delay: 0.3, size: "md", position: { bottom: "15%", left: "8%" } },
  { Icon: Heart, delay: 1.2, size: "sm", position: { top: "35%", right: "3%" } },
  { Icon: Bird, delay: 0.8, size: "sm", position: { top: "45%", left: "6%" } },
  { Icon: Moon, delay: 1.8, size: "md", position: { bottom: "30%", right: "10%" } },
  { Icon: Zap, delay: 2.2, size: "sm", position: { top: "70%", right: "15%" } },
];

// Floating sheep positions scattered around the section
const FLOATING_SHEEP = [
  { delay: 0, size: 80, position: { top: "12%", left: "2%" }, flip: false },
  { delay: 1.5, size: 60, position: { top: "25%", right: "4%" }, flip: true },
  { delay: 0.8, size: 50, position: { bottom: "35%", left: "1%" }, flip: false },
  { delay: 2, size: 70, position: { bottom: "18%", right: "2%" }, flip: true },
  { delay: 0.5, size: 45, position: { top: "55%", right: "6%" }, flip: false },
  { delay: 1.2, size: 55, position: { top: "78%", left: "5%" }, flip: true },
];

// Cute animated sheep SVG component
const FloatingSheep = ({ delay, size, position, flip }: { delay: number; size: number; position: Record<string, string>; flip: boolean }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-0"
      style={{ ...position, width: size, height: size }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0.15, 0.35, 0.15],
        y: [-15, 15, -15],
        x: [-8, 8, -8],
        rotate: flip ? [5, -5, 5] : [-5, 5, -5],
      }}
      transition={{
        duration: 10 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <svg
        viewBox="0 0 100 80"
        fill="none"
        className={cn("w-full h-full", flip && "scale-x-[-1]")}
      >
        {/* Wool body - fluffy cloud shape */}
        <ellipse cx="50" cy="45" rx="35" ry="28" className="fill-primary/30" />
        <circle cx="25" cy="40" r="18" className="fill-primary/25" />
        <circle cx="75" cy="40" r="18" className="fill-primary/25" />
        <circle cx="35" cy="28" r="14" className="fill-primary/20" />
        <circle cx="65" cy="28" r="14" className="fill-primary/20" />
        <circle cx="50" cy="25" r="12" className="fill-primary/15" />
        
        {/* Head */}
        <ellipse cx="82" cy="35" rx="14" ry="12" className="fill-foreground/20" />
        
        {/* Ears */}
        <ellipse cx="92" cy="28" rx="6" ry="4" className="fill-foreground/15" transform="rotate(30 92 28)" />
        <ellipse cx="78" cy="24" rx="5" ry="3" className="fill-foreground/15" transform="rotate(-20 78 24)" />
        
        {/* Eye */}
        <circle cx="86" cy="33" r="3" className="fill-foreground/40" />
        <circle cx="87" cy="32" r="1" className="fill-background/60" />
        
        {/* Nose */}
        <ellipse cx="93" cy="38" rx="3" ry="2" className="fill-foreground/25" />
        
        {/* Legs */}
        <rect x="30" y="65" width="6" height="12" rx="3" className="fill-foreground/20" />
        <rect x="42" y="65" width="6" height="12" rx="3" className="fill-foreground/20" />
        <rect x="54" y="65" width="6" height="12" rx="3" className="fill-foreground/20" />
        <rect x="66" y="65" width="6" height="12" rx="3" className="fill-foreground/20" />
      </svg>
    </motion.div>
  );
};

const FloatingIcon = ({ Icon, delay, size, position }: typeof FLOATING_ICONS[0]) => {
  const sizeClasses = {
    sm: "w-6 h-6 md:w-8 md:h-8",
    md: "w-10 h-10 md:w-14 md:h-14",
    lg: "w-14 h-14 md:w-20 md:h-20",
  };

  return (
    <motion.div
      className={cn(
        "absolute text-primary/20 dark:text-primary/10 pointer-events-none",
        sizeClasses[size as keyof typeof sizeClasses]
      )}
      style={position as any}
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ 
        opacity: [0.2, 0.5, 0.2],
        scale: [0.9, 1.1, 0.9],
        rotate: [-10, 10, -10],
        y: [-20, 20, -20],
        x: [-10, 10, -10],
      }}
      transition={{
        duration: 8 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <Icon className="w-full h-full" strokeWidth={1} />
    </motion.div>
  );
};

interface ThoughtCardProps {
  thought: ThoughtData;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const ThoughtCard = ({ thought, index, isActive, onClick }: ThoughtCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const modeStyle = MODE_COLORS[thought.mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 25,
        delay: index * 0.1 
      }}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3 }
      }}
      style={{ 
        rotateX, 
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="cursor-pointer group"
    >
      {/* Card container */}
      <div className={cn(
        "relative aspect-square rounded-3xl overflow-hidden",
        "backdrop-blur-2xl border-2",
        modeStyle.border,
        "shadow-2xl",
        modeStyle.glow,
        "transform-gpu",
        "transition-shadow duration-500",
        "hover:shadow-3xl",
      )}>
        {/* Animated gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          modeStyle.bg,
          "opacity-80"
        )} />
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-background/40 dark:bg-background/60 backdrop-blur-xl" />

        {/* Floating orbs inside card */}
        <motion.div 
          className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        {/* Content */}
        <div className="relative z-10 h-full p-5 md:p-6 flex flex-col justify-between">
          {/* Mode badge */}
          <div className="flex justify-between items-start">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] md:text-xs font-bold px-2 py-0.5 backdrop-blur-md",
                modeStyle.text,
                modeStyle.border,
                "bg-background/50"
              )}
            >
              {MODE_LABELS[thought.mode]}
            </Badge>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className={cn("w-4 h-4 md:w-5 md:h-5", modeStyle.text)} />
            </motion.div>
          </div>

          {/* Quote text */}
          <div className="flex-1 flex items-center justify-center py-4">
            <p className={cn(
              "text-center font-medium leading-relaxed text-foreground/90",
              "text-sm md:text-base lg:text-lg",
              "line-clamp-5"
            )}>
              "{thought.text}"
            </p>
          </div>

          {/* Bottom decoration */}
          <div className="flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={cn("w-1.5 h-1.5 rounded-full", modeStyle.text.replace('text-', 'bg-'))}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hover shimmer effect */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
          }}
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      </div>
    </motion.div>
  );
};

// Share dialog for individual thoughts
interface ThoughtShareDialogProps {
  thought: ThoughtData | null;
  onClose: () => void;
  onShuffle: () => void;
}

const ThoughtShareDialog = ({ thought, onClose, onShuffle }: ThoughtShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { share, isSharing } = useShare({
    successMessage: "Wisdom shared with the world! 🐑",
  });

  if (!thought) return null;

  const modeStyle = MODE_COLORS[thought.mode];
  const shareText = `"${thought.text}" — Bubbles the Sheep 🐑`;
  const shareUrl = `${window.location.origin}/facts?thought=${thought.id}`;

  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Quote copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
      
      // Record share event
      await supabase.from('share_events').insert({
        content_type: 'thought',
        content_id: thought.id,
        content_title: thought.text.substring(0, 50),
        share_method: 'clipboard',
      });
    } catch {
      toast.error("Could not copy quote");
    }
  };

  const handleNativeShare = async () => {
    await share({
      title: "Bubbles the Sheep Wisdom",
      text: shareText,
      url: shareUrl,
      contentType: "thought",
      contentId: thought.id,
    });
  };

  const handleSocialShare = async (platform: string) => {
    // Record share event
    await supabase.from('share_events').insert({
      content_type: 'thought',
      content_id: thought.id,
      content_title: thought.text.substring(0, 50),
      share_method: platform,
    });
  };

  return (
    <Dialog open={!!thought} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className={cn(modeStyle.text, modeStyle.border)}
            >
              {MODE_LABELS[thought.mode]}
            </Badge>
            <span className="text-lg">Bubbles Thinks...</span>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8"
        >
          <p className="text-xl md:text-2xl font-medium text-center leading-relaxed italic text-foreground/90">
            "{thought.text}"
          </p>
        </motion.div>

        {/* Share Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Share2 className="w-4 h-4" />
            <span>Share this wisdom</span>
          </div>

          {/* Social Share Buttons */}
          <div className="flex justify-center">
            <ShareButtons
              url={shareUrl}
              title="Bubbles the Sheep Wisdom"
              text={shareText}
              size="sm"
              onShare={handleSocialShare}
            />
          </div>

          {/* Copy & Native Share */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyQuote}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Quote
                </>
              )}
            </Button>
            
            {typeof navigator !== "undefined" && navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNativeShare}
                disabled={isSharing}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}
          </div>

          {/* Shuffle button */}
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={onShuffle}>
              🎲 Another thought
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function InsideMyHeadHero() {
  const [thoughts, setThoughts] = useState<ThoughtData[]>([]);
  const [visibleThoughts, setVisibleThoughts] = useState<ThoughtData[]>([]);
  const [selectedThought, setSelectedThought] = useState<ThoughtData | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | BubblesMode>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch thoughts from database
  useEffect(() => {
    async function fetchThoughts() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode, tags')
        .eq('is_curated', true)
        .limit(60);

      if (error) {
        console.error('Error fetching thoughts:', error);
        const { data: fallbackData } = await supabase
          .from('bubbles_thoughts')
          .select('id, text, mode, tags')
          .limit(40);
        
        if (fallbackData) {
          setThoughts(fallbackData);
        }
      } else if (data && data.length > 0) {
        setThoughts(data);
      }
      setIsLoading(false);
    }

    fetchThoughts();
  }, []);

  // Filter and shuffle thoughts
  const filteredThoughts = useMemo(() => {
    let filtered = [...thoughts];
    if (activeFilter !== "all") {
      filtered = filtered.filter(t => t.mode === activeFilter);
    }
    return filtered.sort(() => Math.random() - 0.5);
  }, [thoughts, activeFilter]);

  // Show initial grid of thoughts
  useEffect(() => {
    setVisibleThoughts(filteredThoughts.slice(0, 9));
  }, [filteredThoughts]);

  // Shuffle visible thoughts
  const shuffleThoughts = useCallback(() => {
    const shuffled = [...filteredThoughts].sort(() => Math.random() - 0.5);
    setVisibleThoughts(shuffled.slice(0, 9));
  }, [filteredThoughts]);

  if (isLoading) {
    return (
      <section className="relative min-h-screen py-20 md:py-32 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-3xl bg-muted/30 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-16 md:py-24 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Large floating blobs */}
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [30, -30, 30],
            y: [20, -20, 20],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            x: [-20, 40, -20],
            y: [30, -30, 30],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>

      {/* Floating animal/nature icons */}
      {FLOATING_ICONS.map((iconProps, i) => (
        <FloatingIcon key={i} {...iconProps} />
      ))}

      {/* Floating sheep illustrations */}
      {FLOATING_SHEEP.map((sheepProps, i) => (
        <FloatingSheep key={`sheep-${i}`} {...sheepProps} />
      ))}

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Verified Wisdom™</span>
          </motion.div>
          
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Inside My Head
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            A curated gallery of profound observations. Click any thought to expand.
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className="rounded-full"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            All Thoughts
          </Button>
          {(["innocent", "triggered", "savage", "nuclear"] as BubblesMode[]).map(mode => (
            <Button
              key={mode}
              variant={activeFilter === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(mode)}
              className={cn(
                "rounded-full capitalize",
                activeFilter === mode && MODE_COLORS[mode].text
              )}
            >
              {MODE_LABELS[mode]}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={shuffleThoughts}
            className="rounded-full"
          >
            🎲 Shuffle
          </Button>
        </motion.div>

        {/* Thought cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {visibleThoughts.map((thought, index) => (
              <ThoughtCard
                key={thought.id}
                thought={thought}
                index={index}
                isActive={selectedThought?.id === thought.id}
                onClick={() => setSelectedThought(thought)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Load more hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-2xl mr-2">+{Math.max(0, filteredThoughts.length - 9)}</span>
            more thoughts available
          </p>
        </motion.div>
      </div>

      {/* Thought detail dialog */}
      <ThoughtShareDialog
        thought={selectedThought}
        onClose={() => setSelectedThought(null)}
        onShuffle={shuffleThoughts}
      />
    </section>
  );
}
