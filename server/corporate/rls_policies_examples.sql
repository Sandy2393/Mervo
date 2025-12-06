-- Example RLS policies for company-scoped access (adapt to your platform)

-- Expect current_setting('app.company_id') or JWT claim company_id
-- ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY company_users_select ON company_users
--   FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
-- CREATE POLICY company_users_modify ON company_users
--   FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
-- CREATE POLICY company_users_update ON company_users
--   FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid) WITH CHECK (company_id = current_setting('app.company_id')::uuid);

-- Invites RLS
-- ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY invites_policy ON invites
--   FOR ALL USING (company_id = current_setting('app.company_id')::uuid);

-- Audit logs (read-only for company scope)
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY audit_logs_select ON audit_logs
--   FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
