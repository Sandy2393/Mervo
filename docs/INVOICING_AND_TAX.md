# Invoicing and Tax

## Invoice numbering
- Use company-specific sequential numbers (TODO: enforce unique per company in DB).

## Tax
- Percent-based placeholder per company (e.g., GST/HST/VAT). All amounts in cents.
- TODO: add jurisdiction detection and accountant-reviewed logic.

## Delivery
- Provide CSV/PDF (placeholder) exports; email sending not included (TODO).

## Exports
- Accounting CSV via `accountingCsv.ts` for bookkeepers.
