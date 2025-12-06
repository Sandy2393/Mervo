/**
 * Stripe Webhook Handler for billing events
 * Expected env: STRIPE_WEBHOOK_SECRET
 * TODO: Wire to HTTP framework (Express/Fastify/Next.js API route/Supabase Edge Function)
 * TODO: Ensure raw body is passed for signature verification
 */

import { StripeClient } from "../stripeClient";

// In-memory store (replace with DB)
const webhooksStore: any[] = [];
const subscriptionsStore: any[] = [];

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export class StripeWebhookHandler {
  constructor(private stripeClient = new StripeClient()) {}

  /**
   * Handle incoming Stripe webhook
   * Verify signature, persist event, process key event types
   */
  async handleWebhook(rawBody: string, signature: string): Promise<{ ok: boolean; eventId?: string; error?: string }> {
    // 1. Verify signature
    const validation = this.stripeClient.verifyWebhookSignature(rawBody, signature);
    if (!validation.valid) {
      return { ok: false, error: `Invalid webhook signature: ${validation.reason}` };
    }

    // 2. Parse event
    const event: StripeWebhookEvent = JSON.parse(rawBody);

    // 3. Check for duplicate (idempotency)
    const existing = webhooksStore.find((w) => w.event_id === event.id);
    if (existing) {
      return { ok: true, eventId: event.id }; // Already processed
    }

    // 4. Persist event
    const webhookRecord = {
      id: crypto.randomUUID(),
      provider: "stripe",
      event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
      received_at: new Date().toISOString(),
    };

    webhooksStore.push(webhookRecord);

    // 5. Process event
    try {
      await this.processEvent(event);
      webhookRecord.processed = true;
      (webhookRecord as any).processed_at = new Date().toISOString();
    } catch (err: any) {
      (webhookRecord as any).error = err.message;
      console.error(`[webhook] Error processing event ${event.id}:`, err);
    }

    return { ok: true, eventId: event.id };
  }

  /**
   * Process specific event types
   * TODO: Extend with more event handlers as needed
   */
  private async processEvent(event: StripeWebhookEvent) {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await this.handleInvoicePaymentSucceeded(event);
        break;

      case "invoice.payment_failed":
        await this.handleInvoicePaymentFailed(event);
        break;

      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event);
        break;

      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event);
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event);
        break;

      case "charge.refunded":
        await this.handleChargeRefunded(event);
        break;

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle invoice.payment_succeeded
   * TODO: Update subscription status, send receipt email
   */
  private async handleInvoicePaymentSucceeded(event: StripeWebhookEvent) {
    const invoice = event.data.object;
    console.log(`[webhook] Invoice paid: ${invoice.id}, customer: ${invoice.customer}`);

    // TODO: Fetch subscription by stripe_customer_id, update status to 'active'
    // TODO: Trigger receipt email notification
    this.audit("invoice_payment_succeeded", { invoiceId: invoice.id, customerId: invoice.customer });
  }

  /**
   * Handle invoice.payment_failed
   * TODO: Update subscription status to 'past_due', send payment failure notification
   */
  private async handleInvoicePaymentFailed(event: StripeWebhookEvent) {
    const invoice = event.data.object;
    console.log(`[webhook] Invoice payment failed: ${invoice.id}, customer: ${invoice.customer}`);

    // TODO: UPDATE subscriptions SET status = 'past_due' WHERE stripe_customer_id = invoice.customer
    // TODO: Send payment failure email/notification
    this.audit("invoice_payment_failed", { invoiceId: invoice.id, customerId: invoice.customer });
  }

  /**
   * Handle checkout.session.completed
   * TODO: Create subscription record if new signup; send welcome email
   */
  private async handleCheckoutSessionCompleted(event: StripeWebhookEvent) {
    const session = event.data.object;
    console.log(`[webhook] Checkout session completed: ${session.id}, subscription: ${session.subscription}`);

    // TODO: Fetch company_id from session.metadata
    // TODO: INSERT INTO subscriptions (company_id, stripe_subscription_id, stripe_customer_id, tier, status, ...)
    // TODO: Send onboarding/welcome email
    this.audit("checkout_session_completed", { sessionId: session.id, subscriptionId: session.subscription });
  }

  /**
   * Handle customer.subscription.updated
   * TODO: Sync subscription status, tier, period dates to DB
   */
  private async handleSubscriptionUpdated(event: StripeWebhookEvent) {
    const subscription = event.data.object;
    console.log(`[webhook] Subscription updated: ${subscription.id}, status: ${subscription.status}`);

    // TODO: UPDATE subscriptions SET status = subscription.status, current_period_end = subscription.current_period_end, ...
    this.audit("subscription_updated", { subscriptionId: subscription.id, status: subscription.status });
  }

  /**
   * Handle customer.subscription.deleted
   * TODO: Mark subscription as canceled
   */
  private async handleSubscriptionDeleted(event: StripeWebhookEvent) {
    const subscription = event.data.object;
    console.log(`[webhook] Subscription deleted: ${subscription.id}`);

    // TODO: UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE stripe_subscription_id = subscription.id
    this.audit("subscription_deleted", { subscriptionId: subscription.id });
  }

  /**
   * Handle charge.refunded
   * TODO: Record refund in billing_adjustments
   */
  private async handleChargeRefunded(event: StripeWebhookEvent) {
    const charge = event.data.object;
    console.log(`[webhook] Charge refunded: ${charge.id}, amount: ${charge.amount_refunded}`);

    // TODO: INSERT INTO billing_adjustments (adjustment_type='refund', amount_cents=charge.amount_refunded, ...)
    this.audit("charge_refunded", { chargeId: charge.id, amountRefunded: charge.amount_refunded });
  }

  private audit(event: string, payload: any) {
    // TODO: Replace with structured audit logger
    console.log(`[billing:webhook:audit] ${event}`, payload);
  }
}

/**
 * HTTP handler entrypoint for Stripe webhooks
 * TODO: Wire to framework runtime (Express/Next.js/Edge Function)
 */
export async function handleStripeWebhook(req: { headers: Record<string, string>; body: string }) {
  const signature = req.headers["stripe-signature"] || "";
  const rawBody = req.body;

  const handler = new StripeWebhookHandler();
  const result = await handler.handleWebhook(rawBody, signature);

  return {
    statusCode: result.ok ? 200 : 400,
    body: result,
  };
}
