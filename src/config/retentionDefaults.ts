import { RetentionDurationKey, RetentionPolicy } from "../types/retention";

// Duration mapping in milliseconds
export const RETENTION_WINDOWS_MS: Record<RetentionDurationKey, number> = {
  "1_month": 30 * 24 * 60 * 60 * 1000,
  "2_months": 60 * 24 * 60 * 60 * 1000,
  "6_months": 182 * 24 * 60 * 60 * 1000,
  "1_year": 365 * 24 * 60 * 60 * 1000,
  "5_years": 5 * 365 * 24 * 60 * 60 * 1000,
  never: Number.POSITIVE_INFINITY,
};

export function getRetentionWindow(policy: RetentionPolicy, now = Date.now()) {
  const mediaMs = RETENTION_WINDOWS_MS[policy.media.duration];
  const metadataMs = RETENTION_WINDOWS_MS[policy.metadata.duration];
  const cutoffMedia = mediaMs === Number.POSITIVE_INFINITY ? null : new Date(now - mediaMs);
  const cutoffMetadata = metadataMs === Number.POSITIVE_INFINITY ? null : new Date(now - metadataMs);

  return {
    cutoffMedia,
    cutoffMetadata,
    mediaMs,
    metadataMs,
  };
}

export const RETENTION_CHOICES: Array<{ key: RetentionDurationKey; label: string }> = [
  { key: "1_month", label: "1 month" },
  { key: "2_months", label: "2 months" },
  { key: "6_months", label: "6 months" },
  { key: "1_year", label: "1 year (default)" },
  { key: "5_years", label: "5 years" },
  { key: "never", label: "Never" },
];
