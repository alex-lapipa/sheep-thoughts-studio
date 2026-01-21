import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConsentStatus = "pending" | "accepted" | "rejected" | "custom";

interface ConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = "bubbles-cookie-consent";
const PREFERENCES_KEY = "bubbles-cookie-preferences";

// Disable/enable analytics based on consent
const updateAnalyticsConsent = (allowed: boolean) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: allowed ? "granted" : "denied",
    });
  }
};

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    const savedPrefs = localStorage.getItem(PREFERENCES_KEY);

    if (!consent) {
      // First visit - show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    // Apply saved preferences
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs) as ConsentPreferences;
      setPreferences(prefs);
      updateAnalyticsConsent(prefs.analytics);
    }
  }, []);

  const saveConsent = useCallback((status: ConsentStatus, prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_KEY, status);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    updateAnalyticsConsent(prefs.analytics);
    setIsVisible(false);
  }, []);

  const handleAcceptAll = () => {
    const prefs: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent("accepted", prefs);
  };

  const handleRejectAll = () => {
    const prefs: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent("rejected", prefs);
  };

  const handleSavePreferences = () => {
    saveConsent("custom", preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Main Banner */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg mb-2">
                  🐑 Bubbles Uses Cookies
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies to understand how you interact with our site and to improve your experience. 
                  Bubbles promises these cookies contain no actual wool.
                </p>

                {/* Quick Actions */}
                {!showDetails && (
                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={handleAcceptAll} className="font-display">
                      Accept All
                    </Button>
                    <Button variant="outline" onClick={handleRejectAll} className="font-display">
                      Reject All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                      className="gap-2 text-muted-foreground"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </Button>
                  </div>
                )}
              </div>

              {/* Close button (rejects all) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRejectAll}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Detailed Preferences */}
          {showDetails && (
            <div className="border-t border-border p-6 bg-muted/30 animate-fade-in">
              <h4 className="font-display font-semibold mb-4">Cookie Preferences</h4>
              
              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <label className="flex items-start gap-4 p-3 bg-card rounded-xl border">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 h-4 w-4 rounded border-primary text-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Necessary</span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        Always active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Essential cookies that make the site work. Without these, Bubbles would forget everything.
                    </p>
                  </div>
                </label>

                {/* Analytics Cookies */}
                <label className="flex items-start gap-4 p-3 bg-card rounded-xl border cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary accent-primary"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm">Analytics</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Help us understand how visitors use the site. All data is anonymized – we can't tell sheep apart anyway.
                    </p>
                  </div>
                </label>

                {/* Marketing Cookies */}
                <label className="flex items-start gap-4 p-3 bg-card rounded-xl border cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary accent-primary"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm">Marketing</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used to deliver relevant ads. Bubbles has many opinions about targeted advertising, all of them wrong.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSavePreferences} className="font-display">
                  Save Preferences
                </Button>
                <Button variant="outline" onClick={handleAcceptAll} className="font-display">
                  Accept All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-muted-foreground"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to check consent status
export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    const prefs = localStorage.getItem(PREFERENCES_KEY);

    setHasConsent(consent !== null);
    if (prefs) {
      setPreferences(JSON.parse(prefs));
    }
  }, []);

  const openSettings = useCallback(() => {
    // Dispatch custom event to open cookie settings
    window.dispatchEvent(new CustomEvent("open-cookie-settings"));
  }, []);

  return { hasConsent, preferences, openSettings };
};
