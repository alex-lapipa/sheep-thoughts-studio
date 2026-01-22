import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_ENDPOINTS = [
  { id: "home", name: "Home", endpoint: "og-home-image" },
  { id: "about", name: "About", endpoint: "og-about-image" },
  { id: "achievements", name: "Achievements", endpoint: "og-achievements-image" },
  { id: "collections", name: "Collections", endpoint: "og-collections-image" },
  { id: "contact", name: "Contact", endpoint: "og-contact-image" },
  { id: "dach", name: "DACH", endpoint: "og-dach-image" },
  { id: "explains", name: "Explains", endpoint: "og-explains-image" },
  { id: "facts", name: "Facts", endpoint: "og-facts-image" },
  { id: "faq", name: "FAQ", endpoint: "og-faq-image" },
  { id: "francophone", name: "Francophone", endpoint: "og-francophone-image" },
  { id: "privacy", name: "Privacy", endpoint: "og-privacy-image" },
  { id: "shipping", name: "Shipping", endpoint: "og-shipping-image" },
] as const;

const TEST_LANGUAGES = ["en", "es", "fr", "de"] as const;

interface EndpointStatus {
  id: string;
  name: string;
  endpoint: string;
  status: "pending" | "checking" | "healthy" | "degraded" | "error";
  responseTime?: number;
  error?: string;
  languageResults?: {
    lang: string;
    status: "healthy" | "error";
    responseTime: number;
    error?: string;
  }[];
}

export function OGHealthCheck() {
  const [endpointStatuses, setEndpointStatuses] = useState<EndpointStatus[]>(
    PAGE_ENDPOINTS.map(p => ({
      ...p,
      status: "pending" as const,
    }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const checkEndpoint = async (
    endpoint: string, 
    lang: string
  ): Promise<{ status: "healthy" | "error"; responseTime: number; error?: string }> => {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/${endpoint}?lang=${lang}`,
        { 
          method: "GET",
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeout);
      const responseTime = Math.round(performance.now() - startTime);
      
      if (!response.ok) {
        return { 
          status: "error", 
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
      
      // Verify it's actually an image
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("image")) {
        return { 
          status: "error", 
          responseTime,
          error: `Invalid content type: ${contentType}` 
        };
      }
      
      // Consume body to avoid resource leak
      await response.blob();
      
      return { status: "healthy", responseTime };
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      
      if (error instanceof Error && error.name === "AbortError") {
        return { status: "error", responseTime, error: "Request timed out (30s)" };
      }
      
      return { 
        status: "error", 
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };

  const runHealthCheck = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const totalChecks = PAGE_ENDPOINTS.length * TEST_LANGUAGES.length;
    let completedChecks = 0;

    // Reset all statuses to pending
    setEndpointStatuses(PAGE_ENDPOINTS.map(p => ({
      ...p,
      status: "pending" as const,
      languageResults: undefined,
    })));

    for (let i = 0; i < PAGE_ENDPOINTS.length; i++) {
      const page = PAGE_ENDPOINTS[i];
      
      // Set to checking
      setEndpointStatuses(prev => prev.map(s => 
        s.id === page.id ? { ...s, status: "checking" as const } : s
      ));

      const languageResults: EndpointStatus["languageResults"] = [];
      
      // Check all languages for this endpoint
      for (const lang of TEST_LANGUAGES) {
        const result = await checkEndpoint(page.endpoint, lang);
        languageResults.push({
          lang,
          status: result.status,
          responseTime: result.responseTime,
          error: result.error,
        });
        
        completedChecks++;
        setProgress(Math.round((completedChecks / totalChecks) * 100));
      }

      // Determine overall status
      const hasErrors = languageResults.some(r => r.status === "error");
      const allErrors = languageResults.every(r => r.status === "error");
      const avgResponseTime = Math.round(
        languageResults.reduce((sum, r) => sum + r.responseTime, 0) / languageResults.length
      );

      setEndpointStatuses(prev => prev.map(s => 
        s.id === page.id 
          ? { 
              ...s, 
              status: allErrors ? "error" : hasErrors ? "degraded" : "healthy",
              responseTime: avgResponseTime,
              languageResults,
              error: allErrors ? "All language variants failed" : undefined,
            } 
          : s
      ));
    }

    setIsRunning(false);
    setLastChecked(new Date());
  };

  const healthyCount = endpointStatuses.filter(s => s.status === "healthy").length;
  const degradedCount = endpointStatuses.filter(s => s.status === "degraded").length;
  const errorCount = endpointStatuses.filter(s => s.status === "error").length;
  const pendingCount = endpointStatuses.filter(s => s.status === "pending" || s.status === "checking").length;

  const getOverallHealth = () => {
    if (pendingCount === PAGE_ENDPOINTS.length) return "unknown";
    if (errorCount > 0) return "critical";
    if (degradedCount > 0) return "degraded";
    return "healthy";
  };

  const overallHealth = getOverallHealth();

  const getStatusIcon = (status: EndpointStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: EndpointStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Degraded</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>OG Image Health Check</CardTitle>
            </div>
            <Button 
              onClick={runHealthCheck} 
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking... {progress}%
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Health Check
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Verify all OG image endpoints are responding correctly across all languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRunning && (
            <Progress value={progress} className="h-2" />
          )}

          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={cn(
              "border-2",
              overallHealth === "healthy" && "border-green-500/50 bg-green-500/5",
              overallHealth === "degraded" && "border-yellow-500/50 bg-yellow-500/5",
              overallHealth === "critical" && "border-destructive/50 bg-destructive/5",
            )}>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{healthyCount}/{PAGE_ENDPOINTS.length}</div>
                <p className="text-xs text-muted-foreground">Healthy Endpoints</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold flex items-center gap-2">
                  {degradedCount}
                  {degradedCount > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-xs text-muted-foreground">Degraded</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold flex items-center gap-2">
                  {errorCount}
                  {errorCount > 0 && <XCircle className="h-4 w-4 text-destructive" />}
                </div>
                <p className="text-xs text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">
                  {lastChecked ? (
                    <>
                      <div className="text-lg font-semibold text-foreground">
                        {lastChecked.toLocaleTimeString()}
                      </div>
                      <p className="text-xs">Last checked</p>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-semibold">—</div>
                      <p className="text-xs">Not checked yet</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpoint Status</CardTitle>
          <CardDescription>
            Detailed status for each OG image endpoint across {TEST_LANGUAGES.length} language variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {endpointStatuses.map((endpoint) => (
                <div 
                  key={endpoint.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    endpoint.status === "healthy" && "border-green-500/30 bg-green-500/5",
                    endpoint.status === "degraded" && "border-yellow-500/30 bg-yellow-500/5",
                    endpoint.status === "error" && "border-destructive/30 bg-destructive/5",
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(endpoint.status)}
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        <code className="text-xs text-muted-foreground">
                          {endpoint.endpoint}
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {endpoint.responseTime !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          {endpoint.responseTime}ms avg
                        </div>
                      )}
                      {getStatusBadge(endpoint.status)}
                    </div>
                  </div>
                  
                  {endpoint.languageResults && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      {endpoint.languageResults.map((result) => (
                        <div 
                          key={result.lang}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
                            result.status === "healthy" 
                              ? "bg-green-500/10 text-green-600" 
                              : "bg-destructive/10 text-destructive"
                          )}
                          title={result.error || `${result.responseTime}ms`}
                        >
                          {result.status === "healthy" ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span className="font-medium">{result.lang.toUpperCase()}</span>
                          <span className="opacity-60">{result.responseTime}ms</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {endpoint.error && (
                    <p className="text-sm text-destructive mt-2">{endpoint.error}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
