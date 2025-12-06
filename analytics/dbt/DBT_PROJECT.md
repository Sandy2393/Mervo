# dbt Project Notes

Recommended models:
- staging: stg_events (from raw_events)
- dims: dim_users, dim_companies
- facts: fact_jobs
- marts: daily_company_metrics, retention_cohorts, funnel_job_completion

Conventions:
- Use seeds for reference data (regions, roles).
- Enable incremental models for large facts.
- Use dbt docs for catalog; align with data_catalog.yaml.
