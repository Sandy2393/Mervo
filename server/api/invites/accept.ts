import { InviteService } from "../../corporate/inviteService";

const inviteService = new InviteService();

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = await readJson(req);
    const accepted = await inviteService.acceptInvite(body.token, body.password, body.display_name);
    return res.status(200).json(accepted);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Invalid token" });
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
