import { runPrelaunchChecklist } from "../../tests/integrationRunner";

export default async function handler(req: any, res: any) {
  try {
    const result = await runPrelaunchChecklist();
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
