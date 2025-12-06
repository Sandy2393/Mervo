/**
 * i18n Configuration
 * Minimal i18n setup using a custom hook pattern.
 * Supports locale switching and persistence.
 * TODO: Add i18next library if more complex features are needed.
 */

import { useEffect, useState } from 'react';

export type Locale = 'en-AU' | 'en-US';

const DEFAULT_LOCALE: Locale = 'en-AU';

// Locale catalog — add more locales as needed
const locales: Record<Locale, Record<string, string>> = {
  'en-AU': require('./locales/en-AU.json'),
  'en-US': require('./locales/en-AU.json'), // Fallback to en-AU for now
};

/**
 * useTranslation hook
 * Returns a t() function that translates keys and a locale value
 */
export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && stored in locales) {
      setLocale(stored);
    }
    setMounted(true);
  }, []);

  const t = (key: string, defaultValue = key): string => {
    const catalog = locales[locale];
    return catalog[key] || defaultValue;
  };

  const changeLocale = (newLocale: Locale) => {
    if (newLocale in locales) {
      setLocale(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  };

  return { t, locale, changeLocale, mounted };
}

/**
 * Initialize i18n (can be called in App root)
 */
export function initializeI18n() {
  const stored = localStorage.getItem('locale') as Locale | null;
  if (stored && stored in locales) {
    document.documentElement.lang = stored;
  } else {
    document.documentElement.lang = DEFAULT_LOCALE;
  }
}

export default { useTranslation, initializeI18n };
