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
import { Download, Share2, Copy, Check } from "lucide-react";
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

  const shareToWhatsApp = () => {
    const text = `🏆 I just unlocked the "${badge.title}" badge on Bubbles the Sheep! ${badge.days} days of seeking wisdom from a confidently wrong sheep. 🐑 Check it out: https://sheep-thoughts-studio.lovable.app/achievements`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    recordShare("whatsapp");
  };

  const shareToLinkedIn = () => {
    const url = "https://sheep-thoughts-studio.lovable.app/achievements";
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
    recordShare("linkedin");
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button
            onClick={shareToTwitter}
            variant="outline"
            className="gap-2 hover:bg-foreground hover:text-background"
            disabled={!generatedImage}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Twitter/X
          </Button>
          <Button
            onClick={shareToFacebook}
            variant="outline"
            className="gap-2 hover:bg-[#1877F2] hover:text-white"
            disabled={!generatedImage}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>
          <Button
            onClick={shareToWhatsApp}
            variant="outline"
            className="gap-2 hover:bg-[#25D366] hover:text-white"
            disabled={!generatedImage}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </Button>
          <Button
            onClick={shareToLinkedIn}
            variant="outline"
            className="gap-2 hover:bg-[#0A66C2] hover:text-white"
            disabled={!generatedImage}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
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
