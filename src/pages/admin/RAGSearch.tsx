import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Loader2, 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Zap,
  BarChart3,
  Database,
  FileText,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSemanticSearch, type SemanticSearchResult } from "@/hooks/useSemanticSearch";

const SOURCE_CONFIG = {
  knowledge: { 
    label: "Knowledge Base", 
    icon: BookOpen, 
    color: "bg-blue-500",
    description: "Character bible, psychology, brand guidelines"
  },
  thoughts: { 
    label: "Thoughts", 
    icon: MessageCircle, 
    color: "bg-green-500",
    description: "Pre-written thought bubbles and quips"
  },
  rag: { 
    label: "RAG Content", 
    icon: Sparkles, 
    color: "bg-purple-500",
    description: "Wrong takes, comedy hooks, signature lines"
  },
};

function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.8) return "text-green-600 dark:text-green-400";
  if (similarity >= 0.6) return "text-yellow-600 dark:text-yellow-400";
  if (similarity >= 0.4) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getSimilarityBg(similarity: number): string {
  if (similarity >= 0.8) return "bg-green-100 dark:bg-green-900/30";
  if (similarity >= 0.6) return "bg-yellow-100 dark:bg-yellow-900/30";
  if (similarity >= 0.4) return "bg-orange-100 dark:bg-orange-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

interface ResultCardProps {
  result: SemanticSearchResult;
  rank: number;
}

function ResultCard({ result, rank }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sourceConfig = SOURCE_CONFIG[result.source];
  const Icon = sourceConfig.icon;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      expanded && "ring-2 ring-primary/20"
    )}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  sourceConfig.color
                )}>
                  {rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Badge variant="outline" className="text-xs">
                      {sourceConfig.label}
                    </Badge>
                    {result.category && (
                      <Badge variant="secondary" className="text-xs">
                        {result.category}
                      </Badge>
                    )}
                    {result.mode && (
                      <Badge className="text-xs capitalize">
                        {result.mode}
                      </Badge>
                    )}
                    {result.type && (
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mt-1 truncate">
                    {result.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {result.preview}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={cn(
                  "px-2 py-1 rounded-md text-sm font-mono font-bold",
                  getSimilarityBg(result.similarity),
                  getSimilarityColor(result.similarity)
                )}>
                  {(result.similarity * 100).toFixed(1)}%
                </div>
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Full Content */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Full Content
              </Label>
              <div className="bg-muted/50 rounded-lg p-3 text-sm relative group">
                <pre className="whitespace-pre-wrap font-mono text-xs">
                  {result.text || result.bubbles_wrong_take || result.preview}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result.text || result.bubbles_wrong_take || result.preview || "");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Comedy Hooks */}
            {result.comedy_hooks && result.comedy_hooks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Comedy Hooks
                </Label>
                <div className="flex flex-wrap gap-2">
                  {result.comedy_hooks.map((hook, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {hook}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-1">
                  {result.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div>
                <span className="font-medium">ID:</span>{" "}
                <code className="bg-muted px-1 rounded">{result.id}</code>
              </div>
              <div>
                <span className="font-medium">Source:</span> {result.source}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function AdminRAGSearch() {
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState(0.3);
  const [limit, setLimit] = useState(10);
  const [selectedSources, setSelectedSources] = useState<("knowledge" | "thoughts" | "rag")[]>(
    ["knowledge", "thoughts", "rag"]
  );
  
  const { results, isLoading, error, searchMethod, search, clearResults } = useSemanticSearch();

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    search(query, {
      sources: selectedSources,
      limit,
      threshold,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const toggleSource = (source: "knowledge" | "thoughts" | "rag") => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (results.length === 0) return null;
    
    const bySource = results.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const maxSimilarity = Math.max(...results.map(r => r.similarity));
    const minSimilarity = Math.min(...results.map(r => r.similarity));

    return { bySource, avgSimilarity, maxSimilarity, minSimilarity };
  }, [results]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            RAG Search Visualizer
          </h1>
          <p className="text-muted-foreground mt-1">
            Test semantic queries against the knowledge base and visualize results
          </p>
        </div>

        {/* Search Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Configuration
            </CardTitle>
            <CardDescription>
              Configure and execute semantic searches across the RAG knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Query Input */}
            <div className="space-y-2">
              <Label htmlFor="query">Search Query</Label>
              <div className="flex gap-2">
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Why do clouds exist? What makes Bubbles wrong about technology?"
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading || selectedSources.length === 0}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Source Selection */}
            <div className="space-y-3">
              <Label>Sources to Search</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(SOURCE_CONFIG) as [keyof typeof SOURCE_CONFIG, typeof SOURCE_CONFIG[keyof typeof SOURCE_CONFIG]][]).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = selectedSources.includes(key);
                  return (
                    <div
                      key={key}
                      onClick={() => toggleSource(key)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{config.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Similarity Threshold</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                    {(threshold * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={([v]) => setThreshold(v)}
                  min={0}
                  max={1}
                  step={0.05}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum similarity score for results. Lower = more results, higher = stricter matching.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Result Limit</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                    {limit}
                  </span>
                </div>
                <Slider
                  value={[limit]}
                  onValueChange={([v]) => setLimit(v)}
                  min={1}
                  max={50}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of results to return per source.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="py-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Results</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    {results.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Search Method</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <span className="capitalize">{searchMethod}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Similarity</CardDescription>
                  <CardTitle className={cn("text-2xl", stats && getSimilarityColor(stats.avgSimilarity))}>
                    {stats ? `${(stats.avgSimilarity * 100).toFixed(1)}%` : "-"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Best Match</CardDescription>
                  <CardTitle className={cn("text-2xl", stats && getSimilarityColor(stats.maxSimilarity))}>
                    {stats ? `${(stats.maxSimilarity * 100).toFixed(1)}%` : "-"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>By Source</CardDescription>
                  <CardContent className="p-0 pt-1">
                    <div className="flex gap-2 text-xs">
                      {stats && Object.entries(stats.bySource).map(([source, count]) => (
                        <Badge key={source} variant="secondary">
                          {source}: {count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>

            {/* Similarity Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Similarity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.slice(0, 10).map((result, i) => (
                    <div key={result.id} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <Progress 
                        value={result.similarity * 100} 
                        className="flex-1 h-2"
                      />
                      <span className={cn(
                        "text-xs font-mono w-12 text-right",
                        getSimilarityColor(result.similarity)
                      )}>
                        {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Search Results
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearResults}>
                    Clear
                  </Button>
                </div>
                <CardDescription>
                  {results.length} results found via {searchMethod} search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {results.map((result, i) => (
                      <ResultCard key={`${result.id}-${i}`} result={result} rank={i + 1} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No Results Yet</h3>
                <p className="text-sm">
                  Enter a query above to search the knowledge base using semantic similarity.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Use natural language questions for best semantic matching</li>
              <li>Lower threshold values return more results but may include less relevant matches</li>
              <li>The search uses embeddings to find semantically similar content, not just keyword matching</li>
              <li>Results are ranked by similarity score - higher percentages indicate better matches</li>
              <li>Click on any result card to expand and see full content details</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
