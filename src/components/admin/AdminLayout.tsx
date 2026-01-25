import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { AdminQuickJump } from './AdminQuickJump';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Lightbulb, 
  Zap, 
  BookOpen, 
  Target, 
  LogOut, 
  Home,
  Sparkles,
  Store,
  Webhook,
  Package,
  Link2,
  ShoppingCart,
  AlertTriangle,
  Tag,
  DollarSign,
  Percent,
  FileText,
  ChevronDown,
  ChevronRight,
  Users,
  ExternalLink,
  MessageCircle,
  BarChart3,
  Mail,
  Map,
  Megaphone,
  Calendar,
  Timer,
  Database,
  HardDrive,
  PanelLeftClose,
  PanelLeft,
  Shield,
  Bell,
  Image,
  User,
  Briefcase,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
  requiredModule?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredModule?: string;
  external?: boolean;
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: Home },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/ab-test', label: 'A/B Testing', icon: Target },
      { href: '/admin/business-plan', label: 'Business Plan', icon: Briefcase },
    ],
  },
  {
    title: 'Store',
    requiredModule: 'shopify',
    items: [
      { href: '/admin/shopify', label: 'Connection & Sync', icon: Store, requiredModule: 'shopify' },
      { href: '/admin/products', label: 'Products', icon: Package, requiredModule: 'products' },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, requiredModule: 'orders' },
      { href: '/admin/orders/exceptions', label: 'Exceptions', icon: AlertTriangle, requiredModule: 'exceptions' },
      { href: '/admin/pod', label: 'POD & Apps', icon: Link2, requiredModule: 'pod' },
      { href: '/admin/pod/mappings', label: 'Variant Mapping', icon: Package, requiredModule: 'mappings' },
      { href: '/admin/discounts', label: 'Discount Codes', icon: Percent, requiredModule: 'pricing' },
      { href: '/admin/pricing', label: 'Pricing Rules', icon: DollarSign, requiredModule: 'pricing' },
      { href: '/admin/drops', label: 'Drops', icon: Tag, requiredModule: 'drops' },
      { href: '/admin/shopify/webhooks', label: 'Webhooks', icon: Webhook, requiredModule: 'webhooks' },
    ],
  },
  {
    title: 'Bubbles AI',
    items: [
      { href: '/admin/thoughts', label: 'Thoughts', icon: Lightbulb },
      { href: '/admin/scenarios', label: 'Scenarios', icon: Zap },
      { href: '/admin/triggers', label: 'Triggers', icon: Target },
      { href: '/admin/mentors', label: 'Mentors', icon: Users },
      { href: '/admin/mentors/analytics', label: 'Mentor Analytics', icon: BarChart3 },
      { href: '/admin/knowledge', label: 'Knowledge', icon: BookOpen },
      { href: '/admin/rag-content', label: 'RAG Content', icon: FileText },
      { href: '/admin/rag-search', label: 'RAG Search', icon: Sparkles },
      { href: '/admin/faq-knowledge', label: 'FAQ Knowledge', icon: HelpCircle },
      { href: '/admin/embeddings', label: 'Embeddings', icon: Database },
      { href: '/admin/generate', label: 'AI Generate', icon: Sparkles },
    ],
  },
  {
    title: 'Brand',
    items: [
      { href: '/admin/brand', label: 'Overview', icon: BookOpen },
      { href: '/about', label: 'My Story', icon: User, external: true },
      { href: '/admin/brand/colors', label: 'Colors', icon: Sparkles },
      { href: '/admin/brand/typography', label: 'Typography', icon: FileText },
      { href: '/admin/brand/character', label: 'Character', icon: Target },
      { href: '/admin/brand/production', label: 'Production', icon: Package },
      { href: '/admin/brand/frontend', label: 'Frontend', icon: ExternalLink },
      { href: '/admin/brand/wicklow-palette', label: 'Wicklow Palette', icon: Sparkles },
      { href: '/admin/brand/gallery', label: 'Character Gallery', icon: Target },
      { href: '/admin/brand/review', label: 'Character Review', icon: Shield },
      { href: '/admin/illustrations', label: 'Illustration Generator', icon: Image },
    ],
  },
  {
    title: 'Support',
    requiredModule: 'ops',
    items: [
      { href: '/admin/messages', label: 'Contact Messages', icon: MessageCircle, requiredModule: 'ops' },
      { href: '/admin/spam-queue', label: 'Spam Queue', icon: AlertTriangle, requiredModule: 'ops' },
      { href: '/admin/subscribers', label: 'Subscribers', icon: Users, requiredModule: 'ops' },
      { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone, requiredModule: 'ops' },
      { href: '/admin/templates', label: 'Email Templates', icon: Mail, requiredModule: 'ops' },
    ],
  },
  {
    title: 'Languages',
    requiredModule: 'admin',
    items: [
      { href: '/dach', label: 'Deutschland 🇩🇪', icon: Globe, external: true },
      { href: '/fr', label: 'France 🇫🇷', icon: Globe, external: true },
      { href: '/es', label: 'España 🇪🇸', icon: Globe, external: true },
      { href: '/mx', label: 'México 🇲🇽', icon: Globe, external: true },
      { href: '/ar', label: 'Argentina 🇦🇷', icon: Globe, external: true },
      { href: '/latam', label: 'Latinoamérica 🌎', icon: Globe, external: true },
      { href: '/be', label: 'Belgique 🇧🇪', icon: Globe, external: true },
      { href: '/lu', label: 'Luxembourg 🇱🇺', icon: Globe, external: true },
    ],
  },
  {
    title: 'System',
    requiredModule: 'admin',
    items: [
      { href: '/admin/users', label: 'Users & Roles', icon: Users, requiredModule: 'admin' },
      { href: '/admin/pre-authorized', label: 'Pre-Authorized', icon: Shield, requiredModule: 'admin' },
      { href: '/admin/sitemap', label: 'Sitemap & SEO', icon: Map },
      { href: '/admin/og-preview', label: 'OG Image Preview', icon: ExternalLink },
      { href: '/admin/og-cache', label: 'OG Cache Manager', icon: HardDrive },
      { href: '/admin/seasonal-banners', label: 'Seasonal Banners', icon: Calendar },
      { href: '/admin/cron-jobs', label: 'Scheduled Tasks', icon: Timer },
      { href: '/admin/audit', label: 'Audit Log', icon: FileText, requiredModule: 'audit' },
      { href: '/admin/whats-new', label: "What's New", icon: Bell },
      { href: '/admin/presentation', label: 'Presentation', icon: Sparkles },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const { roles, isAdmin, isOwner, canAccess, loading: rolesLoading } = useUserRoles();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Store', 'Bubbles AI', 'Brand', 'Support', 'System']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Subscribe to real-time order notifications
  useOrderNotifications();

  // Persist sidebar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', String(sidebarCollapsed));
    } catch {
      // Ignore storage errors
    }
  }, [sidebarCollapsed]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    ops: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    merch: 'bg-green-500/10 text-green-500 border-green-500/20',
    readonly: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Sidebar Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="h-9 w-9"
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
              <Link to="/admin" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bubbles-cream border-2 border-bubbles-heather flex items-center justify-center">
                  <span className="font-display font-bold text-sm text-bubbles-peat">G</span>
                </div>
                <span className="font-display font-bold text-xl hidden sm:inline">Genius</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2">
                {!rolesLoading && isOwner && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-bubbles-gorse/20 text-bubbles-gorse border-bubbles-gorse/30 font-semibold"
                  >
                    👑 Owner
                  </Badge>
                )}
                {!rolesLoading && roles.map(role => (
                  <Badge 
                    key={role} 
                    variant="outline" 
                    className={cn('capitalize text-xs', roleColors[role])}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
              <span className="text-sm text-muted-foreground hidden lg:inline">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
              <Link to="/" className="hidden md:block">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Store
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside 
            className={cn(
              "min-h-[calc(100vh-4rem)] border-r border-border bg-card overflow-y-auto flex-shrink-0",
              "transition-[width] duration-300 ease-out",
              sidebarCollapsed ? "w-16" : "w-64"
            )}
          >
            <nav className={cn(
              "space-y-2 transition-[padding] duration-300 ease-out",
              sidebarCollapsed ? "p-2" : "p-4"
            )}>
              {navSections.map((section) => {
                // Check if user can access this section
                const canAccessSection = !section.requiredModule || 
                  section.requiredModule === 'admin' ? isAdmin : canAccess(section.requiredModule);
                
                if (!canAccessSection && section.requiredModule) return null;

                const isExpanded = expandedSections.includes(section.title);
                const visibleItems = section.items.filter(item => 
                  !item.requiredModule || canAccess(item.requiredModule)
                );

                if (visibleItems.length === 0) return null;

                // Collapsed view - show only icons
                if (sidebarCollapsed) {
                  return (
                    <div key={section.title} className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.href}
                                className={cn(
                                  'flex items-center justify-center w-12 h-10 rounded-lg transition-colors',
                                  isActive 
                                    ? 'bg-accent text-accent-foreground' 
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  );
                }

                // Expanded view - full navigation
                return (
                  <div key={section.title}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {section.title}
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="mt-1 space-y-1">
                        {visibleItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                                isActive 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                              )}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
            <AdminBreadcrumb />
            {children}
          </main>
          <AdminQuickJump />
        </div>
      </div>
    </TooltipProvider>
  );
}
