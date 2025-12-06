import { StripeConnectClient } from "./stripeConnectClient";
import { promises as fs } from "fs";
import path from "path";

// TODO: replace in-memory stores with real DB calls (Supabase/Postgres)
const paymentsTable: any[] = [];
const webhooksTable: any[] = [];

export type PaymentStatus = "pending" | "requires_action" | "succeeded" | "refunded" | "failed";

type CreatePaymentInput = {
  company_id: string;
  amount_cents: number;
  currency: string;
  metadata?: Record<string, string>;
};

type WebhookPayload = {
  id: string;
  type: string;
  data: any;
  created: number;
};

type RefundReason = "requested_by_customer" | "duplicate" | "fraudulent" | string;

export class PaymentsService {
  constructor(private stripeClient = new StripeConnectClient()) {}

  async createPaymentIntent(input: CreatePaymentInput) {
    const intent = await this.stripeClient.createPaymentIntent({
      company_id: input.company_id,
      amount_cents: input.amount_cents,
      currency: input.currency,
      metadata: input.metadata,
    });

    this.audit("payment_intent_created", intent);

    paymentsTable.push({
      id: intent.provider_payment_id,
      company_id: input.company_id,
      amount_cents: input.amount_cents,
      currency: input.currency,
      provider: "stripe",
      provider_payment_id: intent.provider_payment_id,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return intent;
  }

  async handleProviderWebhook(provider: string, payload: WebhookPayload, sigHeader?: string) {
    if (provider === "stripe") {
      const validation = this.stripeClient.verifyWebhookSignature(JSON.stringify(payload), sigHeader || "");
      if (!validation.valid) throw new Error(`Invalid webhook signature: ${validation.reason}`);
    }

    await this.recordPaymentEvent({ provider, payload });

    // TODO: extend mapping for more event types
    if (payload.type === "payment_intent.succeeded") {
      await this.markPaymentSettled(payload.data.object.id, payload.data.object.id);
    }

    return { ok: true };
  }

  async recordPaymentEvent(rawEvent: { provider: string; payload: any }) {
    const stored = {
      id: crypto.randomUUID(),
      provider: rawEvent.provider,
      provider_event_id: rawEvent.payload.id,
      payload: rawEvent.payload,
      received_at: new Date().toISOString(),
    };

    webhooksTable.push(stored);
    await this.persistWebhookEvent(stored);
    this.audit("payment_webhook_recorded", stored);
  }

  private async persistWebhookEvent(event: any) {
    try {
      const dir = path.join(process.cwd(), "data");
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, "webhooks.log");
      const line = `${JSON.stringify(event)}\n`;
      await fs.appendFile(file, line, "utf8");
    } catch (err) {
      this.audit("payment_webhook_persist_failed", { error: err instanceof Error ? err.message : err });
    }
  }

  async markPaymentSettled(paymentId: string, providerPaymentId: string) {
    const record = paymentsTable.find((p) => p.provider_payment_id === providerPaymentId || p.id === paymentId);
    if (!record) throw new Error("payment not found");
    record.status = "succeeded" satisfies PaymentStatus;
    record.provider_payment_id = providerPaymentId;
    this.audit("payment_settled", { paymentId, providerPaymentId });
    return record;
  }

  async refundPayment(paymentId: string, amount_cents: number, reason?: RefundReason) {
    const record = paymentsTable.find((p) => p.id === paymentId);
    if (!record) throw new Error("payment not found");

    const res = await this.stripeClient.refund(record.provider_payment_id, amount_cents, reason);
    record.status = "refunded" satisfies PaymentStatus;
    this.audit("payment_refund_initiated", { paymentId, amount_cents, reason, providerRes: res });
    return res;
  }

  private audit(event: string, payload: any) {
    // TODO: replace console with structured audit logger writing to DB/file
    console.log(`[payments:audit] ${event}`, payload);
  }
}
