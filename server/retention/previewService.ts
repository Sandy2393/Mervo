export interface RetentionConfig {
  retention_media_days: number;
  retention_meta_days: number;
  softDeleteFirst?: boolean;
}

export interface RetentionSample {
  id: string;
  type: "media" | "metadata";
  created_at: string;
  category: string;
}

export interface RetentionPreviewResult {
  company_id: string;
  cutoff_media: string | null;
  cutoff_meta: string | null;
  counts: { media: number; metadata: number };
  samples: RetentionSample[];
}

const demoStore = {
  media: [
    { id: "photo-1", company_id: "demo", created_at: shiftDays(-40), category: "job_photo" },
    { id: "photo-2", company_id: "demo", created_at: shiftDays(-5), category: "job_photo" },
    { id: "photo-3", company_id: "demo", created_at: shiftDays(-400), category: "report_pdf" },
  ],
  metadata: [
    { id: "meta-1", company_id: "demo", created_at: shiftDays(-50), category: "timesheet" },
    { id: "meta-2", company_id: "demo", created_at: shiftDays(-10), category: "job_log" },
    { id: "meta-3", company_id: "demo", created_at: shiftDays(-800), category: "audit_log" },
  ],
};

function shiftDays(delta: number) {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return d.toISOString();
}

function cutoffDate(days: number): string | null {
  if (!days || days <= 0) return null;
  if (days === Number.POSITIVE_INFINITY) return null;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysBetween(from: Date, to: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

export async function computeCountsForRetention(company_id: string, retentionConfig: RetentionConfig): Promise<RetentionPreviewResult> {
  const cutoffMedia = cutoffDate(retentionConfig.retention_media_days);
  const cutoffMeta = cutoffDate(retentionConfig.retention_meta_days);

  // Placeholder: filter demo data; replace with COUNT(*) queries + LIMIT for samples
  const mediaItems = demoStore.media.filter((m) => m.company_id === company_id || company_id === "demo");
  const metaItems = demoStore.metadata.filter((m) => m.company_id === company_id || company_id === "demo");

  const mediaExpired = cutoffMedia
    ? mediaItems.filter((m) => daysBetween(new Date(m.created_at), new Date()) > retentionConfig.retention_media_days)
    : [];
  const metaExpired = cutoffMeta
    ? metaItems.filter((m) => daysBetween(new Date(m.created_at), new Date()) > retentionConfig.retention_meta_days)
    : [];

  const samples: RetentionSample[] = [...mediaExpired.slice(0, 50).map((m) => ({
    id: m.id,
    type: "media" as const,
    created_at: m.created_at,
    category: m.category,
  })),
  ...metaExpired.slice(0, 50).map((m) => ({
    id: m.id,
    type: "metadata" as const,
    created_at: m.created_at,
    category: m.category,
  }))];

  return {
    company_id,
    cutoff_media: cutoffMedia,
    cutoff_meta: cutoffMeta,
    counts: { media: mediaExpired.length, metadata: metaExpired.length },
    samples,
  };
}

export function exportPreviewCsv(preview: RetentionPreviewResult): string {
  const header = "id,type,created_at,category";
  const rows = preview.samples.map((s) => `${s.id},${s.type},${s.created_at},${s.category}`);
  return [header, ...rows].join("\n");
}

// Utility to build soft-mark payloads for the executor
export function buildSoftMarkPayload(preview: RetentionPreviewResult) {
  return preview.samples.map((s) => ({ id: s.id, type: s.type, company_id: preview.company_id }));
}
