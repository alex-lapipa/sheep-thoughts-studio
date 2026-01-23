import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Target, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Search,
  Megaphone,
  ShoppingBag,
  DollarSign,
  Calendar,
  AlertTriangle,
  Gauge,
  RefreshCw,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string | null;
  loading: boolean;
  generated: boolean;
}

const initialSections: Section[] = [
  {
    id: "executive_summary",
    title: "Executive Summary",
    description: "Business overview, value proposition, and 12-month outlook",
    icon: <FileText className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "swot_analysis",
    title: "SWOT Analysis",
    description: "Strengths, Weaknesses, Opportunities, Threats",
    icon: <Target className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "market_analysis",
    title: "Market Analysis",
    description: "TAM/SAM/SOM, customer segments, and market trends",
    icon: <BarChart3 className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "competitor_analysis",
    title: "Competitor Analysis",
    description: "Competitive landscape and positioning",
    icon: <Users className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "marketing_peso",
    title: "Marketing Strategy (PESO)",
    description: "Paid, Earned, Shared, Owned media framework",
    icon: <Megaphone className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "seo_strategy",
    title: "SEO Strategy",
    description: "Organic search optimization and content plan",
    icon: <Search className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "sales_funnel",
    title: "Sales Funnel",
    description: "Customer journey and conversion optimization",
    icon: <TrendingUp className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "product_strategy",
    title: "Product Strategy",
    description: "10 initial products with market analysis",
    icon: <ShoppingBag className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "revenue_projections",
    title: "Revenue Projections",
    description: "12-month conservative financial model",
    icon: <DollarSign className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "monthly_action_plan",
    title: "Monthly Action Plan",
    description: "Detailed 12-month tactical roadmap",
    icon: <Calendar className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "risk_analysis",
    title: "Risk Analysis",
    description: "Risk matrix with mitigation strategies",
    icon: <AlertTriangle className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "kpi_dashboard",
    title: "KPI Dashboard",
    description: "Key metrics and success indicators",
    icon: <Gauge className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
  {
    id: "financial_summary",
    title: "Financial Summary",
    description: "Investment-ready financial overview",
    icon: <FileText className="h-5 w-5" />,
    content: null,
    loading: false,
    generated: false,
  },
];

export default function BusinessPlan() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [activeSection, setActiveSection] = useState("executive_summary");
  const [generatingAll, setGeneratingAll] = useState(false);
  const [loadingCache, setLoadingCache] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load cached sections on mount
  useEffect(() => {
    const loadCachedSections = async () => {
      try {
        const { data, error } = await supabase
          .from('business_plan_sections')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          setSections(prev => prev.map(section => {
            const cached = data.find(d => d.id === section.id);
            if (cached) {
              return {
                ...section,
                content: cached.content,
                generated: true,
              };
            }
            return section;
          }));

          // Get most recent update time
          const mostRecent = data.reduce((latest, item) => {
            const itemDate = new Date(item.updated_at);
            return itemDate > new Date(latest) ? item.updated_at : latest;
          }, data[0].updated_at);
          setLastUpdated(mostRecent);
        }
      } catch (error) {
        console.error('Failed to load cached sections:', error);
      } finally {
        setLoadingCache(false);
      }
    };

    loadCachedSections();
  }, []);

  // Save section to database
  const saveSectionToCache = async (sectionId: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('business_plan_sections')
        .upsert({
          id: sectionId,
          title,
          content,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Failed to cache section:', error);
    }
  };

  const generateSection = async (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, loading: true } : s
    ));

    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: { section: sectionId }
      });

      if (error) throw error;

      const sectionTitle = sections.find(s => s.id === sectionId)?.title || sectionId;
      
      // Save to cache
      await saveSectionToCache(sectionId, sectionTitle, data.content);

      setSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, content: data.content, loading: false, generated: true } : s
      ));

      toast.success(`${sectionTitle} generated and saved`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(`Failed to generate section: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, loading: false } : s
      ));
    }
  };

  const generateAllSections = async () => {
    setGeneratingAll(true);
    
    for (const section of sections) {
      if (!section.generated) {
        await generateSection(section.id);
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setGeneratingAll(false);
    toast.success("Business plan generation complete!");
  };

  const exportToMarkdown = () => {
    const generatedSections = sections.filter(s => s.generated && s.content);
    if (generatedSections.length === 0) {
      toast.error("No sections generated yet");
      return;
    }

    const markdown = `# Bubbles the Sheep - Business Plan
## 12-Month Strategic Plan | March 2025 - February 2026
### Europe & North America Market Entry

---

${generatedSections.map(s => `## ${s.title}\n\n${s.content}\n\n---\n`).join('\n')}

*Generated by Bubbles AI Business Planning Engine*
*Date: ${new Date().toLocaleDateString()}*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bubbles-business-plan-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Business plan exported!");
  };

  const generatedCount = sections.filter(s => s.generated).length;
  const progress = (generatedCount / sections.length) * 100;

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-accent" />
              Business Plan Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered 12-month business strategy for Bubbles the Sheep
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToMarkdown}
              disabled={generatedCount === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export MD
            </Button>
            <Button
              onClick={generateAllSections}
              disabled={generatingAll || generatedCount === sections.length}
              className="bg-accent hover:bg-accent/90"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Generation Progress</span>
                {loadingCache && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading cached data...
                  </span>
                )}
                {lastUpdated && !loadingCache && (
                  <span className="text-xs text-muted-foreground">
                    Last saved: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {generatedCount} / {sections.length} sections
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Plan Details Banner */}
        <Card className="bg-gradient-to-r from-bubbles-meadow/20 via-accent/10 to-bubbles-gorse/20 border-accent/30">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">Mar 2025</p>
                <p className="text-xs text-muted-foreground">Start Date</p>
              </div>
              <div>
                <p className="text-2xl font-bold">12 Months</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div>
                <p className="text-2xl font-bold">EU + NA</p>
                <p className="text-xs text-muted-foreground">Markets</p>
              </div>
              <div>
                <p className="text-2xl font-bold">€0</p>
                <p className="text-xs text-muted-foreground">Cost Budget</p>
              </div>
              <div>
                <p className="text-2xl font-bold">10 SKUs</p>
                <p className="text-xs text-muted-foreground">Initial Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Section List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Plan Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        activeSection === section.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {section.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : section.generated ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{section.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentSection?.icon}
                  <div>
                    <CardTitle>{currentSection?.title}</CardTitle>
                    <CardDescription>{currentSection?.description}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateSection(activeSection)}
                  disabled={currentSection?.loading}
                >
                  {currentSection?.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : currentSection?.generated ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                {currentSection?.loading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-accent" />
                    <p className="text-muted-foreground">
                      AI is analyzing and generating your {currentSection.title}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take 15-30 seconds
                    </p>
                  </div>
                ) : currentSection?.content ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-base font-medium mt-3 mb-2 text-foreground">{children}</h4>,
                        p: ({ children }) => <p className="mb-3 text-foreground/90 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-border rounded-lg">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                        th: ({ children }) => <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-2 text-sm text-foreground">{children}</td>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                        ),
                        hr: () => <hr className="my-6 border-border" />,
                      }}
                    >
                      {currentSection.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      {currentSection?.icon}
                    </div>
                    <div>
                      <p className="font-medium">{currentSection?.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click "Generate" to create this section with AI
                      </p>
                    </div>
                    <Button onClick={() => generateSection(activeSection)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Section
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Framework Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Methodology & Frameworks Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">SWOT Analysis</Badge>
              <Badge variant="outline">PESO Framework</Badge>
              <Badge variant="outline">TAM/SAM/SOM</Badge>
              <Badge variant="outline">Porter's Five Forces</Badge>
              <Badge variant="outline">Sales Funnel</Badge>
              <Badge variant="outline">Risk Matrix</Badge>
              <Badge variant="outline">Unit Economics</Badge>
              <Badge variant="outline">Break-even Analysis</Badge>
              <Badge variant="outline">McKinsey 7S</Badge>
              <Badge variant="outline">OKR Framework</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Business plan generated using Gemini AI with professional CFO/McKinsey consultant voice. 
              All projections are conservative estimates for investor credibility.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
