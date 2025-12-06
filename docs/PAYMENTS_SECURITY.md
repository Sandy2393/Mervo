# Payments Security

- Store STRIPE_SECRET_KEY, STRIPE_CONNECT_CLIENT_ID, STRIPE_WEBHOOK_SECRET in a secret manager; never commit.
- Money-moving endpoints must run server-side only.
- Enforce dry-run + confirm flags before calling provider APIs.
- Log raw webhooks to `payment_webhooks` for audit; protect logs with access controls.
- Do not handle card data directly; use Stripe Elements/Checkout client-side if needed (PCI scope).
- Rotate keys regularly; document key owners and rotation cadence.
- Add rate limiting and idempotency keys to provider calls (TODO in stripeConnectClient).
