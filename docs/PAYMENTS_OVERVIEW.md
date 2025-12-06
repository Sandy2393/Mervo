# Payments Overview

## Purpose
Outline how Mervo handles incoming payments, payouts, invoices, reconciliation, and tax placeholders using Stripe Connect.

## Flows
- Incoming payments: company -> platform via PaymentIntent; store cents integers; audit all events.
- Payouts: platform -> contractors via Connect; batches require approval; dry-run by default; confirm for live.
- Invoices: generated per company/period; exported CSV/PDF placeholder; tax calculated as percent.
- Reconciliation: match settled payments to job approvals; report unmatched, partials, over/under.
- Webhooks: store raw payloads in `payment_webhooks` before processing.

## Environment (server-side)
- STRIPE_SECRET_KEY (secret manager)
- STRIPE_CONNECT_CLIENT_ID
- STRIPE_WEBHOOK_SECRET
- PAYER_FEE_PERCENT (optional)
- PLATFORM_FEE_CENTS (optional)

## Safety
- No secrets client-side.
- Money-moving actions require `confirm=true` and `dryRun=false`.
- Audit every DB write; keep webhook payloads.
