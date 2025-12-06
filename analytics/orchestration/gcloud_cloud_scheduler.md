# Cloud Scheduler Alternative

- If not using Airflow, schedule Cloud Run/Functions to:
  - load raw events daily
  - run transforms (trigger dbt/SQL runner)
  - refresh BI extracts
- Use Cloud Scheduler cron with auth header to trigger secure endpoints.
- Keep idempotent endpoints; guard with `--confirm` for destructive tasks.
