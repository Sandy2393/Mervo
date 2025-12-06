# Finance & Billing — Operational Guide

This document explains how to set up server-side billing and invoicing integrations and the expected database structure.

Important: never store or embed provider secrets in client-side code. Use server-only environment variables and run billing logic using an admin client (SUPABASE_SERVICE_ROLE_KEY).

## Environment variables (server-only)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key with permission to bypass RLS for admin operations.
- `PAYMENT_PROVIDER_SECRET` — Your payment provider (Stripe/PayPal) secret used to verify webhooks and perform payouts.

## Database: invoices table (TODO: create via Supabase SQL Editor)
Run this SQL snippet in Supabase SQL editor to create an `invoices` table. This is just a suggested schema — adapt to your needs.

```sql
-- TODO: Review fields and add indexes/constraints per your data model
create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  invoice_number text not null,
  period_start timestamptz,
  period_end timestamptz,
  line_items jsonb not null,
  subtotal_cents int not null,
  tax_cents int not null,
  total_cents int not null,
  currency text default 'AUD',
  payment_history jsonb default '[]',
  status text default 'issued',
  created_at timestamptz default now()
);
```

## Webhooks
- Deploy `server/functions/webhooks/paymentWebhook.ts` as an edge function or serverless endpoint.
- Verify webhooks using provider SDKs (e.g., Stripe) and validate signatures using `PAYMENT_PROVIDER_SECRET`.
- Use `SUPABASE_SERVICE_ROLE_KEY` on the server to write to `audit_logs`, update invoices, and adjust payouts.

## Bulk payouts
- Implement bulk payouts with Stripe Connect or another provider on the server with proper idempotency and error handling.
- Payouts must be recorded to the DB and reconciled with invoice payment_history.

## GDPR & Tax retention
- Respect `companies.retention_days` for retention policies — older invoices may be archived or deleted as appropriate.
- Store minimal PII and redact sensitive payment details once compliance window allows.
- Consider keeping an export/audit trail for tax and accounting purposes outside the primary DB (e.g., secure blob storage).

## Notes & TODOs
- Move heavy aggregations and sensitive operations (payouts, invoice creation, signature verification) to server-side functions.
- Add scheduled jobs or cron to run monthly invoice generation and payroll exports.
