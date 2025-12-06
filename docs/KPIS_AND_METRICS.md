# KPIs and Metrics

## Core KPIs
- MAU / DAU / WAU
- Jobs created per week; jobs completed per week
- Avg job completion time; abandonment rate
- Upload success rate; avg photos per job
- Retention by cohort (weekly, monthly)
- Churn rate (logo and revenue)
- Storage growth (GB/week)
- Support: time to first response, time to resolve

## Instrumentation Points
- Track events: login, job create, job assign, clock-in, clock-out, report submit, upload success/fail, rating submit.
- Add tracing/metrics around: API latency (P50/P95/P99), 4xx/5xx, queue depth.
- Client: capture offline queue length and retry counts (no PII).
- Admin: exports/downloads, dashboard loads.

## Analytics Suggestions
- Use event schema with company_id/user_id and timestamp (no secrets).
- Aggregate daily/weekly for cohorts.
- Build retention: first job date vs. returning jobs per week.

## Targets (initial)
- DAU/MAU > 30%
- Upload success > 99.2%
- P95 latency < 500ms (core APIs)
- Churn < 3% monthly

## TODO
- TODO: Wire events to analytics provider (placeholder).
- TODO: Define dashboards for exec vs. ops audiences.
