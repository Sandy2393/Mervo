/**
 * Usage Reporter — Collect and aggregate usage metrics for metered billing
 * TODO: Replace in-memory store with real DB queries
 */

export type UsageType = "photo_bytes" | "storage_bytes" | "api_calls" | "contractor_minutes";

export interface UsageMetric {
  company_id: string;
  usage_type: UsageType;
  units: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AggregatedUsage {
  company_id: string;
  usage_type: UsageType;
  total_units: number;
  period_start: string;
  period_end: string;
  record_count: number;
}

// In-memory store (replace with DB)
const usageRecords: UsageMetric[] = [];

/**
 * Record a single usage event
 * TODO: INSERT INTO usage_records (company_id, usage_type, units, recorded_at, metadata)
 */
export async function recordUsage(metric: UsageMetric): Promise<void> {
  usageRecords.push({
    ...metric,
    timestamp: metric.timestamp || new Date().toISOString(),
  });

  console.log(`[usage] Recorded ${metric.usage_type}: ${metric.units} for ${metric.company_id}`);
}

/**
 * Aggregate usage for a time period
 * TODO: SELECT company_id, usage_type, SUM(units) as total_units, COUNT(*) as record_count
 *       FROM usage_records WHERE recorded_at >= start AND recorded_at < end AND exported_to_stripe = false
 *       GROUP BY company_id, usage_type
 */
export async function aggregateUsage(periodStart: string, periodEnd: string): Promise<AggregatedUsage[]> {
  const filtered = usageRecords.filter((r) => r.timestamp >= periodStart && r.timestamp < periodEnd);

  const groupedMap = new Map<string, AggregatedUsage>();

  for (const record of filtered) {
    const key = `${record.company_id}:${record.usage_type}`;
    const existing = groupedMap.get(key);

    if (existing) {
      existing.total_units += record.units;
      existing.record_count += 1;
    } else {
      groupedMap.set(key, {
        company_id: record.company_id,
        usage_type: record.usage_type,
        total_units: record.units,
        period_start: periodStart,
        period_end: periodEnd,
        record_count: 1,
      });
    }
  }

  return Array.from(groupedMap.values());
}

/**
 * Get current usage summary for a company
 * TODO: Query usage_records for current billing period
 */
export async function getCompanyUsageSummary(companyId: string, periodStart: string, periodEnd: string) {
  const filtered = usageRecords.filter(
    (r) => r.company_id === companyId && r.timestamp >= periodStart && r.timestamp < periodEnd
  );

  const summary: Record<UsageType, number> = {
    photo_bytes: 0,
    storage_bytes: 0,
    api_calls: 0,
    contractor_minutes: 0,
  };

  for (const record of filtered) {
    summary[record.usage_type] += record.units;
  }

  return summary;
}

/**
 * Batch record usage events
 * TODO: Bulk INSERT for performance
 */
export async function batchRecordUsage(metrics: UsageMetric[]): Promise<void> {
  for (const metric of metrics) {
    await recordUsage(metric);
  }
}

// Helper functions for common usage types

export async function recordPhotoUpload(companyId: string, bytes: number, metadata?: Record<string, any>) {
  await recordUsage({
    company_id: companyId,
    usage_type: "photo_bytes",
    units: bytes,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

export async function recordStorageUsage(companyId: string, bytes: number) {
  await recordUsage({
    company_id: companyId,
    usage_type: "storage_bytes",
    units: bytes,
    timestamp: new Date().toISOString(),
  });
}

export async function recordApiCall(companyId: string, metadata?: Record<string, any>) {
  await recordUsage({
    company_id: companyId,
    usage_type: "api_calls",
    units: 1,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

export async function recordContractorMinutes(companyId: string, minutes: number, contractorId?: string) {
  await recordUsage({
    company_id: companyId,
    usage_type: "contractor_minutes",
    units: minutes,
    timestamp: new Date().toISOString(),
    metadata: { contractor_id: contractorId },
  });
}
