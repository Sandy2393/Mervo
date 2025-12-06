# Handover Readme

Welcome to the Mervo handover bundle. This document points you to every artifact you need to run, support, and extend the platform.

## Where to Start
- Release assets: `handover/release/` (changelog, release notes template, rollback, tag script)
- Demo data: `demo/` (SQL seed, TS generator, uploads README)
- Support & maintenance: `support/` (support plan, maintenance schedule, onboarding emails)
- DevOps: `devops/` (repo handoff checklist, cleanup script, demo account creator)
- API docs: `api/` (OpenAPI spec, Postman collection)
- QA: `qa/` (client acceptance checklist, smoke script)
- Training: `training/` + `handover/*_TRAINING_SLIDES.md`
- Legal/Privacy: `LICENSE`, `handover/PRIVACY_STATEMENT_TEMPLATE.md`

## Running Quick Checks
1. Smoke test API: `BASE_URL=<url> TOKEN=<bearer> bash qa/SMOKE_TEST_SCRIPT.sh`
2. Demo data (non-prod only): `ts-node demo/generate_demo_data.ts --dry-run` then `--confirm`
3. Create demo auth users: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ./devops/create_demo_accounts.sh --confirm`

## Deploy & Release
- Tag and release: `handover/release/tag_and_release.sh --version X.Y.Z --dry-run`
- Rollback guide: `handover/release/ROLLBACK_PLAN.md`

## Known TODOs
- Replace placeholder secrets/URLs before production
- Fill "Unreleased" section of `CHANGELOG.md` when new work lands
- Complete legal review of `PRIVACY_STATEMENT_TEMPLATE.md`

For questions: support@mervo.app
