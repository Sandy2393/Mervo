# Activity Logging Spec

## What to Log
- Auth events: login success/fail, SSO link/unlink, MFA challenges.
- Role/permission changes, company_user adds/removals.
- Data exports/downloads (reports, CSVs), admin actions.
- Job lifecycle changes, clock-in/out, upload failures.
- System events: backup status, DR drills, config changes.

## Fields
- timestamp, actor_user_account_id, company_id, action, target_type/id, metadata (jsonb), ip, user_agent.

## Retention
- Hot: 90 days searchable
- Warm/archive: 1 year minimum (export to cold storage)
- TODO: Configure lifecycle rules in storage bucket

## Alerting
- Alert on: repeated auth failures, role escalations, export spikes, SSO config changes, audit log gaps.
- Route P1/P2 to on-call; P3 to Slack/email.

## Access
- Read-only for auditors; RLS to enforce company scoping.
- Tamper-evident storage; consider append-only.

## TODO
- TODO: Implement audit_logs table and ingestion
- TODO: Add dashboards for audit log anomalies
