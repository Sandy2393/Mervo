# On-Call Playbook (APP_ID)

## Rota
- Weekday primary/secondary; weekend rotations. Escalation via Pager/Slack.

## Severity
- P1: complete outage/data loss. Target ack: 5m, ETR: 30m.
- P2: major degradation. Ack: 10m, ETR: 1h.
- P3: partial feature impact. Ack: 1h.
- P4: cosmetic/questions. Ack: 1 business day.

## Escalation matrix
- Primary -> Secondary -> Eng manager -> VP Eng.
- For P1/P2, open incident channel, assign IC and scribe.

## Common incidents
- Auth failures: check IdP status, token service, clock skew; roll tokens if compromised.
- Storage outages: verify bucket/region health; switch to alternate region if configured; serve degraded mode.
- Delayed jobs: inspect queue backlog; scale workers; retry dead-letter with bounds.
- High error rate: check recent deploy; toggle kill-switch; roll back.

## Communications
- External: status page + customer email template with timeline, impact, mitigation, next update time (UTC).
- Internal: incident channel with updates every 15 minutes for P1.

## Hygiene
- Keep runbooks linked in alerts; ensure dashboards bookmarked; rotate on-call devices.
