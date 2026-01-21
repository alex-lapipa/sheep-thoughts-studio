import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, HelpCircle, ShoppingBag, Brain } from "lucide-react";

interface CrossLink {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CROSS_LINKS: CrossLink[] = [
  {
    to: "/facts",
    label: "Bubbles' Facts",
    description: "100% researched, 0% accurate",
    icon: <Brain className="h-5 w-5" />,
    color: "bg-wicklow-butter/20 border-wicklow-butter/40 hover:bg-wicklow-butter/30",
  },
  {
    to: "/scenarios",
    label: "Escalation Journeys",
    description: "Watch innocence become chaos",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-urban-soho/20 border-urban-soho/40 hover:bg-urban-soho/30",
  },
  {
    to: "/collections/all",
    label: "The Merch",
    description: "Wear the confusion",
    icon: <ShoppingBag className="h-5 w-5" />,
    color: "bg-wicklow-meadow/20 border-wicklow-meadow/40 hover:bg-wicklow-meadow/30",
  },
  {
    to: "/faq",
    label: "Ask Bubbles",
    description: "Questions with unhelpful answers",
    icon: <HelpCircle className="h-5 w-5" />,
    color: "bg-wicklow-atlantic/20 border-wicklow-atlantic/40 hover:bg-wicklow-atlantic/30",
  },
];

interface CrossLinksProps {
  exclude?: string[];
  maxLinks?: number;
  className?: string;
  title?: string;
}

export function CrossLinks({ 
  exclude = [], 
  maxLinks = 3, 
  className,
  title = "While you're lost..."
}: CrossLinksProps) {
  const availableLinks = CROSS_LINKS.filter(link => !exclude.includes(link.to));
  const shuffled = [...availableLinks].sort(() => Math.random() - 0.5);
  const displayLinks = shuffled.slice(0, maxLinks);

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-display text-lg font-bold text-center animate-bounce-gentle">
        {title}
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        {displayLinks.map((link, index) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "group block p-4 rounded-xl border-2 transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-lg",
              link.color,
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background/50 group-hover:animate-wiggle">
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm truncate">
                    {link.label}
                  </span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
