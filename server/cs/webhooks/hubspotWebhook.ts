// HubSpot webhook receiver stub
// TODO: verify signature (HMAC) with secret; ensure idempotency using eventId.

export async function hubspotWebhookHandler(req: { headers: Record<string, string>; body: any }) {
  const eventId = req.body?.[0]?.eventId || "unknown";
  // TODO: persist raw payload to external_webhooks table
  console.log("hubspot webhook", eventId);
  return { statusCode: 200, body: { ok: true } };
}
