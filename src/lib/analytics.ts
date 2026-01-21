// Google Analytics event tracking utility

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type EventCategory = 
  | 'engagement'
  | 'content'
  | 'achievement'
  | 'navigation'
  | 'share';

interface TrackEventOptions {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
}

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = ({ category, action, label, value }: TrackEventOptions) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Pre-defined event helpers for common actions
export const analytics = {
  // Question & Answer events
  askQuestion: (question: string) => {
    trackEvent({
      category: 'engagement',
      action: 'ask_bubbles',
      label: question.slice(0, 100),
    });
  },
  
  receiveAnswer: () => {
    trackEvent({
      category: 'engagement',
      action: 'receive_answer',
    });
  },

  // Scenario events
  viewScenario: (scenarioTitle: string) => {
    trackEvent({
      category: 'content',
      action: 'view_scenario',
      label: scenarioTitle,
    });
  },
  
  playScenario: (scenarioTitle: string) => {
    trackEvent({
      category: 'engagement',
      action: 'play_scenario',
      label: scenarioTitle,
    });
  },
  
  shuffleScenario: () => {
    trackEvent({
      category: 'engagement',
      action: 'shuffle_scenario',
    });
  },

  // Sharing events
  shareContent: (contentType: string, method: string) => {
    trackEvent({
      category: 'share',
      action: `share_${contentType}`,
      label: method,
    });
  },

  // Favorite events
  favoriteAnswer: (isFavoriting: boolean) => {
    trackEvent({
      category: 'engagement',
      action: isFavoriting ? 'favorite_answer' : 'unfavorite_answer',
    });
  },

  // History events
  exportHistory: (count: number, favoritesOnly: boolean) => {
    trackEvent({
      category: 'engagement',
      action: 'export_history',
      label: favoritesOnly ? 'favorites' : 'all',
      value: count,
    });
  },
  
  clearHistory: () => {
    trackEvent({
      category: 'engagement',
      action: 'clear_history',
    });
  },

  // Achievement events
  unlockMilestone: (milestoneDays: number, milestoneLabel: string) => {
    trackEvent({
      category: 'achievement',
      action: 'unlock_milestone',
      label: milestoneLabel,
      value: milestoneDays,
    });
  },

  // Wisdom events
  viewDailyWisdom: () => {
    trackEvent({
      category: 'content',
      action: 'view_daily_wisdom',
    });
  },
  
  refreshRandomWisdom: () => {
    trackEvent({
      category: 'engagement',
      action: 'refresh_random_wisdom',
    });
  },

  // Navigation events
  pageView: (pageName: string) => {
    trackEvent({
      category: 'navigation',
      action: 'page_view',
      label: pageName,
    });
  },

  // Product events
  viewProduct: (productTitle: string) => {
    trackEvent({
      category: 'content',
      action: 'view_product',
      label: productTitle,
    });
  },
  
  addToCart: (productTitle: string) => {
    trackEvent({
      category: 'engagement',
      action: 'add_to_cart',
      label: productTitle,
    });
  },
};
