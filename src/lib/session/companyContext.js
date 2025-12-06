const LOCAL_KEY = "mervo:lastCompanyId";
const SESSION_OVERRIDE_KEY = "mervo:sessionCompanyId";
export function getActiveCompanyId() {
    if (typeof window === "undefined")
        return null;
    const sessionOverride = sessionStorage.getItem(SESSION_OVERRIDE_KEY);
    if (sessionOverride)
        return sessionOverride;
    return localStorage.getItem(LOCAL_KEY);
}
export function setActiveCompanyId(companyId) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(LOCAL_KEY, companyId);
    sessionStorage.setItem(SESSION_OVERRIDE_KEY, companyId);
}
export function clearSessionOverride() {
    if (typeof window === "undefined")
        return;
    sessionStorage.removeItem(SESSION_OVERRIDE_KEY);
}
export function withCompanyHeaders(init = {}, companyId) {
    const headers = new Headers(init.headers || {});
    const active = companyId || getActiveCompanyId();
    if (active)
        headers.set("x-company-id", active);
    if (typeof window !== "undefined") {
        const raw = localStorage.getItem("super_admin_user");
        if (raw) {
            headers.set("x-role", "super_admin");
            try {
                const parsed = JSON.parse(raw);
                if (parsed?.id)
                    headers.set("x-user-id", parsed.id);
                if (parsed?.email)
                    headers.set("x-user", parsed.email);
            }
            catch (_err) {
                // ignore parsing issues
            }
        }
    }
    return { ...init, headers };
}
export async function authedFetch(input, init = {}) {
    const nextInit = withCompanyHeaders(init);
    return fetch(input, nextInit);
}
export async function superAdminFetch(input, init = {}) {
    const headers = new Headers(init.headers || {});
    const nextInit = withCompanyHeaders({ ...init, headers });
    return fetch(input, nextInit);
}
