import { tracker } from '../lib/analytics/tracker';
/**
 * useAnalytics Hook
 * Wraps the analytics tracker with convenient hooks for components
 */
export function useAnalytics() {
    const trackEvent = (name, properties) => {
        const event = {
            name,
            properties,
            timestamp: Date.now(),
        };
        tracker.trackEvent(event);
    };
    const identify = (userId, traits) => {
        tracker.identify(userId, traits);
    };
    const setAnalyticsEnabled = (enabled) => {
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
