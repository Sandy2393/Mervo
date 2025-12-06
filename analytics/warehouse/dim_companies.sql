-- dim_companies table
CREATE OR REPLACE TABLE `${BIGQUERY_PROJECT_ID}.${DATASET_ANALYTICS}.dim_companies` AS
SELECT
  company_id,
  ANY_VALUE(company_tag) AS company_tag,
  MIN(event_timestamp) AS created_at,
  'default' AS retention_policy,
  'unknown' AS region
FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
WHERE company.company_id IS NOT NULL
GROUP BY company_id;
