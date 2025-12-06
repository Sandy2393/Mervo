-- dim_users table
CREATE OR REPLACE TABLE `${BIGQUERY_PROJECT_ID}.${DATASET_ANALYTICS}.dim_users` AS
SELECT
  user_id,
  TO_HEX(SHA256(CAST(user_id AS STRING))) AS master_alias_hash,
  MIN(event_timestamp) AS created_at,
  ANY_VALUE(role) AS role,
  MAX(event_timestamp) AS last_active_at,
  COUNT(DISTINCT company_id) AS company_count
FROM (
  SELECT user.user_id, company.company_id, event_timestamp,
    properties.role AS role
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
)
WHERE user_id IS NOT NULL
GROUP BY user_id;
