# Privacy Consent Flow

- Obtain explicit consent from companies before syncing PII to CRM/helpdesk.
- Record consent timestamp, scope (fields synced), and revocation path.
- Provide UI toggle to revoke; when revoked, stop outbound sync and delete third-party data where required (TODO policy mapping).
- Do not send end-user PII to third parties without consent.
- Webhooks should carry minimal data; store raw payloads securely.
