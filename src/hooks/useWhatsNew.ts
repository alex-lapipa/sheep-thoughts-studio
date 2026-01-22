import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Increment this version when adding new features
const CURRENT_VERSION = '1.2.0';

export interface WhatsNewEntry {
  version: string;
  title: string;
  features: string[];
  date: string;
  highlights?: string[];
  category?: 'major' | 'minor' | 'patch';
}

// Define changelog entries - newest first
export const CHANGELOG: WhatsNewEntry[] = [
  {
    version: '1.2.0',
    title: "Newsletter & Legal Updates 📬",
    features: [
      '📧 Newsletter unsubscribe with one-click opt-out',
      '📋 Table of contents sidebar on Terms page',
      '📊 Scroll progress bar on Privacy page',
      '📰 Full changelog history page',
    ],
    highlights: ['Newsletter management', 'Improved navigation'],
    date: '2026-01-22',
    category: 'minor',
  },
  {
    version: '1.1.0',
    title: "Campaign Manager & Admin Tools 🚀",
    features: [
      '📨 Newsletter campaign manager in admin',
      '✉️ Double opt-in email confirmation',
      '📤 CSV export for contact messages',
      '🔐 Bulk message management',
    ],
    highlights: ['Email campaigns', 'Admin improvements'],
    date: '2026-01-22',
    category: 'minor',
  },
  {
    version: '1.0.0',
    title: "Launch Day! 🐑",
    features: [
      '✨ Newsletter signup with welcome emails',
      '📋 Table of contents on Privacy page',
      '🔗 Smooth scrolling to anchor sections',
      '📊 Admin newsletter management',
      '🎨 Full brand book implementation',
      '🛍️ Shopify storefront integration',
    ],
    highlights: ['Initial launch', 'Core features'],
    date: '2026-01-20',
    category: 'major',
  },
];

const STORAGE_KEY = 'bubbles-seen-version';

// Helper to compare version strings
function isVersionNewer(version: string, seenVersion: string): boolean {
  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
  const [sMajor, sMinor, sPatch] = seenVersion.split('.').map(Number);
  
  if (vMajor > sMajor) return true;
  if (vMajor === sMajor && vMinor > sMinor) return true;
  if (vMajor === sMajor && vMinor === sMinor && vPatch > sPatch) return true;
  return false;
}

export function useWhatsNew() {
  const [hasNewFeatures, setHasNewFeatures] = useState(false);
  const [newEntriesCount, setNewEntriesCount] = useState(0);
  const [currentChangelog, setCurrentChangelog] = useState<WhatsNewEntry | null>(null);

  useEffect(() => {
    // Check stored version
    const seenVersion = localStorage.getItem(STORAGE_KEY);
    
    // Find if there are new features since last visit
    if (seenVersion !== CURRENT_VERSION) {
      // Count how many entries are newer than seen version
      const newEntries = seenVersion 
        ? CHANGELOG.filter(entry => isVersionNewer(entry.version, seenVersion))
        : CHANGELOG; // If no seen version, all are new
      
      const count = newEntries.length;
      
      if (count > 0) {
        setHasNewFeatures(true);
        setNewEntriesCount(count);
        setCurrentChangelog(CHANGELOG[0]);
        
        // Show toast after a short delay for better UX
        const timeoutId = setTimeout(() => {
          const latestEntry = CHANGELOG[0];
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
    setNewEntriesCount(0);
  };

  const resetWhatsNew = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasNewFeatures(true);
    setNewEntriesCount(CHANGELOG.length);
  };

  return {
    hasNewFeatures,
    newEntriesCount,
    currentChangelog,
    markAsSeen,
    resetWhatsNew,
    currentVersion: CURRENT_VERSION,
  };
}
