# Experimentation Guide

## Design basics
- Define primary metric (conversion, activation) and guardrail metrics (error rate, latency).
- Form a clear hypothesis and expected direction.
- Keep one primary metric per experiment to avoid p-hacking.

## Sample size (rough)
- Use online calculators; input baseline rate, minimum detectable effect, power 80%.
- For tiny traffic, prefer sequential ramp or qualitative validation.

## Ramp plan
1) Internal QA with forced variants
2) 5-10% monitored ramp with kill switch ready
3) 25-50% if stable
4) 100% or rollback

## Guardrails
- Kill switch per flag
- Monitored ramp with daily checks
- Auto-rollback TODO: wire to monitor thresholds

## Rollout checklist
- Targeting rules defined
- Variants sum to 100%
- Events emitted: assignment + conversion
- Data retention considered; PII minimized
- QA paths: forceVariant query param or context override

## Decision making
- Review uplift and confidence interval from `processStats.ts`
- For critical decisions, cross-check with external stats tooling (LaunchDarkly, Amplitude Experiment)
