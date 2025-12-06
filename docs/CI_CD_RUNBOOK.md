# CI/CD Runbook

Pipeline: GitHub Actions workflow `.github/workflows/deploy_pipeline.yml` + deploy scripts in `infra/deploy/`.

## Branches
- `main`: triggers build/test/deploy stages.
- Feature branches: run tests/build but skip deploy unless explicitly allowed.

## Jobs (expected)
- Test: run `npm test` / `npm run type-check`.
- Build: `npm run build` for frontend; ensure server code compiles if included.
- Deploy Backend (Cloud Run): `infra/deploy/cloud_run_deploy.sh` with `--confirm` to apply; defaults to dry-run.
- Deploy Frontend (Vercel): `infra/deploy/frontend_deploy.sh` with `--confirm` to apply; defaults to dry-run.

## Safety Flags
- Deploy scripts require `--confirm` for live changes. Without it, scripts log intended actions.
- Set required secrets in Actions: `GCP_PROJECT`, `GCP_REGION`, `SERVICE_NAME`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LIVE` (for usage export).

## Manual Steps
- For billing exports, run script as documented in `docs/BILLING_RUNBOOK.md`.
- For migrations, run DB migration step prior to deploy if schema changed.

## Rollbacks
- Frontend: redeploy previous Vercel build or set `VERCEL_GIT_COMMIT_SHA` to prior commit and rerun deploy.
- Backend: deploy previous container image (`gcloud run deploy --image gcr.io/PROJECT/IMAGE:TAG`).
- Toggle traffic split in Cloud Run to shift back to prior revision if needed.

## Observability
- Ensure build artifacts and deploy logs are stored in Actions logs and GCP/Vercel dashboards.
- Add alerts on failed workflows; require green tests before deploy.
