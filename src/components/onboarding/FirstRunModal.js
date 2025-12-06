import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/button';
export default function FirstRunModal({ onStartTour, onSkip }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const hasSeenFirstRun = localStorage.getItem('mervo_first_run_shown') === 'true';
        if (!hasSeenFirstRun) {
            setShow(true);
        }
    }, []);
    const handleStartTour = () => {
        localStorage.setItem('mervo_first_run_shown', 'true');
        setShow(false);
        onStartTour();
    };
    const handleSkip = () => {
        localStorage.setItem('mervo_first_run_shown', 'true');
        setShow(false);
        onSkip();
    };
    if (!show)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsx(Card, { className: "max-w-md", children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-2xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md", children: "Welcome to Mervo" }), _jsx("p", { className: "text-charcoal-700 dark:text-charcoal-300 mb-lg", children: "Let's get you started with a quick tour of the key features. You can skip this at any time." }), _jsxs("div", { className: "flex gap-md", children: [_jsx(Button, { onClick: handleSkip, className: "flex-1 bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-50 hover:bg-charcoal-300 dark:hover:bg-charcoal-600", children: "Skip for now" }), _jsx(Button, { onClick: handleStartTour, className: "flex-1 bg-orange-500 text-white hover:bg-orange-600", children: "Take the tour" })] })] }) }) }));
}
