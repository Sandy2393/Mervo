export interface StorageUsage {
  company_id: string;
  total_bytes: number;
  top_folders: Array<{ path: string; bytes: number }>;
  estimated_monthly_cost_usd: number;
}

export interface ArchiveCriteria {
  older_than_days?: number;
  folder_prefix?: string;
}

export interface CleanupOptions {
  confirm?: boolean;
  dryRun?: boolean;
}

const storageSamples: Record<string, StorageUsage> = {
  demo: {
    company_id: "demo",
    total_bytes: 5_000_000,
    top_folders: [
      { path: "photos/before", bytes: 2_000_000 },
      { path: "reports/pdf", bytes: 1_500_000 },
      { path: "timesheets", bytes: 500_000 },
    ],
    estimated_monthly_cost_usd: 12.5,
  },
};

export class StorageManager {
  computeCompanyUsage(company_id: string): StorageUsage {
    return storageSamples[company_id] || {
      company_id,
      total_bytes: 0,
      top_folders: [],
      estimated_monthly_cost_usd: 0,
    };
  }

  listLargeObjects(limit = 20) {
    const demo = storageSamples.demo;
    return Array.from({ length: limit }).map((_, i) => ({
      path: `photos/before/${i}.jpg`,
      bytes: 100_000,
      company_id: demo.company_id,
    }));
  }

  scheduleArchive(company_id: string, criteria: ArchiveCriteria) {
    // Placeholder: enqueue archival request
    return { company_id, criteria, scheduled: true, ticket: `arch-${company_id}-${Date.now()}` };
  }

  runCleanup(company_id: string, opts: CleanupOptions = {}) {
    if (!opts.confirm) {
      throw new Error("Cleanup requires confirm=true");
    }
    return { company_id, deleted_bytes: 0, message: "Cleanup simulated; wire to storage provider" };
  }
}

export const storageManager = new StorageManager();
