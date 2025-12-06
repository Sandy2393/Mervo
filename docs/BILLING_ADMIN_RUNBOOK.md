# Billing System - Admin Runbook

## Overview
Comprehensive guide for managing the Mervo billing system, troubleshooting issues, and performing operational tasks.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Common Tasks](#common-tasks)
3. [Troubleshooting](#troubleshooting)
4. [Emergency Procedures](#emergency-procedures)
5. [Monitoring](#monitoring)
6. [Support & Escalation](#support--escalation)

---

## System Overview

### Architecture
- **Backend**: Node.js/TypeScript with Express
- **Database**: PostgreSQL (Supabase)
- **Payment**: Stripe (subscriptions only)
- **Scheduler**: node-cron (Australia/Sydney timezone)
- **Email**: Sendgrid/AWS SES (templates ready)

### Key Components
- **Core Services**: Tier, Usage, Coupon, Invoice, Billing
- **API Endpoints**: 27 routes (12 company, 15 super-admin)
- **Automation Jobs**: 5 cron jobs (snapshots, invoicing, alerts, suspensions, expiry)
- **Dashboards**: 4 React pages (company + 3 super-admin)

### Daily Operations Timeline
```
3:00 AM  → Expire old coupons job
9:00 AM  → Send overage alerts
10:00 AM → Suspend overdue accounts
11:00 PM → Capture daily usage snapshots

1st Month, 2:00 AM → Monthly invoicing job
```

---

## Common Tasks

### Task 1: Create a Coupon

**Via API:**
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "HOLIDAY20",
    "discountType": "percentage",
    "discountValue": 20,
    "recurring": false,
    "activeFrom": "2025-12-20",
    "expiresAt": "2025-12-31",
    "usageLimit": 100,
    "notes": "Holiday promotion"
  }'
```

**Via Dashboard:**
1. Navigate to Super Admin → Coupon Manager
2. Click "Create Coupon"
3. Fill in coupon details
4. Click "Create Coupon"

**Verification:**
```bash
curl -X GET https://api.mervo.com.au/api/super-admin/billing/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.coupons[] | select(.couponCode=="HOLIDAY20")'
```

---

### Task 2: Suspend a Company Account

**Via API:**
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/suspend/comp-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Payment overdue by 10 days"
  }'
```

**Via Dashboard:**
1. Navigate to Super Admin → Billing Overview
2. Find company in table
3. Click "Suspend" action button
4. Confirm suspension

**Suspension Effects:**
- API access revoked immediately
- Dashboard shows read-only mode
- Email notification sent to admins
- Account marked as suspended in `company_plans`
- Event logged in `billing_events`

**Unsuspend:**
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/unsuspend/comp-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Task 3: Manually Process Monthly Billing

**When to use:** If scheduled job fails or you need to reprocess a month.

**Via API:**
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/process-monthly \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Via Dashboard:**
1. Navigate to Super Admin → Billing Overview
2. Click "Process Monthly Billing" button
3. Confirm action
4. Wait for completion (typically 2-5 seconds)

**Expected Output:**
```json
{
  "success": true,
  "summary": {
    "month": "December 2025",
    "invoicesGenerated": 95,
    "totalRevenue": 125000,
    "errors": 0,
    "duration": "2.5 seconds"
  }
}
```

---

### Task 4: Apply Coupon to Company (Admin Override)

**Via API:**
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/apply-coupon/comp-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "SAVE20"
  }'
```

**Via Dashboard:**
1. Navigate to Super Admin → Billing Overview
2. Click company name to open detail view
3. Scroll to "Coupon Management" section
4. Enter coupon code
5. Click "Apply Coupon"

---

### Task 5: Change Company Plan

**Via API:**
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/change-plan/comp-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newTier": "enterprise"
  }'
```

**Via Dashboard:**
1. Navigate to Super Admin → Company Detail
2. Click "Change Plan" button
3. Select new tier
4. Review proration calculation
5. Click "Confirm Change"

**Automatic Actions:**
- Prorated credit/charge calculated
- New plan effective immediately
- Invoice generated for adjustment
- Company notified via email

---

### Task 6: View Company Billing Details

**Via Dashboard:**
1. Navigate to Super Admin → Billing Overview
2. Click company name in table
3. View comprehensive billing information:
   - Current usage (3 gauges)
   - Billing breakdown (base + overages + GST)
   - Storage breakdown (pie chart)
   - Invoice history
   - Applied coupons

---

## Troubleshooting

### Problem: Monthly Invoicing Job Failed

**Symptoms:**
- No invoices generated on 1st of month
- `billing_events` shows `monthly_invoicing_failed`
- Companies didn't receive invoices

**Investigation Steps:**

1. **Check job logs:**
```bash
# Query billing_events table
psql -U postgres -d mervo -c \
  "SELECT * FROM billing_events \
   WHERE eventType LIKE 'monthly_invoicing%' \
   ORDER BY createdAt DESC LIMIT 5;"
```

2. **Check database connectivity:**
```bash
# Verify Supabase connection
psql -U postgres -d mervo -c "SELECT COUNT(*) FROM invoices;"
```

3. **Check server logs:**
```bash
# View recent server logs
docker logs mervo-server | tail -100 | grep -i billing
```

4. **Manual execution:**
```bash
# Run job manually to see error details
node server/jobs/monthlyInvoicing.ts
```

**Resolution Options:**

- **Option A**: Restart scheduler and retry
```bash
# Restart billing scheduler
docker restart mervo-server
# Wait 2 AM to run automatically
```

- **Option B**: Manually process
```bash
curl -X POST https://api.mervo.com.au/api/super-admin/billing/process-monthly \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

- **Option C**: Check and fix root cause
  - Insufficient database permissions?
  - Stripe connection issues?
  - Invalid company data?

---

### Problem: Company Reports Incorrect Bill Amount

**Investigation:**

1. **Pull invoice details:**
```bash
curl -X GET https://api.mervo.com.au/api/super-admin/billing/companies/comp-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.invoices'
```

2. **Verify usage snapshots:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM company_usage_snapshots \
   WHERE companyId = 'comp-123' \
   AND date >= NOW() - INTERVAL '35 days' \
   ORDER BY date DESC;"
```

3. **Check applied coupons:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM company_coupons \
   WHERE companyId = 'comp-123' \
   AND status = 'active';"
```

4. **Recalculate invoice:**
```bash
# Use tierService to verify overage calculations
node -e "
const { tierService } = require('./server/billing/services/tierService');
const tier = tierService.getTierDefinition('professional');
const usage = { contractors: 12, storageGB: 165, apiCalls: 195000 };
const bill = tierService.calculateMonthlyBill(tier, usage);
console.log(JSON.stringify(bill, null, 2));
"
```

**Common Issues & Fixes:**

- **Issue**: Coupon still applied after expiry
  - **Fix**: Run expireOldCoupons job or manually remove coupon
  
- **Issue**: Overage charges incorrect
  - **Fix**: Verify tier definition in tierService.ts
  
- **Issue**: GST calculated wrong
  - **Fix**: GST should always be 10% on subtotal (after coupon)

---

### Problem: Company Suspended Incorrectly

**Symptoms:**
- Company reports access denied
- They say invoice was paid
- In `company_plans` table: status = 'suspended'

**Resolution:**

1. **Verify payment status:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM invoices \
   WHERE companyId = 'comp-123' \
   ORDER BY issuedDate DESC LIMIT 3;"
```

2. **Check payment history:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM payment_history \
   WHERE companyId = 'comp-123' \
   ORDER BY createdAt DESC LIMIT 5;"
```

3. **If paid but suspended:**
   - Mark invoice as paid manually
   - Unsuspend account
   
```bash
# Unsuspend via API
curl -X POST https://api.mervo.com.au/api/super-admin/billing/unsuspend/comp-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

4. **Investigate suspension trigger:**
   - Check when suspension happened
   - Verify it was due to actual overdue invoices
   - Check `billing_events` for context

---

### Problem: Usage Not Appearing in Dashboard

**Symptoms:**
- Company reports zero usage
- Last update was days ago
- Daily snapshot job status unknown

**Investigation:**

1. **Check last snapshot:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM company_usage_snapshots \
   WHERE companyId = 'comp-123' \
   ORDER BY date DESC LIMIT 1;"
```

2. **Check daily snapshot job status:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM billing_events \
   WHERE eventType = 'daily_snapshot' \
   ORDER BY createdAt DESC LIMIT 1;"
```

3. **Check if API calls are being recorded:**
```bash
# Query application logs for API activity
grep "comp-123" app.log | grep -c "POST\|GET" | tail -10
```

**Resolution:**

- **If job failed**: Check server logs and restart scheduler
- **If API calls not tracked**: Verify API middleware is recording calls
- **If storage not updating**: Check file system permissions

---

### Problem: Email Notifications Not Sent

**Symptoms:**
- Invoices not received by customers
- Alerts not appearing
- Suspension notices not sent

**Investigation:**

1. **Check email service configuration:**
```bash
# Verify SendGrid API key set
echo $SENDGRID_API_KEY
# Should not be empty
```

2. **Check email logs:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM billing_events \
   WHERE eventType LIKE 'email_%' \
   ORDER BY createdAt DESC LIMIT 10;"
```

3. **Test email sending:**
```bash
# Manual test
node -e "
const { sendEmail, emailTemplates } = require('./server/utils/emailTemplates');
sendEmail(
  'test@example.com',
  'Test Invoice',
  emailTemplates.invoiceGenerated({
    companyName: 'Test',
    invoiceNumber: 'INV-2025-12-00001',
    month: 'December 2025',
    totalAmount: 500,
    dueDate: '2025-12-15',
    invoiceUrl: 'https://example.com'
  })
);
"
```

**Resolution:**

- **Add SendGrid integration:**
  - Get API key from SendGrid dashboard
  - Set `SENDGRID_API_KEY` environment variable
  - Verify sender domain is confirmed

---

## Emergency Procedures

### Emergency: Scheduler Completely Down

**Symptoms:** Multiple jobs not running (invoices, alerts, suspensions, snapshots).

**Immediate Actions:**

1. **Verify scheduler status:**
```bash
docker ps | grep mervo-server
ps aux | grep scheduler
```

2. **Restart scheduler:**
```bash
# Stop server
docker stop mervo-server

# Restart with clean scheduler
docker start mervo-server

# Verify
docker logs mervo-server | grep "Scheduler\|billing"
```

3. **Check for blocking issues:**
```bash
# Database lock?
psql -U postgres -d mervo -c "SELECT * FROM pg_locks;"

# Check resource usage
docker stats mervo-server
```

---

### Emergency: Database Connection Lost

**Symptoms:** All billing operations failing, API returns 503.

**Immediate Actions:**

1. **Verify database:**
```bash
# Test connection
psql -U postgres -d mervo -c "SELECT 1;"
```

2. **Check Supabase status:**
   - Go to https://supabase.com/dashboard
   - Check if service is operational
   - Look for maintenance notices

3. **Fallback to read-only:**
   - Disable write operations temporarily
   - Return cached billing data
   - Notify customers of delay

4. **Re-establish connection:**
```bash
# Restart database connection pool
# Update SUPABASE_URL and SUPABASE_KEY if changed
docker restart mervo-server
```

---

### Emergency: Security Breach - Unauthorized Access

**Immediate Actions:**

1. **Revoke compromised API keys:**
```bash
# Update .env and restart
docker restart mervo-server
```

2. **Audit recent activity:**
```bash
psql -U postgres -d mervo -c \
  "SELECT * FROM billing_events \
   WHERE createdAt >= NOW() - INTERVAL '24 hours' \
   ORDER BY createdAt DESC;"
```

3. **Suspend suspicious accounts:**
```bash
# Via dashboard or API
curl -X POST https://api.mervo.com.au/api/super-admin/billing/suspend/comp-id \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "Security review"}'
```

4. **Notify support team** for customer outreach

---

## Monitoring

### Key Metrics to Track

**Daily Checks:**
```sql
-- MRR trend
SELECT DATE(createdAt) as date, COUNT(*) as invoices, SUM(total) as revenue
FROM invoices
WHERE createdAt >= NOW() - INTERVAL '7 days'
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- Suspended accounts
SELECT COUNT(*) FROM company_plans WHERE status = 'suspended';

-- Overdue invoices
SELECT COUNT(*) FROM invoices WHERE status = 'unpaid' AND dueDate < NOW();

-- Failed jobs
SELECT eventType, COUNT(*) FROM billing_events
WHERE eventType LIKE '%_failed%'
AND createdAt >= NOW() - INTERVAL '24 hours'
GROUP BY eventType;
```

### Alerts to Set Up

1. **No invoices generated**: `monthly_invoicing_failed` in last 48 hours
2. **Snapshot backlog**: Last snapshot > 48 hours old
3. **High failure rate**: >5% of API calls returning errors
4. **Overdue invoices piling up**: >10 invoices unpaid 14+ days
5. **Database connection issues**: Consecutive connection timeouts

### Grafana Dashboard Setup

Key panels to create:
- MRR over time (30-day trend)
- Revenue by tier (pie chart)
- Invoice payment rate (funnel)
- Job execution status (gauge)
- API error rate (time series)
- Suspension events (counter)

---

## Support & Escalation

### Support Channels

**Level 1 - Automated:**
- Billing API documentation
- Self-service dashboard
- Automated email responses

**Level 2 - Support Team:**
- Email: billing@mervo.com.au
- Phone: 1300 MERVO AU (1300 637 862)
- Response: 2-4 hours

**Level 3 - Engineering:**
- Slack: #billing-escalations
- Response: 1 hour
- On-call: Available 24/7 for critical issues

### Escalation Criteria

**Critical (Page on-call):**
- Billing system completely down
- Security breach
- Mass payment failures
- Database corruption

**High (Email within 1 hour):**
- Multiple job failures
- Invoices not generating
- Scheduler not running
- Large cohort of customers reporting issues

**Medium (Email within 4 hours):**
- Single job failure (recoverable)
- Individual invoice issue
- Coupon not working
- Usage tracking delayed

### Common Escalation Paths

**Customer reports wrong bill:**
1. Support verifies invoice calculation
2. If calculation error: Escalate to engineering
3. If coupon issue: Check expiry/limits
4. If overage error: Escalate to engineering

**Customer account suspended:**
1. Support checks invoice status
2. If invoice paid: Unsuspend immediately
3. If payment issue: Collect payment or escalate
4. If system error: Escalate to engineering

**Billing job failed:**
1. Support runs manual job via API
2. If succeeds: Monitor next run
3. If fails: Escalate to engineering with error logs
4. If critical: Page on-call engineer

---

## Quick Reference Commands

```bash
# Check system status
curl https://api.mervo.com.au/api/super-admin/billing/overview \
  -H "Authorization: Bearer $TOKEN"

# Generate invoice manually
curl -X POST https://api.mervo.com.au/api/super-admin/billing/process-monthly \
  -H "Authorization: Bearer $TOKEN"

# View recent billing events
psql -U postgres -d mervo -c \
  "SELECT eventType, description, createdAt FROM billing_events \
   ORDER BY createdAt DESC LIMIT 20;"

# Find overdue invoices
psql -U postgres -d mervo -c \
  "SELECT invoiceNumber, companyId, amount, dueDate FROM invoices \
   WHERE status = 'unpaid' AND dueDate < NOW();"

# Check scheduler status
docker logs mervo-server | grep -i "scheduler\|job"

# Restart billing system
docker restart mervo-server

# View active coupons
psql -U postgres -d mervo -c \
  "SELECT couponCode, discountValue, usageCount, usageLimit FROM coupon_definitions \
   WHERE status = 'active';"
```

---

**Last Updated**: December 6, 2025
**Version**: 1.0.0
**Maintenance Window**: Every Sunday 2-4 AM AEST
