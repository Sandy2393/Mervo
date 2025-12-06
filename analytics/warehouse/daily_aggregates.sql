-- daily_company_metrics aggregate
CREATE OR REPLACE TABLE `${BIGQUERY_PROJECT_ID}.${DATASET_ANALYTICS}.daily_company_metrics` AS
WITH base AS (
  SELECT
    DATE(event_timestamp) AS dt,
    company.company_id AS company_id,
    event_type,
    properties
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
)
SELECT
  dt AS date,
  company_id,
  SUM(event_type = 'user.created') AS new_users,
  SUM(event_type = 'contractor.login') AS active_contractors,
  SUM(event_type = 'job.created') AS jobs_created,
  SUM(event_type = 'job.completed') AS jobs_completed,
  SUM(event_type = 'photo.uploaded') AS photos_uploaded,
  SUM(CASE WHEN event_type = 'payment.succeeded' THEN COALESCE(properties.amount_cents, 0) ELSE 0 END) AS revenue_cents,
  SUM(CASE WHEN event_type = 'payout.processed' THEN COALESCE(properties.amount_cents, 0) ELSE 0 END) AS payouts_cents
FROM base
GROUP BY date, company_id;
