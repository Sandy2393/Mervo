# Experiment Events

Expected JSON lines per file under `events/` directory.

```json
{
  "user_id": "user-1",
  "company_id": "co-1",
  "flagKey": "pricing_experiment",
  "variant": "control",
  "eventName": "conversion",
  "timestamp": "2025-01-01T00:00:00Z",
  "metadata": {"value": 1}
}
```

Required fields: `user_id`, `flagKey`, `variant`, `eventName`, `timestamp`.
Optional: `company_id`, `metricValue`, `metadata`.

Usage: the stats processor reads all `*.json` files in this folder and aggregates by flag/variant.
