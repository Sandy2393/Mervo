# Tracking Plan Overview

Purpose: define canonical event schema for Mervo, how to instrument, and where events flow (clients -> edge/server -> Pub/Sub/GCS -> warehouse).

## Libraries / SDKs
- Web: segment-like/analytics SDK (placeholder) sending JSON events to Edge Function endpoint `/api/events`.
- Mobile: mobile SDK (iOS/Android) posting JSON with canonical schema.
- Server: direct emission from backend jobs and workers to Pub/Sub.

## Flow
Client/mobile/server emits canonical JSON -> gateway validates schema -> dedupe by event_id -> lands in raw bucket/table partitioned by ingestion_date -> transformed to staging -> facts/dims -> dashboards.

## Naming conventions
- event_type: snake.case with domain prefix (job.created, timesheet.clock_in).
- event_id: UUID v4, globally unique.
- timestamp_utc: ISO 8601 in UTC.
- Properties: lower_snake_case keys.

## Required fields
- event_type, event_id, timestamp_utc, user.master_alias, company.company_id.

## PII handling
- PII allowed only in raw_events; staging/facts must tokenize or drop unless opt-in.
- TTL: raw PII removed after configurable days (TODO: set retention).

## Environments
- Respect env flags (DEV/QA/PROD). Never mix events across envs; include app_version and device/context.

## Idempotency
- event_id drives dedupe; producers should reuse event_id on retry.

## QA
- Use `analytics/sample/sample_events.ndjson` to validate pipelines locally.
