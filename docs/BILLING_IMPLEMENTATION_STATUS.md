# MERVO Billing System - Implementation Summary

## ✅ Completed Components

### 1. Database Layer (Migration 013)

Created comprehensive billing database schema:

- **company_plans** - Tracks subscription tiers for each company
- **company_usage_snapshots** - Daily snapshots of resource usage
- **company_coupons** - Applied discount codes per company
- **coupon_definitions** - Master list of all available coupons
- **invoices** - Monthly invoices with line items
- **stripe_subscriptions** - Sync table for Stripe data
- **payment_history** - Audit trail of all payments
- **billing_events** - Event log for billing actions

### 2. Core Services (5 services implemented)

**tierService.ts** - Plan definitions & calculations
- Tier pricing: Starter ($199), Professional ($499), Enterprise ($2,999), Custom
- Overage pricing: $0.75/GB storage, $0.10/1k API calls, $5/contractor seat
- Usage validation & percentage calculations
- Alert level determination (normal/warning/critical/exceeded)
- Annual prepayment savings calculator

**usageService.ts** - Real-time usage tracking
- Current usage calculation (contractors, storage, API calls)
- Daily snapshot capture for all companies
- Usage trend analysis (30-day historical)
- Storage breakdown by category
- API call increment tracking

**couponService.ts** - Discount code management
- Create/validate/apply coupons to companies
- Support for percentage, fixed amount, and trial day discounts
- Recurring vs one-time coupons
- Usage limits & expiration dates
- Coupon statistics & reporting

**invoiceService.ts** - Invoice generation & management
- Generate monthly invoices with accurate calculations
- Track invoice status (draft/sent/paid/overdue)
- Payment recording with Stripe integration
- Overdue invoice detection
- Invoice line item breakdown

**billingService.ts** - Orchestration layer
- Company billing dashboard data aggregation
- Super-admin MRR & revenue reporting
- Plan upgrades/downgrades
- Company suspension/unsuspension for non-payment
- Monthly billing cycle automation
- Usage alert triggering

### 3. API Endpoints

**Company Admin APIs** (`/api/billing/*`)
- `GET /dashboard` - Complete billing overview
- `GET /usage` - Current usage metrics
- `GET /usage/trend` - Historical usage data
- `GET /usage/breakdown` - Storage breakdown
- `GET /estimated-cost` - Current month estimate
- `GET /invoices` - Invoice history
- `GET /invoices/:id` - Single invoice details
- `GET /plan` - Current plan details
- `GET /tiers` - Available plans
- `POST /apply-coupon` - Apply discount code
- `DELETE /coupon` - Remove active coupon
- `POST /change-plan` - Request plan change

**Super-Admin APIs** (`/api/super-admin/billing/*`)
- `GET /dashboard` - System-wide billing overview
- `GET /companies` - All companies with billing info
- `GET /company/:id` - Detailed company billing
- `POST /company/:id/suspend` - Suspend for non-payment
- `POST /company/:id/unsuspend` - Restore access
- `POST /company/:id/change-plan` - Force plan change
- `POST /company/:id/apply-coupon` - Apply coupon to company
- `GET /invoices` - All invoices (filterable)
- `POST /invoice/:id/mark-paid` - Manual payment recording
- `GET /coupons` - All coupon definitions
- `POST /coupons` - Create new coupon
- `GET /coupons/stats` - Coupon usage statistics
- `POST /process-monthly` - Trigger monthly billing
- `POST /suspend-overdue` - Suspend all overdue accounts
- `POST /send-usage-alerts` - Send usage threshold alerts
- `GET /tiers` - All tier definitions

### 4. Frontend Dashboards

**Company Billing Dashboard** (`/src/pages/admin/BillingDashboard.tsx`)
- ✅ Real-time usage gauges (contractors, storage, API calls)
- ✅ Color-coded alert levels (normal/warning/critical/exceeded)
- ✅ Estimated monthly bill breakdown
- ✅ Coupon code application interface
- ✅ Invoice history table with download links
- ✅ Upgrade recommendation when overages exceed $10
- ✅ GST (10%) calculation and display
- ✅ Responsive grid layout

## 🚧 Remaining Work

### 5. Super-Admin Billing Dashboards (Not Started)

**Files to Create:**
- `/src/pages/super-admin/BillingOverview.tsx` - MRR dashboard with charts
- `/src/pages/super-admin/BillingCompanyDetail.tsx` - Detailed company view
- `/src/components/billing/MRRChart.tsx` - Monthly recurring revenue chart
- `/src/components/billing/CompanyTable.tsx` - Sortable company list
- `/src/components/billing/CouponManager.tsx` - Coupon CRUD interface

**Features Needed:**
- MRR trend line chart (Chart.js or Recharts)
- Revenue by tier pie chart
- Top 10 highest-spending companies table
- Filterable/sortable company list
- Coupon creation form with validation
- Manual invoice adjustment interface
- Bulk suspension/unsuspension actions

### 6. Automation Jobs (Not Started)

**Files to Create:**
- `/server/jobs/dailyUsageSnapshot.ts` - Cron job for snapshot capture
- `/server/jobs/monthlyInvoicing.ts` - End-of-month invoice generation
- `/server/jobs/overageAlerts.ts` - Usage threshold email alerts
- `/server/jobs/suspendOverdueAccounts.ts` - Auto-suspend after 7 days
- `/server/jobs/expireOldCoupons.ts` - Deactivate expired coupons
- `/server/utils/emailTemplates.ts` - HTML email templates

**Cron Schedule:**
```typescript
// In server/index.ts or job scheduler
cron.schedule('0 23 * * *', dailyUsageSnapshot);        // 11 PM daily
cron.schedule('0 2 1 * *', monthlyInvoicing);           // 2 AM on 1st of month
cron.schedule('0 9 * * *', overageAlerts);              // 9 AM daily
cron.schedule('0 10 * * *', suspendOverdueAccounts);    // 10 AM daily
cron.schedule('0 3 * * *', expireOldCoupons);           // 3 AM daily
```

**Email Templates Needed:**
- Usage threshold warning (50%, 75%, 100%)
- Invoice ready for download
- Payment overdue reminder (3 days, 7 days)
- Account suspended notification
- Plan upgrade recommendation

### 7. Tests & Documentation (Not Started)

**Unit Tests:**
- `tierService.test.ts` - Test all pricing calculations
- `usageService.test.ts` - Test usage aggregation
- `couponService.test.ts` - Test coupon validation
- `invoiceService.test.ts` - Test invoice generation
- `billingService.test.ts` - Test orchestration logic

**Integration Tests:**
- API endpoint tests for all `/api/billing/*` routes
- API endpoint tests for all `/api/super-admin/billing/*` routes
- End-to-end billing cycle test (signup → usage → invoice → payment)

**Documentation:**
- API documentation (OpenAPI/Swagger spec)
- Admin runbook for manual billing operations
- Troubleshooting guide for common billing issues
- Video walkthrough of billing dashboards

## 📊 System Architecture

### Data Flow

```
User Activity → Usage Tracking → Daily Snapshot → Monthly Invoice → Payment
     ↓               ↓                ↓                 ↓             ↓
  API Calls     usageService    Supabase DB    invoiceService   Stripe
  Storage       captureSnapshot  snapshots      generateInvoice  webhooks
  Contractors                    table          table
```

### Pricing Calculation Flow

```
1. Get company's plan tier (tierService.getTierDefinition)
2. Fetch current period usage (usageService.getCurrentPeriodUsage)
3. Calculate overages (tierService.calculateOverageCost)
4. Check for active coupon (couponService.getActiveCouponForCompany)
5. Apply discount (couponService.calculateDiscount)
6. Add GST 10% (tierService.GST_RATE)
7. Generate invoice (invoiceService.generateInvoice)
```

### Tier Limits Reference

| Tier | Price | Contractors | Storage | API Calls | Connections |
|------|-------|-------------|---------|-----------|-------------|
| Starter | $199 | 5 | 5 GB | 50k | 2 |
| Professional | $499 | 50 | 25 GB | 500k | 10 |
| Enterprise | $2,999 | 500 | 100 GB | 5M | 50 |
| Custom | Negotiated | Unlimited | Unlimited | Unlimited | Unlimited |

### Overage Pricing

- **Storage**: $0.75 AUD per GB over limit
- **API Calls**: $0.10 AUD per 1,000 calls over limit
- **Contractors**: $5.00 AUD per extra seat

### Alert Thresholds

- **50% usage**: Info email ("You're halfway through your limit")
- **75% usage**: Warning email ("Approaching limit, consider upgrading")
- **100% usage**: Critical email ("Limit reached, overages will apply")
- **110% usage**: Urgent SMS + email ("Take action immediately")

## 🔧 Quick Start Guide

### Run Database Migration

```bash
# Connect to Supabase and run migration
psql $DATABASE_URL < server/db/migrations/013_billing_tables.sql
```

### Seed Test Data

```typescript
// Create test company plan
await supabase.from('company_plans').insert({
  company_id: 'test-company-uuid',
  plan_tier: 'professional',
  monthly_cost: 499,
  status: 'active'
});

// Create test coupon
await supabase.from('coupon_definitions').insert({
  coupon_code: 'TESTCODE20',
  discount_type: 'percentage',
  discount_value: 20,
  recurring: false,
  status: 'active'
});
```

### Test Billing Dashboard

1. Navigate to `/admin/billing`
2. View usage gauges (should show placeholder data)
3. Apply coupon code "TESTCODE20"
4. Check estimated bill updates with discount

### Monitor Billing Health

```sql
-- Check active subscriptions
SELECT COUNT(*) FROM company_plans WHERE status = 'active';

-- Check MRR
SELECT SUM(monthly_cost) FROM company_plans WHERE status = 'active';

-- Check overdue invoices
SELECT * FROM invoices WHERE status = 'overdue';

-- Check coupon usage
SELECT coupon_code, usage_count FROM coupon_definitions ORDER BY usage_count DESC;
```

## 🎯 Next Steps

1. **Implement super-admin dashboards** - Visualize MRR, revenue trends, company health
2. **Set up cron jobs** - Automate daily snapshots, monthly invoicing, alerts
3. **Write comprehensive tests** - Ensure billing accuracy with edge case coverage
4. **Integrate Stripe webhooks** - Sync subscription changes, payment events
5. **Create email templates** - Professional branded emails for all billing events
6. **Add usage analytics** - Track which companies are close to limits, upsell opportunities
7. **Build invoice PDF generator** - Downloadable invoices with proper formatting
8. **Implement annual prepayment** - 40% discount for 12-month upfront payment

## 📝 Notes

- All pricing in AUD (Australian Dollars)
- GST (10%) applied to all invoices
- Invoices due 5 days after month end
- Auto-suspend after 7 days overdue
- One active coupon per company (no stacking)
- Usage snapshots captured daily at 11:59 PM
- Storage calculated from job photos, exports, reports
- API calls tracked via middleware (increment on each request)
- Contractor count = active contractors only

## 🔒 Security Considerations

- ✅ Permission checks on all billing endpoints (company-specific data)
- ✅ Super-admin-only access for sensitive operations
- ✅ Coupon codes case-insensitive but stored uppercase
- ✅ Invoice amounts immutable once generated
- ✅ Payment history audit trail (never deleted)
- ✅ Billing events logged for compliance

## 🐛 Known Limitations

- Storage calculation is placeholder (needs real file size queries)
- Concurrent connections not tracked yet (needs WebSocket implementation)
- PDF invoice generation not implemented
- Email sending not wired up (placeholders in place)
- Stripe webhook handler needs billing integration
- No A/B testing framework for pricing experiments
- Annual prepayment not fully implemented

---

**Total Implementation Progress**: ~60% complete (core logic done, UIs and automation remaining)

**Estimated Remaining Effort**: 2-3 weeks for full production readiness
