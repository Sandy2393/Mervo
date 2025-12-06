# DB Migration Runbook (APP_ID)

## Principles
- Backward-compatible first: additive columns, nullable defaults, dual-write/dual-read during transitions.
- Blue-green: prepare new schema in shadow, switch via feature flag.
- Controlled windows: announce UTC window; keep changes minimal.
- Idempotent scripts: re-runnable without side effects.

## Process
1) Plan: define migration scope, risks, expected duration, owner.
2) Prep: take snapshot/PITR marker; confirm backups healthy; set connection pool limits to protect DB.
3) Dry-run: run migration on staging with prod-like data; measure time; capture logs.
4) Feature flag gating: hide new columns/paths behind flags; dual-write if needed.
5) Execute (T0):
   - `npm run db:migrate -- --confirm` (placeholder command; require `--confirm`).
   - Monitor locks, replication lag, error rate.
6) Verification: run smoke queries; ensure app reads/writes succeed; check migration metrics.
7) Rollback: if failure, revert app to previous build; restore from snapshot/PITR; drop partial objects if safe.
8) Post: document outcomes; clean up deprecated columns after read cutover and data backfill.

## Rollback strategies
- Small change: revert code path; disable feature flag.
- Large change: restore from snapshot; replay WAL to known-good time; communicate downtime if required.

## Testing migrations
- Use migrations repo; peer review required.
- Include down/rollback scripts when safe.
- Benchmark long-running queries; add indexes ahead of writes.
