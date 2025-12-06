import { v4 as uuid } from "uuid";

interface MasterCompanyLink {
  master_user_id: string;
  company_id: string;
  linked_at: string;
}

const links: MasterCompanyLink[] = [];

export interface SwitchResult {
  company_id: string;
  session_hint: string;
  expires_at: string;
}

export function linkMasterToCompany(master_user_id: string, company_id: string) {
  const existing = links.find((l) => l.master_user_id === master_user_id && l.company_id === company_id);
  if (!existing) links.push({ master_user_id, company_id, linked_at: new Date().toISOString() });
}

export function listLinkedCompanies(master_user_id: string): MasterCompanyLink[] {
  return links.filter((l) => l.master_user_id === master_user_id);
}

export async function switchCompanyContext(masterUserId: string, targetCompanyId: string): Promise<SwitchResult> {
  const linked = links.find((l) => l.master_user_id === masterUserId && l.company_id === targetCompanyId);
  if (!linked) {
    throw Object.assign(new Error("Not linked to company"), { status: 403 });
  }
  // Placeholder: issue short-lived session hint/token scoped to company_id
  const session_hint = `edge-${uuid()}`;
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  console.log("[audit] company switch", { masterUserId, targetCompanyId, session_hint });
  return { company_id: targetCompanyId, session_hint, expires_at };
}
