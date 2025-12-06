# Performance Testing

Tools: k6 scripts in `perf/k6/`.

## Local run
- `TARGET_URL=http://localhost:3000 k6 run perf/k6/job_create_load_test.js`

## Guardrails
- Do not target production unless `ALLOW_PERF_TARGET=true` and you have approval.
- Start with low VUs, ramp gradually.

## Cloud runs
- TODO: configure k6 cloud or containerized runner.

## Results
- Watch p95 latency thresholds; adjust options in scripts.
