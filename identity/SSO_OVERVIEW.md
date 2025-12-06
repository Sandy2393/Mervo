# SSO Overview

## Supported Methods
- OAuth2: Google, Microsoft (Azure AD)
- SAML: placeholder IdP support (TODO: configure per customer)

## Identity Mapping
- External identity → `master_account_id` (primary key for user account)
- Store external IDs in `users.external_accounts` (see SQL table)
- Preserve `company_id` / `company_alias` for tenant scoping; `master_alias` for global identity

## JIT Provisioning
- On first successful SSO:
  - Create user_account if email domain allowed
  - Map external provider user_id → `user_account_id`
  - Assign default role (viewer) unless role mapping provided
  - Require email verification flag from IdP if available
- TODO: Add domain allowlist per company

## MFA Enforcement
- Prefer IdP-enforced MFA
- If IdP lacks MFA, require app-side MFA at login
- Step-up MFA for admin actions (role changes, exports)

## Session Guidance
- Short-lived tokens (15–60m); refresh token rotation
- Logout on role change or access review failure

## Admin Controls
- Per-company SSO enable/disable
- IdP metadata upload (SAML) placeholders
- Role mapping table for groups → roles
