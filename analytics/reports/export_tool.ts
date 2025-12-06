#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";

// CLI to run named SQL file and export CSV. Dry-run by default; --confirm uploads to GCS if configured.

const confirm = process.argv.includes("--confirm");
const name = process.argv.find((a) => a.startsWith("--name="))?.split("=")[1];
if (!name) {
  console.error("Usage: export_tool.ts --name=finance_monthly_report [--confirm]");
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "analytics/reports", `${name}.sql`);
if (!fs.existsSync(sqlPath)) {
  console.error(`SQL not found: ${sqlPath}`);
  process.exit(1);
}
const sql = fs.readFileSync(sqlPath, "utf-8");

async function run() {
  console.log(`Would run SQL: ${sqlPath}`);
  // TODO: execute via BigQuery client, stream results to CSV
  const output = path.join(process.cwd(), "reports", `${name}.csv`);
  if (!confirm) {
    console.log("Dry-run. Re-run with --confirm to execute and upload.");
    return;
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, "placeholder,0\n");
  console.log(`Wrote ${output}`);
}

run();
