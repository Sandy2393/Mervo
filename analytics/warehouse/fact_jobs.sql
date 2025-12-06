-- fact_jobs table
CREATE OR REPLACE TABLE `${BIGQUERY_PROJECT_ID}.${DATASET_ANALYTICS}.fact_jobs` AS
SELECT
  job_id,
  company_id,
  created_at,
  scheduled_for,
  assigned_to,
  completed_at,
  payment_amount_cents,
  status
FROM (
  -- TODO: replace with real source tables
  SELECT
    properties.job_id AS job_id,
    company.company_id AS company_id,
    TIMESTAMP(event_timestamp) AS created_at,
    NULL AS scheduled_for,
    properties.assignee_id AS assigned_to,
    NULL AS completed_at,
    NULL AS payment_amount_cents,
    'created' AS status
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
  WHERE event_type = 'job.created'
);
