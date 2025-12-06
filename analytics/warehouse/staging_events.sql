-- Transform raw_events -> staging_events with basic typing and PII handling
CREATE OR REPLACE TABLE `${BIGQUERY_PROJECT_ID}.${DATASET_ANALYTICS}.staging_events` AS
SELECT
  event_id,
  event_type,
  event_timestamp,
  ingestion_timestamp,
  user.master_alias AS master_alias,
  user.user_id AS user_id,
  company.company_id,
  company.company_tag,
  context.page,
  context.path,
  context.app_version,
  context.device,
  -- TODO: tokenize PII fields; example hash for user_id
  TO_HEX(SHA256(user.user_id)) AS user_id_hash,
  properties
FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`;
