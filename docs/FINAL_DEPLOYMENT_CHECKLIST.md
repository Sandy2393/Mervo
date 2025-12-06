# Final Deployment Checklist — Pre-production

Before promoting to production, ensure the following:

- Run full test suite (unit, integration, E2E)
- Run `scripts/rls_verify.sql` and verify no missing policies
- Run `scripts/schema_diff_check.sh` to ensure schema in repo matches DB
- Backup production DB (scripts/db_backup.sh)
- Re-run smoke tests on staging and production URL
- Validate Sentry, monitoring, and alerting are active
- Rotate any deployment secrets and confirm CI has access
