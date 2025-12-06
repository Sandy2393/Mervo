# Maintenance Schedule

Regular maintenance tasks and expected downtime windows to keep the Mervo platform healthy, secure, and performant.

## Monthly Maintenance Tasks

### Week 1: Security & Compliance
- [ ] Review audit logs for suspicious activity
- [ ] Rotate API keys and secrets (if any exposed)
- [ ] Check for security advisories on dependencies
  ```bash
  npm audit
  ```
- [ ] Verify all RLS policies are functioning
- [ ] Review and update firewall rules if needed

**Estimated Time:** 2–3 hours
**Owner:** Security/DevOps Lead

---

### Week 2: Performance & Optimization
- [ ] Review application performance monitoring (APM) dashboards
- [ ] Analyze slow queries and optimize as needed
  ```sql
  -- Check slow query logs in Supabase
  SELECT * FROM slow_queries LIMIT 50;
  ```
- [ ] Review database indexes and query plans
- [ ] Clean up old logs and archived data
- [ ] Verify backup jobs completed successfully

**Estimated Time:** 3–4 hours
**Owner:** Database Administrator

---

### Week 3: Feature & Bug Review
- [ ] Review customer support tickets and identify patterns
- [ ] Prioritize bug fixes and new feature requests
- [ ] Plan next release (features, bugfixes, improvements)
- [ ] Update documentation if needed

**Estimated Time:** 2 hours
**Owner:** Product Manager / Tech Lead

---

### Week 4: Deployment & Testing
- [ ] Run full test suite
  ```bash
  npm run test
  npm run test:a11y
  ```
- [ ] Deploy minor fixes to production
- [ ] Verify all monitoring and alerting is active
- [ ] Conduct disaster recovery drill (monthly)
  ```bash
  # Run rollback simulation
  bash release/ROLLBACK_PLAN.md (manual steps)
  ```

**Estimated Time:** 4–5 hours
**Owner:** DevOps / QA

---

## Quarterly Tasks

- [ ] Full security audit (external or internal)
- [ ] Review and update runbooks
- [ ] Conduct load testing if expecting growth
- [ ] Review SLA metrics and incident reports
- [ ] Plan next quarter's infrastructure upgrades

---

## Scheduled Downtime Windows

### Database Maintenance
- **Frequency:** Monthly
- **Window:** First Sunday of the month, 2:00 AM – 4:00 AM UTC
- **Duration:** ~30 minutes (usually)
- **Impact:** Read-only mode; jobs cannot be created/updated
- **Action:** Advance notice in-app and via email 48 hours before

### Backup Restoration Test
- **Frequency:** Monthly
- **Window:** Third Sunday of the month, 1:00 AM – 3:00 AM UTC
- **Duration:** ~1 hour
- **Impact:** No production impact (test environment only)
- **Action:** No user notification needed

### Infrastructure Updates
- **Frequency:** Quarterly (as needed)
- **Window:** Coordinated with customer during change window
- **Duration:** 30 minutes – 2 hours
- **Impact:** Brief unavailability
- **Action:** 2-week advance notice + 48-hour reminder

---

## Change Freeze Policy

### Holiday Freeze
- **Period:** December 20 – January 2, July 1 – July 7
- **Rule:** No production deployments
- **Exceptions:** Security hotfixes only (with VP approval)

### Release Freeze
- **Period:** 48 hours before and after major releases
- [ **Rule:** Only urgent bugfixes deployed
- **Reason:** Stabilize after major changes

---

## Monitoring & Alerting

Ensure these alerts are active and monitored 24/7:

| Alert | Threshold | Action |
|-------|-----------|--------|
| Server Down | 5 min downtime | Page on-call engineer |
| Error Rate | >5% of requests | Alert support team |
| Database Latency | >2s avg query time | Review slow queries |
| Disk Usage | >80% | Alert DevOps, plan cleanup |
| Memory Usage | >85% | Alert DevOps, check for leaks |
| SSL Certificate | <30 days to expiry | Renew certificate |

---

## Backup & Disaster Recovery

### Backup Schedule
- **Full Database:** Daily at 2 AM UTC
- **Transaction Logs:** Every 6 hours
- **Storage Buckets:** Weekly on Sundays
- **Code Snapshots:** On every deployment

### Recovery Testing
- **Frequency:** Monthly (first Sunday)
- **Procedure:** Restore latest backup to staging, run smoke tests
- **Documentation:** Update recovery runbook with any findings

---

## Dependency Updates

### Security Patches
- **Frequency:** As released (critical patches within 24 hours)
- **Testing:** Run full test suite before deployment
- **Deployment:** Can be done immediately if tests pass

### Minor Updates
- **Frequency:** Monthly
- **Testing:** Run test suite, verify no breaking changes
- **Deployment:** Next scheduled release window

### Major Updates
- **Frequency:** Quarterly (planned)
- **Testing:** Extensive testing on staging environment
- **Deployment:** Scheduled release with customer notice

---

## Documentation Updates

Maintain up-to-date documentation:

- [ ] Update CHANGELOG.md after each deployment
- [ ] Update runbooks if procedures change
- [ ] Update training materials for new features
- [ ] Update API documentation if endpoints change

---

## Performance Baselines

Track these metrics monthly to identify trends:

```
Database Query Performance:
  Average: <100ms
  95th percentile: <500ms
  99th percentile: <2000ms

Frontend Load Time:
  First Contentful Paint: <2s
  Largest Contentful Paint: <4s

API Response Times:
  List Jobs: <200ms
  Create Job: <500ms
  Get Timesheets: <1000ms (if large dataset)

Error Rates:
  Target: <0.1% of requests
  Database errors: <0.01%
```

---

## Scheduled Deployments

**Deployment Schedule:** Wednesdays 2:00 PM UTC (subject to critical hotfixes)

**Pre-Deployment Checklist:**
- [ ] All tests passing (unit, integration, a11y)
- [ ] Code reviewed and approved
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Customer notification scheduled
- [ ] Rollback plan prepared

**Post-Deployment Checklist:**
- [ ] Smoke tests passing in production
- [ ] Error rates normal
- [ ] Performance metrics normal
- [ ] No critical bugs reported in first 2 hours
- [ ] Update status page

---

## Escalation Contact List

| Role | Name | Phone | Email | Availability |
|------|------|-------|-------|---|
| On-Call Engineer | [NAME] | [PHONE] | [EMAIL] | 24/7 (rotated weekly) |
| DevOps Lead | [NAME] | [PHONE] | [EMAIL] | Business hours + on-call |
| Tech Lead | [NAME] | [PHONE] | [EMAIL] | Business hours |
| VP Engineering | [NAME] | [PHONE] | [EMAIL] | Business hours + emergency |

---

## TODO Items

- TODO: Configure monitoring alerts in production (Sentry, DataDog, CloudWatch, etc.)
- TODO: Set up automated backup verification
- TODO: Document on-call rotation schedule
- TODO: Create status page (statuspage.io or similar)
- TODO: Set up notification channels (email, SMS, Slack)
- TODO: Schedule monthly maintenance meeting
