// Usage service stubs. TODO: Wire to Supabase functions/tables for real metering.
export async function recordStorageUsage(company_id, bytes, timestamp) {
    // TODO: Insert into metering table (company_id, bytes, timestamp)
    return true;
}
export async function recordPhotoUpload(company_id, bytes, user_id, job_instance_id) {
    // TODO: Insert into photo uploads table
    return true;
}
export async function getUsageSummary(company_id, range) {
    // TODO: Query aggregated metrics from Supabase/analytics
    return {
        storage_bytes: 120000000000,
        photo_upload_bytes: 45000000000,
        api_calls: 250000,
        jobs_created: 3200,
        active_contractor_minutes: 12000,
    };
}
export async function estimateMonthlyFromWindow(company_id, daysWindow) {
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
