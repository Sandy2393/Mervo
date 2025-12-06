# Notifications Runbook (APP_ID)

- Providers: SendGrid (email), Twilio (SMS), FCM (push). Keys stored in secret manager (TODO: configure SENDGRID_API_KEY, TWILIO_SID, TWILIO_TOKEN, FCM_SERVER_KEY).
- Quotas: per-company daily quota placeholder; block sends when exceeded; log skipped attempts.
- Failover: swap adapters by channel; keep template rendering consistent.
- Inspect attempts: query `notification_attempts` by notification_id; track status/response/error.
- Webhooks: implement signature verification in `server/notifications/webhooks/deliveryWebhook.ts` and map provider statuses.
- Test send: use admin UI preview to send test; ensure confirmations before production campaigns.
