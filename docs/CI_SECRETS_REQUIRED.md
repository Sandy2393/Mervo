# CI Secrets Required

- PREVIEW_TOKEN: deploy preview auth
- E2E_SERVICE_ACCOUNT: credentials for seeded data (if needed)
- K6_CLOUD_TOKEN: for k6 cloud runs (optional)
- SEMGREP_APP_TOKEN: for semgrep (optional)
- TEST_SERVICE_ACCOUNT_KEY: placeholder for integration env
Store in GitHub Actions secrets; never commit.
