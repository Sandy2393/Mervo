import { createClient } from "@supabase/supabase-js";
import { RETENTION_WINDOWS_MS } from "../../src/config/retentionDefaults";
import { RetentionPolicy } from "../../src/types/retention";

// TODO: replace with real environment values
const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "SUPABASE_SERVICE_ROLE_KEY_PLACEHOLDER";

// Client is created here for simplicity; in production use a shared singleton.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function getCompanyRetentionSettings(company_id: string): Promise<RetentionPolicy | null> {
  // TODO: fetch from a real table (company_settings)
  const { data, error } = await supabase
    .from("company_settings")
    .select("retention_policy")
    .eq("company_id", company_id)
    .single();

  if (error) {
    console.error("getCompanyRetentionSettings error", error);
    return null;
  }

  return (data?.retention_policy as RetentionPolicy) || null;
}

export async function listMediaOlderThan(company_id: string, cutoff: Date) {
  // TODO: real table for media assets
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, storage_path, created_at")
    .eq("company_id", company_id)
    .lt("created_at", cutoff.toISOString());

  if (error) {
    console.error("listMediaOlderThan error", error);
    return [];
  }
  return data || [];
}

export async function listMetadataOlderThan(company_id: string, cutoff: Date) {
  // TODO: real table for job reports/metadata
  const { data, error } = await supabase
    .from("job_reports")
    .select("id, company_id, created_at")
    .eq("company_id", company_id)
    .lt("created_at", cutoff.toISOString());

  if (error) {
    console.error("listMetadataOlderThan error", error);
    return [];
  }
  return data || [];
}

export async function softMarkForDeletion(record_ids: string[], type: "media" | "metadata") {
  if (!record_ids.length) return { inserted: 0 };

  const rows = record_ids.map((id) => ({
    ref_id: id,
    item_type: type,
    soft_marked_at: new Date().toISOString(),
  }));

  const { error, count } = await supabase
    .from("retention_queue")
    .insert(rows, { count: "exact" });

  if (error) {
    console.error("softMarkForDeletion error", error);
    return { inserted: 0 };
  }
  return { inserted: count || rows.length };
}

export async function logDeletionAction(entry: {
  company_id: string;
  item_type: "media" | "metadata";
  ref_id: string;
  deleted_at: string;
  actor: string;
  notes?: string;
}) {
  const { error } = await supabase.from("deletion_logs").insert(entry);
  if (error) {
    console.error("logDeletionAction error", error);
  }
}

// Utility to enforce metadata >= media retention
export function ensureMetadataNotShorter(policy: RetentionPolicy): RetentionPolicy {
  const mediaMs = RETENTION_WINDOWS_MS[policy.media.duration];
  const metadataMs = RETENTION_WINDOWS_MS[policy.metadata.duration];
  if (metadataMs < mediaMs) {
    return {
      ...policy,
      metadata: { ...policy.metadata, duration: policy.media.duration },
    };
  }
  return policy;
}
