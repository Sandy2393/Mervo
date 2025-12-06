import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { tracker } from '../../lib/analytics/tracker';
/**
 * PrivacyToggle Component
 * Allows users to opt-in/opt-out of analytics.
 * Persists preference in localStorage.
 */
export default function PrivacyToggle() {
    const [isEnabled, setIsEnabled] = useState(tracker.isAnalyticsEnabled());
    const handleToggle = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        tracker.setEnabled(newState);
    };
    return (_jsxs("div", { className: "flex items-center gap-md p-md rounded-lg bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-charcoal-900 dark:text-charcoal-50", children: "Help us improve with anonymous analytics" }), _jsx("p", { className: "text-xs text-charcoal-600 dark:text-charcoal-400 mt-xs", children: isEnabled ? 'Analytics enabled' : 'Analytics disabled' })] }), _jsx("button", { onClick: handleToggle, role: "switch", "aria-checked": isEnabled, "aria-label": isEnabled ? 'Disable analytics' : 'Enable analytics', className: `relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors ${isEnabled ? 'bg-green-500' : 'bg-charcoal-400'}`, children: _jsx("span", { className: `inline-block h-7 w-7 transform rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-0.5'}` }) })] }));
}
