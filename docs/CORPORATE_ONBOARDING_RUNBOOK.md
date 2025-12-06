# Corporate Onboarding Runbook

Scope: onboarding owners/employees/contractors into a company with invites or CSV import.

## Prereqs
- Ensure RLS policies are applied (see `server/corporate/rls_policies_examples.sql`).
- Use service-role key server-side; never expose secrets to the client.

## Invite flow (recommended)
1. Admin opens Workforce -> Send Invite.
2. Fill email, role, expiry; sends via `inviteService.createInvite` (email send is placeholder `notificationService.sendNotification`).
3. Recipient clicks invite link with token -> `/api/invites/accept` handles token validation and user creation, then attach to company.
4. Audit every action (`audit_logs`).

## CSV bulk import
1. Prepare CSV columns: `email,role,company_alias,display_name(optional)` all lowercase.
2. Upload via Workforce CSV import -> preview validates email/role/alias and shows errors.
3. Commit only after preview passes. Import uses `CsvImportService.commitCsv` and logs to audit.

## Alias and naming
- `master_alias` (global) and `company_alias` (per-company) must be lowercase; enforce uniqueness per company.
- Avoid collisions by appending numeric suffix or domain.

## Role guidance
- Owner/Admin: full access including billing and role changes.
- Manager: edit users, view billing.
- Employee/Contractor: limited to own data; viewer: read-only.

## Deletion
- Use soft delete for users (`status=deleted`). Hard purge requires admin approval and `--confirm` flag in any destructive script.

## Troubleshooting
- Invite invalid/expired: resend new invite; old token stays expired.
- CSV errors: fix format, re-run preview, then commit.
- Scope errors: ensure company_id header/JWT claim is passed to APIs.
