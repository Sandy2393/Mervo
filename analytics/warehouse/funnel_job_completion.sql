-- Funnel: created -> assigned -> in_progress -> completed
WITH events AS (
  SELECT
    company.company_id AS company_id,
    properties.job_id AS job_id,
    event_type,
    event_timestamp
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
  WHERE event_type IN ('job.created','job.assigned','job.in_progress','job.completed')
), steps AS (
  SELECT job_id, company_id,
    MIN(CASE WHEN event_type = 'job.created' THEN event_timestamp END) AS created_at,
    MIN(CASE WHEN event_type = 'job.assigned' THEN event_timestamp END) AS assigned_at,
    MIN(CASE WHEN event_type = 'job.in_progress' THEN event_timestamp END) AS in_progress_at,
    MIN(CASE WHEN event_type = 'job.completed' THEN event_timestamp END) AS completed_at
  FROM events
  GROUP BY job_id, company_id
)
SELECT
  company_id,
  COUNTIF(created_at IS NOT NULL) AS created,
  COUNTIF(assigned_at IS NOT NULL) AS assigned,
  COUNTIF(in_progress_at IS NOT NULL) AS in_progress,
  COUNTIF(completed_at IS NOT NULL) AS completed,
  SAFE_DIVIDE(COUNTIF(assigned_at IS NOT NULL), COUNTIF(created_at IS NOT NULL)) AS created_to_assigned,
  SAFE_DIVIDE(COUNTIF(completed_at IS NOT NULL), COUNTIF(assigned_at IS NOT NULL)) AS assigned_to_completed
FROM steps
GROUP BY company_id;
