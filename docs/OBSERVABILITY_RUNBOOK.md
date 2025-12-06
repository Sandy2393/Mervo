# Observability Runbook — Mervo

This runbook describes logging, alerting, and monitoring practices.

## Logging
- Capture structured logs (JSON) with request id, user id (anonymized where possible), company_id, request path, status.
- Store logs in managed service (Cloud Logging, Datadog, or ELK) with retention policy (90 days for operational logs, 365 for audit logs if required by compliance).

## Traces & Metrics
- Instrument key endpoints with tracing spans (Sentry / OpenTelemetry)
- Track metrics: request rate, error rate, p95 latency, queue backlog (offline queue), failed sync count, ingestion rates for uploads

## Alerts & Thresholds
- High severity (P1): error rate > 5% sustained for 5 minutes or p95 latency > 1.5s for 5 minutes
- Medium severity (P2): error rate 1-5% or p95 latency 500ms-1500ms
- Low severity (P3): smaller spikes

## Runbook for common issues
### App returns 503 / high latency
1. Check recent deploys and rollbacks
2. Check Cloud Run / server logs for OOM or CPU throttling
3. Check DB connections usage and slow queries (pg_stat_activity)
4. Restart or scale service if needed

### Failed offline syncs / queue backlog
1. Check sync worker logs
2. Inspect failed items in offlineQueueService table (or Dexie debug store)
3. Retry or run manual reconcile via server backup

### Storage failures
1. Check storage permissions and bucket ACL
2. Verify signed URL creation flow (server-side)

## Retention & legal
- Audit logs retention = `companies.retention_days` (default 180) — ensure retention policy is enforced and archived before deletion.
