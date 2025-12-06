// Stripe Connect wrapper (server-side only)
// Expected env: STRIPE_SECRET_KEY, STRIPE_CONNECT_CLIENT_ID
// TODO: load secrets from secure manager (not bundled to client). Use official Stripe SDK with retries and idempotency keys.

type Money = { amount_cents: number; currency: string };

type PaymentIntentParams = {
  company_id: string;
  metadata?: Record<string, string>;
} & Money;

type PayoutParams = {
  company_id: string;
  contractor_id: string;
  metadata?: Record<string, string>;
} & Money;

type WebhookValidationResult = { valid: boolean; reason?: string };

export class StripeConnectClient {
  // TODO: accept a real Stripe client instance via constructor
  constructor(_opts: { apiKey?: string; webhookSecret?: string } = {}) {}

  async createPaymentIntent(params: PaymentIntentParams) {
    this.ensureServerSide();
    // TODO: call stripe.paymentIntents.create with amount in cents and capture method
    return {
      provider: "stripe",
      client_secret: "pi_client_secret_placeholder",
      provider_payment_id: "pi_placeholder",
      amount_cents: params.amount_cents,
      currency: params.currency,
      metadata: params.metadata || {},
      dryRun: true,
    };
  }

  async confirmPayment(providerPaymentId: string) {
    this.ensureServerSide();
    // TODO: stripe.paymentIntents.confirm(providerPaymentId)
    return { provider_payment_id: providerPaymentId, status: "succeeded", dryRun: true };
  }

  async createTransfer(_params: PayoutParams, opts: { dryRun: boolean; confirm: boolean }) {
    this.ensureServerSide();
    if (opts.dryRun || !opts.confirm) {
      return { simulated: true, provider_payout_id: "tr_simulated", status: "dry-run" };
    }
    // TODO: stripe.transfers.create or payouts.create depending on flow
    return { provider_payout_id: "tr_real_placeholder", status: "initiated" };
  }

  async createPayout(params: PayoutParams, opts: { dryRun: boolean; confirm: boolean }) {
    return this.createTransfer(params, opts);
  }

  async refund(paymentIntentId: string, amount_cents: number, reason?: string) {
    this.ensureServerSide();
    // TODO: stripe.refunds.create({ payment_intent: paymentIntentId, amount })
    return { provider_payment_id: paymentIntentId, amount_cents, status: "refund_initiated", reason };
  }

  verifyWebhookSignature(_rawBody: string, sigHeader: string): WebhookValidationResult {
    // TODO: use stripe.webhooks.constructEvent with webhook secret
    if (!sigHeader) return { valid: false, reason: "missing signature" };
    return { valid: true };
  }

  private ensureServerSide() {
    if (typeof window !== "undefined") {
      throw new Error("Do not load Stripe secrets client-side");
    }
  }
}
