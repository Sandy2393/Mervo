import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { colors } from '../../styles/design-tokens';

/**
 * BrandHeader Component
 * Branded header using design tokens, responsive layout.
 * Includes logo, navigation placeholder, and theme toggle.
 */
export default function BrandHeader() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className="bg-white dark:bg-charcoal-900 border-b border-charcoal-200 dark:border-charcoal-700 shadow-sm"
      style={{
        borderBottomColor: colors.charcoal[200],
      }}
    >
      <div className="max-w-7xl mx-auto px-md md:px-lg lg:px-xl py-md md:py-lg flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-md">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: colors.orange[500],
            }}
            aria-label="Mervo"
          >
            M
          </div>
          {!isMobile && (
            <h1 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-50">
              Mervo
            </h1>
          )}
        </div>

        {/* Navigation Placeholder */}
        <nav className="hidden md:flex items-center gap-lg">
          <a href="/dashboard" className="text-charcoal-700 dark:text-charcoal-300 hover:text-orange-500 transition-colors">
            Dashboard
          </a>
          <a href="/jobs" className="text-charcoal-700 dark:text-charcoal-300 hover:text-orange-500 transition-colors">
            Jobs
          </a>
          <a href="/help" className="text-charcoal-700 dark:text-charcoal-300 hover:text-orange-500 transition-colors">
            Help
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-md">
          <ThemeToggle />
          <button
            aria-label="User menu"
            className="p-md rounded-lg bg-charcoal-100 dark:bg-charcoal-800 hover:bg-charcoal-200 dark:hover:bg-charcoal-700 transition-colors"
          >
            👤
          </button>
        </div>
      </div>
    </header>
  );
}
