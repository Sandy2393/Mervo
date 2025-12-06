import { buildSoftMarkPayload, computeCountsForRetention, RetentionConfig, RetentionPreviewResult } from "./previewService";

export interface RetentionExecutionOptions {
  confirm?: boolean;
  initiated_by?: string;
}

export interface RetentionExecutionResult {
  preview: RetentionPreviewResult;
  action: "soft" | "hard";
  confirmed: boolean;
  processed: Array<{ id: string; type: string }>;
  message: string;
}

function assertConfirmed(options?: RetentionExecutionOptions) {
  if (!options?.confirm) {
    throw new Error("Destructive operation requires confirm=true");
  }
}

export async function runSoftSweep(company_id: string, config: RetentionConfig, options?: RetentionExecutionOptions): Promise<RetentionExecutionResult> {
  assertConfirmed(options);
  const preview = await computeCountsForRetention(company_id, config);
  const marks = buildSoftMarkPayload(preview);
  // TODO: integrate with real retention engine (Phase U) to flag rows and enqueue deletions
  return {
    preview,
    action: "soft",
    confirmed: true,
    processed: marks,
    message: "Soft-marked items for later hard delete",
  };
}

export async function runHardDelete(company_id: string, config: RetentionConfig, options?: RetentionExecutionOptions): Promise<RetentionExecutionResult> {
  assertConfirmed(options);
  const preview = await computeCountsForRetention(company_id, config);
  const marks = buildSoftMarkPayload(preview);
  // TODO: integrate with storage/database hard deletion + export/archive hooks
  return {
    preview,
    action: "hard",
    confirmed: true,
    processed: marks,
    message: "Hard delete simulated; wire to storage and DB deletes",
  };
}
