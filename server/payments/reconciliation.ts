import { Parser } from "json2csv";

// TODO: replace mocks with real DB queries (payments, jobs, approvals)

type PaymentRecord = {
  id: string;
  company_id: string;
  job_instance_id?: string;
  amount_cents: number;
  currency: string;
  status: string;
  provider_payment_id?: string;
  settled_at?: string;
};

type JobApproval = {
  job_instance_id: string;
  approved_cents: number;
  currency: string;
  approved_at: string;
};

type DateRange = { start: string; end: string };

type ReconciliationResult = {
  matched: Array<{ payment_id: string; job_instance_id: string; amount_cents: number }>;
  partials: Array<{ payment_id: string; job_instance_id: string; paid_cents: number; approved_cents: number }>;
  overpaid: Array<{ payment_id: string; job_instance_id: string; overpay_cents: number }>;
  unmatchedPayments: PaymentRecord[];
  unmatchedApprovals: JobApproval[];
};

export async function reconcilePayments(_company_id: string, _range: DateRange): Promise<ReconciliationResult> {
  // TODO: fetch from DB filtered by company_id and date range
  const payments: PaymentRecord[] = [];
  const approvals: JobApproval[] = [];

  const matched: ReconciliationResult["matched"] = [];
  const partials: ReconciliationResult["partials"] = [];
  const overpaid: ReconciliationResult["overpaid"] = [];
  const unmatchedPayments: PaymentRecord[] = [];
  const unmatchedApprovals: JobApproval[] = [];

  const approvalMap = new Map<string, JobApproval>();
  approvals.forEach((a) => approvalMap.set(a.job_instance_id, a));

  payments.forEach((p) => {
    const approval = p.job_instance_id ? approvalMap.get(p.job_instance_id) : undefined;
    if (!approval) {
      unmatchedPayments.push(p);
      return;
    }
    if (p.amount_cents === approval.approved_cents) {
      matched.push({ payment_id: p.id, job_instance_id: approval.job_instance_id, amount_cents: p.amount_cents });
    } else if (p.amount_cents < approval.approved_cents) {
      partials.push({
        payment_id: p.id,
        job_instance_id: approval.job_instance_id,
        paid_cents: p.amount_cents,
        approved_cents: approval.approved_cents,
      });
    } else if (p.amount_cents > approval.approved_cents) {
      overpaid.push({
        payment_id: p.id,
        job_instance_id: approval.job_instance_id,
        overpay_cents: p.amount_cents - approval.approved_cents,
      });
    }
    approvalMap.delete(approval.job_instance_id);
  });

  approvalMap.forEach((a) => unmatchedApprovals.push(a));

  return { matched, partials, overpaid, unmatchedPayments, unmatchedApprovals };
}

export async function generateReconciliationReport(company_id: string, range: DateRange) {
  const result = await reconcilePayments(company_id, range);
  const rows = [
    ...result.matched.map((m) => ({ type: "matched", ...m })),
    ...result.partials.map((p) => ({ type: "partial", ...p })),
    ...result.overpaid.map((o) => ({ type: "overpaid", ...o })),
    ...result.unmatchedPayments.map((u) => ({ type: "unmatched_payment", payment_id: u.id, amount_cents: u.amount_cents })),
    ...result.unmatchedApprovals.map((u) => ({ type: "unmatched_approval", job_instance_id: u.job_instance_id, approved_cents: u.approved_cents })),
  ];

  const parser = new Parser();
  const csv = parser.parse(rows);
  return { csv, json: result };
}
