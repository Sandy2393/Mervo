# API Rate Limiting

## Recommendations (per IP + per user)
- Login: 5/minute, burst 10; add CAPTCHA after 5 fails.
- Token refresh: 20/minute.
- Jobs fetch: 120/minute.
- Timesheets export: 10/minute.
- Photo upload: 30/minute per user; overall bucket write cap as needed.

## Enforcement Options
- Cloud Armor / API Gateway with rate rules (TODO configure).
- App-layer rate limiting (Redis/Upstash placeholder) with company_id + user_account_id keys.

## Notes
- Differentiate 4xx vs 5xx for enforcement.
- Maintain allowlist for backoffice IPs for admin exports.
- Log throttling events to audit_logs.
