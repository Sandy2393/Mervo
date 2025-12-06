-- Stripe SaaS Billing Tables
-- Purpose: manage subscriptions, metered usage, and billing adjustments for companies

-- Subscriptions table: tracks active Stripe subscriptions per company
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'business', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Usage records: metered usage for photos, storage, API calls, contractor minutes
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('photo_bytes', 'storage_bytes', 'api_calls', 'contractor_minutes')),
  units BIGINT NOT NULL CHECK (units >= 0),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exported_to_stripe BOOLEAN DEFAULT FALSE,
  stripe_usage_record_id TEXT,
  export_batch_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_records_company ON usage_records(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_type ON usage_records(usage_type);
CREATE INDEX IF NOT EXISTS idx_usage_records_exported ON usage_records(exported_to_stripe);
CREATE INDEX IF NOT EXISTS idx_usage_records_recorded_at ON usage_records(recorded_at);

-- Billing adjustments: manual charges, credits, refunds applied by admins
CREATE TABLE IF NOT EXISTS billing_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('charge', 'credit', 'refund')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reason TEXT NOT NULL,
  stripe_invoice_item_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_billing_adjustments_company ON billing_adjustments(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_adjustments_type ON billing_adjustments(adjustment_type);

-- Billing webhooks: store raw Stripe webhook events for idempotent processing
CREATE TABLE IF NOT EXISTS billing_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'stripe',
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_billing_webhooks_event_id ON billing_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_billing_webhooks_processed ON billing_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_billing_webhooks_type ON billing_webhooks(event_type);

-- RLS policies for subscriptions (company admins can view their own)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view subscriptions"
  ON subscriptions FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- RLS for usage_records (company admins can view)
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view usage records"
  ON usage_records FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- RLS for billing_adjustments (company admins can view)
ALTER TABLE billing_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view billing adjustments"
  ON billing_adjustments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Active Stripe subscriptions for companies';
COMMENT ON TABLE usage_records IS 'Metered usage records for billing (photos, storage, API calls, contractor time)';
COMMENT ON TABLE billing_adjustments IS 'Manual billing adjustments (charges, credits, refunds) applied by admins';
COMMENT ON TABLE billing_webhooks IS 'Raw Stripe webhook events for idempotent processing';
