# Cost Reduction Playbook

## Quick Wins
- Image compression and resizing before upload; enforce max resolution
- Storage lifecycle: move cold objects to cheaper tier; delete after retention
- CDN/edge caching for static assets and job detail GETs
- Cap photo retries; dedupe uploads

## Infrastructure
- Autoscale Cloud Run with low min instances; scale-to-zero for non-prod
- Right-size dev/test DBs; restrict long-lived previews
- Turn off idle jobs/cron in non-prod

## Database & Storage
- Archive old job attachments; use lifecycle policies (`scripts/generate_lifecycle_policy.sh`)
- Partition/limit analytics tables; vacuum/analyze regularly
- Prefer signed URLs with short TTL to reduce egress

## Network & Egress
- Serve from nearest region; cache via CDN
- Compress payloads; avoid chatty APIs; batch uploads when possible

## Observability
- Alert on sudden storage growth, 5xx spikes, and egress anomalies
- Track cost per company; expose to admins via CostDashboard

## Governance
- Require cost labels/tags: `company_tag`, `env`, `service`
- Budget per company; enforce approvals for overages

## TODO
- TODO: Add automated idle-resource detector for Cloud Run/DB
- TODO: Add image transcoding service with quotas
