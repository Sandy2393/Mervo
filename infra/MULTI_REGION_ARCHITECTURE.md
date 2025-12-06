# Multi-Region Architecture

## Strategy
- Primary: Australia (e.g., australia-southeast1) for lowest latency to core users.
- Secondary: US/EU replicas for read and DR.
- DNS: Cloud DNS with failover policy.

## Database
- Supabase primary in AU; read replicas in US/EU.
- Promote replica for DR (manual/controlled). RPO target: < 15 min; RTO: < 60 min.

## App Layer
- Cloud Run deployed multi-region (AU primary, US failover). Use traffic splitting for failover tests.
- Feature flags to disable heavy workloads during failover.

## Storage
- Supabase storage/buckets with cross-region replication (TODO: configure). Consider dual-region buckets.

## Latency
- Contractors closer to AU get <300ms P95 target; US/EU P95 target <500ms with replicas.
- CDN for static assets; cache API GET where safe.

## Data Residency
- Keep primary data in AU; restrict writes to primary. Reads served regionally where policy allows.
- Company-level residency flag to force region pinning (TODO: implement).

## Observability
- Region-tagged metrics; dashboards per region; alert on replica lag and failover events.

## TODO
- TODO: Automate replica lag alerts
- TODO: Document region cutover runbook
