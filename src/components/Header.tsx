import { Link, useLocation } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { BubblesLogo } from "./BubblesSheep";
import { LanguageToggle } from "./LanguageToggle";
import { CelebrationToggle } from "./CelebrationToggle";
import { ThemeModeToggle } from "./ThemeModeToggle";
import { RegionSwitcher } from "./RegionSwitcher";
import { Search, Menu, Vibrate, Sparkles, X, ChevronRight, Home, BookOpen, Trophy, ShoppingBag, User, HelpCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const getNavLinks = (t: (key: string) => string) => [
  { href: "/", label: t("nav.home"), icon: Home },
  { href: "/facts", label: t("nav.facts"), icon: BookOpen },
  { href: "/explains", label: t("nav.explains"), icon: Zap },
  { href: "/hall-of-fame", label: "Hall of Fame", icon: Trophy },
  { href: "/collections/all", label: t("nav.shop"), icon: ShoppingBag },
  { href: "/about", label: t("nav.story"), icon: User },
  { href: "/faq", label: t("nav.questions"), icon: HelpCircle },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  const { hapticEnabled, toggleHaptic } = useSettings();
  const { hasNewFeatures, newEntriesCount, markAsSeen } = useWhatsNew();
  const location = useLocation();
  const navLinks = getNavLinks(t);

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
      isScrolled && "shadow-md"
    )}>
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 md:gap-3 group transition-transform duration-300 hover:scale-105"
        >
          <div className="group-hover:animate-baa">
            <BubblesLogo />
          </div>
          <span className="font-display font-bold text-lg md:text-xl tracking-tight group-hover:animate-wobble">
            Bubbles
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link, index) => (
            <Link 
              key={link.href} 
              to={link.href}
              className={cn(
                "text-sm font-medium transition-all duration-200 hover:scale-110 hover:-rotate-1 relative group",
                location.pathname === link.href 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.label}
              <span className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300",
                location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </nav>

        {/* Actions - Desktop */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <ThemeModeToggle />
          <CelebrationToggle />
          <RegionSwitcher />
          <LanguageToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleHaptic}
                className={cn(
                  "hover:animate-bounce-gentle transition-colors h-9 w-9",
                  hapticEnabled ? "text-accent" : "text-muted-foreground"
                )}
              >
                <Vibrate className="h-4 w-4" />
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
                    "hover:animate-bounce-gentle relative h-9 w-9",
                    hasNewFeatures && "text-accent"
                  )}
                >
                  <Sparkles className={cn("h-4 w-4", hasNewFeatures && "animate-pulse")} />
                  {hasNewFeatures && newEntriesCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold rounded-full bg-accent text-accent-foreground shadow-sm">
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
              className="hover:animate-bounce-gentle h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <div className="hover:animate-squish">
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-1">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <CartDrawer />
          
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[320px] p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
                  <Link 
                    to="/" 
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <BubblesLogo />
                    <span className="font-display font-bold text-lg">Bubbles</span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <AnimatePresence>
                    {navLinks.map((link, index) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.href;
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link 
                            to={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-4 px-5 py-4 transition-colors active:bg-accent/10",
                              isActive 
                                ? "bg-accent/10 text-accent border-r-2 border-accent" 
                                : "hover:bg-secondary/50"
                            )}
                          >
                            <Icon className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isActive ? "text-accent" : "text-muted-foreground"
                            )} />
                            <span className="font-display text-base font-medium flex-1">
                              {link.label}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </motion.div>
                      );
                    })}
                    
                    {/* What's New */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 }}
                    >
                      <Link 
                        to="/whats-new"
                        onClick={() => {
                          markAsSeen();
                          setMobileOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 transition-colors active:bg-accent/10",
                          hasNewFeatures ? "bg-accent/5" : "hover:bg-secondary/50"
                        )}
                      >
                        <Sparkles className={cn(
                          "h-5 w-5 flex-shrink-0",
                          hasNewFeatures ? "text-accent animate-pulse" : "text-muted-foreground"
                        )} />
                        <span className="font-display text-base font-medium flex-1">
                          What's New
                        </span>
                        {hasNewFeatures && newEntriesCount > 0 && (
                          <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-bold rounded-full bg-accent text-accent-foreground">
                            {newEntriesCount > 9 ? '9+' : newEntriesCount}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </nav>

                {/* Mobile Menu Footer - Settings */}
                <div className="border-t border-border p-4 bg-secondary/20">
                  <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                    Settings
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ThemeModeToggle />
                    <CelebrationToggle />
                    <LanguageToggle />
                    <RegionSwitcher />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={toggleHaptic}
                      className={cn(
                        "h-9 w-9 transition-colors",
                        hapticEnabled ? "text-accent bg-accent/10" : "text-muted-foreground"
                      )}
                    >
                      <Vibrate className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
