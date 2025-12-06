# Backup and Restore

## Backups
- Supabase PITR enabled; retains 7–30 days (configure per plan).
- Daily full DB snapshot; weekly verification restore test.
- Storage: daily bucket snapshots; retain 30 days; versioning on critical buckets.

## Manual Backup
- DB: `supabase db dump --file backup_<date>.sql` (placeholder)
- Storage: export bucket to cold storage (TODO: command)

## Automated Schedule
- Cron/Cloud Scheduler triggers Supabase backup tasks daily 02:00 UTC.
- Snapshot lifecycle: keep 7 daily, 4 weekly, 3 monthly.

## Restore Procedure (Test)
1) Create staging DB from snapshot.
2) Run migrations; validate schema checksum.
3) Run smoke tests.
4) Document duration and issues.

## Restore Procedure (Prod DR)
1) Identify snapshot closest to outage (<= RPO)
2) Restore to replica; validate integrity.
3) Redirect app to restored DB; enable read-only until validated.

## TODO
- TODO: Add scripted verification queries.
- TODO: Add checksum for storage objects where applicable.
