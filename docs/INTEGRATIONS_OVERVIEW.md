# Integrations Overview

- Webhooks with HMAC signing, retries, backoff, dead-letter handling.
- Connectors installed per company; secrets stored server-side (TODO: KMS/Secret Manager).
- Marketplace lets owners install/disable connectors and manage permissions.
- Audit logs: install/uninstall, secret updates, retries, kill-switch.
- Delivery worker processes `webhook_deliveries` with exponential backoff.
- Adapter pattern: connectors can run as Edge Functions or external services.
