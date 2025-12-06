# DNS & TLS Runbook

Purpose: reliably point domains to Cloud Run (backend) and Vercel (frontend) with TLS.

## Records
- Frontend (Vercel): add CNAME from `www.example.com` -> `cname.vercel-dns.com`. Root/apex: use ALIAS/ANAME if supported, or set Vercel-provided A records.
- Backend (Cloud Run custom domain): create A/AAAA as instructed by `gcloud run domain-mappings describe`, or use CNAME if using HTTPS Load Balancer. Include `A` for IPv4 and `AAAA` for IPv6 when given.
- API subdomain (e.g., `api.example.com`): map to Cloud Run domain mapping.

## TLS
- Vercel auto-manages TLS after DNS propagates. Check in Vercel dashboard -> Domains -> status must be “Valid”.
- Cloud Run TLS via managed cert when domain mapping is ready. Verify with `gcloud beta run domain-mappings describe DOMAIN` to see certificate status.

## Validation
- Use `dig +short www.example.com` and `dig +short api.example.com` to confirm targets.
- Verify HTTPS: `curl -I https://www.example.com` and `curl -I https://api.example.com` (expect 200/301).
- HSTS: enable at CDN/edge if required by security policy.

## Common Issues
- Stuck in “Pending”: check TTLs, DNS propagation, and ensure no conflicting records exist.
- TLS fails: remove AAAA records if provider doesn’t support IPv6 target; re-request certificate after fixing DNS.
- Mixed content: ensure frontend uses `https://` for API base URLs.

## Rollback
- Repoint DNS to previous endpoints by restoring prior A/CNAMEs; keep TTL low (300s) during cutover.
