import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Increment this version when adding new features
const CURRENT_VERSION = '1.0.0';

interface WhatsNewEntry {
  version: string;
  title: string;
  features: string[];
  date: string;
}

// Define changelog entries - newest first
const CHANGELOG: WhatsNewEntry[] = [
  {
    version: '1.0.0',
    title: "What's New! 🐑",
    features: [
      '✨ Newsletter signup with welcome emails',
      '📋 Table of contents on Privacy page',
      '🔗 Smooth scrolling to anchor sections',
      '📊 Admin newsletter management',
    ],
    date: '2026-01-22',
  },
];

const STORAGE_KEY = 'bubbles-seen-version';

export function useWhatsNew() {
  const [hasNewFeatures, setHasNewFeatures] = useState(false);
  const [currentChangelog, setCurrentChangelog] = useState<WhatsNewEntry | null>(null);

  useEffect(() => {
    // Check stored version
    const seenVersion = localStorage.getItem(STORAGE_KEY);
    
    // Find if there are new features since last visit
    if (seenVersion !== CURRENT_VERSION) {
      const latestEntry = CHANGELOG[0];
      
      if (latestEntry) {
        setHasNewFeatures(true);
        setCurrentChangelog(latestEntry);
        
        // Show toast after a short delay for better UX
        const timeoutId = setTimeout(() => {
          const featureText = latestEntry.features.slice(0, 3).join('\n');
          const moreText = latestEntry.features.length > 3 
            ? `\n+${latestEntry.features.length - 3} more updates` 
            : '';
          
          toast(latestEntry.title, {
            description: featureText + moreText,
            duration: 8000,
            action: {
              label: 'Got it!',
              onClick: () => markAsSeen(),
            },
          });
          
          // Mark as seen after showing
          markAsSeen();
        }, 1500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, []);

  const markAsSeen = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setHasNewFeatures(false);
  };

  const resetWhatsNew = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasNewFeatures(true);
  };

  return {
    hasNewFeatures,
    currentChangelog,
    markAsSeen,
    resetWhatsNew,
    currentVersion: CURRENT_VERSION,
  };
}
