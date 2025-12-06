import crypto from "crypto";
import { IncomingMessage, ServerResponse } from "http";

function verifySignature(body: string, signature: string, secret: string) {
  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return digest === signature;
}

export async function verifyHandler(req: IncomingMessage, res: ServerResponse) {
  // Echo challenge for subscription verification
  let raw = "";
  req.on("data", (c) => (raw += c.toString()));
  req.on("end", () => {
    try {
      const parsed = JSON.parse(raw || "{}");
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ challenge: parsed.challenge ?? "pong" }));
      res.end();
    } catch (e) {
      res.statusCode = 400;
      res.end("bad request");
    }
  });
}

export async function receiveHandler(req: IncomingMessage, res: ServerResponse) {
  // For testing inbound deliveries
  let raw = "";
  req.on("data", (c) => (raw += c.toString()));
  req.on("end", () => {
    const sig = req.headers["x-mervo-signature"] as string;
    const secret = process.env.WEBHOOK_TEST_SECRET || "test";
    const ok = sig ? verifySignature(raw, sig, secret) : false;
    res.statusCode = ok ? 200 : 401;
    res.end(ok ? "ok" : "invalid signature");
  });
}

// TODO: secure with service role / auth
export async function adminListHandler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ deliveries: [] }));
}
