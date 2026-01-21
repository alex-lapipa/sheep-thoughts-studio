import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Download, Share2, Twitter, Facebook, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BadgeMilestone {
  days: number;
  label: string;
  emoji: string;
  color: string;
  title: string;
  description: string;
  bubblesQuote: string;
}

interface ShareableBadgeCardProps {
  badge: BadgeMilestone;
  currentStreak: number;
  isOpen: boolean;
  onClose: () => void;
}

// Map gradient classes to actual colors for canvas
const GRADIENT_COLORS: Record<string, { from: string; to: string }> = {
  "from-green-400 to-emerald-500": { from: "#4ade80", to: "#10b981" },
  "from-orange-400 to-red-500": { from: "#fb923c", to: "#ef4444" },
  "from-yellow-400 to-amber-500": { from: "#facc15", to: "#f59e0b" },
  "from-blue-400 to-indigo-500": { from: "#60a5fa", to: "#6366f1" },
  "from-purple-400 to-violet-500": { from: "#c084fc", to: "#8b5cf6" },
  "from-pink-400 to-rose-500": { from: "#f472b6", to: "#f43f5e" },
  "from-primary to-accent": { from: "#4ade80", to: "#ec4899" },
};

export function ShareableBadgeCard({ 
  badge, 
  currentStreak,
  isOpen, 
  onClose 
}: ShareableBadgeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateShareImage = async () => {
    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size for social media (1200x630 for OG image)
    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(0.5, "#16213e");
    bgGradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 200 + 50,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Badge colors
    const colors = GRADIENT_COLORS[badge.color] || { from: "#4ade80", to: "#ec4899" };

    // Central badge circle
    const centerX = canvas.width / 2;
    const centerY = 250;
    const badgeRadius = 120;

    // Glow effect
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, badgeRadius * 0.5,
      centerX, centerY, badgeRadius * 2
    );
    glowGradient.addColorStop(0, colors.from + "60");
    glowGradient.addColorStop(1, "transparent");
    ctx.fillStyle = glowGradient;
    ctx.fillRect(centerX - badgeRadius * 2, centerY - badgeRadius * 2, badgeRadius * 4, badgeRadius * 4);

    // Badge background
    const badgeGradient = ctx.createLinearGradient(
      centerX - badgeRadius, centerY - badgeRadius,
      centerX + badgeRadius, centerY + badgeRadius
    );
    badgeGradient.addColorStop(0, colors.from);
    badgeGradient.addColorStop(1, colors.to);

    ctx.beginPath();
    ctx.arc(centerX, centerY, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle = badgeGradient;
    ctx.fill();

    // Badge border
    ctx.strokeStyle = "#ffffff40";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Emoji
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badge.emoji, centerX, centerY);

    // Badge title
    ctx.font = "bold 48px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(badge.title, centerX, centerY + 180);

    // Days label
    ctx.font = "24px 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff99";
    ctx.fillText(`${badge.days}-Day Streak Achievement`, centerX, centerY + 230);

    // Current streak if higher
    if (currentStreak > badge.days) {
      ctx.font = "20px 'Inter', sans-serif";
      ctx.fillStyle = colors.from;
      ctx.fillText(`Current streak: ${currentStreak} days 🔥`, centerX, centerY + 270);
    }

    // Branding
    ctx.font = "bold 28px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText("🐑 Bubbles the Sheep", 40, canvas.height - 40);

    ctx.font = "18px 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff80";
    ctx.textAlign = "right";
    ctx.fillText("sheep-thoughts-studio.lovable.app", canvas.width - 40, canvas.height - 40);

    // Convert to image
    const dataUrl = canvas.toDataURL("image/png");
    setGeneratedImage(dataUrl);
    setIsGenerating(false);
  };

  // Generate image when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTimeout(generateShareImage, 100);
    } else {
      setGeneratedImage(null);
      onClose();
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.download = `bubbles-badge-${badge.days}-day-streak.png`;
    link.href = generatedImage;
    link.click();
    
    recordShare("download");
    toast.success("Badge image downloaded!");
  };

  const copyImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      recordShare("clipboard");
      toast.success("Image copied to clipboard!");
    } catch {
      toast.error("Unable to copy image");
    }
  };

  const shareToTwitter = () => {
    const text = `🏆 I just unlocked the "${badge.title}" badge on Bubbles the Sheep! ${badge.days} days of seeking wisdom from a confidently wrong sheep. 🐑`;
    const url = "https://sheep-thoughts-studio.lovable.app/achievements";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
    recordShare("twitter");
  };

  const shareToFacebook = () => {
    const url = "https://sheep-thoughts-studio.lovable.app/achievements";
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
    recordShare("facebook");
  };

  const recordShare = async (method: string) => {
    try {
      await supabase.from("share_events").insert({
        content_type: "achievement",
        content_id: badge.days.toString(),
        content_title: badge.title,
        share_method: method,
      });
    } catch (error) {
      console.error("Failed to record share:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Achievement
          </DialogTitle>
          <DialogDescription>
            Show off your {badge.title} badge to the world!
          </DialogDescription>
        </DialogHeader>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview */}
        <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden border-2 border-border bg-muted">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : generatedImage ? (
            <img 
              src={generatedImage} 
              alt={`${badge.title} achievement badge`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Generating preview...
            </div>
          )}
        </div>

        {/* Share Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareToTwitter}
            variant="outline"
            className="gap-2 hover:bg-foreground hover:text-background"
            disabled={!generatedImage}
          >
            <Twitter className="w-4 h-4" />
            Twitter/X
          </Button>
          <Button
            onClick={shareToFacebook}
            variant="outline"
            className="gap-2 hover:bg-blue-600 hover:text-white"
            disabled={!generatedImage}
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </Button>
          <Button
            onClick={copyImage}
            variant="outline"
            className="gap-2"
            disabled={!generatedImage}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Image"}
          </Button>
          <Button
            onClick={downloadImage}
            className="gap-2"
            disabled={!generatedImage}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Bubbles Quote */}
        <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-primary">
          <p className="text-sm italic text-muted-foreground">
            "{badge.bubblesQuote}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">— Bubbles, on sharing achievements</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
