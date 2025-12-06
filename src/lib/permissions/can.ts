export type PermissionName =
  | "job.add"
  | "job.assign"
  | "job.approve"
  | "workforce.manage"
  | "finance.view"
  | "settings.edit"
  | "settings.view"
  | "retention.preview"
  | "retention.execute"
  | "switch.company";

export async function can(userId: string, companyId: string, permission: PermissionName): Promise<boolean> {
  if (!userId || !companyId || !permission) return false;
  try {
    const resp = await fetch("/api/permissions/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
        "x-company-id": companyId,
      },
      body: JSON.stringify({ company_id: companyId, permission }),
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    return Boolean(data.allowed);
  } catch (err) {
    console.error("can() check failed", err);
    return false;
  }
}

export function filterByPermission<T extends { permission: PermissionName }>(items: T[], allowed: PermissionName[]) {
  return items.filter((item) => allowed.includes(item.permission));
}
