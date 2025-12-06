import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { colors } from '../../styles/design-tokens';
/**
 * RatingStars Component
 * Interactive star rating selector or display.
 * Keyboard accessible: use arrow keys to change rating.
 */
export default function RatingStars({ value = 0, onChange, readOnly = false, size = 'md', showLabel = true, }) {
    const [hoverRating, setHoverRating] = useState(0);
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
    };
    const displayRating = hoverRating || value;
    const handleKeyDown = (e, star) => {
        if (readOnly)
            return;
        if (e.key === 'ArrowRight' && star < 5) {
            onChange?.(star + 1);
        }
        else if (e.key === 'ArrowLeft' && star > 1) {
            onChange?.(star - 1);
        }
    };
    const ratingLabel = {
        0: 'No rating',
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent',
    };
    return (_jsxs("div", { className: "flex items-center gap-md", children: [_jsx("div", { className: "flex gap-sm", role: "group", "aria-label": "Rating", children: [1, 2, 3, 4, 5].map(star => (_jsx("button", { onClick: () => !readOnly && onChange?.(star), onMouseEnter: () => !readOnly && setHoverRating(star), onMouseLeave: () => setHoverRating(0), onKeyDown: (e) => handleKeyDown(e, star), disabled: readOnly, "aria-label": `${star} stars`, "aria-pressed": value === star, className: `transition-colors ${sizeClasses[size]} ${!readOnly && 'cursor-pointer hover:scale-110'} ${readOnly && 'cursor-default'}`, style: {
                        color: star <= displayRating ? colors.orange[500] : colors.charcoal[300],
                    }, children: "\u2605" }, star))) }), showLabel && (_jsx("span", { className: "text-sm text-charcoal-600 dark:text-charcoal-400 min-w-20", "aria-live": "polite", "aria-atomic": "true", children: ratingLabel[displayRating] }))] }));
}
