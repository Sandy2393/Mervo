# Security Summary (Executive)

- Identity: SSO (Google/Microsoft/SAML placeholder), MFA enforced for admins, role-based access with RLS per company.
- Data: Encryption in transit/at rest; keys in Secret Manager; audit logging for critical actions.
- Reliability: SLOs and alerting; DR plan (RTO 60m, RPO 15m); backups with PITR.
- Network: IP allowlists for admin, rate limits on auth/uploads; Cloud Armor/API Gateway placeholders.
- Governance: Quarterly access reviews, admin approval for role changes, audit exports.
- Compliance: SOC2-style controls documented; privacy template/DPA placeholders; pen-test and threat model checklist.

## TODO
- TODO: Finalize SAML integration and IdP metadata handling
- TODO: Complete pen-test and attach report
