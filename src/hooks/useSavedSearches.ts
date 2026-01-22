import { useState, useEffect, useCallback } from "react";

export interface SavedSearch {
  id: string;
  query: string;
  createdAt: string;
  useCount: number;
  lastUsedAt: string;
}

const STORAGE_KEY = "bubbles-saved-searches";
const MAX_SAVED_SEARCHES = 20;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadSavedSearches(): SavedSearch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistSavedSearches(searches: SavedSearch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error("Failed to persist saved searches:", error);
  }
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setSavedSearches(loadSavedSearches());
  }, []);

  // Save a new search query
  const saveSearch = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return false;

    const trimmedQuery = query.trim().toLowerCase();
    
    setSavedSearches((prev) => {
      // Check if already saved
      const existingIndex = prev.findIndex(
        (s) => s.query.toLowerCase() === trimmedQuery
      );

      if (existingIndex !== -1) {
        // Already saved, don't duplicate
        return prev;
      }

      const newSearch: SavedSearch = {
        id: generateId(),
        query: query.trim(),
        createdAt: new Date().toISOString(),
        useCount: 0,
        lastUsedAt: new Date().toISOString(),
      };

      const updated = [newSearch, ...prev].slice(0, MAX_SAVED_SEARCHES);
      persistSavedSearches(updated);
      return updated;
    });

    return true;
  }, []);

  // Remove a saved search
  const removeSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistSavedSearches(updated);
      return updated;
    });
  }, []);

  // Increment use count when a saved search is used
  const useSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.map((s) =>
        s.id === id
          ? { ...s, useCount: s.useCount + 1, lastUsedAt: new Date().toISOString() }
          : s
      );
      persistSavedSearches(updated);
      return updated;
    });
  }, []);

  // Check if a query is already saved
  const isSearchSaved = useCallback(
    (query: string) => {
      if (!query || query.trim().length < 2) return false;
      const trimmedQuery = query.trim().toLowerCase();
      return savedSearches.some((s) => s.query.toLowerCase() === trimmedQuery);
    },
    [savedSearches]
  );

  // Clear all saved searches
  const clearAllSearches = useCallback(() => {
    setSavedSearches([]);
    persistSavedSearches([]);
  }, []);

  // Get sorted by most used
  const sortedByUsage = [...savedSearches].sort((a, b) => b.useCount - a.useCount);

  return {
    savedSearches,
    sortedByUsage,
    saveSearch,
    removeSearch,
    useSearch,
    isSearchSaved,
    clearAllSearches,
  };
}
