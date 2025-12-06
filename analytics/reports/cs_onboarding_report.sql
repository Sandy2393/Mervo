-- CS Onboarding report
SELECT
  company.company_id,
  MAX(CASE WHEN event_type LIKE 'onboarding.%' THEN properties.stage END) AS current_stage,
  DATE_DIFF(CURRENT_DATE(), DATE(MIN(event_timestamp)), DAY) AS days_since_start,
  MAX(event_timestamp) AS last_activity,
  'unassigned' AS assigned_cs_owner -- TODO: join to owner table
FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
GROUP BY company.company_id;
