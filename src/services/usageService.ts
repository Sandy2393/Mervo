// Usage service stubs. TODO: Wire to Supabase functions/tables for real metering.

export interface UsageSummary {
  storage_bytes: number;
  photo_upload_bytes: number;
  api_calls: number;
  jobs_created: number;
  active_contractor_minutes: number;
}

export async function recordStorageUsage(company_id: string, bytes: number, timestamp: string): Promise<boolean> {
  // TODO: Insert into metering table (company_id, bytes, timestamp)
  return true;
}

export async function recordPhotoUpload(company_id: string, bytes: number, user_id: string, job_instance_id: string): Promise<boolean> {
  // TODO: Insert into photo uploads table
  return true;
}

export async function getUsageSummary(company_id: string, range: { start: string; end: string }): Promise<UsageSummary> {
  // TODO: Query aggregated metrics from Supabase/analytics
  return {
    storage_bytes: 120_000_000_000,
    photo_upload_bytes: 45_000_000_000,
    api_calls: 250_000,
    jobs_created: 3200,
    active_contractor_minutes: 12_000,
  };
}

export async function estimateMonthlyFromWindow(company_id: string, daysWindow: number): Promise<UsageSummary> {
  // Placeholder: scale window usage to 30d
  const usage = await getUsageSummary(company_id, { start: "", end: "" });
  const scale = 30 / Math.max(daysWindow, 1);
  return {
    storage_bytes: Math.round(usage.storage_bytes * scale),
    photo_upload_bytes: Math.round(usage.photo_upload_bytes * scale),
    api_calls: Math.round(usage.api_calls * scale),
    jobs_created: Math.round(usage.jobs_created * scale),
    active_contractor_minutes: Math.round(usage.active_contractor_minutes * scale),
  };
}

// TODO: Add server-side batch job to rollup daily metrics per company_id.
