# Key Management

## Encryption
- In transit: TLS everywhere (Cloud Run, Supabase, storage).
- At rest: Supabase-managed encryption; storage buckets encrypted with provider-managed keys.

## Secret Storage
- Use GCP Secret Manager for API keys, DB creds, SSO secrets.
- No secrets in code or images; mount at runtime.

## Rotation
- Rotate API/DB keys quarterly or on compromise.
- SSO certificates/keys rotated per IdP policy; document expiry reminders.

## Access Control
- Least privilege IAM; separate roles for CI/CD vs ops.
- Audit access to secrets; log retrieval events.

## Backup & DR
- Secrets replicated across regions; test restore in DR drills.

## TODO
- TODO: Add key custodians list and break-glass procedure.
- TODO: Automate secret rotation workflows.
