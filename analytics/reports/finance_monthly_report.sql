-- Monthly finance report
WITH payments AS (
  SELECT DATE_TRUNC(event_timestamp, MONTH) AS month,
    SUM(CASE WHEN event_type = 'payment.succeeded' THEN COALESCE(properties.amount_cents,0) ELSE 0 END) AS revenue_cents,
    SUM(CASE WHEN event_type = 'refund.processed' THEN COALESCE(properties.amount_cents,0) ELSE 0 END) AS refunds_cents
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
  GROUP BY month
), payouts AS (
  SELECT DATE_TRUNC(event_timestamp, MONTH) AS month,
    SUM(CASE WHEN event_type = 'payout.processed' THEN COALESCE(properties.amount_cents,0) ELSE 0 END) AS payouts_cents
  FROM `${BIGQUERY_PROJECT_ID}.${DATASET_RAW}.raw_events`
  GROUP BY month
)
SELECT p.month,
  revenue_cents,
  payouts_cents,
  refunds_cents,
  revenue_cents - payouts_cents - refunds_cents AS net_cents
FROM payments p
LEFT JOIN payouts po ON p.month = po.month
ORDER BY p.month DESC;
