-- Raw events table (BigQuery)
CREATE TABLE IF NOT EXISTS `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events` (
  event_id STRING,
  event_type STRING,
  event_timestamp TIMESTAMP,
  ingestion_timestamp TIMESTAMP,
  user RECORD<master_alias STRING, user_id STRING>,
  company RECORD<company_id STRING, company_tag STRING>,
  context RECORD<page STRING, path STRING, app_version STRING, device STRING>,
  properties JSON
)
PARTITION BY DATE(ingestion_timestamp)
CLUSTER BY company.company_id, event_type;

-- Deduplication note: use MERGE on event_id to avoid duplicates when loading.
