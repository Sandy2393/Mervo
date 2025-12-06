-- Example RLS policies for jobs and instances. Adapt to your platform and JWT claim names.

-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY jobs_company_scope ON jobs
--   FOR ALL USING (company_id = current_setting('app.company_id')::uuid)
--   WITH CHECK (company_id = current_setting('app.company_id')::uuid);

-- ALTER TABLE job_instances ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY job_instances_company_scope ON job_instances
--   FOR ALL USING (company_id = current_setting('app.company_id')::uuid)
--   WITH CHECK (company_id = current_setting('app.company_id')::uuid);

-- Contractors only access assigned instances:
-- CREATE POLICY job_instances_assigned ON job_instances
--   FOR SELECT USING (
--     assigned_company_user_id = current_setting('app.company_user_id')::uuid
--   );

-- Reports restricted to company and assignment:
-- ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY job_reports_company_scope ON job_reports
--   FOR ALL USING (job_instance_id IN (SELECT id FROM job_instances WHERE company_id = current_setting('app.company_id')::uuid));
