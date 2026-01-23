import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feature flags registry - add new flags here
export interface FeatureFlags {
  newNavigation: boolean;      // Phase 1: Simplified nav (Chat, Live, Shop, FAQ)
  simplifiedHomepage: boolean; // Phase 2: Remove static knowledge sections
  enhancedShop: boolean;       // Phase 2: Shop hero + trust cues
  faqSummary: boolean;         // Phase 3: Lightweight FAQ page
}

const DEFAULT_FLAGS: FeatureFlags = {
  newNavigation: true,        // Currently enabled
  simplifiedHomepage: false,
  enhancedShop: false,
  faqSummary: false,
};

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
  resetFlags: () => void;
  isEnabled: (key: keyof FeatureFlags) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const STORAGE_KEY = 'bubbles_feature_flags';

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new flags
        return { ...DEFAULT_FLAGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load feature flags:', e);
    }
    return DEFAULT_FLAGS;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch (e) {
      console.warn('Failed to save feature flags:', e);
    }
  }, [flags]);

  const setFlag = (key: keyof FeatureFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [key]: value }));
  };

  const resetFlags = () => {
    setFlags(DEFAULT_FLAGS);
  };

  const isEnabled = (key: keyof FeatureFlags) => flags[key];

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag, resetFlags, isEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}
