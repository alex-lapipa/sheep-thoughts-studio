import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SettingsContextType {
  hapticEnabled: boolean;
  toggleHaptic: () => void;
  triggerHaptic: (pattern?: number | number[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("bubbles-haptic");
    return saved !== "false"; // Default to enabled
  });

  const toggleHaptic = useCallback(() => {
    setHapticEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("bubbles-haptic", String(newValue));
      // Give feedback when enabling
      if (newValue && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      return newValue;
    });
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
    if (hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [hapticEnabled]);

  return (
    <SettingsContext.Provider value={{ hapticEnabled, toggleHaptic, triggerHaptic }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
