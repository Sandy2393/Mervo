# k6 Load Tests — Mervo

Quick instructions to run locally:

1. Install k6: https://k6.io/docs/getting-started/installation

2. Run a quick local test:

```bash
BASE_URL=http://localhost:5173 AUTH_TOKEN=replace-token k6 run load/k6/config.js
```

Recommended thresholds (examples):
- p95 request latency < 500ms
- error rate < 1%

In CI, run tests in a dedicated environment with load generators and analysis tooling.
