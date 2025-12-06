import { computeCountsForRetention, RetentionConfig } from "../retention/previewService";

export interface CompanySettingsPayload {
  retention_media_days?: number;
  retention_meta_days?: number;
  suffix_type?: string;
  timezone?: string;
  currency?: string;
  geofence_defaults?: any;
  notify_quota_per_day?: number;
  billing_contact?: string;
  sso_config?: any;
}

export interface CompanySettings extends Required<CompanySettingsPayload> {
  company_id: string;
  created_at: string;
  updated_at: string;
}

const settingsStore: Record<string, CompanySettings> = {};

function nowIso() {
  return new Date().toISOString();
}

function defaultSettings(company_id: string): CompanySettings {
  return {
    company_id,
    retention_media_days: 365,
    retention_meta_days: 365,
    suffix_type: "none",
    timezone: "UTC",
    currency: "USD",
    geofence_defaults: { radius_m: 50, strict: false },
    notify_quota_per_day: 500,
    billing_contact: "",
    sso_config: { enabled: false, metadata: {} },
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

export class SettingsService {
  async getSettings(company_id: string): Promise<CompanySettings> {
    if (!settingsStore[company_id]) {
      settingsStore[company_id] = defaultSettings(company_id);
    }
    return settingsStore[company_id];
  }

  async updateSettings(company_id: string, payload: CompanySettingsPayload): Promise<CompanySettings> {
    const existing = await this.getSettings(company_id);
    const updated = { ...existing, ...payload, updated_at: nowIso() } as CompanySettings;
    settingsStore[company_id] = updated;
    return updated;
  }

  async previewRetentionCounts(company_id: string) {
    const settings = await this.getSettings(company_id);
    const config: RetentionConfig = {
      retention_media_days: settings.retention_media_days,
      retention_meta_days: settings.retention_meta_days,
      softDeleteFirst: true,
    };
    return computeCountsForRetention(company_id, config);
  }
}
