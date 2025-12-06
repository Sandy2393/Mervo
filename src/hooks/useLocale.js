import { useEffect, useState } from 'react';
const DEFAULT_LOCALE = 'en-AU';
const SUPPORTED_LOCALES = ['en-AU', 'en-US'];
/**
 * useLocale Hook
 * Get and set the current locale, persisted in localStorage
 */
export function useLocale() {
    const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const stored = localStorage.getItem('locale');
        if (stored && SUPPORTED_LOCALES.includes(stored)) {
            setLocaleState(stored);
            document.documentElement.lang = stored;
        }
        setMounted(true);
    }, []);
    const setLocale = (newLocale) => {
        if (!SUPPORTED_LOCALES.includes(newLocale))
            return;
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
    };
    return { locale, setLocale, mounted, supportedLocales: SUPPORTED_LOCALES };
}
export default useLocale;
