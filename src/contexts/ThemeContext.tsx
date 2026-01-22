import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "sheep";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isSheep: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("bubbles-theme") as ThemeMode | null;
    if (saved && ["light", "dark", "sheep"].includes(saved)) return saved;
    // Default to dark mode as primary
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("dark", "sheep-mode");
    
    // Apply appropriate classes
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "sheep") {
      // Sheep mode is... special. Bubbles thinks dark mode is "when the grass is sleeping"
      root.classList.add("sheep-mode");
    }
    
    localStorage.setItem("bubbles-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        isDark: theme === "dark",
        isSheep: theme === "sheep"
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
