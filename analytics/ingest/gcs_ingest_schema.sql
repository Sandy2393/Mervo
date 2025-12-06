-- External table over GCS raw NDJSON events (BigQuery)
-- TODO: set project/dataset/bucket
CREATE OR REPLACE EXTERNAL TABLE `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events_external`
OPTIONS (
  format = 'NEWLINE_DELIMITED_JSON',
  uris = ['gs://${GCS_BUCKET}/raw_events/ingestion_date=*/*.ndjson']
);
