#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import { HealthEngine } from "../server/cs/healthEngine";

// CLI to run health checks. Dry-run by default; use --confirm to persist (placeholder).

const confirm = process.argv.includes("--confirm");
const engine = new HealthEngine();
const today = new Date().toISOString().slice(0, 10);
const reportDir = path.join(process.cwd(), "reports");
const reportFile = path.join(reportDir, `health_${today}.md`);

function mockMetrics(company_id: string) {
  return {
    company_id,
    jobs_per_week: 0,
    overdue_approvals: 4,
    storage_growth_pct: 10,
  };
}

async function main() {
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const companies = ["c1", "c2"];
  const lines: string[] = [];
  for (const c of companies) {
    const score = engine.computeHealthScore(c, mockMetrics(c));
    lines.push(`- ${c}: score ${score}`);
  }
  fs.writeFileSync(reportFile, `# Health Report ${today}\n\n${lines.join("\n")}\n`);
  if (!confirm) {
    console.log("Dry-run complete. Re-run with --confirm to persist actions (if any).");
  }
  console.log(`Wrote ${reportFile}`);
}

main();
