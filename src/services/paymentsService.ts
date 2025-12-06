/**
 * Payments Service
 * Client wrappers and placeholders for interacting with payment providers (Stripe Connect, PayPal, etc.)
 * NOTE: All provider secrets and signing keys must be kept server-side (SERVICE_ROLE_KEY or equivalent).
 * The methods below are lightweight client wrappers and MUST be implemented server-side in Edge Functions.
 */

import { ServiceResponse, PaymentBatchResult } from '../types';

/**
 * Create a payout batch for a company. This is a placeholder that returns simulated responses.
 * In production, implement server-side using Stripe Connect or equivalent and return batch statuses.
 */
export async function createPayoutBatch(_company_id: string, payouts: { payoutId: string; contractor_alias: string; amount_cents: number; currency?: string }[]): Promise<ServiceResponse<PaymentBatchResult>> {
  // TODO: Implement server-side with provider API and secure keys.
  // We'll return a simulated batch id and success for demonstration.
  const batchId = `batch_${Date.now()}`;
  const results = payouts.map(p => ({ payoutId: p.payoutId, status: 'paid' as const }));

  return { success: true, data: { batchId, results } };
}

/**
 * Verify webhook signature - placeholder
 * Server-side implementations should verify using provider signing secrets
 */
export function verifyWebhookSignature(_headers: Record<string, string>, _body: string): boolean {
  // TODO: Implement signature verification server-side (e.g., Stripe.verifyHeader)
  // Never include provider secrets in client code.
  return true;
}

export const paymentsService = {
  createPayoutBatch,
  verifyWebhookSignature
};
