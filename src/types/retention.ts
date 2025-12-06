// Types for retention policies and rules
export type RetentionDurationKey = "1_month" | "2_months" | "6_months" | "1_year" | "5_years" | "never";

export interface MediaRetentionRule {
  duration: RetentionDurationKey;
  softDeleteFirst: boolean;
}

export interface MetadataRetentionRule {
  duration: RetentionDurationKey;
}

export interface RetentionPolicy {
  companyId: string;
  media: MediaRetentionRule;
  metadata: MetadataRetentionRule;
  updatedAt?: string;
  updatedBy?: string;
  notes?: string;
}

export const DEFAULT_MEDIA_RULE: MediaRetentionRule = {
  duration: "1_year",
  softDeleteFirst: true,
};

export const DEFAULT_METADATA_RULE: MetadataRetentionRule = {
  duration: "1_year",
};

export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  companyId: "",
  media: DEFAULT_MEDIA_RULE,
  metadata: DEFAULT_METADATA_RULE,
};
