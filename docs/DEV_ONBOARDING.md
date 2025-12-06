# Developer Onboarding — Mervo

Welcome! This document lists the steps for a new developer joining the project.

1. Access
   - Request GitHub repository access
   - Request access to Supabase project (owner/limited depending on role)

2. Local environment
   - Copy `.env.example` to `.env` and fill with local values
   - Install dependencies: `npm ci`
   - Start dev server: `npm run dev`

3. Database
   - Import `supabase_schema.sql` into local Supabase or Postgres instance
   - Seed sample data if available

4. Testing
   - Run unit tests: `npm test`
   - Run k6 load tests locally: `k6 run load/k6/config.js`

5. Secrets & CI
   - Use platform secret manager for service keys. Never commit secrets.
   - Check GitHub Actions for deploy credentials and CI checks

6. RLS & Security
   - Review `scripts/rls_verify.sql` to validate RLS policies

7. Common workflows
   - Feature branches, test locally, open PRs.

