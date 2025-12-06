import { BillingService } from "../../billing/billingService";
import { Parser } from "json2csv";

// Minimal serverless-style handler for billing API endpoints used by the admin UI.
// Wire this into your HTTP framework or edge runtime. Assumes JSON request/response.

const billingService = new BillingService();

async function readJsonBody(req: any) {
  const raw = await new Promise<string>((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });

  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: any, res: any) {
  const url = new URL(req.url || "/", "http://localhost");
  const path = url.pathname;
  const companyId = req.headers["x-company-id"] || url.searchParams.get("company_id") || "company_placeholder";

  try {
    // GET /api/billing/subscription
    if (req.method === "GET" && path.endsWith("/api/billing/subscription")) {
      const sub = billingService.getSubscription(String(companyId));
      return res.status(sub ? 200 : 404).json(sub || { error: "subscription not found" });
    }

    // GET /api/billing/usage
    if (req.method === "GET" && path.endsWith("/api/billing/usage")) {
      const usage = billingService.getUsageSummary(String(companyId));
      return res.status(200).json(usage);
    }

    // GET /api/billing/invoices
    if (req.method === "GET" && path.endsWith("/api/billing/invoices")) {
      const invoices = await billingService.listCompanyInvoices(String(companyId));
      const wantsCsv = url.searchParams.get("format") === "csv";

      if (wantsCsv) {
        const parser = new Parser({ fields: ["id", "invoice_number", "status", "total_cents", "period_start", "period_end"] });
        const csv = parser.parse(invoices || []);
        res.setHeader("Content-Type", "text/csv");
        return res.status(200).send(csv);
      }

      return res.status(200).json(invoices || []);
    }

    // POST /api/billing/adjustments
    if (req.method === "POST" && path.endsWith("/api/billing/adjustments")) {
      const body = await readJsonBody(req);
      const adjustment = await billingService.createAdjustment({
        company_id: String(companyId),
        adjustment_type: body.adjustment_type,
        amount_cents: body.amount_cents,
        currency: body.currency || "USD",
        reason: body.reason,
        created_by: body.created_by || "system",
      });
      return res.status(201).json(adjustment);
    }

    return res.status(404).json({ error: "Not Found" });
  } catch (err: any) {
    console.error("[billing:api:error]", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
