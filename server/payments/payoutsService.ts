import { StripeConnectClient } from "./stripeConnectClient";

// TODO: replace in-memory store with real DB tables
const payoutBatches: any[] = [];
const payouts: any[] = [];

export type PayoutStatus = "draft" | "scheduled" | "approved" | "processing" | "paid" | "failed";

type ProcessOpts = { dryRun?: boolean; confirm?: boolean };

export class PayoutsService {
  constructor(private stripeClient = new StripeConnectClient()) {}

  schedulePayoutBatch(company_id: string, scheduled_at: string, created_by: string) {
    const batch = {
      id: crypto.randomUUID(),
      company_id,
      batch_date: scheduled_at,
      total_cents: 0,
      status: "draft" as PayoutStatus,
      created_by,
      approved_at: null,
      processed_at: null,
    };
    payoutBatches.push(batch);
    this.audit("payout_batch_scheduled", batch);
    return batch;
  }

  addPayoutToBatch(batch_id: string, contractor_id: string, amount_cents: number, currency: string) {
    const batch = payoutBatches.find((b) => b.id === batch_id);
    if (!batch) throw new Error("batch not found");
    const line = { id: crypto.randomUUID(), batch_id, contractor_id, amount_cents, currency, status: "scheduled" };
    payouts.push(line);
    batch.total_cents += amount_cents;
    this.audit("payout_added", { batch_id, contractor_id, amount_cents });
    return line;
  }

  approveBatch(batch_id: string, approverId: string) {
    const batch = payoutBatches.find((b) => b.id === batch_id);
    if (!batch) throw new Error("batch not found");
    batch.status = "approved" as PayoutStatus;
    batch.approved_at = new Date().toISOString();
    batch.approved_by = approverId;
    this.audit("payout_batch_approved", { batch_id, approverId });
    return batch;
  }

  async processBatch(batch_id: string, opts: ProcessOpts = { dryRun: true, confirm: false }) {
    const batch = payoutBatches.find((b) => b.id === batch_id);
    if (!batch) throw new Error("batch not found");
    const dryRun = opts.dryRun !== false ? true : false;
    const confirm = opts.confirm === true;

    const lines = payouts.filter((p) => p.batch_id === batch_id);
    const results: any[] = [];

    for (const line of lines) {
      const res = await this.stripeClient.createPayout(
        {
          company_id: batch.company_id,
          contractor_id: line.contractor_id,
          amount_cents: line.amount_cents,
          currency: line.currency,
        },
        { dryRun, confirm }
      );

      if (!dryRun && confirm) {
        line.status = "paid";
        line.provider_payout_id = res.provider_payout_id;
      }

      results.push({ line_id: line.id, response: res });
    }

    if (!dryRun && confirm) {
      batch.status = "processed" as PayoutStatus;
      batch.processed_at = new Date().toISOString();
    }

    this.audit("payout_batch_processed", { batch_id, dryRun, confirm, results });
    return { batch_id, dryRun, confirm, results };
  }

  requeueFailedPayouts(batch_id: string) {
    const failed = payouts.filter((p) => p.batch_id === batch_id && p.status === "failed");
    failed.forEach((p) => (p.status = "scheduled"));
    this.audit("payouts_requeued", { batch_id, count: failed.length });
    return failed.length;
  }

  private audit(event: string, payload: any) {
    // TODO: replace console with structured audit logger
    console.log(`[payouts:audit] ${event}`, payload);
  }
}
