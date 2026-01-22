import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { BubblesLogo } from "./BubblesSheep";
import { LanguageToggle } from "./LanguageToggle";
import { CelebrationToggle } from "./CelebrationToggle";
import { ThemeModeToggle } from "./ThemeModeToggle";
import { Search, Menu, Vibrate, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import { cn } from "@/lib/utils";

const getNavLinks = (t: (key: string) => string, language: string) => {
  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/facts", label: t("nav.facts") },
    { href: "/explains", label: t("nav.explains") },
    { href: "/collections/all", label: t("nav.shop") },
    { href: "/about", label: t("nav.story") },
    { href: "/faq", label: t("nav.questions") },
  ];
  
  // Add regional links based on language
  if (language === "de") {
    links.push({ href: "/dach", label: "🇩🇪🇦🇹🇨🇭 DACH" });
  } else if (language === "fr") {
    links.push({ href: "/fr", label: "🇫🇷🇧🇪🇱🇺 France" });
  }
  
  return links;
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language } = useLanguage();
  const { hapticEnabled, toggleHaptic } = useSettings();
  const { hasNewFeatures, newEntriesCount, markAsSeen } = useWhatsNew();
  const navLinks = getNavLinks(t, language);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
        >
          <div className="group-hover:animate-baa">
            <BubblesLogo />
          </div>
          <span className="font-display font-bold text-xl tracking-tight group-hover:animate-wobble">
            Bubbles
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <Link 
              key={link.href} 
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 hover:-rotate-1 relative group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeModeToggle />
          <CelebrationToggle />
          <LanguageToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleHaptic}
                className={cn(
                  "hover:animate-bounce-gentle transition-colors",
                  hapticEnabled ? "text-accent" : "text-muted-foreground"
                )}
              >
                <Vibrate className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Haptic feedback: {hapticEnabled ? "On" : "Off"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/whats-new" onClick={markAsSeen}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    "hover:animate-bounce-gentle relative",
                    hasNewFeatures && "text-accent"
                  )}
                >
                  <Sparkles className={cn("h-5 w-5", hasNewFeatures && "animate-pulse")} />
                  {hasNewFeatures && newEntriesCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-accent text-accent-foreground shadow-sm">
                      {newEntriesCount > 9 ? '9+' : newEntriesCount}
                    </span>
                  )}
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasNewFeatures ? "New features available!" : "What's New"}</p>
            </TooltipContent>
          </Tooltip>
          <Link to="/search">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:animate-bounce-gentle"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <div className="hover:animate-squish">
            <CartDrawer />
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:animate-wobble">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="mt-4 mb-6">
                <LanguageToggle />
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <Link 
                    key={link.href} 
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-display font-medium hover:text-accent transition-all duration-200 animate-slide-in-right hover:translate-x-2"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link 
                  to="/whats-new"
                  onClick={() => {
                    markAsSeen();
                    setMobileOpen(false);
                  }}
                  className="text-lg font-display font-medium hover:text-accent transition-all duration-200 animate-slide-in-right hover:translate-x-2 flex items-center gap-2"
                  style={{ animationDelay: `${navLinks.length * 75}ms` }}
                >
                  <Sparkles className={cn("h-5 w-5", hasNewFeatures && "text-accent animate-pulse")} />
                  What's New
                  {hasNewFeatures && newEntriesCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-accent text-accent-foreground">
                      {newEntriesCount > 9 ? '9+' : newEntriesCount}
                    </span>
                  )}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
