import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  ChevronDown,
  ChevronRight,
  Users,
  ExternalLink,
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
    ],
  },
  {
    title: 'Bubbles AI',
    items: [
      { href: '/admin/thoughts', label: 'Thoughts', icon: Lightbulb },
      { href: '/admin/scenarios', label: 'Scenarios', icon: Zap },
      { href: '/admin/triggers', label: 'Triggers', icon: Target },
      { href: '/admin/knowledge', label: 'Knowledge', icon: BookOpen },
      { href: '/admin/generate', label: 'AI Generate', icon: Sparkles },
    ],
  },
  {
    title: 'Brand',
    items: [
      { href: '/admin/brand', label: 'Overview', icon: BookOpen },
      { href: '/admin/brand/colors', label: 'Colors', icon: Sparkles },
      { href: '/admin/brand/typography', label: 'Typography', icon: FileText },
      { href: '/admin/brand/character', label: 'Character', icon: Target },
      { href: '/admin/brand/production', label: 'Production', icon: Package },
    ],
  },
  {
    title: 'Shopify',
    requiredModule: 'shopify',
    items: [
      { href: '/admin/shopify', label: 'Connection', icon: Store, requiredModule: 'shopify' },
      { href: '/admin/shopify/webhooks', label: 'Webhooks', icon: Webhook, requiredModule: 'webhooks' },
    ],
  },
  {
    title: 'POD',
    requiredModule: 'pod',
    items: [
      { href: '/admin/pod', label: 'Connections', icon: Package, requiredModule: 'pod' },
      { href: '/admin/pod/mappings', label: 'Variant Mapping', icon: Link2, requiredModule: 'mappings' },
    ],
  },
  {
    title: 'Orders',
    requiredModule: 'orders',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, requiredModule: 'orders' },
      { href: '/admin/orders/exceptions', label: 'Exceptions', icon: AlertTriangle, requiredModule: 'exceptions' },
    ],
  },
  {
    title: 'Catalog',
    requiredModule: 'products',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package, requiredModule: 'products' },
      { href: '/admin/pricing', label: 'Pricing Rules', icon: DollarSign, requiredModule: 'pricing' },
      { href: '/admin/drops', label: 'Drops', icon: Tag, requiredModule: 'drops' },
    ],
  },
  {
    title: 'System',
    requiredModule: 'admin',
    items: [
      { href: '/admin/users', label: 'Users & Roles', icon: Users, requiredModule: 'admin' },
      { href: '/admin/audit', label: 'Audit Log', icon: FileText, requiredModule: 'audit' },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const { roles, isAdmin, canAccess, loading: rolesLoading } = useUserRoles();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Bubbles AI', 'Shopify', 'POD', 'Orders', 'Catalog', 'System']);

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

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    ops: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    merch: 'bg-green-500/10 text-green-500 border-green-500/20',
    readonly: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-2xl">🐑</span>
              <span className="font-display font-bold text-xl">Bubbles Ops</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Link to="/">
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
        <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-border bg-card overflow-y-auto">
          <nav className="p-4 space-y-2">
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
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{item.label}</span>
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
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
