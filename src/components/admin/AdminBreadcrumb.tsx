import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Route to label mapping for better readability
const routeLabels: Record<string, string> = {
  admin: 'Dashboard',
  analytics: 'Analytics',
  thoughts: 'Thoughts',
  scenarios: 'Scenarios',
  triggers: 'Triggers',
  knowledge: 'Knowledge',
  'rag-content': 'RAG Content',
  embeddings: 'Embeddings',
  generate: 'AI Generate',
  brand: 'Brand',
  colors: 'Colors',
  typography: 'Typography',
  character: 'Character',
  production: 'Production',
  'wicklow-palette': 'Wicklow Palette',
  shopify: 'Shopify',
  webhooks: 'Webhooks',
  pod: 'POD Connections',
  mappings: 'Variant Mapping',
  orders: 'Orders',
  exceptions: 'Exceptions',
  products: 'Products',
  pricing: 'Pricing Rules',
  drops: 'Drops',
  messages: 'Contact Messages',
  'spam-queue': 'Spam Queue',
  subscribers: 'Subscribers',
  campaigns: 'Campaigns',
  templates: 'Email Templates',
  users: 'Users & Roles',
  sitemap: 'Sitemap & SEO',
  'og-preview': 'OG Image Preview',
  'og-cache': 'OG Cache Manager',
  'seasonal-banners': 'Seasonal Banners',
  'cron-jobs': 'Scheduled Tasks',
  audit: 'Audit Log',
};

// Section groupings for parent breadcrumbs
const sectionParents: Record<string, { label: string; path: string }> = {
  colors: { label: 'Brand', path: '/admin/brand' },
  typography: { label: 'Brand', path: '/admin/brand' },
  character: { label: 'Brand', path: '/admin/brand' },
  production: { label: 'Brand', path: '/admin/brand' },
  'wicklow-palette': { label: 'Brand', path: '/admin/brand' },
  webhooks: { label: 'Shopify', path: '/admin/shopify' },
  mappings: { label: 'POD', path: '/admin/pod' },
  exceptions: { label: 'Orders', path: '/admin/orders' },
};

export function AdminBreadcrumb() {
  const location = useLocation();
  
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Remove 'admin' from the display but keep it for path building
    if (pathSegments[0] === 'admin') {
      pathSegments.shift();
    }
    
    // Build breadcrumb items
    const items: { label: string; path: string; isLast: boolean }[] = [];
    
    // Always add Dashboard as first item
    items.push({
      label: 'Dashboard',
      path: '/admin',
      isLast: pathSegments.length === 0,
    });
    
    // If we're on the dashboard, that's it
    if (pathSegments.length === 0) {
      return items;
    }
    
    // Check if first segment has a parent section
    const firstSegment = pathSegments[0];
    const parentSection = sectionParents[firstSegment];
    
    if (parentSection) {
      items.push({
        label: parentSection.label,
        path: parentSection.path,
        isLast: false,
      });
    }
    
    // Build path progressively
    let currentPath = '/admin';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Skip if this is the parent section we already added
      if (parentSection && index === 0 && routeLabels[segment] === parentSection.label) {
        return;
      }
      
      items.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        path: currentPath,
        isLast,
      });
    });
    
    return items;
  }, [location.pathname]);

  // Don't show breadcrumb if only Dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.path}>
            {crumb.isLast ? (
              <BreadcrumbPage className="flex items-center gap-1.5">
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                {crumb.label}
              </BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link to={crumb.path} className="flex items-center gap-1.5">
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
