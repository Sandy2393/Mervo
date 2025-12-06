# Smoke Tests (APP_ID)

Run before/after deploy and during launch. Expected HTTP 2xx unless specified.

```
# Health
curl -f https://app.example.com/health

# Auth (expects 401 without token)
curl -i https://app.example.com/api/auth/whoami | head -n 5

# Login (replace token placeholder)
curl -f -X POST https://app.example.com/api/auth/login -d '{"email":"user@example.com","password":"REDACTED"}'

# Job create
curl -f -X POST https://app.example.com/api/jobs -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{"title":"Launch job"}'

# Clock-in
curl -f -X POST https://app.example.com/api/jobs/ID/clock-in -H 'Authorization: Bearer TOKEN'

# Photo upload (placeholder file)
curl -f -X POST https://app.example.com/api/jobs/ID/photo -H 'Authorization: Bearer TOKEN' -F 'file=@/tmp/photo.jpg'

# Report submit
curl -f -X POST https://app.example.com/api/jobs/ID/report -H 'Authorization: Bearer TOKEN' -d '{"notes":"ok"}'

# Admin reports
curl -f https://app.example.com/api/admin/reports -H 'Authorization: Bearer ADMIN_TOKEN'
```

Exit codes: non-zero indicates failure. Log responses for audit.
