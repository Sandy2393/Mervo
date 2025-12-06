# DNS & TLS Runbook (APP_ID / APP_TAG)

## Steps
1) Prereqs: confirm apex/domain ownership; gather DNS provider credentials (TODO: provider login). Lower TTL to 300s 24h before cutover.
2) Records:
- A/AAAA -> load balancer IPs.
- CNAME for app/preview -> CDN/edge hostname.
- TXT for ACME/verification if needed.
3) TLS issuance (ACME):
- Let's Encrypt HTTP-01: serve `/.well-known/acme-challenge` via CDN origin.
- DNS-01: add TXT `_acme-challenge.APP_ID`.
- Cloud DNS cert: `gcloud beta compute ssl-certificates create ... --domains=app.example.com`.
- Cloudflare ACM: enable Universal SSL; strict mode on.
4) OCSP/HSTS: enable OCSP stapling at edge; set `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` after validation.
5) CDN cache policies: bypass cache for `/api`, auth, uploads; enable caching for static assets with immutable; set default TTL 300s for HTML.
6) Validation: use `curl -Iv https://app.example.com/health`; check cert chain and OCSP; `dig +trace app.example.com` for propagation.
7) Troubleshooting: if stale records, flush CDN cache; check high TTL; ensure no split horizon; verify AAAA not mispointing.

## CLI Examples
- `gcloud`: `gcloud dns record-sets transaction start --zone=prod && gcloud dns record-sets transaction add --zone=prod --name=app.example.com. --ttl=300 --type=A 203.0.113.10 && gcloud dns record-sets transaction execute --zone=prod`
- `aws route53`: `aws route53 change-resource-record-sets --hosted-zone-id ZONEID --change-batch '{"Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":"app.example.com","Type":"A","TTL":300,"ResourceRecords":[{"Value":"203.0.113.10"}]}}]}'`
- `cloudflare` API: `curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -H "Authorization: Bearer CLOUDFLARE_TOKEN" -H "Content-Type: application/json" --data '{"type":"CNAME","name":"app","content":"edge.example.net","ttl":300,"proxied":true}'`

## Cert renewal automation
- Use acme.sh/Certbot with DNS-01 hook. Store certs in secret manager. Reload ingress after renewal.
- Monitor expiry: alert at <=30 days.
