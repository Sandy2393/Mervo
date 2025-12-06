# Instrumentation Guide

## Web (TypeScript)
```ts
import { v4 as uuid } from "uuid";

function track(event_type: string, props: Record<string, any>) {
  const payload = {
    event_type,
    event_id: uuid(),
    timestamp_utc: new Date().toISOString(),
    user: { master_alias: window.__USER_ALIAS__, user_id: window.__USER_ID__ },
    company: { company_id: window.__COMPANY_ID__, company_tag: window.__COMPANY_TAG__ },
    context: { page: document.title, path: window.location.pathname, app_version: __APP_VERSION__, device: "web" },
    properties: props,
  };
  return fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
```

## Mobile (pseudo)
```kotlin
val event = mapOf(
  "event_type" to "job.completed",
  "event_id" to UUID.randomUUID().toString(),
  "timestamp_utc" to Instant.now().toString(),
  "user" to mapOf("master_alias" to userAlias, "user_id" to userId),
  "company" to mapOf("company_id" to companyId),
  "context" to mapOf("app_version" to appVersion, "device" to "android"),
  "properties" to mapOf("job_id" to jobId)
)
httpPost("/api/events", event)
```

## Server-side (Edge Function)
```ts
import { publish } from "@google-cloud/pubsub"; // TODO: configure creds

async function emitServerEvent(evt) {
  // Reuse event_id on retry for idempotency
  await publish("events-topic", Buffer.from(JSON.stringify(evt)));
}
```

## Idempotency
- Always reuse event_id for retries.
- Warehouse ingestion uses event_id as dedupe key.

## Validation
- Validate against `event_schema.json` before send where possible.
