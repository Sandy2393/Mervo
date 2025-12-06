# Offline Sync Runbook

Scope: contractor app queues clock events/photos/reports when offline; syncs later with idempotency keys.

Flow:
- Queue writes in IndexedDB with idempotency_key per action.
- On reconnect, batch POST to `/server/jobs/offlineSync` (see `server/jobs/offlineSync.ts`).
- Server processes items idempotently; returns per-item status.

Conflict handling:
- If an instance already has a newer state (e.g., clock-out exists), drop older item and log.
- Photos: keep latest per type (before/after) unless policy says otherwise.

Debugging:
- Check browser devtools Application -> IndexedDB.
- Server logs: audit entries for sync actions.
- Ensure time skew is handled server-side.
