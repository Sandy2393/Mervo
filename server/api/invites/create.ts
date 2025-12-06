import { InviteService } from "../../corporate/inviteService";
import { requireAdmin } from "../commonAuth";

const inviteService = new InviteService();

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await requireAdmin(req);
    const body = await readJson(req);
    const invite = await inviteService.createInvite(
      body.company_id,
      body.email,
      body.role,
      body.expires_at,
      req.user?.id || body.created_by,
    );
    return res.status(201).json(invite);
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
