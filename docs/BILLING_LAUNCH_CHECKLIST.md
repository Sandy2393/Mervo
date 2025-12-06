# Billing Launch Checklist

## Foundations
- Tax setup: VAT/GST rules, tax IDs collected where needed.
- Merchant onboarding: payment processor accounts active (TODO: provider names).
- Bank accounts verified; payouts tested with $1 test.
- Pricing & plans configured (Basic/Standard/Premium + add-ons).
- Refund policy published; trial policy defined.

## Invoicing
- Invoice template branded; includes tax lines.
- Usage metrics defined (storage/jobs/overages) and calculated monthly.
- Credit memo process documented (for SLA credits).
- Dunning emails configured with templates.

## Legal
- Update Terms of Service and Privacy with billing terms.
- Data Processing Agreement link provided.
- Country-specific notices prepared.

## Operations
- Support playbook for billing issues (failed payments, refunds, upgrades).
- Reconciliation process: daily payment vs ledger check.
- Reports: MRR/ARR, churn, LTV/CAC (TODO: data source).
- Access controls: limit who can change prices and issue credits.

## Testing
- Test cards and flows for signup, upgrade, downgrade, cancel.
- Edge cases: expired cards, insufficient funds, duplicate invoices.
- Emails: receipts, dunning, trial ending.

## TODO
- TODO: Add regional tax rates.
- TODO: Configure webhook endpoints for payment events.
