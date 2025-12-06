# Deployment Guide — Cloud Run & Vercel (Mervo)

This document describes how to deploy Mervo to Google Cloud Run and Vercel with the required environment variables and secrets.

## Required Environment Variables

Client-side (Vite):
- VITE_SUPABASE_URL (client) — public Supabase URL
- VITE_SUPABASE_ANON_KEY (client) — Supabase anon key (public)

Server-side (store as platform secrets):
- SUPABASE_SERVICE_ROLE_KEY (server-only) — Supabase service role key for admin ops
- PAYMENT_PROVIDER_SECRET (server-only) — Stripe/PayPal secret for payouts and webhook verification
- GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET — for Google Drive / OAuth flows
- SLACK_WEBHOOK_URL — server webhook for posting to Slack
- SENTRY_DSN — Sentry DSN to enable monitoring
- VERCEL_TOKEN (CI) — for Vercel deploys
- GCP_SA_KEY (CI) — GCP service account JSON for Cloud Run deploys

> Never commit server secrets to source control. Use your cloud provider's secret manager or GitHub repository secrets.

## Deploy to Cloud Run (recommended for static container + server functions)

1. Build and push Docker image (example using gcloud in CI):

```bash
# configure service account in CI with GCP_SA_KEY
IMAGE=gcr.io/PROJECT_ID/mervo-frontend:latest
docker build -f docker/Dockerfile -t $IMAGE .
docker push $IMAGE
```

2. Deploy to Cloud Run:

```bash
gcloud run deploy mervo-frontend --image=$IMAGE --region=us-central1 --platform=managed --allow-unauthenticated
```

3. Configure environment variables in Cloud Run service environment or Secret Manager.

## Deploy to Vercel (optional)

1. Add project to Vercel dashboard and set VERCEL_TOKEN in GitHub secrets.
2. Push to `main` branch — the provided workflow will call `vercel --prod` if VERCEL_TOKEN is present.

## Webhook & Background jobs

- Webhook endpoints (e.g., `server/functions/webhooks/paymentWebhook.ts`) should be deployed to a serverless environment (Cloud Run or Vercel Serverless Functions) and protected by verifying provider signatures and using SUPABASE_SERVICE_ROLE_KEY for DB writes.

## CI / GitHub Actions

- `/.github/workflows/ci.yml` validates PRs.
- `/.github/workflows/deploy-cloudrun.yml` triggers Cloud Run deploy when `GCP_SA_KEY` is present and branch is `main`.
- `/.github/workflows/deploy-vercel.yml` triggers Vercel deployment when `VERCEL_TOKEN` is present.

## Monitoring & Rollouts

- Integrate Sentry by adding SENTRY_DSN to deployment. See `sentry-config.md` for details.

## GDPR / Data retention

- Respect `companies.retention_days` in bookkeeping and purging of financial records. Consider archiving old invoices rather than permanent deletion.

## Notes

- For robust production billing: implement server-side RPCs for payouts, invoice creation, pdf generation, and webhook handling using SUPABASE_SERVICE_ROLE_KEY.
- Ensure idempotency and transactional updates for payouts and invoice marking.
