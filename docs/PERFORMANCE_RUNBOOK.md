# Performance Runbook

- Run k6 locally against staging/previews. Set `ALLOW_PERF_TARGET=true` only when approved.
- Thresholds: p95 < 800ms for job create; <1000ms for report gen.
- If thresholds breached: halt release, investigate backend perf, DB queries, caching.
