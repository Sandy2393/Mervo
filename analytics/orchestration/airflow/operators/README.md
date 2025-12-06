# Airflow Operators

- Configure BigQuery connection (Conn ID: bigquery_default) with service account.
- Use `BigQueryInsertJobOperator` for SQL scripts in `analytics/warehouse`.
- Use `GCSToBigQueryOperator` for raw loads.
- Set DAG-level retries and email/slack alerts.
- Enable task-level `retries` for ingestion steps.
