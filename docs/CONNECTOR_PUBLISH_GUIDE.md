# Connector Publish Guide

1) Build your connector using @app-id/connectors-sdk.
2) Create `manifest.json` with metadata, permissions, supported events.
3) Test locally with mock events and HMAC verification.
4) Run `scripts/publish_connector.sh --confirm path/to/connector` to package.
5) Submit package + manifest via PR for review; security review checks scopes, data handling, rate limits.
6) On approval, ops publishes to marketplace listing.

Notes:
- Secrets must be stored via server-side secret store (TODO: KMS integration).
- Provide DPIA/privacy summary for data flows.
- Include rollback/killswitch handling in your connector logic.
