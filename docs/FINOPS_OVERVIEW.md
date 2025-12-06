# FinOps Overview

## Purpose & Scope
Provide cost visibility, budgeting, and usage governance across Mervo (Supabase + Cloud Run + storage). Applies to all environments; production prioritized.

## Ownership
- FinOps Lead (Eng/Ops) owns process and tooling
- Support: Data/Analytics for reporting; Product for budget alignment

## Cadence
- Daily: ingest billing/export, check budget thresholds, alert on anomalies
- Weekly: review top cost drivers, storage growth, egress trends; land quick wins
- Monthly: forecast next 3 months, true-up budgets, review vendor discounts
- Quarterly: negotiate commitments, revisit thresholds, DR/backup cost review

## Process (loop)
1) Collect usage (storage, egress, invocations, jobs) per company
2) Allocate costs via labels/tags; generate dashboards
3) Alert on budget overrun risk; enforce caps where needed
4) Recommend optimizations; track actions to completion
5) Report to stakeholders (engineering, product, finance)

## Data Sources
- Cloud Billing exports (CSV/BigQuery) — TODO wire exports
- Supabase usage (storage bytes, bandwidth) — TODO fetch via admin API
- App usage metrics (jobs, uploads) via `usageService`
