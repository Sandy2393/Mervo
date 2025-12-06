// Pub/Sub consumer to ingest raw events into BigQuery/GCS
// Env: BIGQUERY_PROJECT_ID, DATASET_RAW, TABLE_RAW_EVENTS, GCS_BUCKET
// TODO: wire actual Pub/Sub trigger and BigQuery client; add auth via service account.

import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import Ajv from "ajv";

const schemaPath = path.join(process.cwd(), "analytics/tracking/event_schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const seen = new Set<string>(); // TODO: replace with persistent dedupe (BigQuery MERGE)

export async function handler(pubsubMessage: { data: string }) {
  const decoded = Buffer.from(pubsubMessage.data, "base64").toString();
  const evt = JSON.parse(decoded);

  if (!validate(evt)) {
    console.error("schema validation failed", validate.errors);
    return;
  }
  if (seen.has(evt.event_id)) {
    console.log("duplicate event_id", evt.event_id);
    return;
  }
  seen.add(evt.event_id);

  const ingestion = {
    event_id: evt.event_id,
    event_type: evt.event_type,
    event_timestamp: evt.timestamp_utc,
    ingestion_timestamp: new Date().toISOString(),
    payload: evt,
  };

  // TODO: insert into BigQuery raw_events or write to GCS
  console.log("ingested", ingestion.event_id);
}

// Local test helper
if (require.main === module) {
  const sample = {
    event_type: "job.created",
    event_id: uuid(),
    timestamp_utc: new Date().toISOString(),
    user: { master_alias: "u", user_id: "u1" },
    company: { company_id: "c1" },
    context: { app_version: "local", device: "cli" },
    properties: { job_id: "j1" },
  };
  handler({ data: Buffer.from(JSON.stringify(sample)).toString("base64") });
}
