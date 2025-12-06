# Audit Controls (SOC2-style)

## Access Control
- Enforce RLS per company_id/master_alias; least privilege roles.
- MFA required for admins; SSO preferred.
- TODO: Quarterly access review report export.

## Change Management
- Git-based change control; PR reviews; release tagging (`tag_and_release.sh`).
- Rollback plan: `handover/release/ROLLBACK_PLAN.md`.

## Logging & Monitoring
- Audit logs for auth events, role changes, data exports, SSO links.
- Store logs immutably with retention 1 year minimum. TODO: enable log sinks.

## Backups & DR
- Supabase PITR; daily storage snapshots; DR plan documented.

## Vendor Management
- Track subprocessors; annual security review; TODO: vendor risk register.

## Availability & Performance
- SLOs in `docs/SLO_AND_ALERTING.md`; monitor burn rates.

## Data Integrity
- Input validation; checksum for uploads; background reconciliations.

## Incident Response
- On-call, paging rules, postmortems within 5 business days.

## Physical/Infrastructure
- Rely on cloud provider controls; align with ISO 27001/SOC2 reports.

## TODO
- TODO: Map controls to evidence store; assign owners and review cadence.
