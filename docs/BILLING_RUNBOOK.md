# Billing Runbook

Operators: this runbook documents how to run billing safely in dry-run and live modes, handle invoices, reconcile, and respond to incidents.

## Environments & Secrets
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` (frontend), price IDs per plan.
- Billing export: `LIVE=true` gate plus `--confirm` flag to execute real exports.
- Storage/DB: Supabase connection for invoices/usage tables; ensure migrations applied (`payments/sql/002_stripe_billing_migrations.sql`).
- Logs: audit logs written via console placeholders; pipe to centralized logging in production.

## Usage Export to Stripe (metered)
1) Dry-run (default):
   ```
   LIVE=false node scripts/export_usage_to_stripe.ts --start=YYYY-MM-DD --end=YYYY-MM-DD
   ```
   Shows counts only, no Stripe writes.
2) Live export (requires BOTH gates):
   ```
   LIVE=true node scripts/export_usage_to_stripe.ts --start=YYYY-MM-DD --end=YYYY-MM-DD --confirm
   ```
   - `BillingService.exportUsageToStripe` requires `confirm=true` AND `liveEnv="true"` or it will dry-run.
   - Validate counts before running live.
3) Post-run: note `batchId` from logs; store in runbook record for audits.

## Webhooks
- Endpoint: `server/payments/webhooks/handler.ts` via `PaymentsService.handleProviderWebhook`.
- Signature verification: uses `STRIPE_WEBHOOK_SECRET`; rejects missing/invalid signatures.
- Persistence: `PaymentsService.recordPaymentEvent` currently writes to in-memory store; replace with DB insert into `billing_webhooks` table for production.
- Sample payload: `docs/stripe_webhook_sample.json`.

## Invoices & Adjustments
- Client-facing invoices use Supabase (`src/services/billingService.ts`). For sensitive changes (mark paid, adjustments), move to server RPC with service-role key.
- Manual adjustments (charges/credits) are triggered via `ChargeModal` hitting `/api/billing/adjustments` (implement server route to call `BillingService.createAdjustment`).
- Download invoice: server helper `BillingService.downloadInvoice(company_id, invoiceId)` delegates to Stripe.

## Plans & Prices
- Plan map in `server/billing/billingService.ts` (`PLAN_PRICE_MAP`). Replace placeholder price IDs with real Stripe price IDs for starter/business/enterprise.
- Keep plan IDs in env or config so deployments can vary without code change.

## Reconciliation & Accounting
- Reconciliation placeholder lives in `server/payments/reconciliation.ts`; extend to query real payments/approvals tables.
- Accounting CSV builder in `server/payments/exporters/accountingCsv.ts`; feed with GL-coded rows per finance chart of accounts.

## Incident Response
- Invalid webhook signatures: rotate webhook secret; verify Stripe endpoint URL matches.
- Export failed mid-run: rerun in dry-run to verify counts, then rerun live. Stripe usage records are idempotent per subscription item + timestamp.
- Refunds: use `BillingService.issueRefund(company_id, paymentIntentId, amount_cents?)`; logs adjustment with reason.

## Deploy & Safety
- Keep dry-run defaults for scripts; require explicit `--confirm` + `LIVE=true` to mutate Stripe.
- Ensure CI/CD masks secrets; do not bundle Stripe secret keys client-side.
- Before deploy, verify migrations applied and plan IDs configured.
