// Media deletion utility with dry-run support
// TODO: integrate with supabase.storage or cloud provider SDK

interface DeleteResult {
  deleted: string[];
  failed: string[];
}

export async function deleteMediaBatch(paths: string[], opts?: { dryRun?: boolean }): Promise<DeleteResult> {
  const result: DeleteResult = { deleted: [], failed: [] };
  for (const path of paths) {
    if (opts?.dryRun) {
      result.deleted.push(path);
      continue;
    }

    try {
      // TODO: call storage API
      console.log(`[mediaDeleter] Deleting ${path}`);
      result.deleted.push(path);
    } catch (err) {
      console.error(`[mediaDeleter] Failed to delete ${path}`, err);
      result.failed.push(path);
    }
  }
  return result;
}
