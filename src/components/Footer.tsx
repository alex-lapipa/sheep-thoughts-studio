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

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
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
            <p className="text-sm text-muted-foreground">
              Made with wool and questionable life choices
            </p>
          </div>
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