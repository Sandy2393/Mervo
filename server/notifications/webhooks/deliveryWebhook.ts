export interface WebhookRequest {
  headers: Record<string, string | string[]>;
  body: any;
}

export interface WebhookResponse {
  status: (code: number) => WebhookResponse;
  json: (body: any) => void;
}

export function handleDeliveryWebhook(req: WebhookRequest, res: WebhookResponse) {
  // TODO: verify signature from provider (SendGrid/Twilio/FCM) before trusting payload
  const events = Array.isArray(req.body) ? req.body : [req.body];
  // Placeholder: store delivery statuses
  const acknowledged = events.map((e) => ({ id: e.id || e.eventId || "unknown", status: e.event || e.status || "unknown" }));
  res.status(200).json({ received: acknowledged.length });
}
