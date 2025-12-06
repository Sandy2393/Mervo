import { useEffect, useRef } from 'react';

/**
 * SkipLink Component
 * Provides keyboard users a way to skip repetitive content and navigate to main content.
 * Placed at the top of the page, visible on focus.
 */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      ref={linkRef}
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-to-content"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}

/**
 * Focus management helper
 * Trap focus within a modal or region, cycle through focusable elements.
 */
export function useFocusTrap(isActive: boolean, elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [isActive, elementRef]);
}

/**
 * Announce to screen readers
 */
export function useAnnounce() {
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRef.current) return;
    liveRef.current.setAttribute('aria-live', priority);
    liveRef.current.setAttribute('aria-atomic', 'true');
    liveRef.current.textContent = message;
  };

  return { liveRef, announce };
}

export default { SkipLink, useFocusTrap, useAnnounce };
