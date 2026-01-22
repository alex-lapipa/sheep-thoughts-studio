import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Image,
  FileText,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  Bot,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Send,
  Loader2,
  ScanSearch,
  ImageOff,
  Check,
  X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageMeta {
  path: string;
  name: string;
  hasTitle: boolean;
  hasDescription: boolean;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  ogImagePath: string | null;
  hasTwitterCard: boolean;
  hasCanonical: boolean;
  status: "complete" | "partial" | "missing";
}

// Define all public pages with their expected OG configurations
const SITE_PAGES: PageMeta[] = [
  {
    path: "/",
    name: "Homepage",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-image.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/about",
    name: "About Bubbles",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-about.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/facts",
    name: "Facts",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-facts.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/faq",
    name: "FAQ",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-faq.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/explains",
    name: "Bubbles Explains",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-explains.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/achievements",
    name: "Achievements",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-achievements.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/privacy",
    name: "Privacy Policy",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-privacy.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/terms",
    name: "Terms of Service",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-terms.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/shipping",
    name: "Shipping & Returns",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-shipping.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/contact",
    name: "Contact",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-contact.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/search",
    name: "Search",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-search.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/share-badges",
    name: "Share Badges",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-share-badges.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/data-rights",
    name: "Data Rights",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-data-rights.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/collections/:collection",
    name: "Collections (Dynamic)",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "/og-collections.jpg",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
  {
    path: "/product/:handle",
    name: "Product Detail (Dynamic)",
    hasTitle: true,
    hasDescription: true,
    hasOgTitle: true,
    hasOgDescription: true,
    hasOgImage: true,
    ogImagePath: "(dynamic from product)",
    hasTwitterCard: true,
    hasCanonical: true,
    status: "complete",
  },
];

const StatusIcon = ({ status }: { status: PageMeta["status"] }) => {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "partial":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "missing":
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const MetaIndicator = ({ 
  present, 
  label, 
  icon: Icon 
}: { 
  present: boolean; 
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div 
    className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
      present 
        ? "bg-green-500/10 text-green-700 dark:text-green-400" 
        : "bg-red-500/10 text-red-700 dark:text-red-400"
    )}
  >
    <Icon className="h-3 w-3" />
    {label}
  </div>
);

// Robots.txt validation rules
interface RobotsValidation {
  rule: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

function validateRobotsTxt(content: string): RobotsValidation[] {
  const validations: RobotsValidation[] = [];
  const lines = content.split("\n").map(l => l.trim().toLowerCase());
  
  // Check for sitemap declaration
  const hasSitemap = lines.some(l => l.startsWith("sitemap:"));
  validations.push({
    rule: "Sitemap Declaration",
    status: hasSitemap ? "pass" : "fail",
    message: hasSitemap ? "Sitemap URL is declared" : "Missing Sitemap declaration"
  });

  // Check for user-agent declarations
  const hasUserAgent = lines.some(l => l.startsWith("user-agent:"));
  validations.push({
    rule: "User-Agent Rules",
    status: hasUserAgent ? "pass" : "fail",
    message: hasUserAgent ? "User-agent directives present" : "No user-agent rules defined"
  });

  // Check for wildcard user-agent
  const hasWildcard = lines.some(l => l === "user-agent: *");
  validations.push({
    rule: "Wildcard User-Agent",
    status: hasWildcard ? "pass" : "warn",
    message: hasWildcard ? "Catch-all user-agent defined" : "No wildcard user-agent (may miss some bots)"
  });

  // Check admin is blocked
  const adminBlocked = lines.some(l => l.includes("disallow: /admin"));
  validations.push({
    rule: "Admin Protected",
    status: adminBlocked ? "pass" : "fail",
    message: adminBlocked ? "/admin/ is blocked from crawling" : "Admin area is exposed to crawlers!"
  });

  // Check API is blocked
  const apiBlocked = lines.some(l => l.includes("disallow: /api"));
  validations.push({
    rule: "API Protected",
    status: apiBlocked ? "pass" : "warn",
    message: apiBlocked ? "/api/ is blocked from crawling" : "API endpoints may be indexed"
  });

  // Check for social bot access
  const socialBots = ["twitterbot", "facebookexternalhit", "linkedinbot"];
  const socialBotsAllowed = socialBots.every(bot => 
    lines.some(l => l.includes(bot))
  );
  validations.push({
    rule: "Social Bot Access",
    status: socialBotsAllowed ? "pass" : "warn",
    message: socialBotsAllowed ? "Social preview bots have access" : "Some social bots may be missing"
  });

  // Check for crawl-delay
  const hasCrawlDelay = lines.some(l => l.startsWith("crawl-delay:"));
  validations.push({
    rule: "Crawl Delay",
    status: hasCrawlDelay ? "pass" : "warn",
    message: hasCrawlDelay ? "Crawl delay is set for rate limiting" : "No crawl delay (optional)"
  });

  // Check for disallow all
  const disallowsAll = lines.some(l => l === "disallow: /");
  validations.push({
    rule: "Site Accessibility",
    status: disallowsAll ? "fail" : "pass",
    message: disallowsAll ? "Entire site is blocked from crawling!" : "Site is accessible to crawlers"
  });

  return validations;
}

interface OGImageValidation {
  path: string;
  name: string;
  ogImagePath: string;
  exists: boolean;
  status: "loading" | "valid" | "missing" | "error";
  dimensions?: { width: number; height: number };
  sizeValid?: boolean;
}

export default function AdminSitemap() {
  const [pages] = useState<PageMeta[]>(SITE_PAGES);
  const [robotsTxt, setRobotsTxt] = useState<string>("");
  const [robotsValidation, setRobotsValidation] = useState<RobotsValidation[]>([]);
  const [loadingRobots, setLoadingRobots] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    summary: { successful: number; total: number };
  } | null>(null);
  const [ogValidation, setOgValidation] = useState<OGImageValidation[]>([]);
  const [validatingOg, setValidatingOg] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const siteUrl = "https://sheep-thoughts-studio.lovable.app";
  const supabaseUrl = "https://iteckeoeowgguhgrpcnm.supabase.co";

  const fetchRobotsTxt = async () => {
    setLoadingRobots(true);
    try {
      const response = await fetch("/robots.txt");
      const text = await response.text();
      setRobotsTxt(text);
      setRobotsValidation(validateRobotsTxt(text));
    } catch (error) {
      console.error("Failed to fetch robots.txt:", error);
    } finally {
      setLoadingRobots(false);
    }
  };

  const pingSitemap = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/ping-sitemap`);
      const data = await response.json();
      setPingResult({
        success: data.success,
        summary: data.summary,
      });
    } catch (error) {
      console.error("Failed to ping sitemap:", error);
      setPingResult({ success: false, summary: { successful: 0, total: 0 } });
    } finally {
      setPinging(false);
    }
  };

  const validateOgImages = async () => {
    setValidatingOg(true);
    setValidationProgress(0);
    
    // Get all pages with static OG images (not dynamic)
    const staticOgPages = pages.filter(p => p.ogImagePath && !p.ogImagePath.startsWith("("));
    
    const results: OGImageValidation[] = staticOgPages.map(p => ({
      path: p.path,
      name: p.name,
      ogImagePath: p.ogImagePath!,
      exists: false,
      status: "loading" as const,
    }));
    
    setOgValidation(results);
    
    // Validate each image
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      try {
        const img = new window.Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            results[i] = {
              ...result,
              exists: true,
              status: "valid",
              dimensions: { width: img.naturalWidth, height: img.naturalHeight },
              sizeValid: img.naturalWidth >= 1200 && img.naturalHeight >= 630,
            };
            resolve();
          };
          img.onerror = () => {
            results[i] = {
              ...result,
              exists: false,
              status: "missing",
            };
            resolve();
          };
          img.src = result.ogImagePath;
        });
      } catch (error) {
        results[i] = {
          ...result,
          exists: false,
          status: "error",
        };
      }
      
      setValidationProgress(Math.round(((i + 1) / results.length) * 100));
      setOgValidation([...results]);
    }
    
    setValidatingOg(false);
  };

  useEffect(() => {
    fetchRobotsTxt();
  }, []);

  const stats = {
    total: pages.length,
    complete: pages.filter(p => p.status === "complete").length,
    partial: pages.filter(p => p.status === "partial").length,
    missing: pages.filter(p => p.status === "missing").length,
    withOgImage: pages.filter(p => p.hasOgImage).length,
    withTwitter: pages.filter(p => p.hasTwitterCard).length,
  };

  const completionPercentage = Math.round((stats.complete / stats.total) * 100);
  
  const robotsStats = {
    pass: robotsValidation.filter(v => v.status === "pass").length,
    warn: robotsValidation.filter(v => v.status === "warn").length,
    fail: robotsValidation.filter(v => v.status === "fail").length,
  };

  const ogStats = {
    valid: ogValidation.filter(v => v.status === "valid").length,
    missing: ogValidation.filter(v => v.status === "missing").length,
    wrongSize: ogValidation.filter(v => v.status === "valid" && !v.sizeValid).length,
    total: ogValidation.length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Sitemap & SEO Audit</h1>
            <p className="text-muted-foreground mt-1">
              Verify OG meta tags and social preview coverage for all pages
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                View sitemap.xml
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Asheep-thoughts-studio.lovable.app" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Globe className="h-4 w-4 mr-2" />
                Google Search Console
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://www.bing.com/webmasters/sitemaps?siteUrl=https://sheep-thoughts-studio.lovable.app" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Globe className="h-4 w-4 mr-2" />
                Bing Webmaster
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter Validator
              </a>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={pingSitemap}
              disabled={pinging}
            >
              {pinging ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {pinging ? "Pinging..." : "Ping Search Engines"}
            </Button>
            {pingResult && (
              <Badge 
                variant="outline" 
                className={cn(
                  pingResult.success 
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" 
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                )}
              >
                {pingResult.summary.successful}/{pingResult.summary.total} notified
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.complete}</div>
              <p className="text-sm text-muted-foreground">Fully Configured</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{stats.partial}</div>
              <p className="text-sm text-muted-foreground">Partial Coverage</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.withOgImage}</div>
              <p className="text-sm text-muted-foreground">With OG Images</p>
            </CardContent>
          </Card>
        </div>

        {/* Step-by-Step Guide */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              How to Verify & Submit Your Sitemap
            </CardTitle>
            <CardDescription>
              Follow these steps to ensure search engines can discover all your pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Verify Site Ownership</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a TXT record or HTML file to prove you own the domain in Google Search Console and Bing Webmaster Tools.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Submit Your Sitemap</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Go to Sitemaps section in each console and submit: <code className="bg-muted px-1 rounded text-xs">/sitemap.xml</code>
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Request Indexing</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use URL Inspection tool to request indexing for important pages that aren't appearing in search results.
                  </p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Ping Search Engines</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Ping Search Engines" button above after publishing new content to notify Google, Bing & Yandex.
                  </p>
                </div>
              </div>
              
              {/* Step 5 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Test Social Previews</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use Twitter Card Validator and Facebook Debugger to verify OG images display correctly when shared.
                  </p>
                </div>
              </div>
              
              {/* Step 6 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Monitor Coverage</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check the Coverage report in Search Console weekly for indexing errors or warnings to fix.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">SEO Completion</CardTitle>
            <CardDescription>
              {completionPercentage}% of pages have complete OG meta configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt Validator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Robots.txt Validator
                </CardTitle>
                <CardDescription>
                  Validate crawler directives and SEO best practices
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRobotsTxt}
                  disabled={loadingRobots}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", loadingRobots && "animate-spin")} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Raw
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Validation Results */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                    {robotsStats.pass} Passed
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                    {robotsStats.warn} Warnings
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30">
                    {robotsStats.fail} Failed
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {robotsValidation.map((validation, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        validation.status === "pass" && "bg-green-500/5 border-green-500/20",
                        validation.status === "warn" && "bg-yellow-500/5 border-yellow-500/20",
                        validation.status === "fail" && "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      {validation.status === "pass" && <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
                      {validation.status === "warn" && <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />}
                      {validation.status === "fail" && <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                      <div>
                        <div className="font-medium text-sm">{validation.rule}</div>
                        <div className="text-sm text-muted-foreground">{validation.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Content Preview */}
              <div>
                <div className="text-sm font-medium mb-2">File Contents</div>
                <ScrollArea className="h-[320px] rounded-lg border bg-muted/30">
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                    {robotsTxt || "Loading..."}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OG Image Validator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ScanSearch className="h-5 w-5" />
                  Bulk OG Image Validator
                </CardTitle>
                <CardDescription>
                  Check if all referenced OG images exist and have correct dimensions (1200×630)
                </CardDescription>
              </div>
              <Button 
                onClick={validateOgImages}
                disabled={validatingOg}
              >
                {validatingOg ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ScanSearch className="h-4 w-4 mr-2" />
                )}
                {validatingOg ? "Validating..." : "Validate All Images"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {validatingOg && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Checking images...</span>
                  <span>{validationProgress}%</span>
                </div>
                <Progress value={validationProgress} className="h-2" />
              </div>
            )}
            
            {ogValidation.length > 0 && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold">{ogStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Checked</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{ogStats.valid}</div>
                    <div className="text-sm text-muted-foreground">Valid</div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{ogStats.missing}</div>
                    <div className="text-sm text-muted-foreground">Missing</div>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ogStats.wrongSize}</div>
                    <div className="text-sm text-muted-foreground">Wrong Size</div>
                  </div>
                </div>

                {/* Validation Results Table */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {ogValidation.map((validation) => (
                      <div 
                        key={validation.path}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg border",
                          validation.status === "valid" && validation.sizeValid && "bg-green-500/5 border-green-500/20",
                          validation.status === "valid" && !validation.sizeValid && "bg-yellow-500/5 border-yellow-500/20",
                          validation.status === "missing" && "bg-red-500/5 border-red-500/20",
                          validation.status === "loading" && "bg-muted/50"
                        )}
                      >
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {validation.status === "loading" && (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          )}
                          {validation.status === "valid" && validation.sizeValid && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                          {validation.status === "valid" && !validation.sizeValid && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          {validation.status === "missing" && (
                            <ImageOff className="h-5 w-5 text-red-500" />
                          )}
                          {validation.status === "error" && (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-16 h-8 rounded overflow-hidden border bg-muted flex-shrink-0">
                          {validation.status === "valid" ? (
                            <img 
                              src={validation.ogImagePath}
                              alt={validation.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Page Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{validation.name}</div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {validation.ogImagePath}
                          </div>
                        </div>

                        {/* Dimensions */}
                        <div className="text-sm text-right flex-shrink-0">
                          {validation.dimensions ? (
                            <div className={cn(
                              "font-mono",
                              validation.sizeValid ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                            )}>
                              {validation.dimensions.width}×{validation.dimensions.height}
                              {!validation.sizeValid && (
                                <div className="text-xs text-muted-foreground">
                                  (should be 1200×630+)
                                </div>
                              )}
                            </div>
                          ) : validation.status === "missing" ? (
                            <span className="text-red-600 dark:text-red-400">Not Found</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>

                        {/* Link */}
                        {validation.status === "valid" && (
                          <a 
                            href={validation.ogImagePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
            
            {ogValidation.length === 0 && !validatingOg && (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Validate All Images" to check if all OG images exist</p>
                <p className="text-sm mt-1">This will verify each image loads correctly and check dimensions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>All Pages</CardTitle>
            <CardDescription>
              Click on a page to preview it. Green indicators show configured meta tags.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pages.map((page) => (
                <div 
                  key={page.path}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  {/* OG Image Thumbnail */}
                  <div className="flex-shrink-0">
                    {page.ogImagePath && !page.ogImagePath.startsWith("(") ? (
                      <a 
                        href={`${siteUrl}${page.ogImagePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative group"
                      >
                        <div className="w-24 h-[50px] md:w-32 md:h-[67px] rounded-md overflow-hidden border bg-muted">
                          <img 
                            src={page.ogImagePath}
                            alt={`OG image for ${page.name}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                              (e.target as HTMLImageElement).insertAdjacentHTML('afterend', '<span class="text-xs text-muted-foreground">Not found</span>');
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                      </a>
                    ) : (
                      <div className="w-24 h-[50px] md:w-32 md:h-[67px] rounded-md border bg-muted flex items-center justify-center">
                        {page.ogImagePath?.startsWith("(") ? (
                          <span className="text-[10px] text-muted-foreground text-center px-1">Dynamic</span>
                        ) : (
                          <Image className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Page Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={page.status} />
                      <span className="font-medium truncate">{page.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono truncate mt-0.5">
                      {page.path}
                    </div>
                    {/* Meta indicators - mobile responsive */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <MetaIndicator present={page.hasTitle} label="Title" icon={FileText} />
                      <MetaIndicator present={page.hasOgTitle} label="OG" icon={Globe} />
                      <MetaIndicator present={page.hasOgImage} label="Image" icon={Image} />
                      <MetaIndicator present={page.hasTwitterCard} label="Twitter" icon={Twitter} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Social debuggers dropdown */}
                    {!page.path.includes(":") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="hidden sm:flex">
                            Test Preview
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.open(
                              `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(siteUrl + page.path)}`,
                              "_blank"
                            )}
                            className="cursor-pointer"
                          >
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook Debugger
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(
                              `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(siteUrl + page.path)}`,
                              "_blank"
                            )}
                            className="cursor-pointer"
                          >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn Inspector
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {/* View page button */}
                    {!page.path.includes(":") && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={page.path} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missing OG Images */}
        {stats.partial > 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                Pages Missing OG Images
              </CardTitle>
              <CardDescription>
                These pages would benefit from custom OG images for better social sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pages
                  .filter(p => !p.hasOgImage)
                  .map(p => (
                    <Badge key={p.path} variant="outline" className="border-yellow-500/30">
                      {p.name}
                    </Badge>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* OG Image Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>OG Image Gallery</CardTitle>
            <CardDescription>
              Preview all configured Open Graph images (1200×630 recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages
                .filter(p => p.ogImagePath && !p.ogImagePath.startsWith("("))
                .map(p => (
                  <div key={p.path} className="space-y-2">
                    <a 
                      href={`${siteUrl}${p.ogImagePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={p.ogImagePath!}
                        alt={`OG image for ${p.name}`}
                        className="w-full aspect-[1.91/1] object-cover rounded-lg border hover:ring-2 hover:ring-primary transition-all"
                      />
                    </a>
                    <div className="text-sm font-medium text-center">{p.name}</div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
