// Replay stored webhook payloads for debugging
// Expected env: API_BASE, EVENT_ID
// TODO: connect to payment_webhooks table to fetch payload by id

const API_BASE = process.env.API_BASE || "http://localhost:3000/api/payments/webhooks";
const EVENT_ID = process.env.EVENT_ID;

if (!EVENT_ID) {
  console.error("Set EVENT_ID to replay");
  process.exit(1);
}

async function main() {
  // TODO: fetch from DB; placeholder reads local file or mock
  const payload = { id: EVENT_ID, type: "payment_intent.succeeded", data: { object: { id: "pi_placeholder" } } };
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log(await res.text());
}

main();
