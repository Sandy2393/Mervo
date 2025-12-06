# Handover Checklist — Mervo

Deliver these items to the client before final acceptance:

## Access & Accounts
- Grant admin access to GitHub repo and branch protections
- Grant Supabase project owner access, export project credentials and DB backups
- Transfer domain and DNS entries with HTTPS/TLS

## Infrastructure & Secrets
- Rotate all service keys and ensure they are in secure secret manager (GCP Secret Manager / Vercel secrets)
- Provide instructions to rotate SUPABASE_SERVICE_ROLE_KEY and PAYMENT_PROVIDER_SECRET

## Operational Runbook
- Provide `docs/OBSERVABILITY_RUNBOOK.md`, `docs/DEPLOYMENT.md`, `docs/ONCALL_PLAYBOOK.md`
- Provide contact list, emergency access and billing contacts

## Data
- Provide final DB backup and access to archive locations
- Confirm retention policy and any special data-handing requirements

## Final checks
- Run smoke tests in production URL
- Verify RLS policies via `scripts/rls_verify.sql`
- Verify webhooks and payments in staging

## Handover artifacts
- Release notes, license, contributor guide, API docs, and runbooks
