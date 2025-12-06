# Alerting Rules Summary (APP_ID)

| Signal | Threshold | Route | Runbook |
| --- | --- | --- | --- |
| API error rate | >2% for 5m | Pager primary | launch/SMOKE_TESTS.md |
| p95 latency | >1.5x baseline for 10m | Pager primary | monitoring/DASHBOARD_FINAL_SPEC.md |
| DB connections | >80% pool for 5m | Pager secondary | launch/DB_MIGRATION_RUNBOOK.md |
| Queue backlog | >500 msgs or >15m age | Pager primary | monitoring/ON_CALL_PLAYBOOK.md |
| Auth failures | >1% login errors | Pager primary | monitoring/ON_CALL_PLAYBOOK.md |
| Billing spikes | >2x daily baseline | Slack finance | billing/BILLING_MONITOR_SCRIPT.sh |
| Storage egress | >50% above daily median | Pager secondary | monitoring/ON_CALL_PLAYBOOK.md |

Ensure alerts link to dashboards and owners.
