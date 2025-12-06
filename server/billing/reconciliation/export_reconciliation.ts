/**
 * Billing Reconciliation Export
 * Generate monthly reconciliation CSV for accounting
 * TODO: Replace placeholders with real DB queries
 */

import { Parser } from "json2csv";

export interface ReconciliationRow {
  date: string;
  type: "invoice" | "payout" | "refund" | "adjustment";
  reference_id: string;
  company_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description: string;
}

export interface ExportOptions {
  startDate: string;
  endDate: string;
  includePayouts?: boolean;
  includeRefunds?: boolean;
  includeAdjustments?: boolean;
}

/**
 * Fetch reconciliation data for a date range
 * TODO: Query subscriptions, invoices, payouts, billing_adjustments tables
 */
export async function fetchReconciliationData(options: ExportOptions): Promise<ReconciliationRow[]> {
  const rows: ReconciliationRow[] = [];

  // TODO: Fetch invoices from Stripe or billing_webhooks where event_type = 'invoice.payment_succeeded'
  // Example placeholder:
  rows.push({
    date: options.startDate,
    type: "invoice",
    reference_id: "in_placeholder_001",
    company_id: "company_placeholder",
    amount_cents: 10000,
    currency: "USD",
    status: "paid",
    description: "Monthly subscription - Starter",
  });

  // TODO: Fetch payouts from payouts table if includePayouts
  if (options.includePayouts) {
    rows.push({
      date: options.startDate,
      type: "payout",
      reference_id: "po_placeholder_001",
      company_id: "company_placeholder",
      amount_cents: 5000,
      currency: "USD",
      status: "paid",
      description: "Contractor payout",
    });
  }

  // TODO: Fetch refunds from billing_adjustments or Stripe events
  if (options.includeRefunds) {
    rows.push({
      date: options.startDate,
      type: "refund",
      reference_id: "re_placeholder_001",
      company_id: "company_placeholder",
      amount_cents: 2000,
      currency: "USD",
      status: "succeeded",
      description: "Refund for overpayment",
    });
  }

  // TODO: Fetch manual adjustments from billing_adjustments
  if (options.includeAdjustments) {
    rows.push({
      date: options.startDate,
      type: "adjustment",
      reference_id: "adj_placeholder_001",
      company_id: "company_placeholder",
      amount_cents: -1000,
      currency: "USD",
      status: "applied",
      description: "Manual credit applied",
    });
  }

  return rows;
}

/**
 * Generate reconciliation CSV
 */
export async function generateReconciliationCSV(options: ExportOptions): Promise<string> {
  const data = await fetchReconciliationData(options);

  const parser = new Parser<ReconciliationRow>({
    fields: ["date", "type", "reference_id", "company_id", "amount_cents", "currency", "status", "description"],
  });

  const csv = parser.parse(data);
  return csv;
}

/**
 * CLI helper to export reconciliation
 * Usage: node export_reconciliation.js --start=2024-01-01 --end=2024-01-31
 */
export async function exportReconciliationCLI(args: string[]) {
  const startArg = args.find((a) => a.startsWith("--start="));
  const endArg = args.find((a) => a.startsWith("--end="));

  if (!startArg || !endArg) {
    console.error("Usage: --start=YYYY-MM-DD --end=YYYY-MM-DD [--payouts] [--refunds] [--adjustments]");
    process.exit(1);
  }

  const startDate = startArg.split("=")[1];
  const endDate = endArg.split("=")[1];
  const includePayouts = args.includes("--payouts");
  const includeRefunds = args.includes("--refunds");
  const includeAdjustments = args.includes("--adjustments");

  const csv = await generateReconciliationCSV({ startDate, endDate, includePayouts, includeRefunds, includeAdjustments });

  console.log(csv);
}
