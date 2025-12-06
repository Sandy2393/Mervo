# Post-Launch Operations

## Overview
Post-launch goal: keep Mervo stable, secure, and growing. Focus on availability, latency, data integrity, and user trust.

## Roles & Owners
- **Ops Lead**: owns uptime, incident response, runbooks.
- **Eng Lead**: owns reliability roadmap, migrations, perf tuning.
- **Support Lead**: owns customer comms, ticket triage, SLAs.
- **Product Manager**: owns prioritization of fixes vs. features.
- **Data/Analytics**: owns KPI instrumentation and reporting.

## Weekly Cadence
- **Mon**: Review prior week incidents, SLO burn-down, error budget status.
- **Tue**: Ops/Eng sync on migrations, perf work, and rollout plan.
- **Wed**: Deploy window + automated smoke + rollback readiness check.
- **Thu**: Support ticket review; top 5 issues + mitigations.
- **Fri**: KPI review (MAU/DAU/jobs), support trends, plan next week.
- **Biweekly**: Security/backup drill, restore test, rollback drill.

## KPIs to Track
- Availability (API, auth, uploads) vs. SLO.
- P95 latency (login, job fetch, clock-in, report submit).
- Error rate (% 4xx/5xx), upload failure rate.
- Jobs created/completed per week; avg completion time.
- DAU/WAU/MAU; retention by cohort; churn.
- Support: time to first response, time to resolve, top incident causes.

## Escalation Path
1) On-call engineer (primary)
2) Eng Lead
3) CTO / VP Eng
4) Incident commander declares severity and coordinates comms

## Meetings & Rituals
- Incident review (30 min weekly): top incidents, actions, owners.
- Release review (weekly): go/no-go for next window, rollback readiness.
- Reliability planning (monthly): budget allocations, SLO updates.
- Support + Product sync (weekly): top issues → backlog intake.

## Ownership Matrix (RACI)
- SLO definitions: R=Eng Lead, A=CTO, C=Ops Lead, I=Support
- Incident response: R=On-call, A=Ops Lead, C=Eng Lead, I=Product
- Deploy/rollback: R=On-call, A=Eng Lead, C=Ops Lead, I=Support
- Backups/restores: R=Ops, A=Ops Lead, C=Eng Lead, I=Product
- KPI reporting: R=Data, A=Product, C=Eng Lead, I=Support

## Tooling & Sources of Truth
- Monitoring (Grafana/Looker): SLOs, burn rates, latency, errors
- Alerting: Pager (P1/P2), Slack (P3), Email (P4)
- Runbooks: `handover/` and `docs/` directory
- Incident tickets: JIRA/Linear (placeholder)

## Action Items
- TODO: Configure actual dashboards and alert routes in chosen stack.
- TODO: Define on-call rotation calendar and escalation phone numbers.
