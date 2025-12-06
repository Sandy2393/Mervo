# Billing Integration Notes

## GCP
- Enable Billing export to BigQuery or GCS bucket.
- Label resources with `company_tag`, `env`, `service`.
- Use `scripts/parse_gcp_billing.py` on exported CSV; schedule via cron/Action.
- TODO: Add BigQuery view to aggregate by label.

## AWS
- Enable Cost & Usage Report (CUR) to S3.
- Ensure tags include `company_tag`.
- Use `scripts/parse_aws_costs.py` for CSV.

## Mapping to company_id
- Prefer labels/tags; fallback heuristics on resource names.
- Store company_alias mapping table to resolve tags.

## Supabase
- TODO: Use admin APIs for storage/egress metrics per bucket.

## Security
- Billing buckets must be private; access via service account with least privilege.
- No secrets committed; use env/secret store in CI.
