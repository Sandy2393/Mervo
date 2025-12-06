# Dashboard Query Snippets

## Postgres
```sql
-- Signups per day
SELECT date_trunc('day', created_at) AS day, count(*) FROM users GROUP BY 1 ORDER BY 1;

-- Job completion rate
SELECT date_trunc('day', completed_at) AS day,
       count(*) FILTER (WHERE status='completed')::decimal / nullif(count(*),0) AS completion_rate
FROM jobs GROUP BY 1;
```

## BigQuery
```sql
-- Activated companies
SELECT DATE(created_at) AS day, COUNTIF(status='activated') AS activated FROM `app.companies` GROUP BY 1 ORDER BY 1;
```
