#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";

const confirm = process.argv.includes("--confirm");
const fixturePath = path.join(process.cwd(), "tests/fixtures/sample_companies.json");

async function main() {
  const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  if (!confirm) {
    console.log("Dry-run. Use --confirm to write.");
    return;
  }
  // TODO: insert into Supabase/Postgres
  console.log(`Would seed ${fixtures.length} companies`);
}

main();
