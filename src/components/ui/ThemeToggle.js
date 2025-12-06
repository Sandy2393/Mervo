import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { colors } from '../../styles/design-tokens';
/**
 * ThemeToggle Component
 * Switches between light and dark theme, persists choice to localStorage,
 * and applies 'dark' class to <html> element for Tailwind dark mode.
 */
export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);
    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored) {
            setTheme(stored);
        }
        else {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(isDark ? 'dark' : 'light');
        }
        setMounted(true);
    }, []);
    // Apply theme to HTML element
    useEffect(() => {
        if (!mounted)
            return;
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
        }
        else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme, mounted]);
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    if (!mounted)
        return null;
    const bgColor = theme === 'dark' ? colors.charcoal[700] : colors.charcoal[100];
    const textColor = theme === 'dark' ? colors.charcoal[50] : colors.charcoal[900];
    return (_jsx("button", { onClick: toggleTheme, "aria-label": `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, title: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, className: "p-md rounded-lg transition-colors", style: {
            backgroundColor: bgColor,
            color: textColor,
        }, children: theme === 'light' ? '🌙' : '☀️' }));
}
