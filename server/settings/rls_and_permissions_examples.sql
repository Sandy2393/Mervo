-- Example RLS and permission guard patterns. Adapt for Supabase/Postgres.

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_accounts_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Allow company members to read their settings
CREATE POLICY company_settings_select ON company_settings
FOR SELECT USING (company_id = auth.uid());

-- Only admins/managers can update settings (replace role check with your membership lookup)
CREATE POLICY company_settings_update ON company_settings
FOR UPDATE USING (
  company_id = auth.uid() AND EXISTS (
    SELECT 1 FROM company_users cu WHERE cu.user_id = auth.uid() AND cu.company_id = company_settings.company_id AND cu.role IN ('owner','admin')
  )
);

-- Master account link policies: only allow owners to link
CREATE POLICY mac_select ON master_accounts_companies
FOR SELECT USING (master_user_id = auth.uid());
CREATE POLICY mac_insert ON master_accounts_companies
FOR INSERT WITH CHECK (master_user_id = auth.uid());
CREATE POLICY mac_delete ON master_accounts_companies
FOR DELETE USING (master_user_id = auth.uid());

-- Permission matrix authoring: restrict to admins
CREATE POLICY role_permissions_admin ON role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid() AND cu.role IN ('owner','admin')
  )
);

-- Recommended view helper to resolve effective permissions
-- CREATE VIEW effective_permissions AS
-- SELECT cu.user_id, cu.company_id, rp.permission_name
-- FROM company_users cu
-- JOIN role_permissions rp ON rp.role = cu.role;
