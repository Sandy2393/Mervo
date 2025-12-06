# SSO Technical Spec

## OAuth2 Flow (Google/Microsoft)
1) beginOAuthLogin(provider) → redirect to provider auth URL with state & nonce
2) IdP redirects back with code
3) Exchange code → tokens (access/id). Validate nonce, issuer, audience.
4) Extract subject/email; lookup `user_account_id` via `user_external_accounts`
5) If none, JIT create user (if domain allowed); store provider_user_id
6) Issue app session/refresh tokens; bind to `master_account_id`

## Storage of External IDs
- Table `user_external_accounts`: `user_account_id`, `provider`, `provider_user_id`, `metadata jsonb`, `created_at`
- Link to `users` via `user_account_id`
- Use `provider_user_id` as stable key; avoid email-only matching

## SAML (TODO)
- TODO: Add SP metadata generation and ACS endpoint
- TODO: Validate assertions, map NameID/attributes to `user_account_id`
- TODO: Support signed assertions, optional encrypted assertions
- TODO: IdP-initiated vs SP-initiated login handling

## JIT vs Manual Provisioning
- JIT: Fast onboarding; risk of unwanted accounts if domain not restricted → mitigate with domain allowlist and group mapping
- Manual: Admin pre-creates users and links IdP groups; safer for regulated tenants

## Security Considerations
- Enforce nonce/state validation, PKCE for OAuth
- Rotate signing keys; validate exp/nbf on tokens
- Step-up MFA for admin actions
- Log all SSO events to audit_logs (success/fail, provider, user, company_id)

## TODOs
- TODO: Implement SAML ACS endpoint and metadata download
- TODO: Add group-to-role mapping per company_id
- TODO: Add IdP certificate rotation process
