import { Link } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const { user } = useAuth();
  const { canAccessAdmin, isSuperAdmin } = useUserRoles();
  
  // Only show admin link if user is authenticated and has admin/super_admin role
  const showAdminLink = user && canAccessAdmin;

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bubbles-cream border-2 border-bubbles-heather flex items-center justify-center">
                <span className="font-display font-bold text-bubbles-peat">B</span>
              </div>
              <span className="font-display font-bold text-xl">Bubbles</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A sweet, daft sheep from Wicklow. Cute outside, savage inside.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/collections/all" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/collections/tees" className="hover:text-foreground transition-colors">T-Shirts</Link></li>
              <li><Link to="/collections/hoodies" className="hover:text-foreground transition-colors">Hoodies</Link></li>
              <li><Link to="/collections/accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-foreground transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
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
                className={`text-xs transition-colors ${
                  isSuperAdmin 
                    ? "text-mode-nuclear/70 hover:text-mode-nuclear" 
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
      </div>
    </footer>
  );
}