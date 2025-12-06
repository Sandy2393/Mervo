# Threat Model (STRIDE)

## Scope
- Web/mobile apps, Supabase backend (DB, storage, auth), Cloud Run services.

## STRIDE Summary
- Spoofing: stolen tokens, SSO misuse → mitigations: MFA, nonce/state, short tokens, device alerts.
- Tampering: malicious payloads, SQLi → mitigations: parameterized queries, RLS, input validation.
- Repudiation: lack of logs → mitigations: audit_logs with IP/user_agent, immutable storage.
- Information Disclosure: bucket misconfig, IDOR → mitigations: RLS, signed URLs, authZ checks, least privilege.
- Denial of Service: brute force, flood → mitigations: rate limiting, CAPTCHA for auth, Cloud Armor.
- Elevation of Privilege: role escalation, SSO group mapping bugs → mitigations: approval workflows, audit, group-to-role validation.

## Attack Surface
- Auth endpoints, file uploads, webhooks, admin UIs, background jobs.

## Mitigations
- RLS per company_id/master_alias; feature flags; dependency scanning; CSP/HTTPS only; secure cookies.

## TODO
- TODO: Formal DFD diagram
- TODO: Pen-test cadence and findings tracker
