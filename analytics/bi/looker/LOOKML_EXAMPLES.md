# LookML Examples

## Views
- raw_events_view: dimensions for event_type, event_timestamp, company_id, user_id, properties (json_extract).
- daily_company_metrics_view: date, company_id, jobs_created, jobs_completed, revenue_cents (measure: sum).
- fact_jobs_view: job_id, company_id, created_at, completed_at, status.
- dim_users_view: user_id, master_alias_hash, role, last_active_at.

## Explores
- explore: daily_company_metrics joined to dim_companies.
- explore: fact_jobs joined to dim_users and dim_companies.

## Measures/Dimensions
- Dimension: revenue (revenue_cents/100).
- Measure: completion_rate (completed / created).

## Notes
- Use persistent derived tables for heavy funnels/retention.
- Add access filters for company_id when embedding.
