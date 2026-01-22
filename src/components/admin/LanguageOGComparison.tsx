import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Globe, Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "de-DE", name: "German (DE)", flag: "🇩🇪" },
  { code: "de-AT", name: "Austrian German", flag: "🇦🇹" },
  { code: "de-CH", name: "Swiss German", flag: "🇨🇭" },
] as const;

const PAGE_TYPES = [
  { id: "home", name: "Home", path: "/" },
  { id: "about", name: "About", path: "/about" },
  { id: "achievements", name: "Achievements", path: "/achievements" },
  { id: "collections", name: "Collections", path: "/collections/all" },
  { id: "contact", name: "Contact", path: "/contact" },
  { id: "dach", name: "DACH", path: "/dach" },
  { id: "explains", name: "Explains", path: "/explains" },
  { id: "facts", name: "Facts", path: "/facts" },
  { id: "faq", name: "FAQ", path: "/faq" },
  { id: "francophone", name: "Francophone", path: "/francophone" },
  { id: "privacy", name: "Privacy", path: "/privacy" },
  { id: "shipping", name: "Shipping", path: "/shipping" },
] as const;

type LanguageCode = typeof LANGUAGES[number]["code"];
type PageType = typeof PAGE_TYPES[number]["id"];

interface LanguagePreview {
  lang: LanguageCode;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  generated: boolean;
}

export function LanguageOGComparison() {
  const [selectedPage, setSelectedPage] = useState<PageType>("home");
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>(["en", "es", "de"]);
  const [previews, setPreviews] = useState<Record<string, LanguagePreview>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const getOGFunctionName = (pageType: PageType): string => {
    return `og-${pageType}-image`;
  };

  const generatePreview = async (lang: LanguageCode, skipCache = false) => {
    const key = `${selectedPage}-${lang}`;
    
    setPreviews(prev => ({
      ...prev,
      [key]: { ...prev[key], lang, loading: true, error: null, generated: false }
    }));

    try {
      const functionName = getOGFunctionName(selectedPage);
      const params = new URLSearchParams({ lang });
      if (skipCache) params.append("nocache", "1");
      
      const url = `${supabaseUrl}/functions/v1/${functionName}?${params}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      setPreviews(prev => ({
        ...prev,
        [key]: { lang, imageUrl, loading: false, error: null, generated: true }
      }));
    } catch (error) {
      console.error(`Error generating ${lang} preview:`, error);
      setPreviews(prev => ({
        ...prev,
        [key]: { 
          lang, 
          imageUrl: null, 
          loading: false, 
          error: error instanceof Error ? error.message : "Failed to generate",
          generated: false 
        }
      }));
    }
  };

  const generateAllPreviews = async (skipCache = false) => {
    setIsGeneratingAll(true);
    
    // Generate all selected language previews in parallel
    await Promise.all(
      selectedLanguages.map(lang => generatePreview(lang, skipCache))
    );
    
    setIsGeneratingAll(false);
    toast.success(`Generated ${selectedLanguages.length} language variants`);
  };

  const toggleLanguage = (lang: LanguageCode) => {
    setSelectedLanguages(prev => 
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const getPreviewKey = (lang: LanguageCode) => `${selectedPage}-${lang}`;

  // Clear previews when page changes
  useEffect(() => {
    setPreviews({});
  }, [selectedPage]);

  const pageInfo = PAGE_TYPES.find(p => p.id === selectedPage);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Variant Comparison
          </CardTitle>
          <CardDescription>
            Compare OG images across different language variants side by side
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Type</label>
              <Select value={selectedPage} onValueChange={(v) => setSelectedPage(v as PageType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map(page => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Languages to Compare</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLanguage(lang.code)}
                  >
                    {lang.flag} {lang.code.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => generateAllPreviews(false)} 
              disabled={isGeneratingAll || selectedLanguages.length === 0}
            >
              {isGeneratingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Generate All ({selectedLanguages.length})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => generateAllPreviews(true)}
              disabled={isGeneratingAll || selectedLanguages.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Previews */}
      {selectedLanguages.length > 0 && (
        <div className={cn(
          "grid gap-4",
          selectedLanguages.length === 1 && "grid-cols-1",
          selectedLanguages.length === 2 && "grid-cols-1 lg:grid-cols-2",
          selectedLanguages.length >= 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        )}>
          {selectedLanguages.map(langCode => {
            const lang = LANGUAGES.find(l => l.code === langCode)!;
            const key = getPreviewKey(langCode);
            const preview = previews[key];

            return (
              <Card key={langCode} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      {lang.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {preview?.generated && (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Generated
                        </Badge>
                      )}
                      {preview?.error && (
                        <Badge variant="destructive" className="gap-1">
                          <X className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    ?lang={langCode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-[1200/630] bg-muted rounded-lg overflow-hidden border relative">
                    {preview?.loading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : preview?.imageUrl ? (
                      <img 
                        src={preview.imageUrl} 
                        alt={`${pageInfo?.name} OG - ${lang.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : preview?.error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4 text-center">
                        <X className="h-8 w-8 mb-2" />
                        <p className="text-sm">{preview.error}</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Globe className="h-8 w-8 mb-2" />
                        <p className="text-sm">Click Generate to preview</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => generatePreview(langCode, false)}
                      disabled={preview?.loading}
                    >
                      {preview?.loading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Generate"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const functionName = getOGFunctionName(selectedPage);
                        const url = `${supabaseUrl}/functions/v1/${functionName}?lang=${langCode}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Function Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm font-mono">
            {PAGE_TYPES.map(page => (
              <div key={page.id} className="flex items-center gap-2 text-muted-foreground">
                <Badge variant={page.id === selectedPage ? "default" : "outline"} className="font-mono">
                  {page.id}
                </Badge>
                <span className="text-xs">→ og-{page.id}-image?lang=</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
