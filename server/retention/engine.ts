import { getCompanyRetentionSettings, listMediaOlderThan, listMetadataOlderThan, softMarkForDeletion, logDeletionAction } from "./queries";
import { auditDeletion } from "./audit";
import { getRetentionWindow } from "../../src/config/retentionDefaults";
import { RetentionPolicy } from "../../src/types/retention";
import { deleteMediaBatch } from "../storage/mediaDeleter";

type QueueItem = { id?: string; ref_id: string; item_type: "media" | "metadata"; company_id: string };

interface HardDeleteOptions {
  confirm: boolean;
  dryRun?: boolean;
  actor: string;
  notes?: string;
}

export async function runMediaSweep(company_id: string, now = Date.now()) {
  const policy = await getPolicy(company_id);
  if (!policy) return { matched: 0, marked: 0 };

  const { cutoffMedia } = getRetentionWindow(policy, now);
  if (!cutoffMedia) return { matched: 0, marked: 0 };

  const media = await listMediaOlderThan(company_id, cutoffMedia);
  const ids = media.map((m: any) => m.id);
  const { inserted } = await softMarkForDeletion(ids, "media");
  await auditBatch(media, company_id, "media", "SOFT_MARK");
  return { matched: ids.length, marked: inserted };
}

export async function runMetadataSweep(company_id: string, now = Date.now()) {
  const policy = await getPolicy(company_id);
  if (!policy) return { matched: 0, marked: 0 };

  const { cutoffMetadata } = getRetentionWindow(policy, now);
  if (!cutoffMetadata) return { matched: 0, marked: 0 };

  const records = await listMetadataOlderThan(company_id, cutoffMetadata);
  const ids = records.map((r: any) => r.id);
  const { inserted } = await softMarkForDeletion(ids, "metadata");
  await auditBatch(records, company_id, "metadata", "SOFT_MARK");
  return { matched: ids.length, marked: inserted };
}

export async function enqueueMedia(records: Array<{ id: string }>) {
  const ids = records.map((r) => r.id);
  return softMarkForDeletion(ids, "media");
}

export async function enqueueMetadata(records: Array<{ id: string }>) {
  const ids = records.map((r) => r.id);
  return softMarkForDeletion(ids, "metadata");
}

export async function applyHardDeletion(queueItems: QueueItem[], opts: HardDeleteOptions) {
  if (!opts.confirm) {
    throw new Error("Hard deletion requires confirm=true");
  }

  const results: { deleted: string[]; failed: string[] } = { deleted: [], failed: [] };

  for (const item of queueItems) {
    try {
      if (opts.dryRun) {
        results.deleted.push(item.ref_id);
        continue;
      }

      if (item.item_type === "media") {
        const deletion = await deleteMediaBatch([item.ref_id], { dryRun: opts.dryRun });
        if (deletion.failed.length) {
          results.failed.push(item.ref_id);
          continue;
        }
      }

      // TODO: delete metadata record from DB when implemented

      await logDeletionAction({
        company_id: item.company_id,
        item_type: item.item_type,
        ref_id: item.ref_id,
        deleted_at: new Date().toISOString(),
        actor: opts.actor,
        notes: opts.notes,
      });
      await auditDeletion({
        company_id: item.company_id,
        item_type: item.item_type,
        ref_id: item.ref_id,
        stage: "HARD_DELETE",
        note: opts.notes || "hard deletion applied",
      });
      results.deleted.push(item.ref_id);
    } catch (err) {
      console.error("applyHardDeletion error", err);
      results.failed.push(item.ref_id);
    }
  }

  return results;
}

async function getPolicy(company_id: string): Promise<RetentionPolicy | null> {
  const policy = await getCompanyRetentionSettings(company_id);
  return policy;
}

async function auditBatch(records: any[], company_id: string, item_type: "media" | "metadata", stage: "SOFT_MARK") {
  for (const rec of records) {
    await auditDeletion({
      company_id,
      item_type,
      ref_id: rec.id,
      stage,
      note: "Queued by sweep",
    });
  }
}
