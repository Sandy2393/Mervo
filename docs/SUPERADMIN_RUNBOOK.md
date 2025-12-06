# Super-admin Runbook

## Purpose
Operate platform-level controls: manage companies, contacts, storage, offline resilience, and audits.

## Access
- Require `superadmin` role header/token. All actions are audited into `audit_logs` (stub: console/in-memory).
- Masked contact info is shown by default; unmask only during ownership transfer with explicit audit entries.

## Common flows
- **List companies:** `/api/super-admin/companies` shows masked owners and status.
- **Suspend/reactivate:** `POST /api/super-admin/company/:id` with `{ action: "suspend" | "reactivate" }`. Triggers audit.
- **Temp password:** same endpoint with `{ action: "temp_password", user_email }`. Returns short-lived temp credential.
- **View details:** `/api/super-admin/company/:id` returns masked contact, storage, retention metadata.
- **Audit viewer:** `/super-admin/audit` filters by company/actor/action and exports CSV.
- **Storage manager:** `/super-admin/storage` displays usage and lets you queue cleanup/archival placeholders (require double-confirm in production).
- **Offline center:** `/super-admin/offline` shows pending offline sync items, retry/resolve buttons, and success metrics.
- **Pre-launch checks:** `/super-admin/prelaunch` runs integrationRunner and shows PASS/WARN/FAIL.

## Safety
- Destructive actions (cleanup, deletes) must enforce `confirm=true` and double-confirm UI prompts.
- Record an audit entry for every super-admin action with actor + target.
- When unlinking master-company associations, require email + 2FA verification (TODO in stubs).

## Incident tips
- Use Offline Center to retry failed contractor sync items with idempotency to avoid duplicates.
- Before suspending a company, export billing and storage data and notify the owner.
- Prior to hard retention sweeps, generate and store exports in cold storage.
