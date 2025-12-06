-- Demo Seed Data for Mervo
-- NOTE: Use only in non-production environments. Replace placeholders before use.
-- TODO: Ensure required tables exist (see supabase_schema.sql and supabase_schema_addons.sql for contractor_ratings)
-- TODO: For Supabase Auth users, create users via Supabase Auth import or dashboard; this script only inserts profile/related rows.

-- Deterministic UUIDs for easier testing
-- Companies
INSERT INTO companies (id, name, domain, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'DemoCo Pty Ltd', 'democo.local', now()),
  ('00000000-0000-0000-0000-000000000002', 'FieldOps Test Ltd', 'fieldops.local', now())
ON CONFLICT (id) DO NOTHING;

-- Users (profile rows only; auth users must be created separately)
INSERT INTO users (id, email, full_name, phone, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'owner@democo.local', 'Demo Owner', '+61000000001', now()),
  ('22222222-2222-2222-2222-222222222222', 'manager@democo.local', 'Demo Manager', '+61000000002', now()),
  ('33333333-3333-3333-3333-333333333333', 'contractor@democo.local', 'Demo Contractor', '+61000000003', now()),
  ('44444444-4444-4444-4444-444444444444', 'owner@fieldops.local', 'FieldOps Owner', '+61000000004', now())
ON CONFLICT (id) DO NOTHING;

-- Company Users (roles/permissions)
INSERT INTO company_users (company_id, user_id, role_level, permissions, company_alias)
VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 100, '{"jobs":"edit","billing":"edit"}', 'democo-owner'),
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 80, '{"jobs":"edit"}', 'democo-manager'),
  ('00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 20, '{"jobs":"view"}', 'democo-contractor'),
  ('00000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 100, '{"jobs":"edit","billing":"edit"}', 'fieldops-owner')
ON CONFLICT DO NOTHING;

-- Jobs
INSERT INTO jobs (id, company_id, job_name, description, priority, status, publish, created_by, created_at)
VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '00000000-0000-0000-0000-000000000001', 'Site Inspection - Warehouse', 'Inspect safety equipment and exits', 'high', 'open', true, '11111111-1111-1111-1111-111111111111', now()),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '00000000-0000-0000-0000-000000000001', 'Cleaning - Office L3', 'Deep clean of level 3 offices', 'medium', 'open', true, '22222222-2222-2222-2222-222222222222', now()),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '00000000-0000-0000-0000-000000000002', 'HVAC Maintenance', 'Quarterly HVAC check', 'medium', 'open', true, '44444444-4444-4444-4444-444444444444', now())
ON CONFLICT (id) DO NOTHING;

-- Job Instances
INSERT INTO job_instances (id, company_id, job_id, assigned_to, status, scheduled_for, created_at)
VALUES
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '00000000-0000-0000-0000-000000000001', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '33333333-3333-3333-3333-333333333333', 'assigned', now() + interval '1 day', now()),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '00000000-0000-0000-0000-000000000001', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '33333333-3333-3333-3333-333333333333', 'scheduled', now() + interval '2 days', now()),
  ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '00000000-0000-0000-0000-000000000002', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '44444444-4444-4444-4444-444444444444', 'scheduled', now() + interval '3 days', now())
ON CONFLICT (id) DO NOTHING;

-- Timesheets (simple demo rows)
INSERT INTO timesheets (id, user_id, company_id, job_instance_id, clock_in, clock_out, created_at)
VALUES
  ('ccccccc1-cccc-cccc-cccc-ccccccccccc1', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', now() - interval '2 hours', now() - interval '1 hour', now())
ON CONFLICT (id) DO NOTHING;

-- Contractor Ratings (requires contractor_ratings table from supabase_schema_addons.sql)
INSERT INTO contractor_ratings (id, company_id, contractor_id, rating, comment, created_at)
VALUES
  ('ddddddd1-dddd-dddd-dddd-ddddddddddd1', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 5, 'Excellent work, on time and thorough', now())
ON CONFLICT (id) DO NOTHING;

-- Job Photos placeholder (if table exists)
-- TODO: Ensure job_photos table exists; upload files to storage and insert URLs below
-- INSERT INTO job_photos (id, job_instance_id, url, uploaded_by, created_at)
-- VALUES ('eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'https://storage.example.com/demo/photo1.jpg', '33333333-3333-3333-3333-333333333333', now());

-- Notes:
-- 1) After inserting users here, create matching Supabase Auth users and link IDs.
-- 2) Replace placeholders before production use.
