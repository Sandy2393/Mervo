-- Retention cohorts: day 0, day 7, day 30
WITH first_touch AS (
  SELECT company.company_id AS company_id, user.user_id AS user_id, MIN(DATE(event_timestamp)) AS day0
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
  GROUP BY company_id, user_id
), activity AS (
  SELECT company.company_id AS company_id, user.user_id AS user_id, DATE(event_timestamp) AS d
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
), joined AS (
  SELECT f.company_id, f.user_id, f.day0,
    MIN(CASE WHEN DATE_ADD(f.day0, INTERVAL 7 DAY) = a.d THEN 1 END) AS d7,
    MIN(CASE WHEN DATE_ADD(f.day0, INTERVAL 30 DAY) = a.d THEN 1 END) AS d30
  FROM first_touch f
  LEFT JOIN activity a ON f.company_id = a.company_id AND f.user_id = a.user_id
  GROUP BY f.company_id, f.user_id, f.day0
)
SELECT company_id, day0,
  COUNT(*) AS cohort_size,
  SUM(d7) AS retained_d7,
  SUM(d30) AS retained_d30,
  SAFE_DIVIDE(SUM(d7), COUNT(*)) AS d7_retention,
  SAFE_DIVIDE(SUM(d30), COUNT(*)) AS d30_retention
FROM joined
GROUP BY company_id, day0
ORDER BY day0 DESC;
