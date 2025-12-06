-- Migration 013: Billing and Subscription Tables
-- Created: 2025-12-06
-- Description: Adds tables for tiered billing, usage tracking, invoicing, and coupons

-- Company Plans Table
-- Tracks which tier each company is subscribed to
CREATE TABLE IF NOT EXISTS company_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_tier VARCHAR(50) NOT NULL CHECK (plan_tier IN ('starter', 'professional', 'enterprise', 'custom')),
  monthly_cost DECIMAL(10, 2) NOT NULL CHECK (monthly_cost >= 0),
  active_from TIMESTAMP NOT NULL DEFAULT NOW(),
  active_to TIMESTAMP NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, active_from)
);

CREATE INDEX idx_company_plans_company_id ON company_plans(company_id);
CREATE INDEX idx_company_plans_status ON company_plans(status);
CREATE INDEX idx_company_plans_active ON company_plans(company_id, status) WHERE status = 'active';

-- Company Usage Snapshots Table
-- Daily snapshots of resource usage for billing and analytics
CREATE TABLE IF NOT EXISTS company_usage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  storage_gb DECIMAL(10, 3) NOT NULL DEFAULT 0 CHECK (storage_gb >= 0),
  api_calls_count INTEGER NOT NULL DEFAULT 0 CHECK (api_calls_count >= 0),
  contractors_active INTEGER NOT NULL DEFAULT 0 CHECK (contractors_active >= 0),
  concurrent_connections INTEGER NOT NULL DEFAULT 0 CHECK (concurrent_connections >= 0),
  data_exported_gb DECIMAL(10, 3) NOT NULL DEFAULT 0 CHECK (data_exported_gb >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, snapshot_date)
);

CREATE INDEX idx_usage_snapshots_company_date ON company_usage_snapshots(company_id, snapshot_date DESC);
CREATE INDEX idx_usage_snapshots_date ON company_usage_snapshots(snapshot_date);

-- Company Coupons Table
-- Tracks discount codes applied to companies
CREATE TABLE IF NOT EXISTS company_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  coupon_code VARCHAR(50) NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'trial_days')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
  recurring BOOLEAN NOT NULL DEFAULT false,
  applied_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used', 'suspended')),
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_coupons_company ON company_coupons(company_id);
CREATE INDEX idx_company_coupons_code ON company_coupons(coupon_code);
CREATE INDEX idx_company_coupons_status ON company_coupons(status);

-- Coupon Definitions Table (Master list of all available coupons)
CREATE TABLE IF NOT EXISTS coupon_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'trial_days')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
  recurring BOOLEAN NOT NULL DEFAULT false,
  active_from TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  usage_limit INTEGER NULL CHECK (usage_limit > 0),
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupon_definitions_code ON coupon_definitions(coupon_code);
CREATE INDEX idx_coupon_definitions_status ON coupon_definitions(status);

-- Invoices Table
-- Monthly invoices for each company
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (base_cost >= 0),
  storage_overage_gb DECIMAL(10, 3) NOT NULL DEFAULT 0 CHECK (storage_overage_gb >= 0),
  storage_overage_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (storage_overage_cost >= 0),
  api_overage_calls INTEGER NOT NULL DEFAULT 0 CHECK (api_overage_calls >= 0),
  api_overage_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (api_overage_cost >= 0),
  contractor_overage_count INTEGER NOT NULL DEFAULT 0 CHECK (contractor_overage_count >= 0),
  contractor_overage_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (contractor_overage_cost >= 0),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  coupon_discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (coupon_discount >= 0),
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_due DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_due >= 0),
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date TIMESTAMP NULL,
  stripe_invoice_id VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);

-- Stripe Subscriptions Table
-- Syncs with Stripe subscription data
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  plan_tier VARCHAR(50) NOT NULL CHECK (plan_tier IN ('starter', 'professional', 'enterprise', 'custom')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'suspended', 'past_due', 'trialing')),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  last_sync TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id)
);

CREATE INDEX idx_stripe_subscriptions_company ON stripe_subscriptions(company_id);
CREATE INDEX idx_stripe_subscriptions_stripe_customer ON stripe_subscriptions(stripe_customer_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe_subscriptions(status);

-- Payment History Table (audit trail)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'stripe',
  stripe_payment_intent_id VARCHAR(255) NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  failure_reason TEXT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_history_invoice ON payment_history(invoice_id);
CREATE INDEX idx_payment_history_company ON payment_history(company_id);
CREATE INDEX idx_payment_history_status ON payment_history(status);

-- Billing Events Table (audit log for all billing actions)
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  triggered_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_billing_events_company ON billing_events(company_id);
CREATE INDEX idx_billing_events_type ON billing_events(event_type);
CREATE INDEX idx_billing_events_created ON billing_events(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_plans_updated_at BEFORE UPDATE ON company_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_coupons_updated_at BEFORE UPDATE ON company_coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupon_definitions_updated_at BEFORE UPDATE ON coupon_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE company_plans IS 'Tracks which subscription tier each company is on';
COMMENT ON TABLE company_usage_snapshots IS 'Daily snapshots of resource usage for billing calculations';
COMMENT ON TABLE company_coupons IS 'Discount codes applied to specific companies';
COMMENT ON TABLE coupon_definitions IS 'Master list of all available coupon codes';
COMMENT ON TABLE invoices IS 'Monthly invoices generated for each company';
COMMENT ON TABLE stripe_subscriptions IS 'Sync table for Stripe subscription data';
COMMENT ON TABLE payment_history IS 'Audit trail of all payment attempts';
COMMENT ON TABLE billing_events IS 'Audit log for billing-related events';
