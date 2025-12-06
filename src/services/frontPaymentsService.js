// Frontend service wrappers calling backend endpoints (no secrets here)
const API_BASE = "/api/payments"; // TODO: adjust to actual API base
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
export const frontPaymentsService = {
    createPaymentIntent: (payload) => api("/create-intent", { method: "POST", body: payload }),
    listPayments: (company_id) => api(`/list?company_id=${company_id}`),
    createPayoutBatch: (payload) => api("/payout-batches", { method: "POST", body: payload }),
    addPayoutLine: (payload) => api("/payouts", { method: "POST", body: payload }),
    approveBatch: (payload) => api("/payout-batches/approve", { method: "POST", body: payload }),
    runReconciliation: (payload) => api("/reconcile", { method: "POST", body: payload }),
    downloadInvoice: (invoiceId) => api(`/invoices/${invoiceId}/download`),
};
