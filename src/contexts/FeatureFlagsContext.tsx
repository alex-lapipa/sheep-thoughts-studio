import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feature flags registry - add new flags here
export interface FeatureFlags {
  newNavigation: boolean;      // Phase 1: Simplified nav (Chat, Live, Shop, FAQ)
  simplifiedHomepage: boolean; // Phase 2: Remove static knowledge sections
  enhancedShop: boolean;       // Phase 2: Shop hero + trust cues
  faqSummary: boolean;         // Phase 3: Lightweight FAQ page
}

const DEFAULT_FLAGS: FeatureFlags = {
  newNavigation: true,        // Phase 1: Enabled
  simplifiedHomepage: true,   // Phase 2: Enabled - removes static knowledge sections
  enhancedShop: true,         // Phase 2: Enabled
  faqSummary: true,           // Phase 3: Enabled
};

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
  resetFlags: () => void;
  isEnabled: (key: keyof FeatureFlags) => boolean;
  isUrlOverride: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const STORAGE_KEY = 'bubbles_feature_flags';

// Parse URL parameters for feature flag overrides
function getUrlFlagOverrides(): Partial<FeatureFlags> | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const overrides: Partial<FeatureFlags> = {};
  let hasOverrides = false;
  
  const flagKeys: (keyof FeatureFlags)[] = ['newNavigation', 'simplifiedHomepage', 'enhancedShop', 'faqSummary'];
  
  for (const key of flagKeys) {
    const value = params.get(key);
    if (value !== null) {
      overrides[key] = value === 'true' || value === '1';
      hasOverrides = true;
    }
  }
  
  return hasOverrides ? overrides : null;
}

// Generate URL with feature flag parameters
export function generatePreviewUrl(baseUrl: string, flags: Partial<FeatureFlags>): string {
  const url = new URL(baseUrl);
  
  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined) {
      url.searchParams.set(key, value ? 'true' : 'false');
    }
  }
  
  return url.toString();
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [urlOverrides] = useState<Partial<FeatureFlags> | null>(() => getUrlFlagOverrides());
  const isUrlOverride = urlOverrides !== null;
  
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    // URL overrides take priority
    if (urlOverrides) {
      return { ...DEFAULT_FLAGS, ...urlOverrides };
    }
    
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

  // Persist to localStorage (only if not using URL overrides)
  useEffect(() => {
    if (isUrlOverride) return; // Don't persist URL-overridden flags
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch (e) {
      console.warn('Failed to save feature flags:', e);
    }
  }, [flags, isUrlOverride]);

  const setFlag = (key: keyof FeatureFlags, value: boolean) => {
    if (isUrlOverride) return; // Don't allow changes when using URL overrides
    setFlags(prev => ({ ...prev, [key]: value }));
  };

  const resetFlags = () => {
    if (isUrlOverride) return;
    setFlags(DEFAULT_FLAGS);
  };

  const isEnabled = (key: keyof FeatureFlags) => flags[key];

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag, resetFlags, isEnabled, isUrlOverride }}>
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
