-- Company settings, permissions, and master account linking
-- Ensure prerequisite extensions (uuid-ossp or pgcrypto) are enabled.

CREATE TABLE IF NOT EXISTS company_settings (
  company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  retention_media_days INT DEFAULT 365,
  retention_meta_days INT DEFAULT 365,
  suffix_type TEXT DEFAULT 'none', -- none|numeric|alpha
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  geofence_defaults JSONB DEFAULT jsonb_build_object('radius_m', 50, 'strict', false),
  notify_quota_per_day INT DEFAULT 500,
  billing_contact TEXT,
  sso_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_company_settings_timezone ON company_settings(timezone);

CREATE TABLE IF NOT EXISTS permissions (
  name TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT NOT NULL,
  permission_name TEXT NOT NULL REFERENCES permissions(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_name)
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

CREATE TABLE IF NOT EXISTS master_accounts_companies (
  master_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(master_user_id, company_id)
);
CREATE INDEX IF NOT EXISTS idx_mac_company ON master_accounts_companies(company_id);

-- Seed core permissions (idempotent)
INSERT INTO permissions(name, description) VALUES
  ('job.add', 'Create jobs'),
  ('job.assign', 'Assign workers to jobs'),
  ('job.approve', 'Approve submitted work'),
  ('workforce.manage', 'Manage workforce members and roles'),
  ('finance.view', 'View payouts and invoices'),
  ('settings.edit', 'Modify company settings'),
  ('settings.view', 'View company settings'),
  ('retention.preview', 'Preview retention sweeps'),
  ('retention.execute', 'Run retention sweeps'),
  ('switch.company', 'Switch company contexts')
ON CONFLICT (name) DO NOTHING;
