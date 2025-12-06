-- Data quality checks

-- Null rates for required columns
SELECT 'raw_events' AS table, COUNTIF(event_id IS NULL) AS null_event_id FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`;

-- Duplicate event_id
SELECT event_id, COUNT(*) c FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events` GROUP BY event_id HAVING c > 1;

-- Late arriving events (event_timestamp more than 1 day older than ingestion)
SELECT COUNT(*) AS late_events FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events` WHERE event_timestamp < TIMESTAMP_SUB(ingestion_timestamp, INTERVAL 1 DAY);

-- Spike detection (z-score placeholder)
-- TODO: implement with window functions comparing daily counts
