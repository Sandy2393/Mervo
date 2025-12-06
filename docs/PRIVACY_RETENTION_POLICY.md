# Privacy & Data Retention Policy

This policy sets expectations for storing and deleting user and company data in Mervo.

## Principles
- Data retention must respect `companies.retention_days` value.
- Personal data should be deleted/archived once retention period lapses, unless legal obligations require longer retention.
- Minimize PII collected; redact or anonymize logs where possible.

## Process
1. Before deletion, create an archival export (encrypted) and store in immutable backup bucket.
2. Run the `scripts/retention_cleanup.js` process to enumerate items and archive then delete.
3. Keep an audit record of deletions (who, what, when) stored in `audit_logs`.

## GDPR / Privacy
- For GDPR subject requests (erasure), provide an export and deletion flow for the data subject (requires server-side logic and confirmation).
- Maintain a Data Processing Agreement with service providers and ensure data residency compliance.

## Owner responsibilities
- Company owners must confirm retentionDays and approve deletion schedules where required.
