# Flakiness Guide

- Use deterministic data and test IDs.
- Avoid sleeps; wait on assertions.
- Record traces/screenshots on failure.
- Retry judiciously; fix root causes.
- Parallelize tests but isolate state.
