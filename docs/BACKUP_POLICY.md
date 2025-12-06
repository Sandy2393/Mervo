# Backup & Retention Policy

This document defines backup schedules and retention for the Mervo platform.

## Policy
- Full backups: weekly (Sunday), retain 90 days
- Incremental / WAL archiving: daily, retain 30 days
- Test a full restore monthly to verify backups are valid

## Storage
- Backups should be uploaded to an immutable, versioned storage bucket (GCS/AWS S3 with object lock if available).
- Access to backup storage must be restricted via IAM and rotated keys.

## Data deletion & retention
- Financial records should follow company-specific `retention_days` (see `companies.retention_days`) — implement soft-delete and archival before permanent removal.

## Responsibilities
- On-call engineer: verify backup logs and restore tests weekly
- DevOps: ensure backups are encrypted at rest and in transit

## Notes
- Do not store backups in the same cloud region as production in case of region-level outage; replicate to another region where possible.
