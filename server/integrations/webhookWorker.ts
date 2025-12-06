import crypto from "crypto";

export type Delivery = {
  id: string;
  url: string;
  payload: any;
  secret?: string;
  attempt_count: number;
  next_attempt?: Date;
  status: string;
};

// Placeholder queue
const queue: Delivery[] = [];

function signPayload(secret: string, body: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function deliver(d: Delivery) {
  const body = JSON.stringify(d.payload);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (d.secret) headers["X-Mervo-Signature"] = signPayload(d.secret, body);
  const fetchFn = (globalThis as any).fetch as typeof fetch;
  if (!fetchFn) throw new Error("fetch not available in runtime");
  const res = await fetchFn(d.url, { method: "POST", body, headers });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

export function backoff(attempt: number) {
  return Math.min(60000, Math.pow(2, attempt) * 1000);
}

export async function processNextDelivery() {
  const next = queue.shift();
  if (!next) return { processed: false };
  try {
    const result = await deliver(next);
    if (result.ok) {
      next.status = "delivered";
      return { processed: true, result };
    }
    next.attempt_count += 1;
    if (next.attempt_count >= 5) {
      next.status = "dead-letter";
      next.next_attempt = undefined;
      next.payload.last_response = result.text;
      return { processed: true, result };
    }
    const waitMs = backoff(next.attempt_count);
    next.next_attempt = new Date(Date.now() + waitMs);
    queue.push(next);
    return { processed: true, result };
  } catch (e: any) {
    next.attempt_count += 1;
    if (next.attempt_count >= 5) {
      next.status = "dead-letter";
      return { processed: true, error: e };
    }
    next.next_attempt = new Date(Date.now() + backoff(next.attempt_count));
    queue.push(next);
    return { processed: true, error: e };
  }
}

if (require.main === module) {
  if (process.argv.includes("--run-once")) {
    processNextDelivery().then((res) => console.log(res));
  }
}
