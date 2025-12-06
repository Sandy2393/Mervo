const STORAGE_KEY = "theme_preference";

type Theme = "light" | "dark";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return systemPrefersDark() ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
  // TODO: persist per-company preference via API
}

export function toggleTheme() {
  const next = getInitialTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

export function initTheme() {
  const initial = getInitialTheme();
  applyTheme(initial);
}
