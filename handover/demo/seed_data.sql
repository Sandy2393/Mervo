-- seed_data.sql
-- Demo data for Mervo platform
-- Version 1.0 - December 2025
-- 
-- This file populates the database with realistic demo data for testing,
-- training, and client presentations.
--
-- WARNING: Running this on production will add demo data to your database.
-- Use --dry-run flag on the seed script to preview changes first.
-- See: handover/demo/seed_uploads/README.md for instructions.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Clean up existing demo data (optional - see README)
-- DELETE FROM job_instances WHERE job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM companies WHERE name LIKE '%Demo%' OR name LIKE '%Test%'));
-- DELETE FROM jobs WHERE company_id IN (SELECT id FROM companies WHERE name LIKE '%Demo%' OR name LIKE '%Test%');
-- DELETE FROM company_users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE '%Demo%' OR name LIKE '%Test%');
-- DELETE FROM companies WHERE name LIKE '%Demo%' OR name LIKE '%Test%';

-- ============================================================================
-- SECTION 1: DEMO USERS (Contractors & Company Employees)
-- ============================================================================

INSERT INTO users (
  id, email, password_hash, full_name, phone, avatar_url,
  company_alias, role, active, email_verified, created_at, updated_at
) VALUES
  -- Demo Contractors
  (gen_random_uuid(), 'contractor-alice@mervo-demo.app', 
   crypt('REPLACE_CONTRACTOR_PASSWORD_HASH', gen_salt('bf')), 
   'Alice Johnson', '+1-555-0101', 'https://api.mervo.app/avatars/contractor-alice.jpg',
   'alice_contracting', 'contractor', true, true, NOW() - INTERVAL '60 days', NOW()),
  
  (gen_random_uuid(), 'contractor-bob@mervo-demo.app',
   crypt('REPLACE_CONTRACTOR_PASSWORD_HASH', gen_salt('bf')),
   'Bob Smith', '+1-555-0102', 'https://api.mervo.app/avatars/contractor-bob.jpg',
   'bob_installations', 'contractor', true, true, NOW() - INTERVAL '45 days', NOW()),
  
  (gen_random_uuid(), 'contractor-carol@mervo-demo.app',
   crypt('REPLACE_CONTRACTOR_PASSWORD_HASH', gen_salt('bf')),
   'Carol Williams', '+1-555-0103', 'https://api.mervo.app/avatars/contractor-carol.jpg',
   'carol_services', 'contractor', true, true, NOW() - INTERVAL '30 days', NOW()),
  
  (gen_random_uuid(), 'contractor-david@mervo-demo.app',
   crypt('REPLACE_CONTRACTOR_PASSWORD_HASH', gen_salt('bf')),
   'David Brown', '+1-555-0104', 'https://api.mervo.app/avatars/contractor-david.jpg',
   'david_solutions', 'contractor', true, true, NOW() - INTERVAL '15 days', NOW()),
  
  -- Demo Company Admins
  (gen_random_uuid(), 'admin-acme@mervo-demo.app',
   crypt('REPLACE_ADMIN_PASSWORD_HASH', gen_salt('bf')),
   'John ACME Admin', '+1-555-0201', 'https://api.mervo.app/avatars/admin-acme.jpg',
   'acme_corp', 'admin', true, true, NOW() - INTERVAL '90 days', NOW()),
  
  (gen_random_uuid(), 'admin-globex@mervo-demo.app',
   crypt('REPLACE_ADMIN_PASSWORD_HASH', gen_salt('bf')),
   'Sarah Globex Manager', '+1-555-0202', 'https://api.mervo.app/avatars/admin-globex.jpg',
   'globex_corp', 'admin', true, true, NOW() - INTERVAL '75 days', NOW());

-- Store user IDs for reference (use these in following queries)
-- REPLACE_CONTRACTOR_ALICE = SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'
-- REPLACE_CONTRACTOR_BOB = SELECT id FROM users WHERE email = 'contractor-bob@mervo-demo.app'
-- REPLACE_CONTRACTOR_CAROL = SELECT id FROM users WHERE email = 'contractor-carol@mervo-demo.app'
-- REPLACE_CONTRACTOR_DAVID = SELECT id FROM users WHERE email = 'contractor-david@mervo-demo.app'
-- REPLACE_ADMIN_ACME = SELECT id FROM users WHERE email = 'admin-acme@mervo-demo.app'
-- REPLACE_ADMIN_GLOBEX = SELECT id FROM users WHERE email = 'admin-globex@mervo-demo.app'

-- ============================================================================
-- SECTION 2: DEMO COMPANIES
-- ============================================================================

INSERT INTO companies (
  id, name, owner_id, email, phone, address,
  city, state, zip, country, active, created_at, updated_at
) VALUES
  ('REPLACE_COMPANY_ACME', 'ACME Corp Demo', 
   (SELECT id FROM users WHERE email = 'admin-acme@mervo-demo.app'),
   'info@acme-demo.app', '+1-555-1001', '123 Demo Street',
   'San Francisco', 'CA', '94102', 'USA', true, NOW() - INTERVAL '90 days', NOW()),
  
  ('REPLACE_COMPANY_GLOBEX', 'Globex Corp Demo',
   (SELECT id FROM users WHERE email = 'admin-globex@mervo-demo.app'),
   'contact@globex-demo.app', '+1-555-1002', '456 Test Avenue',
   'New York', 'NY', '10001', 'USA', true, NOW() - INTERVAL '75 days', NOW());

-- ============================================================================
-- SECTION 3: COMPANY USERS (Assign contractors to companies)
-- ============================================================================

-- TODO: This assumes a junction table exists linking users to companies.
-- Adjust based on your actual schema.
-- INSERT INTO company_users (company_id, user_id, role, permissions, active)
-- VALUES
--   ('REPLACE_COMPANY_ACME', (SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'), 'contractor', '{"jobs": "view", "submit": true}'::jsonb, true),
--   ('REPLACE_COMPANY_ACME', (SELECT id FROM users WHERE email = 'contractor-bob@mervo-demo.app'), 'contractor', '{"jobs": "view", "submit": true}'::jsonb, true),
--   ('REPLACE_COMPANY_GLOBEX', (SELECT id FROM users WHERE email = 'contractor-carol@mervo-demo.app'), 'contractor', '{"jobs": "view", "submit": true}'::jsonb, true),
--   ('REPLACE_COMPANY_GLOBEX', (SELECT id FROM users WHERE email = 'contractor-david@mervo-demo.app'), 'contractor', '{"jobs": "view", "submit": true}'::jsonb, true);

-- ============================================================================
-- SECTION 4: DEMO JOBS
-- ============================================================================

INSERT INTO jobs (
  id, company_id, job_name, description, status,
  rate_type, rate_amount, estimated_hours, location,
  created_at, created_by, updated_at
) VALUES
  ('REPLACE_JOB_ACME_001', 'REPLACE_COMPANY_ACME',
   'Install Office Shelving - Demo',
   'Install industrial shelving units in warehouse. 12 units, 4 shelves each. Must be level and securely anchored. Tools provided. Contact John at 555-1001.',
   'active',
   'hourly', 45.00, 8.0, 'San Francisco, CA',
   NOW() - INTERVAL '30 days', (SELECT id FROM users WHERE email = 'admin-acme@mervo-demo.app'), NOW()),
  
  ('REPLACE_JOB_ACME_002', 'REPLACE_COMPANY_ACME',
   'Facility Inspection & Photos - Demo',
   'Walk through facility, document condition. Take 20+ photos of building exterior, parking, signage. Note any damage or maintenance needs.',
   'active',
   'flat', 150.00, 2.0, 'San Francisco, CA',
   NOW() - INTERVAL '25 days', (SELECT id FROM users WHERE email = 'admin-acme@mervo-demo.app'), NOW()),
  
  ('REPLACE_JOB_GLOBEX_001', 'REPLACE_COMPANY_GLOBEX',
   'Paint Conference Room - Demo',
   'Paint 20x15 conference room. Two coats. Color: "Office Blue" (code: OB-442). Prep and cleanup included. Drop cloths provided.',
   'active',
   'flat', 200.00, 6.0, 'New York, NY',
   NOW() - INTERVAL '20 days', (SELECT id FROM users WHERE email = 'admin-globex@mervo-demo.app'), NOW()),
  
  ('REPLACE_JOB_GLOBEX_002', 'REPLACE_COMPANY_GLOBEX',
   'HVAC Filter Replacement & Testing - Demo',
   'Replace HVAC filters in 3 units. Test airflow and document results. Replace 6 filters total (3 per unit). Report any issues.',
   'active',
   'hourly', 55.00, 4.0, 'New York, NY',
   NOW() - INTERVAL '15 days', (SELECT id FROM users WHERE email = 'admin-globex@mervo-demo.app'), NOW());

-- ============================================================================
-- SECTION 5: DEMO JOB INSTANCES (Contractor work)
-- ============================================================================

INSERT INTO job_instances (
  id, job_id, assigned_to, status, assigned_date, started_date,
  completed_date, rate, hours_worked, notes, created_at
) VALUES
  -- Alice's completed job at ACME
  ('REPLACE_INSTANCE_ACME_ALICE_001', 'REPLACE_JOB_ACME_001',
   (SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'),
   'approved', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days',
   NOW() - INTERVAL '18 days', 45.00, 8.0,
   'Completed all 12 units. All level, anchors secure. Customer satisfied.',
   NOW() - INTERVAL '18 days'),
  
  -- Bob's in-progress job at ACME
  ('REPLACE_INSTANCE_ACME_BOB_001', 'REPLACE_JOB_ACME_002',
   (SELECT id FROM users WHERE email = 'contractor-bob@mervo-demo.app'),
   'in_progress', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days',
   NULL, 150.00, NULL,
   'Started documentation. 15 photos taken so far.',
   NOW() - INTERVAL '4 days'),
  
  -- Carol's pending approval at Globex
  ('REPLACE_INSTANCE_GLOBEX_CAROL_001', 'REPLACE_JOB_GLOBEX_001',
   (SELECT id FROM users WHERE email = 'contractor-carol@mervo-demo.app'),
   'pending_approval', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days',
   NOW() - INTERVAL '3 days', 200.00, 6.0,
   'Painted conference room with two coats of Office Blue. All trim carefully masked.',
   NOW() - INTERVAL '3 days'),
  
  -- David's completed job at Globex
  ('REPLACE_INSTANCE_GLOBEX_DAVID_001', 'REPLACE_JOB_GLOBEX_002',
   (SELECT id FROM users WHERE email = 'contractor-david@mervo-demo.app'),
   'approved', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days',
   NOW() - INTERVAL '6 days', 55.00, 4.0,
   'All filters replaced, tested, documented. Airflow normal on all units.',
   NOW() - INTERVAL '6 days');

-- ============================================================================
-- SECTION 6: CONTRACTOR RATINGS
-- ============================================================================

INSERT INTO contractor_ratings (
  id, contractor_id, company_id, job_instance_id, rating, comment,
  created_at
) VALUES
  ('REPLACE_RATING_ALICE_001', (SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'),
   'REPLACE_COMPANY_ACME', 'REPLACE_INSTANCE_ACME_ALICE_001',
   5, 'Excellent work! Alice was professional, on time, and did perfect quality shelving. Highly recommend.', NOW() - INTERVAL '17 days'),
  
  ('REPLACE_RATING_DAVID_001', (SELECT id FROM users WHERE email = 'contractor-david@mervo-demo.app'),
   'REPLACE_COMPANY_GLOBEX', 'REPLACE_INSTANCE_GLOBEX_DAVID_001',
   5, 'Great job! David was thorough, professional, and documented everything clearly. Will hire again.', NOW() - INTERVAL '5 days');

-- ============================================================================
-- SECTION 7: AUDIT LOGS (Track system activity)
-- ============================================================================

INSERT INTO audit_logs (
  id, company_id, user_id, action, target_type, target_id,
  details, ip_address, user_agent, created_at
) VALUES
  ('REPLACE_AUDIT_001', 'REPLACE_COMPANY_ACME', (SELECT id FROM users WHERE email = 'admin-acme@mervo-demo.app'),
   'job_created', 'job', 'REPLACE_JOB_ACME_001',
   '{"job_name": "Install Office Shelving", "status": "active"}'::jsonb,
   '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '30 days'),
  
  ('REPLACE_AUDIT_002', 'REPLACE_COMPANY_ACME', (SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'),
   'job_accepted', 'job_instance', 'REPLACE_INSTANCE_ACME_ALICE_001',
   '{"job_id": "REPLACE_JOB_ACME_001", "status": "in_progress"}'::jsonb,
   '203.0.113.50', 'Mozilla/5.0', NOW() - INTERVAL '19 days'),
  
  ('REPLACE_AUDIT_003', 'REPLACE_COMPANY_ACME', (SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'),
   'work_submitted', 'job_instance', 'REPLACE_INSTANCE_ACME_ALICE_001',
   '{"status": "pending_approval", "photos_count": 12, "notes": "Completed all 12 units"}'::jsonb,
   '203.0.113.50', 'Mozilla/5.0', NOW() - INTERVAL '18 days'),
  
  ('REPLACE_AUDIT_004', 'REPLACE_COMPANY_ACME', (SELECT id FROM users WHERE email = 'admin-acme@mervo-demo.app'),
   'work_approved', 'job_instance', 'REPLACE_INSTANCE_ACME_ALICE_001',
   '{"status": "approved", "rate": 45.0, "hours": 8.0, "payment_processed": true}'::jsonb,
   '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '17 days'),
  
  ('REPLACE_AUDIT_005', 'REPLACE_COMPANY_GLOBEX', (SELECT id FROM users WHERE email = 'contractor-carol@mervo-demo.app'),
   'work_submitted', 'job_instance', 'REPLACE_INSTANCE_GLOBEX_CAROL_001',
   '{"job_name": "Paint Conference Room", "status": "pending_approval", "photos_count": 8}'::jsonb,
   '198.51.100.25', 'Mozilla/5.0', NOW() - INTERVAL '3 days');

-- ============================================================================
-- SECTION 8: DEMO INVOICES (If billing system exists)
-- ============================================================================

-- TODO: This assumes an invoices table exists. Adjust based on your schema.
-- INSERT INTO invoices (id, company_id, period_start, period_end, amount, status, created_at)
-- VALUES
--   ('REPLACE_INVOICE_ACME_202412', 'REPLACE_COMPANY_ACME', '2024-12-01'::date, '2024-12-31'::date,
--    360.00, 'paid', NOW() - INTERVAL '10 days');

-- ============================================================================
-- SECTION 9: DEMO PAYMENTS (If payments table exists)
-- ============================================================================

-- TODO: This assumes a payments table exists. Adjust based on your schema.
-- INSERT INTO payments (id, contractor_id, amount, status, payment_date, created_at)
-- VALUES
--   ('REPLACE_PAYMENT_ALICE_001', (SELECT id FROM users WHERE email = 'contractor-alice@mervo-demo.app'),
--    360.00, 'completed', NOW() - INTERVAL '16 days', NOW() - INTERVAL '17 days');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify demo data was inserted:

-- Count demo users
-- SELECT COUNT(*) as demo_user_count FROM users WHERE email LIKE '%mervo-demo%';

-- Count demo companies
-- SELECT COUNT(*) as demo_company_count FROM companies WHERE name LIKE '%Demo%';

-- Count demo jobs
-- SELECT COUNT(*) as demo_job_count FROM jobs WHERE job_name LIKE '%Demo%';

-- Count demo job instances
-- SELECT COUNT(*) as demo_instance_count FROM job_instances 
-- WHERE job_id IN (SELECT id FROM jobs WHERE job_name LIKE '%Demo%');

-- View all demo data summary
-- SELECT
--   'Users' as entity, COUNT(*) as count FROM users WHERE email LIKE '%mervo-demo%'
-- UNION ALL
-- SELECT 'Companies', COUNT(*) FROM companies WHERE name LIKE '%Demo%'
-- UNION ALL
-- SELECT 'Jobs', COUNT(*) FROM jobs WHERE job_name LIKE '%Demo%'
-- UNION ALL
-- SELECT 'Job Instances', COUNT(*) FROM job_instances
--   WHERE job_id IN (SELECT id FROM jobs WHERE job_name LIKE '%Demo%')
-- UNION ALL
-- SELECT 'Ratings', COUNT(*) FROM contractor_ratings
--   WHERE contractor_id IN (SELECT id FROM users WHERE email LIKE '%mervo-demo%');

-- ============================================================================
-- NOTES FOR CLIENT
-- ============================================================================

-- 1. Replace all REPLACE_* values with actual database IDs from your system
-- 2. Update REPLACE_CONTRACTOR_PASSWORD_HASH and REPLACE_ADMIN_PASSWORD_HASH with real hashed passwords
-- 3. Tables marked with TODO may not exist in your schema - adjust as needed
-- 4. This data uses realistic but fictional company/contractor information
-- 5. Dates are relative to NOW() for realistic demo progression
-- 6. Job progression shows: not started → in progress → completed → approved → paid
-- 7. Some jobs are still pending approval for demo workflow purposes
-- 8. To remove demo data: DELETE FROM [tables] WHERE [company_id IN demo companies OR email LIKE '%mervo-demo%']
-- 9. Keep audit logs for training - they show system activity patterns
-- 10. Ratings demonstrate quality feedback system

-- Version: 1.0
-- Last updated: December 2025
