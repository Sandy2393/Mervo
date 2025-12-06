# Security Audit Summary — Mervo

This document summarizes a high-level security review and recommended remediation actions for the Mervo app.

## Findings (prioritized)

1. RLS policies may be incomplete or permissive on some tables (e.g., audit_logs, invoices). Risk: cross-tenant data leaks.
2. Storage buckets may be publicly accessible — risk of data exfiltration for job photos or invoices.
3. Client-side operations performing sensitive writes (invoice creation, payout status updates) — risk of forgery and privilege escalation.
4. Service keys and provider secrets potentially used in client code or insufficiently protected in CI.
5. Missing server-side verification for webhooks and payment providers — risk of fraudulent events.
6. Background sync and uploads: large files may be stored in client memory and attempted upload without signed URL — risk of upload failures or data leak.

## Remediation Actions (high → low)

1. Enforce/validate RLS on all multi-tenant tables (companies, users, company_users, jobs, job_instances, timesheets, job_photos, invoices). Acceptance criteria: SQL check script (`scripts/rls_verify.sql`) runs with zero missing policies.
2. Audit storage bucket ACLs — ensure private buckets for PII and job photos. Acceptance: `scripts/check_public_buckets.sh` returns non-zero for public buckets.
3. Migrate privileged operations (invoice creation, marking paid, payouts) to server-side Edge Functions using SUPABASE_SERVICE_ROLE_KEY and add tests for endpoints. Acceptance: all client calls to sensitive operations are removed or replaced with RPC stubs documented in `docs/FINANCE_README.md`.
4. Ensure webhook verification server-side (verify signatures using provider secret). Acceptance: webhook stub verifies signatures and stores events only via server admin client.
5. Secrets policy: ensure `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_PROVIDER_SECRET`, `VERCEL_TOKEN`, `GCP_SA_KEY` are stored in CI/Platform secrets, with rotation policy documented.
6. Harden SW and background sync: do not persist long-lived auth tokens in SW, implement server-side signed upload URLs for media.

## Additional hardening

- Rate limiter on public endpoints (throttle auth attempts and public APIs).
- CSP and XSS protections in front-end templates; sanitize all user-generated content.
- Automated SCA and dependency update policy (e.g., Dependabot alerts) — add to CI.

## Acceptance criteria

- All tables have enforced RLS (see `scripts/rls_verify.sql` report).
- No storage bucket is publicly accessible (see `scripts/check_public_buckets.sh` run).
- Privileged operations are moved server-side or protected by role checks; unit and integration tests validate authorization.
- Webhook verification implemented and audited in staging environment.
- Secrets stored in platform secret manager; CI deploy workflows only run when secrets are present.
