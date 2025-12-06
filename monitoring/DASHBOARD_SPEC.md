# Monitoring Dashboard Spec (Grafana/Looker)

## Overview
Single dashboard for SLOs, latency, errors, uploads, and business health. Targets: reduce MTTR, watch burn rate, and catch regressions.

## Panels (suggested)
- **API Availability (SLO)**: uptime % by service (auth, api, uploads). Alert if <99% over 30m.
- **Latency P50/P95/P99**: per endpoint (auth token, jobs list, clock-in, report submit). Alert if P95 > 900ms 15m.
- **Error Rate**: 4xx vs 5xx split; highlight auth errors and upload errors separately.
- **Upload Failures**: count and rate; panel for photo upload duration P95.
- **DB Connections & CPU**: active connections, CPU %, memory, swap; alert at >80%.
- **Queue Depth (offline jobs)**: jobs waiting; alert if >5x baseline for 15m.
- **Background Jobs**: retention job successes/failures; duration P95.
- **Storage Growth**: bucket size over time; forecast 30 days.
- **Business Pulse**: jobs created/completed per day, active contractors, MAU/DAU.
- **Burn Rate**: error budget burn (1h, 6h windows) for availability and latency.

## Example Queries (pseudocode)
- Availability: `sum(rate(http_requests_total{status!~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`
- Latency: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{route="/v2/jobs"}[5m])) by (le))`
- Errors: `sum(rate(http_requests_total{status=~"5.."}[5m]))`
- Upload failures: `sum(rate(upload_failures_total[5m]))`
- Queue depth: `queue_depth{queue="offline-jobs"}`
- DB connections: `db_connections_active`

## Alert Examples
- P1: Availability <99% 30m OR 5xx rate >2% 15m.
- P2: P95 latency >900ms 15m OR queue depth >5x baseline 30m.
- P3: Upload failure rate >3% 30m OR storage growth >10% day-over-day.

## Annotations
- Releases: tag from `tag_and_release.sh`
- Incidents: auto from incident management tool

## Ownership
- Dashboard owner: Ops Lead
- Backup: Eng Lead

## TODO
- TODO: Implement queries in chosen monitoring stack.
- TODO: Set alert channels (PagerDuty/Slack/email placeholders).
