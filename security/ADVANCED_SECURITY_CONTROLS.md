# Advanced Security Controls

## Network Controls
- IP allowlists for admin endpoints; configurable per company_id.
- Cloud Armor/API Gateway placeholders for geo/IP rules.

## Device Trust
- Track device_id; allow/block lists for admin roles.
- Step-up MFA on new devices; email alert on new device login.
- TODO: Device posture checks (jailbreak/root detection) for mobile apps.

## Session Policies
- Short-lived access tokens; refresh rotation; revoke on role change.
- Idle timeout for admin sessions; absolute max session age.

## Admin Approval Workflows
- New admin creation requires existing admin approval.
- Role escalation requires two-person approval and audit_log entry.

## Password & MFA
- Enforce strong passwords where local auth used; NIST-aligned.
- Require MFA for admins; encourage IdP MFA for all.

## Data Controls
- RLS by company_id/company_alias; restrict cross-tenant queries.
- Export/download gating with audit logs.

## TODO
- TODO: Implement IP allowlist checks at API gateway.
- TODO: Add admin device approval UI.
