-- Check that expected RLS policies exist for critical tables
-- This script queries pg_policies to verify that policies are in place.

-- Tables to check
\set tables 'companies,users,company_users,jobs,job_instances,timesheets,job_photos,invoices'

-- Loop through expected tables and display policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('companies','users','company_users','jobs','job_instances','timesheets','job_photos','invoices')
ORDER BY tablename, policyname;

-- Interpretation: Each table should have at least one policy that restricts access based on jscontext or auth.uid() checks.
-- If any of the tables above returns zero rows, raise a warning in your CI job and fail the pipeline.

-- Example of CI check (psql):
-- psql "$DATABASE_URL" -c "\i scripts/rls_verify.sql" | tee rls_report.txt
-- then assert output contains expected policy rows per table.
