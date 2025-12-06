/**
 * Design System Tokens
 * Centralized design tokens for colors, spacing, typography, and elevation.
 * These are used alongside Tailwind utilities to ensure consistency.
 */

export const colors = {
  // Neutral palette
  charcoal: {
    50: '#f8f8f8',
    100: '#f0f0f0',
    200: '#e0e0e0',
    300: '#c8c8c8',
    400: '#999999',
    500: '#666666',
    600: '#555555',
    700: '#333333',
    800: '#222222',
    900: '#111111',
  },
  // Brand orange
  orange: {
    50: '#fff8f3',
    100: '#ffe8d6',
    200: '#ffd4b0',
    300: '#ffb87a',
    400: '#ff9d4d',
    500: '#ff8c1a',
    600: '#e67e0e',
    700: '#c4680a',
    800: '#a05308',
    900: '#823f07',
  },
  // Brand green (success)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
  // Semantic
  error: '#dc2626',
  warning: '#f97316',
  success: '#22c55e',
  info: '#3b82f6',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Source Code Pro", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const elevation = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const transitions = {
  fast: { duration: '150ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  base: { duration: '200ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  slow: { duration: '300ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
};

export const borderRadius = {
  xs: '0.25rem',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

/**
 * Helper to respect user's motion preferences
 */
export const motionSettings = {
  shouldReduceMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

export default {
  colors,
  spacing,
  typography,
  elevation,
  transitions,
  borderRadius,
  motionSettings,
};
