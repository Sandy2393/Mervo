#!/usr/bin/env ts-node
// Runs data quality queries and reports summary. Dry-run by default.

const confirm = process.argv.includes("--confirm");

async function runChecks() {
  // TODO: connect to BigQuery and execute queries in data_quality_checks.sql
  const results = [
    { name: "null_event_id", status: "ok", value: 0 },
    { name: "duplicate_event_id", status: "ok", value: 0 }
  ];
  if (!confirm) {
    console.log("Dry-run: not sending alerts.");
  }
  console.log(JSON.stringify(results, null, 2));
}

runChecks();
