# Disaster Recovery Plan

## Objectives
- RTO: 60 minutes
- RPO: 15 minutes

## Backups
- Supabase PITR enabled; daily full snapshot.
- Storage snapshots daily; retain 30 days.
- Backup verification monthly.

## DR Playbook
1) Declare incident; assign incident commander.
2) Assess blast radius; check primary health and replica lag.
3) If primary down, promote replica (manual) and update DNS.
4) Redeploy Cloud Run pointing to promoted DB.
5) Run smoke tests (`qa/SMOKE_TEST_SCRIPT.sh`).
6) Communicate status to customers; update status page.
7) Post-incident: revert to primary when stable; reconcile data.

## Responsibilities
- Ops Lead: decision to fail over
- DBA/Eng Lead: promotion and schema validation
- Support Lead: customer comms

## Testing
- Quarterly DR drill; record RTO/RPO achieved.

## TODO
- TODO: Automate DNS failover steps
- TODO: Create checklist for data reconciliation post-failback
