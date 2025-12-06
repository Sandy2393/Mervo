// Frontend CS service wrappers (no secrets)

const API_BASE = "/api/cs";

async function api(path: string, opts: { method?: string; body?: any } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const csService = {
  startOnboarding: (company_id: string) => api("/onboarding/start", { method: "POST", body: { company_id } }),
  advanceStep: (company_id: string, stepId: string) => api("/onboarding/advance", { method: "POST", body: { company_id, stepId } }),
  createTicket: (payload: { subject: string; message: string; urgency: string }) =>
    api("/tickets", { method: "POST", body: payload }),
  runHealth: (payload: { company_id: string }) => api("/health/run", { method: "POST", body: payload }),
};
