# Demo Seed Data & Uploads

**Version:** 1.0  
**Last Updated:** December 2025

---

## Overview

This directory contains demo data files for testing, training, and client presentations. The demo data includes:

- **Fictional companies:** ACME Corp, Globex Corp
- **Demo contractors:** Alice, Bob, Carol, David (with realistic work history)
- **Sample jobs:** Installation, inspection, painting, HVAC maintenance
- **Job progress:** Examples at various stages (pending, in-progress, completed, approved)
- **Ratings & feedback:** Positive feedback demonstrating quality system
- **Audit logs:** System activity showing job workflow

---

## Files in This Directory

### `seed_data.sql`
Main SQL script to populate database with demo data.

**Contents:**
- 6 demo users (4 contractors, 2 company admins)
- 2 demo companies (ACME, Globex)
- 4 demo jobs with various statuses
- 4 job instances (work assignments)
- 2 contractor ratings
- 5 audit log entries

**Size:** ~3 KB (data only, no photos)

### `seed_uploads/README.md` (this file)
Guide for running the seed script and managing demo data.

---

## Setup Instructions

### Prerequisites

1. **Access:** You need direct database access (PostgreSQL admin)
   ```bash
   psql -h REPLACE_DATABASE_HOST -U REPLACE_DATABASE_USER -d REPLACE_DATABASE_NAME
   ```

2. **Backup:** Always back up before running seed script
   ```bash
   # Cloud SQL example
   gcloud sql backups create --instance mervo-db --description "Before demo seed"
   ```

3. **Schema:** Ensure all tables exist (see schema files in `/migrations`)
   - `users`
   - `companies`
   - `jobs`
   - `job_instances`
   - `contractor_ratings`
   - `audit_logs`

### Step 1: Customize the Script

The seed script has many `REPLACE_*` placeholders that you must fill in:

**Open `seed_data.sql` and find/replace:**

1. `REPLACE_CONTRACTOR_PASSWORD_HASH`
   - Generate hashed password for contractors:
   ```sql
   SELECT crypt('contractor-demo-password', gen_salt('bf'));
   -- Copy the result and paste into REPLACE_CONTRACTOR_PASSWORD_HASH
   ```

2. `REPLACE_ADMIN_PASSWORD_HASH`
   - Generate hashed password for admins:
   ```sql
   SELECT crypt('admin-demo-password', gen_salt('bf'));
   ```

3. `REPLACE_COMPANY_ACME`
   - Generate a UUID:
   ```sql
   SELECT gen_random_uuid();
   -- Use this for company ID
   ```

4. `REPLACE_COMPANY_GLOBEX`
   - Another UUID for second company

5. Job IDs, Instance IDs, Rating IDs, Audit Log IDs
   - Generate UUIDs as needed (or let database generate them with `gen_random_uuid()`)

**Recommended approach:** Use Find & Replace in your editor:
- Find: `REPLACE_CONTRACTOR_PASSWORD_HASH`
- Replace: `$2a$12$abc...xyz` (the bcrypt hash)
- Replace All

### Step 2: Run in Dry-Run Mode (Recommended)

Before executing, preview what will be inserted:

```bash
# Show the script (don't execute)
cat handover/demo/seed_data.sql | head -50

# Or paste into a SQL IDE and review

# Or use --dry-run flag with seed script (if available)
./handover/demo/generate_demo_data.ts --dry-run
```

### Step 3: Execute the Script

**Option A: Direct PostgreSQL**
```bash
# Connect to database and run script
psql -h REPLACE_DATABASE_HOST \
     -U REPLACE_DATABASE_USER \
     -d REPLACE_DATABASE_NAME \
     -f handover/demo/seed_data.sql

# Output should show:
# INSERT 0 6  (6 users)
# INSERT 0 2  (2 companies)
# INSERT 0 4  (4 jobs)
# INSERT 0 4  (4 job instances)
# ... etc
```

**Option B: Using Cloud SQL Proxy**
```bash
# If using Cloud SQL
gcloud sql connect mervo-db --user=postgres

# Then paste the contents of seed_data.sql and press Enter
```

**Option C: Through Application API** (if available)
```bash
curl -X POST https://api.mervo.app/admin/seed-demo-data \
  -H "Authorization: Bearer REPLACE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

### Step 4: Verify Demo Data Was Inserted

Run verification queries:

```sql
-- Count demo users
SELECT COUNT(*) as demo_user_count FROM users WHERE email LIKE '%mervo-demo%';
-- Expected: 6

-- Count demo companies
SELECT COUNT(*) as demo_company_count FROM companies WHERE name LIKE '%Demo%';
-- Expected: 2

-- Count demo jobs
SELECT COUNT(*) as demo_job_count FROM jobs WHERE job_name LIKE '%Demo%';
-- Expected: 4

-- Count demo job instances
SELECT COUNT(*) as demo_instance_count FROM job_instances 
WHERE job_id IN (SELECT id FROM jobs WHERE job_name LIKE '%Demo%');
-- Expected: 4

-- View contractor ratings
SELECT COUNT(*) as rating_count FROM contractor_ratings
WHERE contractor_id IN (SELECT id FROM users WHERE email LIKE '%mervo-demo%');
-- Expected: 2

-- View sample job with details
SELECT j.job_name, j.rate_amount, COUNT(ji.id) as instance_count
FROM jobs j
LEFT JOIN job_instances ji ON j.id = ji.job_id
WHERE j.job_name LIKE '%Demo%'
GROUP BY j.id;
```

---

## Demo Data Overview

### Demo Users

| Email | Role | Alias | Status | Purpose |
|-------|------|-------|--------|---------|
| contractor-alice@mervo-demo.app | Contractor | alice_contracting | Active | High-performing contractor (5-star ratings) |
| contractor-bob@mervo-demo.app | Contractor | bob_installations | Active | Contractor with in-progress work |
| contractor-carol@mervo-demo.app | Contractor | carol_services | Active | Contractor awaiting job approval |
| contractor-david@mervo-demo.app | Contractor | david_solutions | Active | Contractor with completed work |
| admin-acme@mervo-demo.app | Admin | acme_corp | Active | ACME Corp company admin |
| admin-globex@mervo-demo.app | Admin | globex_corp | Active | Globex Corp company admin |

**Demo Passwords:**
- Contractors: `contractor-demo-password`
- Admins: `admin-demo-password`

### Demo Companies

| Name | ID | Owner | Status |
|------|----|----|--------|
| ACME Corp Demo | REPLACE_COMPANY_ACME | John ACME Admin | Active |
| Globex Corp Demo | REPLACE_COMPANY_GLOBEX | Sarah Globex Manager | Active |

### Demo Jobs & Progress

| Company | Job | Status | Contractor | Progress |
|---------|-----|--------|-----------|----------|
| ACME | Install Office Shelving | Completed | Alice | ✅ Approved & Paid |
| ACME | Facility Inspection | In Progress | Bob | 🔄 50% complete |
| Globex | Paint Conference Room | Pending Approval | Carol | ⏳ Submitted, awaiting review |
| Globex | HVAC Filter Replacement | Completed | David | ✅ Approved & Paid |

### Realistic Job Workflow Demonstrated

The demo data shows the complete job lifecycle:

```
1. Job Created (ACME: Shelving)
   ↓
2. Contractor Assigned (Alice accepts)
   ↓
3. Work Started (Alice begins installation)
   ↓
4. Work Completed (All shelves installed)
   ↓
5. Work Submitted (Alice uploads photos, notes)
   ↓
6. Approved (ACME admin reviews and approves)
   ↓
7. Payment Processed (Alice paid for 8 hours @ $45/hr)
   ↓
8. Rating Given (ACME rates Alice 5 stars)
```

---

## Managing Demo Data

### Identifying Demo Data

All demo data is marked for easy identification:

```sql
-- Find all demo records
SELECT * FROM users WHERE email LIKE '%mervo-demo%';
SELECT * FROM companies WHERE name LIKE '%Demo%';
SELECT * FROM jobs WHERE job_name LIKE '%Demo%';
```

### Keeping Demo Data

Demo data is useful for:
- **Training:** Show real-world examples to new team members
- **Testing:** Consistent test data for QA
- **Presentations:** Show clients realistic workflows
- **Documentation:** Examples in guides and screenshots

**Keep demo data if:**
- You're still in training phase
- You want to demo to clients
- You're testing new features
- You need sample data for reporting

### Removing Demo Data

To clean up demo data:

```sql
-- Safe deletion (preserves references)
DELETE FROM contractor_ratings 
WHERE contractor_id IN (SELECT id FROM users WHERE email LIKE '%mervo-demo%');

DELETE FROM audit_logs 
WHERE company_id IN (SELECT id FROM companies WHERE name LIKE '%Demo%')
   OR user_id IN (SELECT id FROM users WHERE email LIKE '%mervo-demo%');

DELETE FROM job_instances 
WHERE job_id IN (SELECT id FROM jobs WHERE job_name LIKE '%Demo%')
   OR assigned_to IN (SELECT id FROM users WHERE email LIKE '%mervo-demo%');

DELETE FROM jobs 
WHERE company_id IN (SELECT id FROM companies WHERE name LIKE '%Demo%');

DELETE FROM company_users 
WHERE company_id IN (SELECT id FROM companies WHERE name LIKE '%Demo%');

DELETE FROM companies 
WHERE name LIKE '%Demo%';

DELETE FROM users 
WHERE email LIKE '%mervo-demo%';

-- Verify deletion
SELECT COUNT(*) FROM users WHERE email LIKE '%mervo-demo%';  -- Should be 0
```

### Modifying Demo Data

To customize demo data for your use case:

1. **Change contractor names:**
   ```sql
   UPDATE users SET full_name = 'Your Name' WHERE email = 'contractor-alice@mervo-demo.app';
   ```

2. **Adjust job rates:**
   ```sql
   UPDATE jobs SET rate_amount = 75.00 WHERE job_name LIKE '%Demo%';
   ```

3. **Change company names:**
   ```sql
   UPDATE companies SET name = 'Your Test Company' WHERE name = 'ACME Corp Demo';
   ```

4. **Update dates (make recent):**
   ```sql
   UPDATE jobs SET created_at = NOW() - INTERVAL '5 days' WHERE job_name LIKE '%Demo%';
   ```

---

## Photo Uploads (Demo)

The demo SQL doesn't include actual photo files (they're large). To add demo photos:

1. **Create realistic mock photos:**
   - Screenshot of completed work
   - Photo of before/after installation
   - Inspection photos (20+ per inspection job)

2. **Upload to Cloud Storage:**
   ```bash
   gsutil cp mock-photo-*.jpg gs://mervo-demo-photos/acme/job-001/
   ```

3. **Update job_instances with photo references:**
   ```sql
   UPDATE job_instances 
   SET photos = ARRAY['gs://mervo-demo-photos/acme/job-001/photo-1.jpg', ...]
   WHERE id = 'REPLACE_INSTANCE_ACME_ALICE_001';
   ```

**Note:** Photos are optional for demo. The data shows job progression without them.

---

## Demo Data for Specific Use Cases

### Training Admins
Use the demo data to show:
- Job approval workflow
- Contractor management
- Payment processing
- Rating system
- Audit logging

```sql
-- Show admin Alice's completed work
SELECT j.job_name, ji.status, c.full_name, ji.hours_worked, ji.rate
FROM job_instances ji
JOIN jobs j ON ji.job_id = j.id
JOIN users c ON ji.assigned_to = c.id
WHERE c.email = 'contractor-alice@mervo-demo.app';
```

### Training Contractors
Use demo data to show:
- Available jobs
- Job acceptance flow
- Work submission process
- Approval and payment

```sql
-- Show available jobs contractors see
SELECT job_name, rate_type, rate_amount, estimated_hours
FROM jobs
WHERE status = 'active' AND job_name LIKE '%Demo%'
ORDER BY created_at DESC;
```

### Presenting to Clients
Use demo data to demonstrate:
- Realistic job lifecycle
- Quality of contractor work (through ratings)
- Detailed tracking (audit logs)
- Professional workflow

```sql
-- Show complete job lifecycle
SELECT 
  j.job_name,
  c.name as company,
  u.full_name as contractor,
  ji.status,
  ji.rate * ji.hours_worked as amount,
  cr.rating,
  ji.completed_date
FROM job_instances ji
JOIN jobs j ON ji.job_id = j.id
JOIN companies c ON j.company_id = c.id
JOIN users u ON ji.assigned_to = u.id
LEFT JOIN contractor_ratings cr ON ji.id = cr.job_instance_id
ORDER BY ji.completed_date DESC;
```

---

## Troubleshooting

### Error: "Table doesn't exist"

**Problem:** Script references a table that doesn't exist in your schema

**Solution:**
1. Check if table exists: `\dt table_name;` (in psql)
2. Check schema files in `/migrations`
3. If table is missing, create it or comment out that section in seed script
4. Mark with TODO comment for client to address

### Error: "Foreign key constraint violated"

**Problem:** Trying to insert a record with a non-existent foreign key

**Solution:**
1. Verify referenced table has the ID being referenced
2. Check REPLACE_* placeholders were filled correctly
3. Insert parent records first (users before companies, etc.)

### Error: "Duplicate key value"

**Problem:** Demo data with same email/ID already exists

**Solution:**
```sql
-- Check for existing demo data
SELECT COUNT(*) FROM users WHERE email LIKE '%mervo-demo%';

-- If found, delete first
DELETE FROM users WHERE email LIKE '%mervo-demo%';

-- Then run seed script again
```

### Demo data appeared but incomplete

**Problem:** Script ran but some tables are empty

**Solution:**
1. Check if all REPLACE_* placeholders were replaced
2. Run verification queries to see which tables are empty
3. Manually insert missing records using SQL
4. Check for errors in logs

---

## Best Practices

1. **Always backup before seeding:** One wrong command and your data is gone
2. **Use dry-run first:** Preview the script before executing
3. **Verify after insertion:** Run verification queries
4. **Document changes:** Note which demo data you've modified
5. **Keep a clean copy:** Save original seed_data.sql before modifying
6. **Test on staging first:** Run on test database before production
7. **Schedule cleanup:** Set a date to remove demo data if not keeping long-term

---

## Questions?

- **Setup help:** See CLIENT_HANDOVER_GUIDE.md for database setup
- **SQL help:** See OPERATION_RUNBOOK.md for SQL query examples
- **Schema questions:** Check migration files in `/migrations`

---

**Version history:**
- v1.0 — Initial release, Dec 2025
