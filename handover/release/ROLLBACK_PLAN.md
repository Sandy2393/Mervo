# Rollback Plan

This document outlines procedures to rollback a failed deployment and restore service to the last known good state.

## Pre-Rollback Checklist

- [ ] Confirm deployment failure in logs
- [ ] Alert on-call team and stakeholders
- [ ] Identify the last known good release/commit
- [ ] Verify database snapshots are available
- [ ] Have SSH access to production infrastructure
- [ ] Ensure rollback scripts are executable

## Rollback Scenarios

### Scenario 1: Frontend/UI Deployment Failure

**Time to Rollback:** 5–10 minutes

**Steps:**

1. **Identify Last Good Build**
   ```bash
   # List recent deployments
   # Cloud Run: gcloud run revisions list --service mervo-frontend
   # Vercel: vercel deployments list
   ```

2. **Revert to Previous Deployment**
   ```bash
   # Cloud Run:
   gcloud run deploy mervo-frontend \
     --image gcr.io/PROJECT_ID/mervo-frontend:LAST_GOOD_TAG \
     --region us-central1

   # Vercel:
   vercel rollback DEPLOYMENT_ID
   ```

3. **Verify Service**
   ```bash
   curl https://app.mervo.app/health
   # Expected: 200 OK, JSON response
   ```

4. **Notify Stakeholders**
   - Post status in #incidents
   - Send email to support team

---

### Scenario 2: Database Migration Failure

**Time to Rollback:** 15–30 minutes

**Steps:**

1. **Identify Last Good Snapshot**
   ```bash
   # Supabase: List backups in dashboard
   # AWS RDS: aws rds describe-db-snapshots --db-instance-identifier mervo-prod
   ```

2. **Stop Current Services** (to prevent data corruption)
   ```bash
   gcloud run services update mervo-frontend --no-traffic
   gcloud run services update mervo-api --no-traffic
   ```

3. **Restore Database from Snapshot**
   ```bash
   # Supabase CLI:
   supabase db push --remote production --dry-run  # Verify first
   supabase db push --remote production \
     --yes-to-all \
     --snapshot-name BACKUP_SNAPSHOT_ID
   ```

4. **Run Smoke Tests** (see `qa/SMOKE_TEST_SCRIPT.sh`)
   ```bash
   bash qa/SMOKE_TEST_SCRIPT.sh
   ```

5. **Restore Traffic**
   ```bash
   gcloud run services update mervo-frontend --traffic LAST_GOOD_REVISION=100
   gcloud run services update mervo-api --traffic LAST_GOOD_REVISION=100
   ```

6. **Monitor Logs**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" --limit 100
   ```

---

### Scenario 3: API Service Failure

**Time to Rollback:** 10–15 minutes

**Steps:**

1. **Revert to Last Good Commit**
   ```bash
   git revert HEAD --no-edit
   git push origin main
   # or
   git checkout LAST_GOOD_COMMIT_SHA
   git push origin main --force  # ⚠️ Only if approved
   ```

2. **Rebuild and Deploy**
   ```bash
   npm run build
   docker build -t gcr.io/PROJECT_ID/mervo-api:rollback .
   docker push gcr.io/PROJECT_ID/mervo-api:rollback

   gcloud run deploy mervo-api \
     --image gcr.io/PROJECT_ID/mervo-api:rollback \
     --region us-central1
   ```

3. **Verify API Health**
   ```bash
   curl -H "Authorization: Bearer $TEST_TOKEN" \
     https://api.mervo.app/health
   ```

4. **Check Database Consistency**
   ```sql
   -- Run on production (via Supabase dashboard or CLI)
   SELECT COUNT(*) FROM jobs;
   SELECT COUNT(*) FROM job_instances;
   -- Verify counts match expectations
   ```

---

### Scenario 4: Authentication / Session Service Failure

**Time to Rollback:** 5–10 minutes

**Steps:**

1. **Check Supabase Status**
   - Visit https://status.supabase.io
   - If Supabase is down, there's a global incident; wait for their recovery

2. **If Custom Auth Service Down:**
   ```bash
   # Revert auth service changes
   git revert HEAD~1  # Last 2 commits if last one was auth-related
   npm run build:auth
   gcloud run deploy mervo-auth --image gcr.io/PROJECT_ID/mervo-auth:rollback
   ```

3. **Clear Session Cache** (if applicable)
   ```bash
   redis-cli -h CACHE_INSTANCE FLUSHALL  # Use with caution
   ```

4. **Force Re-login (if necessary)**
   - Notify users to clear browser cache and re-login
   - Post in-app banner if available

---

## Communication Template

### During Rollback

```
[INCIDENT] Deployment Rollback in Progress

We detected an issue with the latest deployment and have initiated a rollback.
Expected recovery time: [TIME] minutes.

Status: Rolling back to [COMMIT_SHA / VERSION]
Last Update: [TIMESTAMP]

Follow-up: [STATUS_URL]
```

### Post-Rollback

```
[RESOLVED] Deployment Rollback Complete

The issue has been resolved and services are now restored.

What happened: [BRIEF SUMMARY]
Root cause: [BRIEF ROOT CAUSE]
Duration: [START_TIME] — [END_TIME]

Next steps:
- Root cause analysis underway
- Fix will be validated before next deployment
- ETA for production fix: [DATE/TIME]

Thank you for your patience.
```

---

## Rollback Decision Tree

```
Is the service completely down?
├─ YES → Immediate rollback to last good version
├─ NO → Is database integrity affected?
    ├─ YES → Restore from snapshot + code rollback
    ├─ NO → Is frontend broken?
        ├─ YES → Revert frontend build
        ├─ NO → Is API broken?
            ├─ YES → Revert API service
            ├─ NO → Assess impact; may not need full rollback
```

---

## Post-Rollback Tasks

- [ ] Run full smoke test suite
- [ ] Check error logs for new issues
- [ ] Verify all integrations (payments, email, webhooks)
- [ ] Confirm user reports of restored service
- [ ] Document what went wrong
- [ ] Schedule post-incident review meeting
- [ ] Create issue to fix root cause
- [ ] Update deployment procedures if needed

---

## Contacts & Escalation

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call Engineer | [NAME] | [PHONE] | [EMAIL] |
| Tech Lead | [NAME] | [PHONE] | [EMAIL] |
| VP Engineering | [NAME] | [PHONE] | [EMAIL] |

---

## Testing Rollback Procedures

**Monthly Rollback Drill:**

1. Pick a random old deployment
2. Follow rollback steps
3. Verify service is restored
4. Test main user workflows
5. Document any issues with the procedure
6. Revert back to current production

This ensures the rollback playbook stays up-to-date and the team is prepared.
