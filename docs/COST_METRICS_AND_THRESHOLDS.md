# Cost Metrics & Thresholds

## Metrics
- Storage bytes & growth rate (GB/day)
- Egress GB per company
- Function/compute invocations
- DB operations (reads/writes)
- API calls per company
- Cost per company vs budget

## Thresholds (starting points)
- Storage growth > 10% day-over-day → investigate
- Egress spike > 2x 7d average → alert
- Budget consumption > 80% mid-month → warn
- Function invocations > 2x baseline → review integration behavior

## Actions
- Optimize images, enforce lifecycle
- Cache high-traffic endpoints; enable CDN
- Throttle abusive clients; adjust rate limits
- Review queries and indexes for DB efficiency

## TODO
- TODO: Calibrate thresholds per environment and company size
- TODO: Wire alerts into monitoring stack
