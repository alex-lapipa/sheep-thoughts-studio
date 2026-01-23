import { createContext, useContext, useEffect, ReactNode } from "react";

// Dark mode only - no theme switching
export type ThemeMode = "dark";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: true;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always dark mode
  const theme: ThemeMode = "dark";

  useEffect(() => {
    const root = document.documentElement;
    // Ensure dark class is always present
    root.classList.add("dark");
    root.classList.remove("sheep-mode");
    localStorage.setItem("bubbles-theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: true }}>
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
