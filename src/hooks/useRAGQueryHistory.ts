import { useState, useEffect, useCallback } from "react";

export interface RAGQueryHistoryItem {
  id: string;
  query: string;
  sources: ("knowledge" | "thoughts" | "rag")[];
  threshold: number;
  limit: number;
  resultCount: number;
  searchedAt: string;
}

const STORAGE_KEY = "bubbles-rag-query-history";
const MAX_HISTORY_ITEMS = 20;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadHistory(): RAGQueryHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistHistory(history: RAGQueryHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to persist RAG query history:", error);
  }
}

export function useRAGQueryHistory() {
  const [history, setHistory] = useState<RAGQueryHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Add a query to history
  const addToHistory = useCallback((
    query: string,
    sources: ("knowledge" | "thoughts" | "rag")[],
    threshold: number,
    limit: number,
    resultCount: number
  ) => {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim();
    
    setHistory((prev) => {
      // Remove duplicate if exists (same query)
      const filtered = prev.filter(
        (h) => h.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      const newItem: RAGQueryHistoryItem = {
        id: generateId(),
        query: trimmedQuery,
        sources,
        threshold,
        limit,
        resultCount,
        searchedAt: new Date().toISOString(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      persistHistory(updated);
      return updated;
    });
  }, []);

  // Remove a query from history
  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      persistHistory(updated);
      return updated;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    persistHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
