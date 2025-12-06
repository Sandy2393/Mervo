# Rollback Procedure (APP_ID)

## When to rollback
- Error rate >5% for 10+ minutes, auth failures, data corruption signs, or customer-impacting P1.

## Steps (app)
1) Owner: Release manager. Notify stakeholders.
2) Stop new deploys; freeze feature flags.
3) Redeploy previous stable artifact (tag: last-green) to production.
4) Invalidate CDN cache for affected paths; keep DNS stable unless misrouted.
5) Run smoke tests; confirm recovery.

## Steps (DB)
1) If schema change unsafe: disable risky feature flag immediately.
2) Restore: use latest snapshot/PITR to pre-deploy timestamp. Verify in read-only copy first.
3) Repoint app to restored DB if required. Monitor replication lag and errors.

## Storage/objects
- If wrong assets uploaded, restore from backup bucket snapshot; versioning on; validate checksums.

## Communication
- Post status page update; customer template: issue, impact, start time (UTC), mitigation, ETA.
- Internal comms: incident channel, assign incident commander and scribe.

## After rollback
- Open postmortem; fix forward only after root cause understood; add guards (tests/flags/alerts).
