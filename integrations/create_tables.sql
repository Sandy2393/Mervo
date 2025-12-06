-- Connector and webhook tables
-- TODO: apply RLS per company_id and secure service-role access for writes

create table if not exists connectors (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  owner_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists company_connectors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  connector_id uuid references connectors(id),
  config jsonb,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_connector_id uuid references company_connectors(id),
  event_types jsonb not null,
  url text not null,
  secret_hmac text, -- TODO: store encrypted via KMS/Secret Manager
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references webhook_subscriptions(id),
  payload jsonb,
  attempt_count int default 0,
  next_attempt timestamptz,
  last_response text,
  status text default 'pending', -- pending|delivered|dead-letter
  created_at timestamptz default now()
);
