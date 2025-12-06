import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
/**
 * GuidedTour Component
 * Step-by-step tour with next/prev navigation.
 * Respects prefers-reduced-motion for accessibility.
 * TODO: Integrate with framer-motion for advanced animations if added to dependencies.
 */
export default function GuidedTour({ steps, onComplete, onSkip }) {
    const [currentStep, setCurrentStep] = useState(0);
    const step = steps[currentStep];
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
        else {
            onComplete();
        }
    };
    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return (_jsx("div", { className: `fixed inset-0 bg-black/50 flex items-center justify-center z-40 transition-opacity ${shouldReduceMotion ? 'opacity-100' : 'animate-fade-in'}`, children: _jsxs("div", { className: "bg-white dark:bg-charcoal-900 rounded-lg shadow-lg p-lg max-w-md", children: [_jsxs("div", { className: "mb-lg", children: [_jsxs("div", { className: "text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm", children: ["Step ", currentStep + 1, " of ", steps.length] }), _jsx("h2", { className: "text-2xl font-bold text-charcoal-900 dark:text-charcoal-50", children: step.title }), _jsx("p", { className: "text-charcoal-700 dark:text-charcoal-300 mt-md", children: step.description })] }), _jsxs("div", { className: "flex gap-md", children: [_jsx("button", { onClick: handlePrev, disabled: currentStep === 0, "aria-label": "Previous step", className: "px-lg py-md rounded-lg bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-50 hover:bg-charcoal-300 dark:hover:bg-charcoal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "\u2190 Back" }), _jsx("button", { onClick: onSkip, "aria-label": "Skip tour", className: "px-lg py-md rounded-lg bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-50 hover:bg-charcoal-300 dark:hover:bg-charcoal-600 transition-colors", children: "Skip" }), _jsx("button", { onClick: handleNext, "aria-label": currentStep === steps.length - 1 ? 'Complete tour' : 'Next step', className: "flex-1 px-lg py-md rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors", children: currentStep === steps.length - 1 ? 'Complete' : 'Next →' })] })] }) }));
}
