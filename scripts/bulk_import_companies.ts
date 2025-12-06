#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import { CrmSyncService } from "../server/cs/crmSyncService";

// Bulk import companies from CSV or JSON. Dry-run by default. Use --confirm to write.

const confirm = process.argv.includes("--confirm");
const fileArg = process.argv.find((a) => a.startsWith("--file="));
if (!fileArg) {
  console.error("Usage: bulk_import_companies.ts --file=path/to/file [--confirm]");
  process.exit(1);
}
const filePath = fileArg.split("=")[1];
const ext = path.extname(filePath);

const crm = new CrmSyncService();

function parseFile(fp: string) {
  const raw = fs.readFileSync(fp, "utf-8");
  if (ext === ".json") return JSON.parse(raw);
  if (ext === ".csv") {
    return raw
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((line) => {
        const [id, name, domain] = line.split(",");
        return { id, name, domain };
      });
  }
  throw new Error("Unsupported file type");
}

async function main() {
  const companies = parseFile(filePath);
  if (!confirm) {
    console.log("Dry-run. Use --confirm to push to CRM.");
  }
  const res = await crm.bulkSyncCompanies(companies, !confirm);
  console.log(JSON.stringify(res, null, 2));
}

main();
