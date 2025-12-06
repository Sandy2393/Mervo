# Dashboard Final Spec (APP_ID)

## Executive
- KPIs: signups/day, activated companies, revenue pace, NPS, uptime. Owner: Product lead. Retention: 90d.

## Ops
- Panels: API error rate, p95 latency, queue backlog, worker success rate, deployment frequency, incident count. Owner: SRE lead. Retention: 30d.

## Payments
- Panels: payout success %, failed payouts by code, Stripe/Supabase latency, retry counts. Owner: Payments lead. Retention: 60d.

## Security
- Panels: auth failures, admin actions, login anomalies, 2FA adoption, dependency vulns. Owner: Security lead. Retention: 90d.

Each panel: show threshold lines; link to related alerts; include annotation for deploys.
