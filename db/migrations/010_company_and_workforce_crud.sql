-- Companies and workforce CRUD (Phase 2A)
-- NOTE: run with appropriate migration tooling; ensure existing tables are compatible before applying.

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Users (master identity)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  master_alias TEXT UNIQUE,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company-scoped user membership
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_alias TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','manager','employee','contractor','viewer')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, company_alias),
  UNIQUE(company_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(role);

-- Invites
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_invites_company ON invites(company_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

-- Invite tokens (opaque tokens for acceptance)
CREATE TABLE IF NOT EXISTS invite_tokens (
  token TEXT PRIMARY KEY,
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  consumed_at TIMESTAMPTZ
);

-- Audit log for workforce actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  action TEXT NOT NULL,
  target JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Sample RLS (enable and adapt in production)
-- ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "company isolation" ON company_users
--   FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
-- CREATE POLICY "company isolation" ON company_users
--   FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);

-- ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "company invites" ON invites
--   FOR ALL USING (company_id = current_setting('app.company_id')::uuid);

-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "company audit" ON audit_logs
--   FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
