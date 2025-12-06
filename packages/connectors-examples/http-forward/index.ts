import { createHandler, sign, httpPost } from "@app-id/connectors-sdk";

const handler = createHandler({
  async onEvent(_event, payload) {
    const target = process.env.FORWARD_URL || "https://example.com/webhook";
    const secret = process.env.FORWARD_SECRET || "test";
    const body = JSON.stringify(payload);
    const signature = sign(body, secret);
    await httpPost(target, payload, { "X-Mervo-Signature": signature });
    return { ok: true };
  },
});

export default handler;
