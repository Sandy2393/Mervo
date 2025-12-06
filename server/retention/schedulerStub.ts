// Placeholder scheduler. In production use Cloud Scheduler or Supabase Scheduled Functions.
import { runMediaSweep, runMetadataSweep } from "./engine";

export async function startSchedulerStub() {
  console.log("[scheduler] Stub started - no real scheduling. Add Cloud Scheduler/Supabase functions.");
}

// Illustrative functions for wiring into a real scheduler
export async function scheduledDailyMediaSweep(company_id: string) {
  // Intended for daily 2AM runs
  return runMediaSweep(company_id);
}

export async function scheduledWeeklyMetadataSweep(company_id: string) {
  // Intended for weekly runs
  return runMetadataSweep(company_id);
}
