// Placeholder for cold storage archival (e.g., GCS Nearline)
// TODO: implement actual move using cloud SDKs

export async function moveToArchive(refs: string[], opts?: { dryRun?: boolean }) {
  const moved: string[] = [];
  const failed: string[] = [];
  for (const ref of refs) {
    if (opts?.dryRun) {
      moved.push(ref);
      continue;
    }
    try {
      // TODO: perform archival move
      console.log(`[archivePlaceholder] Moving to archive: ${ref}`);
      moved.push(ref);
    } catch (err) {
      console.error(`[archivePlaceholder] Failed to move ${ref}`, err);
      failed.push(ref);
    }
  }
  return { moved, failed };
}
