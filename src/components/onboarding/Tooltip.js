import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
/**
 * Tooltip Component
 * Lightweight tooltip with aria attributes and keyboard support.
 */
export default function Tooltip({ text, position = 'top', children, delay = 0 }) {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const timeoutRef = useRef();
    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    };
    const handleMouseLeave = () => {
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };
    const handleFocus = () => {
        setIsVisible(true);
    };
    const handleBlur = () => {
        setIsVisible(false);
    };
    useEffect(() => {
        return () => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    }, []);
    const positionClasses = {
        top: 'bottom-full mb-sm -translate-x-1/2 left-1/2',
        bottom: 'top-full mt-sm -translate-x-1/2 left-1/2',
        left: 'right-full mr-sm top-1/2 -translate-y-1/2',
        right: 'left-full ml-sm top-1/2 -translate-y-1/2',
    };
    return (_jsxs("div", { ref: triggerRef, className: "relative inline-block", onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onFocus: handleFocus, onBlur: handleBlur, children: [children, isVisible && (_jsxs("div", { ref: tooltipRef, role: "tooltip", "aria-label": text, className: `absolute z-50 px-md py-sm bg-charcoal-900 dark:bg-charcoal-700 text-white dark:text-charcoal-50 rounded-md text-sm whitespace-nowrap pointer-events-none ${positionClasses[position]}`, children: [text, _jsx("div", { className: `absolute w-0 h-0 border-4 border-transparent ${position === 'top' ? 'border-t-charcoal-900 top-full left-1/2 -translate-x-1/2' :
                            position === 'bottom' ? 'border-b-charcoal-900 bottom-full left-1/2 -translate-x-1/2' :
                                position === 'left' ? 'border-l-charcoal-900 left-full top-1/2 -translate-y-1/2' :
                                    'border-r-charcoal-900 right-full top-1/2 -translate-y-1/2'}` })] }))] }));
}
