# Mervo Analytics Stack

## Components
- Tracking plan and schema in `analytics/tracking`.
- Ingestion: Pub/Sub consumer, batch uploader to GCS.
- Warehouse: raw/staging/facts/dims SQL (BigQuery-first, Redshift notes).
- BI: Metabase spec, Looker notes.
- Orchestration: Airflow DAG or Cloud Scheduler.
- Monitoring: data quality checks and runner.
- Governance: PII guidelines, catalog, access control.

## Local dev
- Use `analytics/sample/sample_events.ndjson` to test transforms.
- Scripts default to dry-run; use `--confirm` for actions.

## Infra recommendations
- BigQuery + GCS for storage; Airflow/Cloud Composer or dbt Cloud for transforms.
- Keep raw PII only short-term; tokenize before analytics use.
