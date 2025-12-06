/**
 * Billing Service — Core billing operations for SaaS subscriptions and usage metering
 * TODO: Replace in-memory stores with real Supabase/Postgres queries
 * TODO: Add proper transaction handling for billing operations
 */

import { DownloadInvoiceResult, StripeClient, StripePlan } from "./stripeClient";

// In-memory placeholders (replace with real DB)
const subscriptionsStore: any[] = [];
const usageRecordsStore: any[] = [];
const adjustmentsStore: any[] = [];

const envPrice = (key: string, fallback: string) => process.env[key] || fallback;

export const PLAN_PRICE_MAP: Record<StripePlan, { priceId: string; description: string }> = {
  starter: { priceId: envPrice("PRICE_ID_STARTER", "price_starter_placeholder"), description: "Starter plan" },
  business: { priceId: envPrice("PRICE_ID_BUSINESS", "price_business_placeholder"), description: "Business plan" },
  enterprise: { priceId: envPrice("PRICE_ID_ENTERPRISE", "price_enterprise_placeholder"), description: "Enterprise plan" },
};

export type UsageType = "photo_bytes" | "storage_bytes" | "api_calls" | "contractor_minutes";
export type AdjustmentType = "charge" | "credit" | "refund";

export interface CreateSubscriptionParams {
  company_id: string;
  tier: StripePlan;
  priceId: string;
  customerEmail: string;
}

export interface RecordUsageParams {
  company_id: string;
  usage_type: UsageType;
  units: number;
  metadata?: Record<string, any>;
}

export interface CreateAdjustmentParams {
  company_id: string;
  adjustment_type: AdjustmentType;
  amount_cents: number;
  currency?: string;
  reason: string;
  created_by: string;
}

export interface ExportUsageParams {
  start: string;
  end: string;
  confirm?: boolean;
  liveEnv?: string;
}

export class BillingService {
  constructor(private stripeClient = new StripeClient()) {}

  /**
   * Create a new subscription for a company
   * TODO: Persist to subscriptions table with Stripe subscription ID
   */
  async createSubscription(params: CreateSubscriptionParams) {
    // 1. Create Stripe customer if not exists
    const customer = await this.stripeClient.createCustomer({
      email: params.customerEmail,
      companyId: params.company_id,
    });

    // 2. Create subscription
    const subscription = await this.stripeClient.createSubscription({
      customerId: customer.id,
      priceId: params.priceId,
      metadata: { company_id: params.company_id, tier: params.tier },
    });

    // 3. Store in DB
    const record = {
      id: crypto.randomUUID(),
      company_id: params.company_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      tier: params.tier,
      status: subscription.status,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
    };

    subscriptionsStore.push(record);
    this.audit("subscription_created", record);
    return record;
  }

  /**
   * Cancel a subscription (at period end by default)
   * TODO: Update subscription record in DB
   */
  async cancelSubscription(company_id: string, atPeriodEnd = true) {
    const sub = subscriptionsStore.find((s) => s.company_id === company_id && s.status === "active");
    if (!sub) throw new Error("No active subscription found");

    await this.stripeClient.cancelSubscription(sub.stripe_subscription_id, atPeriodEnd);

    sub.cancel_at_period_end = atPeriodEnd;
    if (!atPeriodEnd) {
      sub.status = "canceled";
      sub.canceled_at = new Date().toISOString();
    }

    this.audit("subscription_canceled", { company_id, atPeriodEnd });
    return sub;
  }

  /**
   * Record metered usage for billing
   * TODO: Insert into usage_records table
   */
  async recordUsage(params: RecordUsageParams) {
    const record = {
      id: crypto.randomUUID(),
      company_id: params.company_id,
      usage_type: params.usage_type,
      units: params.units,
      recorded_at: new Date().toISOString(),
      exported_to_stripe: false,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
    };

    usageRecordsStore.push(record);
    this.audit("usage_recorded", record);
    return record;
  }

  getUsageSummary(company_id: string) {
    const totals: Record<UsageType, number> = {
      photo_bytes: 0,
      storage_bytes: 0,
      api_calls: 0,
      contractor_minutes: 0,
    };

    for (const r of usageRecordsStore) {
      if (r.company_id !== company_id) continue;
      totals[r.usage_type as UsageType] += r.units;
    }

    return totals;
  }

  getSubscription(company_id: string) {
    return subscriptionsStore.find((s) => s.company_id === company_id) || null;
  }

  /**
   * Export usage to Stripe for metered billing
   * TODO: Batch fetch usage_records not yet exported, aggregate by company/type, call Stripe API
   */
  async exportUsageToStripe(params: ExportUsageParams) {
    const pending = usageRecordsStore.filter(
      (r) => !r.exported_to_stripe && r.recorded_at >= params.start && r.recorded_at <= params.end
    );

    const live = params.confirm === true && params.liveEnv === "true";

    if (!live) {
      this.audit("usage_export_dry_run", { count: pending.length, dateRange: { start: params.start, end: params.end } });
      return { dryRun: true, count: pending.length };
    }

    const batchId = `batch_${Date.now()}`;
    for (const usage of pending) {
      const subscriptionItemId = `si_placeholder_${usage.company_id}`; // TODO: lookup real item per usage_type

      const result = await this.stripeClient.recordUsage({
        subscriptionItemId,
        quantity: usage.units,
        timestamp: Math.floor(new Date(usage.recorded_at).getTime() / 1000),
        action: "increment",
      });

      usage.exported_to_stripe = true;
      usage.stripe_usage_record_id = result.id;
      usage.export_batch_id = batchId;
    }

    this.audit("usage_exported", { batchId, count: pending.length });
    return { batchId, count: pending.length };
  }

  /**
   * List company invoices from Stripe
   * TODO: Fetch stripe_customer_id from subscriptions table
   */
  async listCompanyInvoices(company_id: string) {
    const sub = subscriptionsStore.find((s) => s.company_id === company_id);
    if (!sub) return [];

    const invoices = await this.stripeClient.listInvoices(sub.stripe_customer_id);
    return invoices;
  }

  async downloadInvoice(company_id: string, invoiceId: string): Promise<DownloadInvoiceResult> {
    const sub = subscriptionsStore.find((s) => s.company_id === company_id);
    if (!sub) throw new Error("subscription not found");
    return this.stripeClient.downloadInvoice(invoiceId);
  }

  /**
   * Create a billing adjustment (manual charge, credit, or refund)
   * TODO: Insert into billing_adjustments table; optionally create Stripe invoice item
   */
  async createAdjustment(params: CreateAdjustmentParams) {
    const adjustment = {
      id: crypto.randomUUID(),
      company_id: params.company_id,
      adjustment_type: params.adjustment_type,
      amount_cents: params.amount_cents,
      currency: params.currency || "USD",
      reason: params.reason,
      created_by: params.created_by,
      created_at: new Date().toISOString(),
    };

    adjustmentsStore.push(adjustment);
    this.audit("adjustment_created", adjustment);

    // TODO: If charge/credit, create Stripe invoice item for next invoice
    return adjustment;
  }

  async issueRefund(company_id: string, paymentIntentId: string, amount_cents?: number) {
    const refund = await this.stripeClient.createRefund({ paymentIntentId, amount_cents });
    await this.createAdjustment({
      company_id,
      adjustment_type: "refund",
      amount_cents: refund.amount,
      currency: "USD",
      reason: "Refund issued",
      created_by: "system",
    });
    return refund;
  }

  /**
   * Calculate tax for an invoice line item (placeholder)
   * TODO: Fetch company tax_percent from company settings; calculate tax_cents = line_total_cents * (tax_percent / 100)
   */
  calculateTax(_company_id: string, line_total_cents: number): { tax_cents: number; tax_percent: number } {
    // TODO: SELECT tax_percent FROM companies WHERE id = _company_id
    const tax_percent = 0; // placeholder
    const tax_cents = Math.round((line_total_cents * tax_percent) / 100);
    return { tax_cents, tax_percent };
  }

  private audit(event: string, payload: any) {
    // TODO: Replace with structured audit logger to DB/file
    console.log(`[billing:audit] ${event}`, payload);
  }
}
