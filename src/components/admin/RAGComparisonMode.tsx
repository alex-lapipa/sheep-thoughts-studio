import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Loader2, 
  BookOpen, 
  MessageCircle, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Zap,
  ArrowLeftRight,
  Copy,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSemanticSearch, type SemanticSearchResult } from "@/hooks/useSemanticSearch";

const SOURCE_CONFIG = {
  knowledge: { 
    label: "Knowledge", 
    icon: BookOpen, 
    color: "bg-blue-500",
  },
  thoughts: { 
    label: "Thoughts", 
    icon: MessageCircle, 
    color: "bg-green-500",
  },
  rag: { 
    label: "RAG", 
    icon: Sparkles, 
    color: "bg-purple-500",
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

interface CompactResultCardProps {
  result: SemanticSearchResult;
  rank: number;
  highlightId?: string;
  onHover?: (id: string | null) => void;
}

function CompactResultCard({ result, rank, highlightId, onHover }: CompactResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sourceConfig = SOURCE_CONFIG[result.source];
  const Icon = sourceConfig.icon;
  const isHighlighted = highlightId === result.id;

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border transition-all",
        isHighlighted && "ring-2 ring-primary bg-primary/5",
        !isHighlighted && "hover:bg-muted/30"
      )}
      onMouseEnter={() => onHover?.(result.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            <div className="flex items-start gap-2">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs",
                sourceConfig.color
              )}>
                {rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{sourceConfig.label}</span>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-xs font-mono font-bold ml-auto",
                    getSimilarityBg(result.similarity),
                    getSimilarityColor(result.similarity)
                  )}>
                    {(result.similarity * 100).toFixed(1)}%
                  </div>
                </div>
                <p className="text-sm font-medium truncate mt-1">
                  {result.title || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {result.preview}
                </p>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="bg-muted/50 rounded p-2 text-xs relative group">
              <pre className="whitespace-pre-wrap font-mono">
                {result.text || result.bubbles_wrong_take || result.preview}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(result.text || result.bubbles_wrong_take || result.preview || "");
                  toast.success("Copied");
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.tags.slice(0, 5).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface SearchPanelProps {
  label: string;
  color: string;
  onResultHover?: (id: string | null) => void;
  highlightedId?: string;
  sharedSettings: {
    sources: ("knowledge" | "thoughts" | "rag")[];
    threshold: number;
    limit: number;
  };
}

function SearchPanel({ label, color, onResultHover, highlightedId, sharedSettings }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const { results, isLoading, error, searchMethod, search, clearResults } = useSemanticSearch();

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Enter a query");
      return;
    }
    search(query, {
      sources: sharedSettings.sources,
      limit: sharedSettings.limit,
      threshold: sharedSettings.threshold,
    });
  };

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const maxSimilarity = Math.max(...results.map(r => r.similarity));
    return { avgSimilarity, maxSimilarity };
  }, [results]);

  return (
    <Card className={cn("flex-1", `border-t-4 border-t-${color}`)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", `bg-${color}`)} />
          Query {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter search query..."
            className="text-sm"
          />
          <Button size="sm" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {error && (
          <p className="text-destructive text-xs">{error}</p>
        )}

        {results.length > 0 && (
          <>
            {/* Mini stats */}
            <div className="flex items-center gap-3 text-xs">
              <Badge variant="secondary">{results.length} results</Badge>
              {stats && (
                <>
                  <span className="text-muted-foreground">
                    Avg: <span className={getSimilarityColor(stats.avgSimilarity)}>
                      {(stats.avgSimilarity * 100).toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Best: <span className={getSimilarityColor(stats.maxSimilarity)}>
                      {(stats.maxSimilarity * 100).toFixed(1)}%
                    </span>
                  </span>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={clearResults} className="ml-auto h-6 text-xs">
                Clear
              </Button>
            </div>

            {/* Results */}
            <ScrollArea className="h-[450px]">
              <div className="space-y-2 pr-3">
                {results.map((result, i) => (
                  <CompactResultCard 
                    key={`${result.id}-${i}`} 
                    result={result} 
                    rank={i + 1}
                    highlightId={highlightedId}
                    onHover={onResultHover}
                  />
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {!isLoading && results.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Enter a query and search to see results
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RAGComparisonMode() {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [sources, setSources] = useState<("knowledge" | "thoughts" | "rag")[]>(
    ["knowledge", "thoughts", "rag"]
  );
  const [threshold, setThreshold] = useState(0.3);
  const [limit, setLimit] = useState(10);

  const toggleSource = (source: "knowledge" | "thoughts" | "rag") => {
    setSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const sharedSettings = { sources, threshold, limit };

  return (
    <div className="space-y-4">
      {/* Shared Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Shared Comparison Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Both queries use the same sources and parameters for fair comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sources */}
            <div className="space-y-2">
              <Label className="text-xs">Sources</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(SOURCE_CONFIG) as [keyof typeof SOURCE_CONFIG, typeof SOURCE_CONFIG[keyof typeof SOURCE_CONFIG]][]).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = sources.includes(key);
                  return (
                    <Button
                      key={key}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSource(key)}
                      className="h-7 text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Threshold</Label>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
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
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Limit</Label>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {limit}
                </span>
              </div>
              <Slider
                value={[limit]}
                onValueChange={([v]) => setLimit(v)}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SearchPanel 
          label="A" 
          color="blue-500"
          sharedSettings={sharedSettings}
          highlightedId={highlightedId ?? undefined}
          onResultHover={setHighlightedId}
        />
        <SearchPanel 
          label="B" 
          color="orange-500"
          sharedSettings={sharedSettings}
          highlightedId={highlightedId ?? undefined}
          onResultHover={setHighlightedId}
        />
      </div>

      {/* Comparison tips */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Comparison Tips</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Try rephrasing the same question to see how wording affects results</li>
                <li>Compare specific vs. general queries to test retrieval precision</li>
                <li>Hover over results to highlight matching items across panels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
