-- Payments & payouts schema (apply via migration tool or Supabase SQL Editor)
-- TODO: review constraints with DBA and apply migrations in staging before prod

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  job_instance_id uuid,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null,
  provider text not null,
  provider_payment_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  contractor_id uuid not null,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null,
  status text not null default 'scheduled',
  scheduled_at timestamptz,
  processed_at timestamptz,
  provider_payout_id text,
  batch_id uuid,
  created_at timestamptz not null default now(),
  constraint fk_batch foreign key (batch_id) references payout_batches(id)
);

create table if not exists payout_batches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  batch_date date not null,
  total_cents bigint not null default 0 check (total_cents >= 0),
  status text not null default 'draft',
  created_by uuid not null,
  approved_at timestamptz,
  processed_at timestamptz
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  invoice_number text not null,
  period_start date not null,
  period_end date not null,
  line_items jsonb not null default '[]'::jsonb,
  total_cents bigint not null check (total_cents >= 0),
  tax_cents bigint not null default 0 check (tax_cents >= 0),
  issued_at timestamptz,
  paid_at timestamptz,
  status text not null default 'draft'
);

create table if not exists payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id),
  provider_dispute_id text not null,
  status text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  created_at timestamptz not null default now(),
  resolution_notes text
);

-- Indexes
create index if not exists idx_payments_company_created on payments(company_id, created_at);
create index if not exists idx_payouts_company_status on payouts(company_id, status);
create index if not exists idx_payout_batches_company_date on payout_batches(company_id, batch_date);
create index if not exists idx_invoices_company_issued on invoices(company_id, issued_at);
create index if not exists idx_payment_webhooks_provider_event on payment_webhooks(provider, provider_event_id);
create index if not exists idx_disputes_status on disputes(status);

-- TODO: add foreign key from payments.job_instance_id to jobs table when available
-- TODO: add unique constraint on invoices(invoice_number) per company
-- TODO: run this migration via proper tooling and capture in repo
