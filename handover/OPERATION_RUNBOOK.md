# Operation Runbook

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** System administrators, operations team

---

## Quick Reference

| Task | Frequency | Time | Page |
|------|-----------|------|------|
| Daily standup | Daily | 5 min | [Daily Tasks](#daily-tasks) |
| Data backup verification | Daily | 2 min | [Backups](#backups) |
| Weekly reconciliation | Weekly | 30 min | [Weekly Tasks](#weekly-tasks) |
| Monthly audit review | Monthly | 1 hour | [Monthly Tasks](#monthly-tasks) |
| Quarterly security review | Quarterly | 2 hours | [Security Checks](#security-checks) |

---

## Daily Tasks

### 1. Check System Health (8:00 AM)

```bash
# SSH into Cloud Run / server
gcloud run describe mervo --platform managed --region us-central1

# Expected: No errors, traffic normal
# Check: CPU, memory, request latency
```

**What to look for:**
- No spike in error rate (check Cloud Logging)
- Response times < 500ms (average)
- No hung/pending jobs

**If issue detected:**
- Check logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=mervo" --limit 50 --format json`
- Restart if needed: `gcloud run services update-traffic mervo --to-revisions LATEST=100`
- Escalate to engineering if errors persist

### 2. Monitor Incoming Errors (Throughout day)

**Real-time alerts via:**
- Slack webhook (if configured)
- Email (if alerts enabled)
- Cloud Logging console

**Action:**
- Log any critical errors in ticket system
- Notify contractors/companies affected
- Coordinate with engineering for fix timeline

### 3. Process Daily Exports (5:00 PM)

```sql
-- Export new jobs created today
SELECT id, job_name, company_id, created_at
FROM jobs
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Export completed job instances
SELECT id, job_id, assigned_to, completed_at
FROM job_instances
WHERE DATE(completed_at) = CURRENT_DATE
  AND status = 'completed'
ORDER BY completed_at DESC;
```

**Action:**
- Archive to data warehouse (if applicable)
- Share with finance (for payroll prep)
- Share with operations (for reporting)

### 4. Backup Verification (Before EOD)

```bash
# Check last backup
psql -h REPLACE_SUPABASE_HOST -U postgres -d postgres -c \
  "SELECT * FROM pg_stat_archiver;"

# Expected: archive_ready_count = 0 (all backed up)
```

**If backup is failing:**
- Check storage quota: `gcloud alpha bq show`
- Check permissions on backup bucket
- Open ticket with Supabase support

---

## Weekly Tasks

### Monday 9:00 AM: Weekly Reconciliation

1. **Count active users**
   ```sql
   SELECT COUNT(*) FROM users WHERE last_sign_in > NOW() - INTERVAL '7 days';
   ```

2. **Count active jobs**
   ```sql
   SELECT COUNT(*) FROM jobs WHERE status != 'archived' AND company_id IN (SELECT id FROM companies WHERE active = true);
   ```

3. **Contractor accuracy check**
   ```sql
   SELECT 
     company_alias,
     COUNT(*) as job_count,
     AVG(rating) as avg_rating
   FROM contractors
   LEFT JOIN contractor_ratings ON contractors.id = contractor_ratings.contractor_id
   GROUP BY company_alias
   HAVING COUNT(*) > 0
   ORDER BY job_count DESC;
   ```

4. **Revenue check** (if billing enabled)
   ```sql
   SELECT 
     companies.name,
     COUNT(job_instances.id) as instances_completed,
     SUM(job_instances.rate) as revenue
   FROM companies
   LEFT JOIN jobs ON companies.id = jobs.company_id
   LEFT JOIN job_instances ON jobs.id = job_instances.job_id
   WHERE job_instances.status = 'completed'
     AND DATE(job_instances.completed_at) >= CURRENT_DATE - INTERVAL '7 days'
   GROUP BY companies.id
   ORDER BY revenue DESC;
   ```

**Action:**
- Flag unusual patterns (e.g., contractor with 0 jobs but high rating)
- Investigate dropped users
- Report findings to management

### Friday 5:00 PM: Approval Queue Review

1. **Check pending approvals**
   ```sql
   SELECT id, contractor_alias, job_id, status, submitted_at
   FROM job_instances
   WHERE status = 'pending_approval'
   ORDER BY submitted_at DESC;
   ```

2. **Review dispute/issue reports**
   ```sql
   SELECT * FROM audit_logs
   WHERE action IN ('dispute_filed', 'issue_reported')
     AND DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'
   ORDER BY created_at DESC;
   ```

3. **Approve valid reports**
   - Check job details match submission
   - Verify contractor completed work (check timestamps)
   - Approve in UI or via API
   - Send approval notification to contractor

---

## Monthly Tasks

### First Monday: Monthly Reconciliation & Cleanup

#### 1. Data Cleanup

```sql
-- Archive old completed jobs (> 1 year)
UPDATE jobs SET status = 'archived'
WHERE status = 'completed' AND completed_at < NOW() - INTERVAL '1 year';

-- Remove test/demo data (if present)
DELETE FROM jobs WHERE company_id IN (
  SELECT id FROM companies WHERE name LIKE '%demo%' OR name LIKE '%test%'
);
```

#### 2. Audit Review

```sql
-- High-level audit summary
SELECT 
  DATE(created_at) as date,
  action,
  COUNT(*) as count
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action
ORDER BY date DESC, count DESC;

-- Check for suspicious activity
SELECT * FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND (
    action LIKE '%delete%' OR
    action LIKE '%update%' AND target_type = 'company' OR
    action = 'role_change'
  )
ORDER BY created_at DESC;
```

**Action:**
- Review all delete/permission changes
- Verify no unauthorized access
- Document in audit log

#### 3. Performance Optimization

```bash
# Analyze slow queries
gcloud logging read "resource.type=cloudsql_database AND severity=WARNING" \
  --limit 100 --format json | grep "slow query"

# Action: Add indexes if needed, escalate to engineering
```

#### 4. Contractor Payout Report

```sql
-- Monthly payout summary
SELECT 
  company_alias,
  COUNT(DISTINCT job_id) as jobs_completed,
  SUM(rate) as total_earnings,
  ROUND(AVG(rating), 2) as avg_rating
FROM job_instances
WHERE status = 'completed'
  AND DATE(completed_at) >= DATE_TRUNC('month', NOW())
GROUP BY company_alias
ORDER BY total_earnings DESC;
```

**Action:**
- Export to CSV for finance
- Send to contractors (if payment pending)
- File for records

---

## Adding & Managing Companies

### Add New Company

```sql
INSERT INTO companies (
  id,
  name,
  owner_id,
  active,
  created_at
) VALUES (
  gen_random_uuid(),
  'REPLACE_COMPANY_NAME',
  'REPLACE_OWNER_UUID',  -- See how to get below
  true,
  NOW()
);

-- Get owner UUID:
SELECT id, email FROM users WHERE email = 'REPLACE_OWNER_EMAIL';
```

### Via Admin UI

1. Log in as admin
2. Navigate to **Admin → Companies**
3. Click **+ Add Company**
4. Fill details: Name, owner email, phone, address
5. Click Save

### Add Company User (Contractor or Employee)

```sql
INSERT INTO company_users (
  company_id,
  user_id,
  role,
  permissions,
  role_level
) VALUES (
  'REPLACE_COMPANY_ID',
  'REPLACE_USER_ID',
  'contractor',  -- or 'employee', 'admin', 'owner'
  '{"jobs": "view"}'::jsonb,
  30
);
```

### Remove Company User

```sql
-- Soft delete (safe)
UPDATE company_users SET active = false
WHERE company_id = 'REPLACE_COMPANY_ID'
  AND user_id = 'REPLACE_USER_ID';

-- Hard delete (use with caution — check audit first)
DELETE FROM company_users
WHERE company_id = 'REPLACE_COMPANY_ID'
  AND user_id = 'REPLACE_USER_ID';
```

---

## Job Reporting & Approval

### View Pending Approvals

```sql
SELECT 
  j.job_name,
  ji.id as instance_id,
  c.company_alias as contractor,
  ji.completed_at,
  ji.status
FROM job_instances ji
JOIN jobs j ON ji.job_id = j.id
JOIN users c ON ji.assigned_to = c.id
WHERE ji.status = 'pending_approval'
ORDER BY ji.completed_at DESC;
```

### Approve Job Instance

**Via API:**
```bash
curl -X PATCH \
  https://api.mervo.app/job-instances/REPLACE_INSTANCE_ID \
  -H "Authorization: Bearer REPLACE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

**Via UI:**
1. Navigate to **Reports → Pending**
2. Click on job instance
3. Review submission details & photos
4. Click **Approve** or **Reject**
5. System notifies contractor automatically

### Dispute Resolution

```sql
-- View all disputes
SELECT * FROM audit_logs
WHERE action = 'dispute_filed'
ORDER BY created_at DESC;

-- Record resolution
INSERT INTO audit_logs (
  company_id, action, target_type, target_id, details, created_at
) VALUES (
  'REPLACE_COMPANY_ID',
  'dispute_resolved',
  'job_instance',
  'REPLACE_INSTANCE_ID',
  '{"resolution": "REPLACE_RESOLUTION", "notes": "REPLACE_NOTES"}'::jsonb,
  NOW()
);
```

---

## Payroll & Financial Exports

### Generate Payroll Report

```sql
-- Monthly payroll for all contractors
SELECT 
  u.email,
  c.company_alias,
  COUNT(ji.id) as jobs_completed,
  SUM(ji.rate) as total_amount,
  AVG(ji.rate) as avg_rate,
  MAX(ji.completed_at) as last_job_date
FROM job_instances ji
JOIN jobs j ON ji.job_id = j.id
JOIN users u ON ji.assigned_to = u.id
JOIN company_users c ON u.id = c.user_id
WHERE ji.status = 'approved'
  AND DATE(ji.completed_at) >= DATE_TRUNC('month', NOW())
GROUP BY u.id, c.company_alias
ORDER BY total_amount DESC;
```

**Action:**
- Export to CSV: `\copy (...) TO 'payroll_YYYY_MM.csv' WITH CSV HEADER;`
- Share with finance/accounting
- Process payments via Stripe/ACH

### Invoice Generation (if applicable)

```sql
-- Sample invoice data
SELECT 
  c.id, c.name, c.email,
  COUNT(j.id) as jobs_this_month,
  SUM(ji.rate) as total_amount,
  NOW()::date as invoice_date
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id
LEFT JOIN job_instances ji ON j.id = ji.job_id
  AND DATE(ji.completed_at) >= DATE_TRUNC('month', NOW())
WHERE ji.status = 'approved'
GROUP BY c.id;
```

---

## Data Retention & Cleanup

### Retention Policy

| Data Type | Retention | Archive Action |
|-----------|-----------|----------------|
| Completed jobs | 7 years | Archive after 1 year |
| Audit logs | 3 years | Delete after 3 years |
| Photos/attachments | 2 years | Delete if no dispute |
| Contractor ratings | Indefinite | Keep (business value) |
| User accounts (inactive) | 2 years | Delete if no login |

### Run Monthly Cleanup

```sql
-- Archive old completed jobs
UPDATE jobs
SET status = 'archived'
WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '1 year'
  AND id NOT IN (SELECT DISTINCT job_id FROM audit_logs);

-- Delete very old audit logs (>3 years)
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '3 years'
  AND action NOT IN ('delete', 'dispute_filed', 'role_change');

-- Disable inactive users (>2 years no login)
UPDATE users
SET active = false
WHERE active = true
  AND last_sign_in < NOW() - INTERVAL '2 years';
```

---

## Incident Response

### System Down (Critical)

**Step 1: Verify the issue (1 min)**
```bash
curl -s https://your-domain.com/health && echo "UP" || echo "DOWN"
```

**Step 2: Check logs (2 min)**
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 20 --format json
```

**Step 3: Restart service (2 min)**
```bash
gcloud run services update-traffic mervo --to-revisions LATEST=100
```

**Step 4: Notify users (2 min)**
- Slack: Post in #status channel
- Email: Send to all companies
- Include ETA for resolution

**Step 5: Investigate root cause (ongoing)**
- Check database connections
- Check disk space, CPU usage
- Check recent deployments
- Coordinate with engineering

### Database Issue (High)

```bash
# Check database status
gcloud sql instances describe mervo-db --format json | grep state

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check storage
SELECT sum(heap_blks_read) FROM pg_statio_user_tables;
```

**If database down:**
1. Restore from backup: `gcloud sql backups restore BACKUP_ID --backup-instance mervo-db`
2. Notify team: "Database restored from backup at TIME"
3. Check data integrity
4. Open incident ticket

---

## Backup & Disaster Recovery

### Daily Backup Verification

```bash
# List recent backups
gcloud sql backups list --instance mervo-db --limit 5

# Restore to point-in-time (test restore)
gcloud sql backups restore BACKUP_ID --backup-instance mervo-db
```

### Manual Backup (before major changes)

```bash
# Trigger manual backup
gcloud sql backups create --instance mervo-db

# Verify backup completed
gcloud sql backups list --instance mervo-db --limit 1
```

### Disaster Recovery (Full restore from backup)

```bash
# 1. Create new database instance
gcloud sql instances create mervo-db-restored

# 2. Restore backup
gcloud sql backups restore BACKUP_ID --backup-instance mervo-db-restored

# 3. Update application config to point to new instance
# Edit Cloud Run environment variables: SQL_HOST = mervo-db-restored

# 4. Test application
curl https://your-domain.com

# 5. If successful, delete old instance
gcloud sql instances delete mervo-db
```

---

## Security Tasks

### Password & Key Rotation

- [ ] Rotate Supabase API keys every 90 days
- [ ] Rotate GitHub tokens every 180 days
- [ ] Rotate database passwords every 180 days
- [ ] Review active sessions and disable old ones

**How to rotate:**

```bash
# Supabase: Settings → API → Create new key, update app config, delete old key
# GitHub: Settings → Developer settings → Personal access tokens → Regenerate
# Database: ALTER USER postgres WITH PASSWORD 'NEW_PASSWORD';
```

### Access Review (Quarterly)

```sql
-- Who has admin access?
SELECT u.email, c.role
FROM company_users c
JOIN users u ON c.user_id = u.id
WHERE c.role IN ('owner', 'admin');

-- Who has not logged in for 90 days?
SELECT email, last_sign_in
FROM users
WHERE last_sign_in < NOW() - INTERVAL '90 days'
  AND active = true;
```

**Action:**
- Remove inactive users: `UPDATE users SET active = false WHERE ...`
- Review admin access — should be minimal
- Document changes in audit log

---

## Contact & Escalation

| Issue | First Contact | Escalation | Timeframe |
|-------|---------------|------------|-----------|
| Slow performance | Engineering | CTO | 2 hours |
| Database error | Database admin | Cloud support | 4 hours |
| Security concern | Security team | VP Security | 1 hour |
| Data loss | Database admin | Executive | Immediate |
| User reports issue | Support | Engineering | 24 hours |

---

## Useful Queries Library

### Find contractor by email
```sql
SELECT id, email FROM users WHERE email ILIKE '%REPLACE_EMAIL%';
```

### Get all jobs for a company
```sql
SELECT id, job_name, status FROM jobs WHERE company_id = 'REPLACE_COMPANY_ID';
```

### Get job details including contractor
```sql
SELECT 
  j.job_name,
  c.company_alias as contractor,
  ji.status,
  ji.created_at,
  ji.completed_at
FROM job_instances ji
JOIN jobs j ON ji.job_id = j.id
JOIN users c ON ji.assigned_to = c.id
WHERE j.id = 'REPLACE_JOB_ID';
```

### Check if company is paying (invoiced)
```sql
SELECT * FROM invoices WHERE company_id = 'REPLACE_COMPANY_ID' ORDER BY created_at DESC LIMIT 1;
```

---

**Version history:**
- v1.0 — Initial release, Dec 2025
