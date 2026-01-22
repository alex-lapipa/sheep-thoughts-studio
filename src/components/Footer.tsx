import { Link } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { useCookieConsent } from "./CookieConsent";

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
  
  // Only show admin link if user is authenticated and has admin/super_admin role
  const showAdminLink = user && canAccessAdmin;

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
              <li><Link to="/data-rights" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Your Data Rights</Link></li>
              <li><Link to="/terms" className="hover:text-foreground hover:translate-x-1 inline-block transition-all">Terms of Service</Link></li>
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