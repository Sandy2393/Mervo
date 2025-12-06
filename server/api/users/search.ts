import { UserService } from "../../corporate/userService";
import { requireAdmin } from "../commonAuth";

const userService = new UserService();

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    await requireAdmin(req);
    const q = req.query?.q || "";
    const users = await userService.searchUsers(String(q));
    return res.status(200).json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
