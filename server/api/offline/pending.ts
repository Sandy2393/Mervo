import { queueInspector } from "../../offline/queueInspector";

function ensureSuperAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role && ["superadmin", "super_admin"].includes(String(role))) return;
  throw Object.assign(new Error("Superadmin required"), { status: 403 });
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

export default async function handler(req: any, res: any) {
  try {
    ensureSuperAdmin(req);
  } catch (err: any) {
    return res.status(err?.status || 403).json({ error: err?.message || "Forbidden" });
  }

  if (req.method === "GET") {
    const company_id = req.query?.company_id;
    const pending = queueInspector.listPendingSyncs(company_id);
    return res.status(200).json({ pending, metrics: queueInspector.metrics() });
  }
  if (req.method === "POST") {
    try {
      const body = await readJson(req);
      if (body.action === "reprocess" && body.item_id) {
        const item = queueInspector.reprocessItem(body.item_id);
        return res.status(200).json(item);
      }
      if (body.action === "resolve" && body.item_id) {
        const item = queueInspector.markResolved(body.item_id);
        return res.status(200).json(item);
      }
      return res.status(400).json({ error: "Invalid action" });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Server error" });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
