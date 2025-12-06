// Frontend CS service wrappers (no secrets)
const API_BASE = "/api/cs";
async function api(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: opts.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok)
        throw new Error(`API error ${res.status}`);
    return res.json();
}
export const csService = {
    startOnboarding: (company_id) => api("/onboarding/start", { method: "POST", body: { company_id } }),
    advanceStep: (company_id, stepId) => api("/onboarding/advance", { method: "POST", body: { company_id, stepId } }),
    createTicket: (payload) => api("/tickets", { method: "POST", body: payload }),
    runHealth: (payload) => api("/health/run", { method: "POST", body: payload }),
};
