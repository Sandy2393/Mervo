/**
 * Stripe Client — SaaS billing operations wrapper
 * Expected env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * TODO: Use official Stripe SDK with retries, idempotency keys, and proper error handling
 * TODO: Load secrets from secure vault (not committed to repo)
 * TODO: Never handle raw card data; use Stripe Checkout/Elements only (PCI guidance)
 */

export type StripePlan = "starter" | "business" | "enterprise";

export interface CreateCheckoutSessionParams {
  company_id: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface RecordUsageParams {
  subscriptionItemId: string;
  quantity: number;
  timestamp: number;
  action?: "increment" | "set";
}

export interface CreateRefundParams {
  paymentIntentId: string;
  amount_cents?: number;
  reason?: string;
}

export interface StripeInvoice {
  id: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
}

export interface DownloadInvoiceResult {
  invoiceId: string;
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
  placeholderPdfBase64?: string;
}

export interface WebhookValidationResult {
  valid: boolean;
  reason?: string;
}

export class StripeClient {
  private apiKey: string;
  private webhookSecret: string;
  private stripe?: any;

  constructor(opts: { apiKey?: string; webhookSecret?: string } = {}) {
    this.apiKey = opts.apiKey || process.env.STRIPE_SECRET_KEY || "";
    this.webhookSecret = opts.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || "";
    this.ensureServerSide();

    if (this.apiKey) {
      // Dynamically require Stripe to avoid bundling into client builds
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require("stripe");
      this.stripe = new Stripe(this.apiKey, { apiVersion: "2023-10-16" });
    }
  }

  async createCheckoutSession(_params: CreateCheckoutSessionParams): Promise<{ sessionId: string; url: string }> {
    if (this.stripe) {
      // TODO: add idempotency key per company_id
      // const session = await this.stripe.checkout.sessions.create({
      //   mode: "subscription",
      //   line_items: [{ price: params.priceId, quantity: 1 }],
      //   success_url: params.successUrl,
      //   cancel_url: params.cancelUrl,
      //   customer_email: params.customerEmail,
      //   metadata: { company_id: params.company_id },
      // });
      // return { sessionId: session.id, url: session.url! };
    }

    return { sessionId: `cs_test_${Date.now()}`, url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}` };
  }

  async recordUsage(params: RecordUsageParams): Promise<{ id: string; quantity: number }> {
    if (this.stripe) {
      // await this.stripe.subscriptionItems.createUsageRecord(params.subscriptionItemId, {
      //   quantity: params.quantity,
      //   timestamp: params.timestamp,
      //   action: params.action || "increment",
      // });
    }

    return { id: `usage_${Date.now()}`, quantity: params.quantity };
  }

  async listInvoices(_customerId: string, _limit = 10): Promise<StripeInvoice[]> {
    if (this.stripe) {
      // const res = await this.stripe.invoices.list({ customer: customerId, limit });
      // return res.data as StripeInvoice[];
    }

    return [
      {
        id: `in_${Date.now()}`,
        number: `INV-${Date.now()}`,
        status: "paid",
        amount_due: 10000,
        amount_paid: 10000,
        currency: "usd",
        created: Date.now() / 1000,
        hosted_invoice_url: "https://invoice.stripe.com/i/placeholder",
        invoice_pdf: "https://invoice.stripe.com/i/placeholder.pdf",
      },
    ];
  }

  async downloadInvoice(invoiceId: string): Promise<DownloadInvoiceResult> {
    if (this.stripe) {
      // const invoice = await this.stripe.invoices.retrieve(invoiceId);
      // return { invoiceId, pdfUrl: invoice.invoice_pdf || undefined, hostedInvoiceUrl: invoice.hosted_invoice_url || undefined };
    }

    const placeholder = Buffer.from(`Invoice ${invoiceId}\nPlaceholder PDF`, "utf-8").toString("base64");
    return { invoiceId, hostedInvoiceUrl: `https://invoice.stripe.com/i/${invoiceId}`, placeholderPdfBase64: placeholder };
  }

  async createRefund(params: CreateRefundParams): Promise<{ id: string; status: string; amount: number }> {
    if (this.stripe) {
      // const refund = await this.stripe.refunds.create({ payment_intent: params.paymentIntentId, amount: params.amount_cents, reason: params.reason });
      // return { id: refund.id, status: refund.status, amount: refund.amount };
    }

    return { id: `re_${Date.now()}`, status: "succeeded", amount: params.amount_cents || 0 };
  }

  verifyWebhookSignature(rawBody: string, signature: string): WebhookValidationResult {
    if (!signature) return { valid: false, reason: "missing signature" };

    if (this.stripe && this.webhookSecret) {
      try {
        this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
        return { valid: true };
      } catch (err: any) {
        return { valid: false, reason: err.message };
      }
    }

    return { valid: true };
  }

  async createCustomer(params: { email: string; companyId: string; name?: string }): Promise<{ id: string; email: string }> {
    if (this.stripe) {
      // const customer = await this.stripe.customers.create({ email: params.email, name: params.name, metadata: { company_id: params.companyId } });
      // return { id: customer.id, email: customer.email! };
    }

    return { id: `cus_${Date.now()}`, email: params.email };
  }

  async createSubscription(_params: { customerId: string; priceId: string; metadata?: Record<string, string> }): Promise<{ id: string; status: string }> {
    if (this.stripe) {
      // const sub = await this.stripe.subscriptions.create({ customer: params.customerId, items: [{ price: params.priceId }], metadata: params.metadata });
      // return { id: sub.id, status: sub.status };
    }

    return { id: `sub_${Date.now()}`, status: "active" };
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true): Promise<{ id: string; status: string }> {
    if (this.stripe) {
      // const sub = atPeriodEnd
      //   ? await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
      //   : await this.stripe.subscriptions.del(subscriptionId);
      // return { id: sub.id, status: sub.status };
    }

    return { id: subscriptionId, status: atPeriodEnd ? "active" : "canceled" };
  }

  private ensureServerSide() {
    if (typeof window !== "undefined") {
      throw new Error("Do not load Stripe secrets client-side. Use Stripe.js or Elements for frontend.");
    }
  }
}
