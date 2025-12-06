// Endpoint-style handler for contractor offline sync
// Accepts batch payload with idempotency keys to avoid duplicates

export async function offlineSyncHandler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = await readJson(req);
    // body: { items: [{ idempotency_key, type, payload, created_at }], actor: { user_id, company_id } }
    const results = body.items.map((item: any) => ({ key: item.idempotency_key, status: "accepted" }));
    // TODO: apply conflict resolution and persist
    return res.status(200).json({ results });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}

async function readJson(req: any) {
  const raw = await new Promise<string>((resolve, reject) => {
    let data = "";
    req.on("data", (c: any) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  return raw ? JSON.parse(raw) : {};
}
