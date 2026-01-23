import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Brain, Sparkles, Coffee, Flame, Plane, Music, Scale, Clock, Languages, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SemanticMatch {
  id: string;
  title?: string;
  preview?: string;
  source: string;
  similarity: number;
  category?: string;
  tags?: string[];
  text?: string;
}

interface DetectedMentor {
  id: string;
  name: string;
  confidence: number;
  icon: React.ReactNode;
  color: string;
  domain: string;
  matchedContent: string[];
}

const MENTOR_CONFIG: Record<string, { icon: React.ReactNode; color: string; domain: string; keywords: string[] }> = {
  anthony: {
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-amber-500",
    domain: "Philosophy & Pub Wisdom",
    keywords: ["anthony", "philosophy", "pub", "guinness", "wisdom", "truth", "meaning", "pipe"]
  },
  peggy: {
    icon: <Flame className="h-4 w-4" />,
    color: "bg-orange-500",
    domain: "Food & Kitchen Comfort",
    keywords: ["peggy", "cook", "food", "kitchen", "comfort", "tea", "warm", "recipe"]
  },
  seamus: {
    icon: <Plane className="h-4 w-4" />,
    color: "bg-sky-500",
    domain: "Travel & Exotic Tales",
    keywords: ["seamus", "travel", "africa", "abroad", "oil", "heat", "desert", "exotic"]
  },
  aidan: {
    icon: <Music className="h-4 w-4" />,
    color: "bg-purple-500",
    domain: "Cosmic & Musical Idealism",
    keywords: ["aidan", "music", "cosmic", "universe", "muffins", "vibe", "energy", "spiritual"]
  },
  jimmy: {
    icon: <Scale className="h-4 w-4" />,
    color: "bg-slate-600",
    domain: "Authority & Rules",
    keywords: ["jimmy", "rule", "law", "authority", "proper", "ispca", "should", "must"]
  },
  carmel: {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-teal-500",
    domain: "Practical Routines",
    keywords: ["carmel", "routine", "schedule", "practical", "morning", "organize", "time"]
  },
  alex: {
    icon: <Languages className="h-4 w-4" />,
    color: "bg-rose-500",
    domain: "Language & Confusion",
    keywords: ["alex", "spanish", "language", "translate", "bilingual", "confused"]
  }
};

function detectMentorsFromResults(results: SemanticMatch[]): DetectedMentor[] {
  const mentorScores: Record<string, { score: number; matches: string[] }> = {};

  for (const result of results) {
    const content = `${result.title || ""} ${result.preview || ""} ${result.text || ""} ${(result.tags || []).join(" ")}`.toLowerCase();
    
    for (const [mentorId, config] of Object.entries(MENTOR_CONFIG)) {
      const matchedKeywords = config.keywords.filter(kw => content.includes(kw.toLowerCase()));
      
      if (matchedKeywords.length > 0) {
        if (!mentorScores[mentorId]) {
          mentorScores[mentorId] = { score: 0, matches: [] };
        }
        // Weight by similarity score and keyword matches
        mentorScores[mentorId].score += result.similarity * (matchedKeywords.length / config.keywords.length);
        mentorScores[mentorId].matches.push(result.title || result.preview?.slice(0, 50) || "Knowledge match");
      }
    }
  }

  return Object.entries(mentorScores)
    .filter(([_, data]) => data.score > 0)
    .map(([mentorId, data]) => ({
      id: mentorId,
      name: mentorId.charAt(0).toUpperCase() + mentorId.slice(1),
      confidence: Math.min(data.score, 1),
      icon: MENTOR_CONFIG[mentorId].icon,
      color: MENTOR_CONFIG[mentorId].color,
      domain: MENTOR_CONFIG[mentorId].domain,
      matchedContent: [...new Set(data.matches)].slice(0, 3)
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function SemanticMentorDetector() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedMentors, setDetectedMentors] = useState<DetectedMentor[]>([]);
  const [rawResults, setRawResults] = useState<SemanticMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMethod, setSearchMethod] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke("semantic-search", {
        body: {
          query: input,
          sources: ["knowledge", "thoughts", "rag"],
          limit: 15,
          threshold: 0.2,
        },
      });

      if (error) throw error;

      const results = data?.results || [];
      setRawResults(results);
      setSearchMethod(data?.method || "semantic");
      
      const mentors = detectMentorsFromResults(results);
      setDetectedMentors(mentors);
    } catch (err) {
      console.error("Semantic search error:", err);
      setDetectedMentors([]);
      setRawResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const exampleQueries = [
    "What should I cook for dinner?",
    "Tell me about the meaning of life",
    "How hot does it get in Africa?",
    "What time should I wake up?",
    "Is it legal to do that?",
    "The universe and music are connected"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Semantic Mentor Detection
          <Badge variant="outline" className="ml-2 text-xs">RAG-powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a query to detect mentors via semantic search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Detect</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-1">Try:</span>
          {exampleQueries.map((query, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer hover:bg-muted text-xs"
              onClick={() => {
                setInput(query);
              }}
            >
              {query.slice(0, 25)}...
            </Badge>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </motion.div>
          )}

          {!isLoading && hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Database className="h-3 w-3" />
                <span>{rawResults.length} semantic matches found</span>
                {searchMethod && (
                  <Badge variant="secondary" className="text-[10px]">{searchMethod}</Badge>
                )}
              </div>

              {detectedMentors.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {detectedMentors.length} mentor{detectedMentors.length !== 1 ? "s" : ""} detected:
                  </p>
                  {detectedMentors.map((mentor, index) => (
                    <motion.div
                      key={mentor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full text-white ${mentor.color}`}>
                            {mentor.icon}
                          </div>
                          <div>
                            <span className="font-medium">{mentor.name}</span>
                            <p className="text-xs text-muted-foreground">{mentor.domain}</p>
                          </div>
                        </div>
                        <Badge variant={mentor.confidence > 0.5 ? "default" : "secondary"}>
                          {Math.round(mentor.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <Progress value={mentor.confidence * 100} className="h-1.5 mb-2" />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Matched knowledge:</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.matchedContent.map((content, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {content.slice(0, 40)}{content.length > 40 ? "..." : ""}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No specific mentor triggered</p>
                  <p className="text-xs">Bubbles would respond with general wisdom</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Available mentors (semantic detection):</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MENTOR_CONFIG).map(([id, config]) => (
              <div key={id} className="flex items-center gap-1">
                <div className={`p-1 rounded-full text-white ${config.color}`}>
                  {config.icon}
                </div>
                <span className="text-xs capitalize">{id}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
