# Performance Profiling Notes

- Add DB indexes on columns frequently used in WHERE and JOIN clauses (e.g., job_instances.company_id, job_instances.status, timesheets.user_id)
- Use connection pooling for server functions; ensure max connections < DB limit.
- Cache common queries (e.g., dashboard metrics) in Redis or CDN for read-heavy endpoints.
- Serve static assets from CDN and enable compression/long cache headers.
- Profile with: pg_stat_activity, EXPLAIN ANALYZE for slow queries.
- Consider horizontal scaling for workers that process photo uploads and report exports.
