import { tracker } from '../lib/analytics/tracker';
import type { AnalyticsEvent, UserTraits } from '../lib/analytics/tracker';

/**
 * useAnalytics Hook
 * Wraps the analytics tracker with convenient hooks for components
 */
export function useAnalytics() {
  const trackEvent = (name: string, properties?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };
    tracker.trackEvent(event);
  };

  const identify = (userId: string, traits?: UserTraits) => {
    tracker.identify(userId, traits);
  };

  const setAnalyticsEnabled = (enabled: boolean) => {
    tracker.setEnabled(enabled);
  };

  const isAnalyticsEnabled = () => {
    return tracker.isAnalyticsEnabled();
  };

  return {
    trackEvent,
    identify,
    setAnalyticsEnabled,
    isAnalyticsEnabled,
  };
}

export default useAnalytics;
