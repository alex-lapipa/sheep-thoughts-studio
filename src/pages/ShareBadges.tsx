import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Download, Copy, Check, ExternalLink, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BADGES = [
  { days: 3, emoji: "🌱", title: "Seedling", color: "from-green-400 to-emerald-500" },
  { days: 7, emoji: "🔥", title: "Week Warrior", color: "from-orange-400 to-red-500" },
  { days: 14, emoji: "⭐", title: "Fortnight Scholar", color: "from-yellow-400 to-amber-500" },
  { days: 30, emoji: "🏆", title: "Monthly Master", color: "from-blue-400 to-indigo-500" },
  { days: 60, emoji: "🧙", title: "Wisdom Sage", color: "from-purple-400 to-violet-500" },
  { days: 100, emoji: "💯", title: "Centurion", color: "from-pink-400 to-rose-500" },
  { days: 365, emoji: "🐑", title: "Year of Enlightenment", color: "from-primary to-accent" },
];

export default function ShareBadges() {
  const [searchParams] = useSearchParams();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [displayName, setDisplayName] = useState("A Wise Soul");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Load from URL params or localStorage
  useEffect(() => {
    const urlStreak = searchParams.get('streak');
    const urlBadges = searchParams.get('badges');
    const urlName = searchParams.get('name');

    if (urlStreak || urlBadges) {
      // Viewing someone else's shared badges
      setCurrentStreak(parseInt(urlStreak || '0', 10));
      setCelebratedMilestones(urlBadges?.split(',').map(d => parseInt(d, 10)).filter(d => !isNaN(d)) || []);
      if (urlName) setDisplayName(decodeURIComponent(urlName));
    } else {
      // Load own data from localStorage
      const storedStreak = localStorage.getItem("bubbles-question-streak");
      if (storedStreak) {
        const data = JSON.parse(storedStreak);
        setCurrentStreak(data.streak || 0);
      }
      const storedMilestones = localStorage.getItem("bubbles-celebrated-milestones");
      if (storedMilestones) {
        setCelebratedMilestones(JSON.parse(storedMilestones));
      }
    }
  }, [searchParams]);

  const unlockedBadges = BADGES.filter(b => celebratedMilestones.includes(b.days) || currentStreak >= b.days);
  const unlockedDays = unlockedBadges.map(b => b.days);

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      streak: currentStreak.toString(),
      badges: unlockedDays.join(','),
      name: displayName,
    });
    return `${baseUrl}/share-badges?${params.toString()}`;
  };

  const getOgImageUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'iteckeoeowgguhgrpcnm';
    const params = new URLSearchParams({
      streak: currentStreak.toString(),
      badges: unlockedDays.join(','),
      name: displayName,
    });
    return `https://${projectId}.supabase.co/functions/v1/og-badge-image?${params.toString()}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleGenerateImage = async () => {
    setGenerating(true);
    try {
      const response = await supabase.functions.invoke('og-badge-image', {
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Since we can't easily get the image from the edge function response,
      // we'll use the URL directly
      setGeneratedImageUrl(getOgImageUrl());
      toast.success("OG image URL generated!");
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async (platform: string) => {
    const shareUrl = getShareUrl();
    const text = `I've earned ${unlockedBadges.length} wisdom badges from Bubbles the Sheep! 🐑 ${currentStreak} day streak of seeking confidently wrong advice.`;

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const isViewingOthers = searchParams.has('streak') || searchParams.has('badges');

  return (
    <Layout>
      <Helmet>
        <title>{displayName}'s Wisdom Badges | Bubbles the Sheep</title>
        <meta name="description" content={`${unlockedBadges.length} badges earned with a ${currentStreak} day streak!`} />
        <meta property="og:title" content={`${displayName}'s Wisdom Badges`} />
        <meta property="og:description" content={`${unlockedBadges.length} badges earned • ${currentStreak} day streak of confidently wrong wisdom!`} />
        <meta property="og:image" content={getOgImageUrl()} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${displayName}'s Wisdom Badges`} />
        <meta name="twitter:description" content={`${unlockedBadges.length} badges earned • ${currentStreak} day streak!`} />
        <meta name="twitter:image" content={getOgImageUrl()} />
      </Helmet>

      {/* Hero with Bubbles */}
      <section className="-mx-4 mb-12">
        <PageHeroWithBubbles
          title={isViewingOthers ? `${displayName}'s Badges` : "Share Your Badges"}
          subtitle={isViewingOthers 
            ? "Check out this collection of wisdom badges!" 
            : "Create a beautiful shareable card of your badge collection"}
          bubbleSize="sm"
        />
      </section>

      <div className="container max-w-3xl">

        {/* Badge Display Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8">
            {/* Stats */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="font-display text-4xl font-bold">{currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold">{unlockedBadges.length}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {BADGES.map((badge) => {
                const isUnlocked = unlockedDays.includes(badge.days);
                return (
                  <div
                    key={badge.days}
                    className={cn(
                      "w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all",
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.color} shadow-lg`
                        : "bg-muted/50 opacity-40"
                    )}
                  >
                    <span className="text-2xl">{isUnlocked ? badge.emoji : "🔒"}</span>
                    <span className={cn(
                      "text-xs font-bold",
                      isUnlocked ? "text-white" : "text-muted-foreground"
                    )}>
                      {badge.days}d
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Attribution */}
            <p className="text-center text-sm text-muted-foreground">
              🐑 Wisdom badges from Bubbles the Sheep
            </p>
          </div>
        </Card>

        {!isViewingOthers && (
          <>
            {/* Display Name Input */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name (for sharing)
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Share Actions */}
            <Card className="mb-6">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display font-bold text-lg">Share Link</h3>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={getShareUrl()} 
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopy} variant="outline" className="shrink-0 gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handleShare('twitter')} variant="outline" className="gap-2">
                    <span>𝕏</span> Twitter
                  </Button>
                  <Button onClick={() => handleShare('facebook')} variant="outline" className="gap-2">
                    <span>f</span> Facebook
                  </Button>
                  <Button onClick={() => handleShare('linkedin')} variant="outline" className="gap-2">
                    <span>in</span> LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* OG Image Generator */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Custom OG Image
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate a custom social preview image featuring your badge collection. 
                  This image will appear when you share your link on social media.
                </p>
                
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={generating}
                  className="gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Generate OG Image
                    </>
                  )}
                </Button>

                {generatedImageUrl && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">OG Image URL:</p>
                    <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={generatedImageUrl} 
                        className="font-mono text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(generatedImageUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {isViewingOthers && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Want to earn your own wisdom badges?
            </p>
            <Link to="/faq">
              <Button className="gap-2">
                🐑 Ask Bubbles a Question
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
