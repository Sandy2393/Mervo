# PII Guidelines

- PII fields: emails, phone numbers, names, addresses, IPs.
- Allowed only in raw_events; staging/facts must hash or drop unless explicit opt-in.
- Retention: remove PII from raw after configured days (TODO: set retention_days).
- DSAR: support lookup by master_alias; purge or anonymize on request.
- Tokenization: use SHA256 for user_id/master_alias before analytics consumption.
