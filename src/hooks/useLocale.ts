import { useEffect, useState } from 'react';
import type { Locale } from '../i18n/i18n';

const DEFAULT_LOCALE: Locale = 'en-AU';
const SUPPORTED_LOCALES: Locale[] = ['en-AU', 'en-US'];

/**
 * useLocale Hook
 * Get and set the current locale, persisted in localStorage
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  return { locale, setLocale, mounted, supportedLocales: SUPPORTED_LOCALES };
}

export default useLocale;
