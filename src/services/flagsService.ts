import { FlagDefinition } from "../types/flags";

const base = "/api/flags"; // TODO: route to Supabase Edge Function

export async function listFlags(): Promise<FlagDefinition[]> {
  const res = await fetch(base);
  if (!res.ok) throw new Error("Failed to list flags");
  return res.json();
}

export async function saveFlag(flag: FlagDefinition) {
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flag),
  });
  if (!res.ok) throw new Error("Failed to save flag");
  return res.json();
}

export async function toggleFlag(key: string, enabled: boolean) {
  const res = await fetch(`${base}/${key}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to toggle flag");
  return res.json();
}
