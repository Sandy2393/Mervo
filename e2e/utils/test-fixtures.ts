export async function seedTestData(opts: { baseUrl: string; dryRun?: boolean }) {
  if (opts.dryRun) {
    return { dryRun: true };
  }
  // TODO: call API to seed test data
  return { ok: true };
}
