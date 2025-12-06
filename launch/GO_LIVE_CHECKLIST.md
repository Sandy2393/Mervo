# APP_ID Go-Live Checklist (APP_TAG)

## Pre-launch (T-7 to T-0)
- Owner: Launch lead. Dependencies: infra, security, QA signoffs.
- Infra readiness: regions chosen, autoscaling enabled, backups scheduled, RLS enforced, secrets stored in vault (TODO: confirm vault path), DR plan validated.
- Domain & TLS: DNS records staged with low TTL (300s), cert order prepared (ACME), OCSP stapling enabled, HSTS preloaded plan reviewed.
- DB: run dry-run migrations in staging; capture snapshot/PITR; confirm backward-compatible schema; verify connection pool limits.
- Feature flags: enable kill-switch for risky features; default to safe/readonly paths.
- Scale test: execute load/perf suite; ensure p95 < target; document capacity headroom.
- Monitoring/alerting: alerts armed (API error rate, DB pool, queue backlog, auth failures); on-call rota active.
- Smoke/acceptance: rehearse `monitoring/SMOKE_TEST_SCRIPT.sh` against staging; verify 0 failures.
- Rollback: rollback play rehearsed; images/artifacts tagged; DB restore tested in staging.

## Launch window (T0)
- Owner: Release manager. Dependencies: pre-launch complete, stakeholders ready.
- Freeze non-critical changes; announce launch window in UTC.
- Deploy: promote approved artifact to production; apply DB migrations with `--confirm` guard; monitor deploy health (5–10 minutes).
- DNS/TLS: switch records (A/AAAA/CNAME) to production endpoints; validate cert status and OCSP; confirm CDN cache policies (no-cache for auth, short TTL for API, longer for assets).
- Smoke tests: run core curls (health, auth, job create, clock-in, photo upload stub, report submit, admin reports); all must return expected status.
- Feature flags: gradually enable user-facing features; monitor error rate and latency.
- Communication: send internal green-light; keep status page ready.

## Post-launch (T0 + 0–48h)
- Owner: Ops lead. Dependencies: launch stable.
- Monitoring watch: heightened watch for 24–48h; track KPIs (signups, job completion rate, error rate, NPS proxy).
- Backups: verify backups succeeded post-migration; test restore smoke.
- Support: staff on-call + support queue; triage P1/P2 immediately.
- Security: re-verify RLS, access logs, admin actions; rotate any temporary credentials.
- Rollback criteria: sustained error rate >5% or p95 latency >1.5x baseline for >10 minutes; critical auth/storage outage; data corruption signals.
- Postmortem if rollback triggered; capture learnings and update runbooks.
