# Access Control

- Use service accounts for pipelines; grant BigQuery Data Editor on raw/staging datasets.
- Analysts: BigQuery Data Viewer on analytics dataset; no access to raw_events unless required.
- BI tool service accounts: read-only to analytics dataset; deny raw PII tables.
- Apply row-level security for customer-specific workspaces as needed.
- Rotate credentials; store in secret manager.
