# Webhooks Runbook

## Inspect issues
- Check `webhook_deliveries` for status and last_response
- View DeliveryLogs UI for manual retry
- Verify signature expectations with subscribers

## Re-deliver
- Use DeliveryLogs retry or `scripts/retry_deadletters.sh --confirm`

## Rotate secrets
- Generate new HMAC secret server-side (TODO: secure store)
- Notify subscribers; support dual-signing period if possible
- Update webhook_subscriptions.secret_hmac securely

## Complaint handling / GDPR
- Allow subscribers to disable/delete subscriptions
- Remove dead-letter payloads after retention window

## Hardening TODOs
- Rate limit webhook endpoints
- URL allowlist/validation before saving subscriptions
- Legal terms for third-party connectors
