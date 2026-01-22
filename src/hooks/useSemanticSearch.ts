import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SemanticSearchResult {
  id: string;
  title?: string;
  preview?: string;
  source: "knowledge" | "thoughts" | "rag";
  similarity: number;
  category?: string;
  mode?: string;
  type?: string;
  tags?: string[];
  text?: string;
  bubbles_wrong_take?: string;
  comedy_hooks?: string[];
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  method: "semantic" | "text";
  total: number;
}

export function useSemanticSearch() {
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMethod, setSearchMethod] = useState<"semantic" | "text" | null>(null);

  const search = useCallback(async (
    query: string,
    options?: {
      sources?: ("knowledge" | "thoughts" | "rag")[];
      limit?: number;
      threshold?: number;
    }
  ) => {
    if (!query || query.length < 2) {
      setResults([]);
      setSearchMethod(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("semantic-search", {
        body: {
          query,
          sources: options?.sources || ["knowledge", "thoughts", "rag"],
          limit: options?.limit || 10,
          threshold: options?.threshold || 0.3,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      const response = data as SemanticSearchResponse;
      setResults(response.results);
      setSearchMethod(response.method);
    } catch (err) {
      console.error("Semantic search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setSearchMethod(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    searchMethod,
    search,
    clearResults,
  };
}
