# SLOs and Alerting

## Key Services & Endpoints
- Auth: `/v2/auth/token`
- Jobs list: `/v2/jobs`
- Clock-in: `/v2/jobs/{id}/clock-in`
- Report submit: `/v2/jobs/{id}/report`
- Uploads: `/storage/uploads`

## SLO Targets (rolling 30 days)
- Availability: **99.9%** (error budget: 43m 12s/month)
- Success rate (non-4xx): **99.5%**
- Latency: **P95 < 500ms**, **P99 < 1200ms** for core APIs
- Upload success: **99.2%**; P95 upload time < 3s

## Error Budget Policy
- If burn > 25% in a week → freeze new feature deploys, prioritize reliability work.
- If burn > 50% in a week → stop feature deploys, rollback risky changes, incident review.

## Alert Thresholds (examples)
- **Page (P1/P2):** Availability < 99% over 30m; P95 latency > 900ms over 15m; 5xx rate > 2% over 15m; auth failures spike 3x baseline.
- **Pager (P2/P3):** Upload failure rate > 3% over 30m; queue depth > 5x baseline for 30m; DB connections > 80% for 15m.
- **Notify (Slack/email):** Daily error budget burn > 5%; job creation drop > 30% day-over-day; cron ingestion lag > 15m.

## Runbooks (references)
- Rollback: `handover/release/ROLLBACK_PLAN.md`
- Smoke tests: `qa/SMOKE_TEST_SCRIPT.sh`
- Deployment/tagging: `handover/release/tag_and_release.sh`
- Feedback triage: `src/pages/admin/FeedbackDashboard.tsx` (admin view)

## Metrics to Capture
- Availability: `uptime_percentage` per service
- Latency: histogram for core endpoints; P50/P95/P99
- Errors: 4xx/5xx split, auth failures, upload failures
- Infra: DB connections, CPU/mem, queue depth, storage latency
- Business: jobs created/completed, active contractors, uploads per job

## Alert Routing
- P1: Page on-call (PagerDuty placeholder), Slack `#incidents`
- P2: Page on-call, Slack `#incidents`, email leadership
- P3: Slack `#eng` + ticket
- P4: Email digest

## TODOs
- TODO: Wire real alert rules in monitoring stack (Grafana/Cloud Monitoring).
- TODO: Define on-call rotation contacts and phone numbers.
