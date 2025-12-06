# On-call Playbook — Mervo

## Incident severity
- P1 (Critical): Production outage affecting >50% users or core workflows (clock-in/out) — immediate response
- P2 (High): Partial outage or major degradation
- P3 (Medium): Non-critical failures affecting small subset
- P4 (Low): Cosmetic or minor issues

## First responder steps
1. Acknowledge the pager and create an Incident issue (use the template).
2. Triage and gather logs: Sentry, server logs, DB, queue backlog.
3. If P1: Trigger incident bridge, escalate to engineering leads and ops.
4. Execute mitigation (rollback, scale, disable feature) and apply temporary fixes.
5. Communicate status to stakeholders and document timeline.

## Escalation contacts
- On-call Engineer: @oncall (PagerDuty / Slack)
- Engineering Lead: @eng-lead
- Product Owner: product@example.com

## Postmortem
- Create incident report (use incident_postmortem.md template)
- Conduct RCA within 72 hours and list follow-up tasks
