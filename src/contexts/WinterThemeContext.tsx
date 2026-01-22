import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WinterThemeContextType {
  isWinterMode: boolean;
  setWinterMode: (enabled: boolean) => void;
}

const WinterThemeContext = createContext<WinterThemeContextType | undefined>(undefined);

const CELEBRATION_KEY = "bubbles-celebration-mode-v3";

export function WinterThemeProvider({ children }: { children: ReactNode }) {
  const [isWinterMode, setIsWinterMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CELEBRATION_KEY);
      return saved === "snow";
    }
    return false;
  });

  // Listen for localStorage changes (from CelebrationToggle)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentMode = localStorage.getItem(CELEBRATION_KEY);
      setIsWinterMode(currentMode === "snow");
    };

    // Check on mount and when storage changes
    handleStorageChange();
    
    // Listen for custom event from CelebrationToggle
    window.addEventListener("celebration-mode-change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("celebration-mode-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Apply winter theme class to document
  useEffect(() => {
    if (isWinterMode) {
      document.documentElement.classList.add("winter-theme");
    } else {
      document.documentElement.classList.remove("winter-theme");
    }
  }, [isWinterMode]);

  const setWinterMode = (enabled: boolean) => {
    setIsWinterMode(enabled);
  };

  return (
    <WinterThemeContext.Provider value={{ isWinterMode, setWinterMode }}>
      {children}
    </WinterThemeContext.Provider>
  );
}

export function useWinterTheme() {
  const context = useContext(WinterThemeContext);
  if (!context) {
    throw new Error("useWinterTheme must be used within a WinterThemeProvider");
  }
  return context;
}
