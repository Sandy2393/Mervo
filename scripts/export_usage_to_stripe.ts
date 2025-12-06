#!/usr/bin/env node
/**
 * Export Usage to Stripe
 * CLI tool to export aggregated usage records to Stripe for metered billing
 * Usage: node export_usage_to_stripe.ts --start=2024-12-01 --end=2024-12-31 [--confirm]
 * Defaults to dry-run unless --confirm is passed
 */

import { BillingService } from "../server/billing/billingService";
import { aggregateUsage } from "../server/billing/usageReporter";

interface ExportArgs {
  start: string;
  end: string;
  confirm: boolean;
  live: boolean;
}

function parseArgs(args: string[]): ExportArgs {
  const startArg = args.find((a) => a.startsWith("--start="));
  const endArg = args.find((a) => a.startsWith("--end="));
  const confirm = args.includes("--confirm");
  const live = process.env.LIVE === "true";

  if (!startArg || !endArg) {
    console.error("Usage: node export_usage_to_stripe.ts --start=YYYY-MM-DD --end=YYYY-MM-DD [--confirm]");
    console.error("\nDefaults to dry-run. Use --confirm to execute live export to Stripe.");
    process.exit(1);
  }

  return {
    start: startArg.split("=")[1],
    end: endArg.split("=")[1],
    confirm,
    live,
  };
}

async function exportUsage(args: ExportArgs) {
  console.log(`\n=== Stripe Usage Export ===`);
  console.log(`Period: ${args.start} to ${args.end}`);
  console.log(`Mode: ${args.confirm && args.live ? "LIVE" : "DRY-RUN"}\n`);

  if (!(args.confirm && args.live)) {
    console.warn("⚠️  DRY-RUN MODE: No data will be exported to Stripe.");
    console.warn("   Use --confirm flag AND set LIVE=true to execute live export.\n");
  }

  // 1. Aggregate usage for the period
  console.log("📊 Aggregating usage records...");
  const aggregated = await aggregateUsage(args.start, args.end);

  console.log(`Found ${aggregated.length} usage aggregations:\n`);

  for (const usage of aggregated) {
    console.log(`  Company: ${usage.company_id}`);
    console.log(`  Type: ${usage.usage_type}`);
    console.log(`  Units: ${usage.total_units.toLocaleString()}`);
    console.log(`  Records: ${usage.record_count}`);
    console.log("");
  }

  if (aggregated.length === 0) {
    console.log("✅ No usage to export for this period.");
    return;
  }

  // 2. Export to Stripe (or dry-run)
  const billingService = new BillingService();
  const result = await billingService.exportUsageToStripe({
    start: args.start,
    end: args.end,
    confirm: args.confirm,
    liveEnv: args.live ? "true" : "false",
  });

  if (result.dryRun) {
    console.log(`\n✅ DRY-RUN completed. ${result.count} usage records would be exported to Stripe.`);
    console.log("   Re-run with --confirm to execute live export.");
  } else {
    console.log(`\n✅ LIVE EXPORT completed. Batch ID: ${result.batchId}`);
    console.log(`   ${result.count} usage records exported to Stripe.`);
  }
}

// CLI entrypoint
const args = parseArgs(process.argv.slice(2));
exportUsage(args)
  .then(() => {
    console.log("\n✨ Export completed successfully.\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Export failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  });
