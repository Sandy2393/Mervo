export async function listWorkforce(companyId: string) {
  const res = await fetch(`/api/companies/${companyId}/workforce`);
  if (!res.ok) throw new Error("Failed to load workforce");
  return res.json();
}

export async function inviteUser(payload: { company_id: string; email: string; role: string; expires_at: string }) {
  const res = await fetch("/api/invites/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send invite");
  return res.json();
}

export async function importCsvPreview(companyId: string, csv: File) {
  const text = await csv.text();
  const res = await fetch(`/api/companies/${companyId}/workforce?mode=preview`, {
    method: "POST",
    headers: { "Content-Type": "text/csv" },
    body: text,
  });
  if (!res.ok) throw new Error("CSV preview failed");
  return res.json();
}

export async function importCsvCommit(companyId: string, csv: File) {
  const text = await csv.text();
  const res = await fetch(`/api/companies/${companyId}/workforce?mode=commit`, {
    method: "POST",
    headers: { "Content-Type": "text/csv" },
    body: text,
  });
  if (!res.ok) throw new Error("CSV commit failed");
  return res.json();
}
