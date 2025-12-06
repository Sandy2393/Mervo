// Zendesk webhook receiver stub
// TODO: verify shared secret; ensure idempotency using event id.

export async function zendeskWebhookHandler(req: { headers: Record<string, string>; body: any }) {
  const ticketId = req.body?.ticket?.id || "unknown";
  // TODO: persist raw payload to external_webhooks table and map to internal ticket
  console.log("zendesk webhook", ticketId);
  return { statusCode: 200, body: { ok: true } };
}
