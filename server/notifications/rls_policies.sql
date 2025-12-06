-- RLS policies (company-scoped) for notifications
-- Apply in Supabase/PG after enabling row level security on tables.

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_company_isolation ON notifications
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY notification_templates_company_isolation ON notification_templates
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY notification_attempts_company_isolation ON notification_attempts
  USING (
    notification_id IN (SELECT id FROM notifications WHERE company_id = current_setting('app.current_company_id')::uuid)
  );
