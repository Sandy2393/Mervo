# 6-Quarter Roadmap

## Q1: Stability & RLS
- Harden RLS policies; audit logging
- Error budget reset; perf wins on job list
- Basic feedback capture in-app

## Q2: Payments & Payroll
- Payout reconciliation, payroll export
- Payment provider redundancy
- SLA-backed support tooling

## Q3: PWA & Offline Polish
- Offline forms, retry queue visibility
- Image upload resiliency; background sync
- Mobile nav refinements

## Q4: Integrations
- Payroll integrations (ADP, Gusto placeholder)
- Calendar/webhook integrations for jobs
- Postman/OpenAPI polish + SDK draft

## Q5: Enterprise Features
- SSO/SAML, RBAC per company
- Audit export, data residency controls
- Fine-grained feature flags

## Q6: Internationalization & Scale
- Multi-region read replicas; latency <300ms P95 per region
- Localization packs (top 3 locales)
- Tax/vat support, regional pricing

## Notes
- Each quarter: reserve 20% capacity for reliability and security.
- Releases: monthly trains; feature flags for gradual rollouts.
