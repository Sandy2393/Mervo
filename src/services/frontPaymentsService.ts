// Frontend service wrappers calling backend endpoints (no secrets here)

const API_BASE = "/api/payments"; // TODO: adjust to actual API base

type FetcherOpts = { method?: string; body?: any };

async function api(path: string, opts: FetcherOpts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const frontPaymentsService = {
  createPaymentIntent: (payload: { company_id: string; amount_cents: number; currency: string; metadata?: Record<string, string> }) =>
    api("/create-intent", { method: "POST", body: payload }),
  listPayments: (company_id: string) => api(`/list?company_id=${company_id}`),
  createPayoutBatch: (payload: { company_id: string; scheduled_at: string; created_by: string }) =>
    api("/payout-batches", { method: "POST", body: payload }),
  addPayoutLine: (payload: { batch_id: string; contractor_id: string; amount_cents: number; currency: string }) =>
    api("/payouts", { method: "POST", body: payload }),
  approveBatch: (payload: { batch_id: string; approverId: string }) => api("/payout-batches/approve", { method: "POST", body: payload }),
  runReconciliation: (payload: { company_id: string; start: string; end: string }) => api("/reconcile", { method: "POST", body: payload }),
  downloadInvoice: (invoiceId: string) => api(`/invoices/${invoiceId}/download`),
};
