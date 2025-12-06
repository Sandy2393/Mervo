import { PaymentsService } from "../paymentsService";

// HTTP/Edge handler entrypoint for payment webhooks (e.g., Stripe)
// Expected env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// TODO: wire to framework runtime (Express/Fastify/Next API route/Supabase Edge Function)

const paymentsService = new PaymentsService();

export async function handlePaymentWebhook(req: { headers: Record<string, string>; body: any }) {
  const provider = "stripe"; // extend for other providers
  const sig = req.headers["stripe-signature"] || "";
  const payload = req.body;

  // Store and validate, then process
  await paymentsService.handleProviderWebhook(provider, payload, sig);

  return { statusCode: 200, body: { ok: true } };
}
