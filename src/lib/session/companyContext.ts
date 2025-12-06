const LOCAL_KEY = "mervo:lastCompanyId";
const SESSION_OVERRIDE_KEY = "mervo:sessionCompanyId";

export function getActiveCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  const sessionOverride = sessionStorage.getItem(SESSION_OVERRIDE_KEY);
  if (sessionOverride) return sessionOverride;
  return localStorage.getItem(LOCAL_KEY);
}

export function setActiveCompanyId(companyId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, companyId);
  sessionStorage.setItem(SESSION_OVERRIDE_KEY, companyId);
}

export function clearSessionOverride() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_OVERRIDE_KEY);
}

export function withCompanyHeaders(init: RequestInit = {}, companyId?: string): RequestInit {
  const headers = new Headers(init.headers || {});
  const active = companyId || getActiveCompanyId();
  if (active) headers.set("x-company-id", active);
  return { ...init, headers };
}

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const nextInit = withCompanyHeaders(init);
  return fetch(input, nextInit);
}
