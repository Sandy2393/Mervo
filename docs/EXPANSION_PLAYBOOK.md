# Expansion Playbook (New Country)

## Checklist
- Legal: entity or reseller model, contracts localized, tax/VAT rules.
- Localization: language pack, date/number/currency formats, RTL check if needed.
- Payments: provider availability, local rails, currency support, FX fees.
- Data residency: region selection, backups, logs retention per law.
- Support: local hours coverage, escalation contacts, SLAs aligned to timezone.
- Pricing: regional pricing, purchasing power adjustments, tax handling.
- Compliance: privacy notices, subprocessors list, DPIA if needed.

## Steps
1) Market selection + legal review (2-4 weeks)
2) Enable region infra (read replica + storage bucket) — TODO: select cloud region
3) Localization pack rollout (strings + formats), QA with native reviewer
4) Payment rail testing with sample transactions
5) Support staffing and playbook localization
6) Pilot with 2-3 customers; monitor SLOs per-region
7) General availability with published pricing and SLAs

## Feature Gating
- Use feature flags by region and account tier.
- Gate enterprise features (SSO, dedicated infra) for Premium/Enterprise.

## Metrics
- Time to first job in new region
- Uptime and latency per region (P95 target <300ms)
- Conversion from pilot to paid
- Support response/resolution times locally

## TODO
- TODO: Add local legal counsel contacts per target country.
- TODO: Add currency tables and tax calculators.
