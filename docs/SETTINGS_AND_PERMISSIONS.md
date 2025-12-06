# Settings and Permissions

This control plane defines how company-wide settings, retention, and access control operate.

## Roles and permissions
- Core permissions: `job.add`, `job.assign`, `job.approve`, `workforce.manage`, `finance.view`, `settings.view`, `settings.edit`, `retention.preview`, `retention.execute`, `switch.company`.
- Default role map (editable via DB `role_permissions`):
  - owner/admin: all permissions
  - manager: job + workforce + settings.view + retention.preview
  - viewer: settings.view + finance.view
  - worker: job.approve only
- Server-side checks are authoritative: `permissionService.canPerform(userId, companyId, permission)` throws 403 when unauthorized. Client-side helper `src/lib/permissions/can.ts` is only for UX hiding.

## Company settings
- Stored in `company_settings`: retention durations (media/meta days), suffix strategy, timezone/currency, geofence defaults, notification quotas, billing contact, SSO placeholders.
- API: `GET/PATCH /api/settings/:company_id` guarded by `settings.view`/`settings.edit`.
- RLS examples live in `server/settings/rls_and_permissions_examples.sql` (company-scoped and admin-only updates).

## Typical setups
- Small teams: grant managers `job.*`, `workforce.manage`, `settings.view`; limit `settings.edit` to owner.
- Larger org: create custom roles in `role_permissions`, restrict `retention.execute` to compliance, and keep `switch.company` limited to master accounts.
- Finance-only users: assign `viewer` role with `finance.view` and no job permissions.

## Auditing and safety
- Switching companies logs an audit event (placeholder console in switcher service).
- Retention endpoints require `retention.execute` and `confirm=true` for destructive paths. Hard deletes should be paired with exports/backups before execution.
