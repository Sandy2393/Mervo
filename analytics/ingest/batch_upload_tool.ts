#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import { Storage } from "@google-cloud/storage"; // TODO: add to deps

// Upload NDJSON events to GCS in date-partitioned folders. Dry-run by default.

const confirm = process.argv.includes("--confirm");
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const dateArg = process.argv.find((a) => a.startsWith("--date="));

if (!fileArg || !dateArg) {
  console.error("Usage: batch_upload_tool.ts --file=events.ndjson --date=YYYY-MM-DD [--confirm]");
  process.exit(1);
}

const filePath = fileArg.split("=")[1];
const date = dateArg.split("=")[1];

const bucketName = process.env.GCS_BUCKET || "GCS_BUCKET_PLACEHOLDER"; // TODO: set
const storage = new Storage();

async function main() {
  if (!confirm) {
    console.log("Dry-run. Use --confirm to upload.");
    return;
  }
  const dest = `raw_events/ingestion_date=${date}/${path.basename(filePath)}`;
  await storage.bucket(bucketName).upload(filePath, { destination: dest });
  console.log(`Uploaded to gs://${bucketName}/${dest}`);
}

main();
