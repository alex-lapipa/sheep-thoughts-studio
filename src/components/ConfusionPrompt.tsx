import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const CONFUSION_PROMPTS = [
  { text: "Wait, did you mean to click that?", link: "/scenarios", linkText: "Try again here" },
  { text: "Bubbles thinks you should also see...", link: "/facts", linkText: "The Facts™" },
  { text: "Since you're here anyway...", link: "/about", linkText: "Meet Bubbles" },
  { text: "Lost? That's the spirit!", link: "/faq", linkText: "Ask Bubbles" },
  { text: "This way to more confusion →", link: "/collections/all", linkText: "Shop the chaos" },
  { text: "While you're wandering...", link: "/scenarios", linkText: "Watch Bubbles escalate" },
];

interface ConfusionPromptProps {
  className?: string;
  excludePath?: string;
}

export function ConfusionPrompt({ className, excludePath }: ConfusionPromptProps) {
  const [prompt, setPrompt] = useState(CONFUSION_PROMPTS[0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a delay
    const showTimer = setTimeout(() => {
      const available = CONFUSION_PROMPTS.filter(p => p.link !== excludePath);
      setPrompt(available[Math.floor(Math.random() * available.length)]);
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, [excludePath]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "animate-pop-in bg-accent/10 border border-accent/30 rounded-2xl p-4 text-center",
        className
      )}
    >
      <p className="text-sm text-muted-foreground mb-2 font-display animate-confused-spin">
        🐑 {prompt.text}
      </p>
      <Link 
        to={prompt.link}
        className="text-accent hover:text-accent-hover font-display font-bold underline underline-offset-4 decoration-wavy transition-all hover:animate-wiggle inline-block"
      >
        {prompt.linkText}
      </Link>
    </div>
  );
}
