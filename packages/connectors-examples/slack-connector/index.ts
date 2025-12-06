import { createHandler, httpPost } from "@app-id/connectors-sdk";

const handler = createHandler({
  async onEvent(event, payload) {
    // TODO: fetch secret webhook URL from secure store
    const url = process.env.SLACK_WEBHOOK_URL || "https://hooks.slack.com/services/TODO";
    const text = `Event ${event}: ${JSON.stringify(payload)}`;
    await httpPost(url, { text });
    return { ok: true };
  },
});

export default handler;
