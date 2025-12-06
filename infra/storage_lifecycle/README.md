# Storage Lifecycle

## Principles
- Hot: recent uploads (<30d) in primary bucket
- Warm: 30–180d moved to cheaper tier
- Cold/Archive: >180d archive or delete per retention policy

## Supabase/GCS/S3
- Use bucket lifecycle rules: match prefix per company_alias or project
- Example: Move to cold after 60d; delete after retentionDays (company-specific)
- TODO: Enable cross-region replication if required by residency

## Steps
1) Define retentionDays per company
2) Generate policy JSON via `scripts/generate_lifecycle_policy.sh`
3) Apply in cloud console/CLI (guarded, requires credentials)

## Recommended
- Versioning off for large media unless required
- Limit public access; use signed URLs
- Periodic reports on aged objects
