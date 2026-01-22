import { Link } from "react-router-dom";
import { useState } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { useCookieConsent } from "./CookieConsent";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle } from "lucide-react";

const RANDOM_SHEEP_QUOTES = [
  "Baa. (This is a legal statement.)",
  "I understood this footer. (I did not.)",
  "This information is definitely correct.",
  "Click things. See what happens.",
  "You're still scrolling? Suspicious.",
];

export function Footer() {
  const { user } = useAuth();
  const { canAccessAdmin, isSuperAdmin } = useUserRoles();
  const { openSettings: openCookieSettings } = useCookieConsent();
  const randomQuote = RANDOM_SHEEP_QUOTES[Math.floor(Math.random() * RANDOM_SHEEP_QUOTES.length)];
  
  // Newsletter state
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Only show admin link if user is authenticated and has admin/super_admin role
  const showAdminLink = user && canAccessAdmin;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (trimmedEmail.length > 255) {
      toast.error("Email address is too long");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { 
          email: trimmedEmail.toLowerCase(),
          source: "footer"
        },
      });

      if (error) throw error;

      if (data?.success) {
        setIsSubscribed(true);
        toast.success(data.message || "Check your inbox to confirm your subscription!");
        setEmail("");
      } else {
        toast.error(data?.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast.error("Something went wrong. Even Bubbles is confused.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border bg-secondary/30 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-accent/5 animate-drift" />
      <div className="absolute bottom-0 right-1/3 w-24 h-24 rounded-full bg-wicklow-butter/10 animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="container py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-bubbles-cream border-2 border-bubbles-heather flex items-center justify-center group-hover:animate-baa transition-transform">
                <span className="font-display font-bold text-bubbles-peat">B</span>
              </div>
              <span className="font-display font-bold text-xl group-hover:animate-wobble">Bubbles</span>
            </Link>
            <p className="text-muted-foreground text-sm animate-fade-in">
              A sweet, daft sheep from Wicklow. Cute outside, savage inside.
            </p>
            <p className="text-xs text-muted-foreground/70 italic animate-bounce-gentle">
              "{randomQuote}"
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/collections/all" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">All Products</Link></li>
              <li><Link to="/collections/tees" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">T-Shirts</Link></li>
              <li><Link to="/collections/hoodies" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">Hoodies</Link></li>
              <li><Link to="/collections/accessories" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">Accessories</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold mb-4">Get Lost</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/facts" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">Bubbles' Facts</Link></li>
              <li><Link to="/scenarios" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">Escalation Journeys</Link></li>
              <li><Link to="/about" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">Meet Bubbles</Link></li>
              <li><Link to="/faq" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">Ask Bubbles</Link></li>
              <li><Link to="/whats-new" className="hover:text-foreground hover:translate-x-1 inline-block transition-all hover:animate-wiggle">What's New ✨</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support (Sort Of)</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Shipping & Returns</Link></li>
              <li><Link to="/contact" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
              <li><Link to="/privacy#your-rights" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Data Deletion</Link></li>
              <li><Link to="/data-rights" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Your Data Rights</Link></li>
              <li><Link to="/terms" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Terms of Service</Link></li>
              <li>
                <a 
                  href="https://iteckeoeowgguhgrpcnm.supabase.co/functions/v1/generate-sitemap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:translate-x-1 inline-block transition-all"
                >
                  Sitemap
                </a>
              </li>
              <li>
                <button 
                  onClick={openCookieSettings}
                  className="hover:text-foreground hover:translate-x-1 inline-block transition-all text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mail className="h-5 w-5 text-accent" />
              <h4 className="font-display font-semibold">Join the Flock</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get Bubbles' questionable wisdom delivered straight to your inbox. Unsubscribe whenever. No hard feelings. Sheep don't hold grudges.
            </p>
            
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-primary py-2 animate-fade-in">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Check your email to confirm!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.baa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                  maxLength={255}
                  aria-label="Email address for newsletter"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="shrink-0"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            )}
            <p className="text-xs text-muted-foreground/70 mt-2">
              By subscribing, you agree that Bubbles may email you. No spam, just wool.
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground mr-2">Follow Bubbles:</span>
              <a
                href="https://x.com/bubblesthesheep"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-secondary hover:bg-bubbles-heather/20 transition-all duration-300 hover:scale-110"
                aria-label="Follow on X (Twitter)"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300 group-hover:animate-wiggle"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-bubbles-peat text-bubbles-cream text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Baa on X
                </span>
              </a>
              <a
                href="https://instagram.com/bubblesthesheep"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-secondary hover:bg-gradient-to-br hover:from-purple-500/20 hover:via-pink-500/20 hover:to-orange-500/20 transition-all duration-300 hover:scale-110"
                aria-label="Follow on Instagram"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300 group-hover:animate-baa"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-bubbles-peat text-bubbles-cream text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Wool pics
                </span>
              </a>
              <a
                href="https://tiktok.com/@bubblesthesheep"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-secondary hover:bg-bubbles-butter/20 transition-all duration-300 hover:scale-110"
                aria-label="Follow on TikTok"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300 group-hover:animate-confused-spin"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-bubbles-peat text-bubbles-cream text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Chaotic dances
                </span>
              </a>
              <a
                href="https://youtube.com/@bubblesthesheep"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-secondary hover:bg-red-500/20 transition-all duration-300 hover:scale-110"
                aria-label="Watch on YouTube"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300 group-hover:animate-float"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-bubbles-peat text-bubbles-cream text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Sheep videos
                </span>
              </a>
              <a
                href="https://threads.net/@bubblesthesheep"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-secondary hover:bg-foreground/10 transition-all duration-300 hover:scale-110"
                aria-label="Follow on Threads"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300 group-hover:animate-wiggle"
                  fill="currentColor"
                >
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.88-.73 2.132-1.13 3.628-1.154 1.086-.017 2.083.112 2.996.384.004-.396-.006-.788-.03-1.176-.098-1.554-.396-2.426-.985-3.164-.68-.854-1.683-1.282-2.979-1.282h-.037c-.939.006-1.802.29-2.435.802-.68.549-1.12 1.333-1.31 2.335l-2.028-.378c.262-1.39.878-2.512 1.835-3.326.988-.84 2.25-1.324 3.7-1.42l.21-.007c1.983 0 3.553.713 4.67 2.119.917 1.153 1.376 2.693 1.495 4.573.035.556.048 1.137.04 1.742.644.264 1.212.607 1.7 1.03 1.085.942 1.81 2.238 2.097 3.746.287 1.509.08 3.133-.599 4.698-.679 1.565-1.783 2.876-3.193 3.792-1.544 1.002-3.405 1.51-5.54 1.51zm-1.14-8.586c-.076 0-.153.002-.23.006-.996.054-1.74.316-2.216.78-.424.411-.618.894-.582 1.44.04.586.306 1.063.796 1.418.513.372 1.209.556 2.07.556.1 0 .201-.002.303-.008 1.093-.058 1.904-.462 2.41-1.199.42-.612.686-1.418.795-2.393-.865-.4-1.905-.6-3.346-.6z"/>
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-bubbles-peat text-bubbles-cream text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Hot takes
                </span>
              </a>
            </div>

            {/* Copyright & Admin */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Bubbles the Sheep. Born in Wicklow. Raised on the internet.
              </p>
              <div className="flex items-center gap-4">
                {showAdminLink && (
                  <Link 
                    to="/admin" 
                    className={`text-xs transition-all hover:scale-110 ${
                      isSuperAdmin 
                        ? "text-mode-nuclear/70 hover:text-mode-nuclear hover:animate-confused-spin" 
                        : "text-muted-foreground/50 hover:text-muted-foreground"
                    }`}
                  >
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </Link>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Made with wool and questionable life choices
          </p>
        </div>

        {/* Creator Credit */}
        <div className="mt-6 text-center">
          <a 
            href="https://alexlawton.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-all hover:scale-105 inline-block"
          >
            Alex Lawton
          </a>
        </div>
      </div>
    </footer>
  );
}