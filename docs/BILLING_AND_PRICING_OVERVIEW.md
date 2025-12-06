# MERVO: Comprehensive Billing & Pricing Overview

**Version:** 1.0  
**Date:** December 6, 2025  
**Prepared for:** Mervo SaaS Application  
**Region:** Australia  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Model Overview](#business-model-overview)
3. [Tier Structure & Pricing](#tier-structure--pricing)
4. [Discount & Coupon System](#discount--coupon-system)
5. [Real-time Usage Monitoring](#real-time-usage-monitoring)
6. [Billing Cycle & Invoicing](#billing-cycle--invoicing)
7. [Automation & Enforcement](#automation--enforcement)
8. [Pricing Flexibility & Future-Proofing](#pricing-flexibility--future-proofing)
9. [Comparison: Stripe Connect (Removed)](#comparison-stripe-connect-removed)
10. [Technical Architecture](#technical-architecture)
11. [Risk Mitigation](#risk-mitigation)
12. [Australian Compliance Notes](#australian-compliance-notes)
13. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

Mervo will operate on a **tiered SaaS subscription model** with usage-based overage billing. Companies pay fixed monthly subscriptions based on their tier, with additional charges for exceeding resource limits. The system is designed for Australian operations with clear, transparent pricing and real-time usage monitoring.

**Key Principles:**
- Simple, predictable monthly pricing
- Fair overage charges for heavy users
- Transparent real-time dashboards
- Promotional flexibility via coupons
- Australian-optimized (AUD, GST compliance)

---

## Business Model Overview

### Revenue Streams

| **Stream** | **Source** | **% of Revenue (Est.)** |
|-----------|-----------|----------------------|
| **Primary** | Monthly SaaS subscriptions (base fee) | 85% |
| **Secondary** | Usage overages (storage, API, contractors) | 12% |
| **Tertiary** | Premium support (future) | 3% |

### Payment Processing

**Provider:** Stripe  
**Scope:** Company → App Owner (one-directional SaaS payments)  
**Contractors:** Self-managed by companies (app NOT involved in payouts)  
**Region:** Australia-focused with AUD support  
**Stripe Fee Impact:**
- Stripe retains ~2.9% + $0.30 per transaction
- Mervo receives ~97.1% of payment to bank account
- No payout fees (app doesn't send money to contractors)

### Why NOT Stripe Connect (Removed)

| **Feature** | **Why Removed** |
|-----------|-----------------|
| Stripe Connect (payout processing) | Companies manage contractor payments themselves |
| 1099 generation | Out of scope for SaaS billing |
| Multi-party settlements | Unnecessary complexity |

**Result:** Simplified to pure SaaS subscription model with zero payout logic.

---

## Tier Structure & Pricing

### Standard Tiers

| **Tier** | **Monthly Price** | **Contractors** | **Storage** | **API Calls/mo** | **Concurrent Connections** | **Target Market** |
|----------|------------------|-----------------|------------|-----------------|--------------------------|-------------------|
| **Starter** | $199 AUD | 5 | 5 GB | 50,000 | 2 | Solo/small teams (1-5 people) |
| **Professional** | $499 AUD | 50 | 25 GB | 500,000 | 10 | Mid-size (10-50 people) |
| **Enterprise** | $2,999 AUD | 500 | 100 GB | 5,000,000 | 50 | Large operations (100+ people) |
| **Custom** | Negotiated | Unlimited | Unlimited | Unlimited | Unlimited | Enterprises with custom needs |

### Overage Pricing (Applies to All Tiers)

| **Resource** | **Price** | **When Applied** |
|-------------|----------|-----------------|
| Storage | $0.75 AUD per GB | When usage exceeds tier limit |
| API Calls | $0.10 AUD per 1,000 calls | When calls exceed tier limit |
| Contractor Seats | $5.00 AUD per additional seat | For each contractor over limit |

### Pricing Calculation Example

**Scenario:** Professional tier ($499/mo) uses 27 GB storage (limit: 25 GB)

```
Base Monthly Fee:           $499.00
Storage Overage:
  - Excess: 27 GB - 25 GB = 2 GB
  - Cost: 2 × $0.75 =       $1.50
─────────────────────────────────
Total This Month:           $500.50
```

### Why This Structure?

✅ **Clear segmentation** – each tier targets specific company size  
✅ **Growth path** – natural progression from Starter → Professional → Enterprise  
✅ **Overage fairness** – heavy users pay for what they use  
✅ **Predictability** – companies know max they'll pay (with caps)  
✅ **Simple math** – easy for customers to understand  

---

## Discount & Coupon System

### Why Coupons?

- Attract new customers (onboarding discounts)
- Reward referrals and long-term loyalty
- Run seasonal promotions
- Test pricing elasticity
- Negotiate custom deals for enterprise

### Coupon Types

| **Type** | **Use Case** | **Example Code** | **How It Works** |
|---------|------------|-----------------|-----------------|
| **Percentage Off** | General promotion | `LAUNCH20` | 20% off monthly bill |
| **Fixed Amount Off** | Specific campaign | `SUMMER50` | $50 off each month |
| **Annual Prepay Discount** | Encourage long-term commitment | `ANNUAL40` | 40% off if pay 12 months upfront |
| **Free Trial** | Onboarding | `FREETRIAL30` | 30 days free, then charged |
| **Referral Bonus** | Growth via word-of-mouth | `REFER20` | 20% off both referrer + new customer |

### Coupon Application Rules

**Timing:** Applied at subscription creation or manually by admin  
**Scope:** Per company, not per individual transaction  
**Duration:** One-time (single billing cycle) OR recurring (all future cycles)  
**Stacking:** No multiple coupons per company (one active coupon at a time)  
**Expiry:** Coupons auto-disable after expiration date  
**Usage Limits:** Optional cap on how many companies can use (e.g., first 100 only)  

### Coupon Metadata to Track

```
coupon_id:           UUID
coupon_code:         "LAUNCH20" (unique, case-insensitive)
discount_type:       percentage | fixed_amount | trial_days
discount_value:      20 (for 20%), or 50 (for $50), or 30 (for 30 days)
recurring:           true | false (repeats each month or one-time)
active_from:         2025-12-01
expires_at:          2025-12-31
usage_limit:         100 (max companies, null = unlimited)
usage_count:         45 (companies who've used it so far)
created_by:          admin_user_id
created_date:        2025-12-01
notes:               "Q4 2025 Launch Campaign"
status:              active | expired | suspended
```

### Coupon Reporting for App Owner

**Example Queries:**
- "Which coupons drove the most new customers this month?"
- "What's our total discount cost in December?"
- "Is this coupon still profitable?" (discount cost vs. customer lifetime value)
- "Which customers used a coupon vs. full price?"

**Dashboard Insights:**
- Coupon usage trends (by month, by campaign)
- Revenue impact (how much did discounts cost us?)
- Customer quality (do coupon customers churn faster?)

---

## Real-time Usage Monitoring

### What Gets Tracked Daily

| **Metric** | **Why** | **Impact** |
|-----------|--------|----------|
| **Storage (GB)** | Costs us Supabase fees | Overage charges for company |
| **API Calls** | Costs us Supabase fees | Overage charges for company |
| **Contractors** | Indicates company growth | Upsell opportunity or overage fee |
| **Concurrent Connections** | Real-time usage | Billing metric for large customers |
| **Data Exported** | Compliance & archival | Tracked for audit trail |

### Dashboard Views

#### **View 1: Company Admin Dashboard** (`/admin/billing`)

**Purpose:** Company sees their own usage & costs

**Displays:**
- Current plan name & monthly price
- Real-time usage gauges:
  ```
  Storage:      4.2 GB / 5 GB (84%) ████████░ 
  API Calls:    45,000 / 50,000 (90%) █████████░
  Contractors:  3 / 5 (60%) ██████░░░░
  ```
- **Estimated bill for current month:**
  ```
  Base plan:              $199.00
  Storage overage:        $0.00 (within limit)
  API call overage:       $0.00 (within limit)
  ───────────────────────────────
  Estimated total:        $199.00
  ```
- Invoice history (last 12 months)
- Download invoice links
- **Action buttons:**
  - "Upgrade to Professional"
  - "View detailed usage breakdown"
  - "Download usage report"

#### **View 2: Super-Admin Revenue Dashboard** (`/super-admin/billing`)

**Purpose:** App owner sees all companies' billing

**Displays:**
- **Summary metrics:**
  ```
  Total Monthly Recurring Revenue (MRR):  $12,455
  Active subscriptions:                   25
  Companies over usage limit:             3
  Past-due invoices:                      1
  ```

- **Company list table:**
  ```
  | Company Name  | Plan      | Monthly | Usage Cost | Total    | Status    |
  |────────────────────────────────────────────────────────────────────────|
  | Acme Corp     | Prof      | $499    | $25.50     | $524.50  | Active    |
  | Bob's Services| Starter   | $199    | $0.00      | $199.00  | Active    |
  | XYZ Inc       | Enterprise| $2,999  | $150.00    | $3,149   | Suspended |
  | FastClean LLC | Starter   | $199    | $5.75      | $204.75  | Active    |
  | ...           |           |         |            |          |           |
  ```

- **Charts:**
  - Revenue by tier (pie chart)
  - MRR trend (line chart over 12 months)
  - Churn vs. new customers (bar chart)
  - Top 10 highest-spending companies

#### **View 3: Super-Admin Detailed Company View** (`/super-admin/billing/[company_id]`)

**Purpose:** App owner drills into one company's details

**Displays:**
- **Company info:**
  ```
  Company: Acme Corp (ID: c123abc)
  Plan: Professional ($499/month)
  Status: Active | Suspended | Pending Payment
  Active since: 2025-01-15
  Employees using app: 12
  ```

- **Current billing period usage (Dec 1-31):**
  ```
  Storage:       23.5 GB / 25 GB (94%)
    └─ Overage: 0 GB @ $0.75/GB = $0.00
  API Calls:     487,000 / 500,000 (97%)
    └─ Overage: 0 calls @ $0.0001/call = $0.00
  Contractors:   48 / 50 (96%)
    └─ Overage: 0 @ $5.00 each = $0.00
  ```

- **Estimated bill (if usage continues):**
  ```
  Base plan:     $499.00
  Overages:      $0.00
  Coupons:       -$0.00
  Total:         $499.00
  ```

- **Last 7 days usage trend** (line graph):
  - Storage climbing from 22 GB → 23.5 GB
  - API calls stable at ~70k/day

- **Top data consumers:**
  ```
  job_photos:     18 GB (76%)
  job_reports:    3.2 GB (14%)
  timesheets:     2.3 GB (10%)
  ```

- **Applied coupons & discounts:**
  ```
  Coupon: "LAUNCH20" (20% off)
  Applied: 2025-01-15
  Recurring: No (one-time for first month only)
  Discount amount: -$99.80
  ```

- **Billing history:**
  ```
  | Date   | Period      | Amount | Overage | Coupon | Total  | Status |
  |──────────────────────────────────────────────────────────────────|
  | Dec 1  | Dec 1-31    | $499   | $0.00   | $0     | $499   | Paid   |
  | Nov 1  | Nov 1-30    | $199   | $3.50   | -$20   | $182.50| Paid   |
  | Oct 1  | Oct 1-31    | $199   | $0.00   | -$99.80| $99.20 | Paid   |
  ```

- **Manual admin actions:**
  - Apply/remove coupon
  - Force upgrade/downgrade plan
  - Mark invoice as paid (manual reconciliation)
  - Suspend/unsuspend account
  - Export company data

---

## Billing Cycle & Invoicing

### Cycle Timeline

```
Dec 1 ─────────────────────── Dec 31 ──→ Jan 1 ──────→ Jan 7 ──→ Jan 8+
 ↓                            ↓          ↓             ↓       ↓
Cycle                    Snapshot      Invoice    Payment Due  Reminder
Starts                   Captured      Generated  (5 days)     (if unpaid)
               Charges accumulated     Emailed to
               daily (overages)        company admin
```

### Invoice Structure

```
═══════════════════════════════════════════════════════════════════
                         MERVO INVOICE
───────────────────────────────────────────────────────────────────
Invoice #: INV-2025-12-ABC123
Company: Acme Corp
Billing Period: December 1 - December 31, 2025
Invoice Date: December 31, 2025
Due Date: January 5, 2026

───────────────────────────────────────────────────────────────────
DESCRIPTION                           QUANTITY    UNIT PRICE    AMOUNT
───────────────────────────────────────────────────────────────────
Professional Plan (Dec 1-31)          1 month     $499.00       $499.00
Storage Overage                       3 GB        $0.75/GB      $2.25
API Calls Overage                     50,000      $0.0001       $5.00
Contractor Seats (over limit)         2 seats     $5.00         $10.00
───────────────────────────────────────────────────────────────────
Subtotal                                                        $516.25
Discount: "PARTNER20" (-20%)                                  -$103.25
───────────────────────────────────────────────────────────────────
Subtotal after discount                                        $413.00
GST (10% - if applicable)                                      $41.30
───────────────────────────────────────────────────────────────────
TOTAL DUE                                                      $454.30
───────────────────────────────────────────────────────────────────
Payment Method: Stripe (automatically charged)
Status: Pending

Notes: Thank you for using Mervo! Your next billing cycle starts Jan 1.
═══════════════════════════════════════════════════════════════════
```

### Late Payment Handling

| **Days Past Due** | **Action** | **Communication** |
|-----------------|----------|------------------|
| 3 days | Send first reminder | Email to billing contact |
| 7 days | Suspend account access | Email + SMS alert |
| 14 days | Auto-retry payment | Email notification |
| 30 days | Manual collection review | Email from support team |

---

## Automation & Enforcement

### Daily Snapshot Job

**What:** Captures usage metrics at end of each day  
**When:** 11:59 PM daily  
**What's captured:**
- Total storage used (GB)
- API calls used (count)
- Active contractors (count)
- Peak concurrent connections
- Data exported (GB)

**Stored in:** `company_usage_snapshots` table  
**Used for:** Trend analysis, forecasting, overage calculation

### Overage Alerts (Configurable per company)

| **Threshold** | **Alert** | **Action** |
|--------------|----------|----------|
| 50% of limit | Info email | "You're using 50% of storage" |
| 75% of limit | Warning email | "Upgrade soon to avoid overage charges" |
| 100% of limit | Urgent email | "You've exceeded limit. Charges apply next month." |
| 110% of limit | SMS + email | "Please address immediately" |

### Automated Actions (Company Can Choose)

```
[ ] Auto-upgrade to next tier when limit exceeded
[ ] Cap API calls (return 503 error after limit reached)
[ ] Block new storage uploads (return 403 error)
[ ] Send alerts at 50%, 75%, 100% of limit
[ ] Suspend if 7 days past due
```

### Suspension Logic

**Trigger:** 7 days past invoice due date  
**What happens:**
- All API access blocked (return 403 "Account Suspended")
- Company sees message: "Your account is suspended due to payment overdue."
- Admin dashboard shows: "Payment overdue. Unsuspend by paying invoice."

**Reversal:** Payment received → automatic unsuspend within 1 hour

---

## Pricing Flexibility & Future-Proofing

### Why This Design Is Flexible

1. **Pricing isolated in config file** (`tierService.ts`)
   - Change prices → update config → instant effect
   - No database migrations needed
   - No code recompilation required

2. **No hardcoding in Stripe**
   - We control all pricing logic
   - Stripe just processes payment

3. **Grandfathering supported**
   - Old customers keep old rates indefinitely
   - New customers get new rates
   - No forced migrations

4. **A/B testing enabled**
   - Test new tier with 10% of signups
   - Rest see old tiers
   - Compare results

5. **Coupon system extensible**
   - Add new coupon types without code changes
   - Test new discount strategies safely

### Pricing Evolution Path (Example Timeline)

```
Month 1-3:   All customers on standard pricing
             Monitor: churn, overage usage, MRR

Month 4:     Introduce referral coupons "REFER20"
             Goal: organic growth

Month 6:     Test new tier: "Growth" at $299 for new signups
             Old tiers unchanged
             Measure: conversion, ARR impact

Month 9:     "Growth" tier performs well
             Grandfather old customers; move new to Growth
             Introduce "Mid-Market" tier at $1,499

Month 12:    Analyze full year
             Adjust pricing based on market feedback
             Consider raising Starter tier if profitable
```

### Easy Pricing Changes

| **Scenario** | **Action** | **Time** |
|----------|---------|--------|
| Lower prices to compete | Update tier prices in config | 2 minutes |
| Add new tier | Add entry to `TIER_DEFINITIONS` | 5 minutes |
| Reduce overage costs | Change `OVERAGE_PRICING` values | 2 minutes |
| Test new pricing model | Create separate tier config for new signups | 10 minutes |
| Increase all tiers 10% | Multiply all numbers by 1.1 | 3 minutes |

---

## Technical Architecture

### Data Model (Database Tables)

```sql
-- Core billing tables
company_plans:
  - company_id (UUID, FK)
  - plan_tier (enum: starter|professional|enterprise|custom)
  - monthly_cost (decimal)
  - active_from (date)
  - active_to (date, nullable)
  - status (active|suspended|cancelled)

company_usage_snapshots:
  - id (UUID, PK)
  - company_id (UUID, FK)
  - snapshot_date (date)
  - storage_gb (decimal)
  - api_calls_count (integer)
  - contractors_active (integer)
  - concurrent_connections (integer)
  - data_exported_gb (decimal)

company_coupons:
  - id (UUID, PK)
  - company_id (UUID, FK)
  - coupon_code (string, unique)
  - discount_type (enum: percentage|fixed_amount|trial_days)
  - discount_value (decimal)
  - recurring (boolean)
  - applied_date (datetime)
  - expires_at (datetime, nullable)
  - status (active|expired|used)

invoices:
  - id (UUID, PK)
  - company_id (UUID, FK)
  - period_start (date)
  - period_end (date)
  - base_cost (decimal)
  - storage_overage_cost (decimal)
  - api_overage_cost (decimal)
  - contractor_overage_cost (decimal)
  - coupon_discount (decimal, nullable)
  - tax_amount (decimal)
  - total_due (decimal)
  - paid_amount (decimal)
  - status (draft|sent|paid|overdue)
  - created_date (datetime)
  - due_date (date)

stripe_subscriptions:
  - company_id (UUID, FK)
  - stripe_customer_id (string)
  - stripe_subscription_id (string)
  - plan_tier (enum)
  - status (active|cancelled|suspended)
  - last_sync (datetime)
```

### Key Services

**1. tierService.ts** – Plan definitions & validation
```typescript
- getPlanLimits(tier) → limits object
- validateUsageAgainstPlan(usage, tier) → boolean
- calculateOverageCost(usage, tier) → decimal
- listAllTiers() → array of plans
```

**2. usageService.ts** – Real-time usage calculation
```typescript
- getCurrentUsage(company_id) → usage object
- getUsageForDate(company_id, date) → snapshot
- getUsageTrend(company_id, days) → array of snapshots
- captureSnapshot(company_id) → saves daily snapshot
```

**3. invoiceService.ts** – Invoice generation & management
```typescript
- generateInvoice(company_id, period) → invoice object
- getInvoiceHistory(company_id) → array of invoices
- markAsPaid(invoice_id) → updates status
- sendInvoiceEmail(invoice_id) → emails PDF
```

**4. couponService.ts** – Coupon validation & application
```typescript
- validateCoupon(code, company_id) → { valid, reason }
- applyCoupon(company_id, code) → discount object
- removeCoupon(company_id) → restores full price
- getCouponStats() → usage metrics
```

**5. billingService.ts** – Orchestrates entire workflow
```typescript
- processMonthlyBilling() → generates all invoices
- handlePaymentSuccess(invoice_id) → updates status
- handlePaymentFailure(invoice_id) → retry logic
- suspendOverdueAccounts() → blocks access
```

### API Endpoints

**Company Admin APIs:**

```
GET  /api/billing/usage
     Response: { storage_gb, api_calls, contractors, ... }

GET  /api/billing/estimated-cost
     Response: { base_cost, overages, coupon_discount, total }

GET  /api/billing/invoices
     Response: [ { id, date, amount, status }, ... ]

GET  /api/billing/invoices/:id
     Response: { full invoice details + PDF link }

POST /api/billing/apply-coupon
     Body: { coupon_code }
     Response: { valid, discount_amount, new_total }

GET  /api/billing/plan
     Response: { tier, monthly_cost, limits }
```

**Super-Admin APIs:**

```
GET  /api/super-admin/billing/companies
     Response: [{ company_name, plan, mrr, usage_cost, total }, ...]

GET  /api/super-admin/billing/company/:id
     Response: { detailed billing + usage breakdown }

POST /api/super-admin/billing/coupons
     Body: { code, discount_type, value, ... }
     Response: { coupon created }

GET  /api/super-admin/billing/coupons
     Response: [{ coupon_id, code, usage_count, revenue_impact }, ...]

POST /api/super-admin/billing/company/:id/suspend
     Response: { company_id, status: "suspended" }

POST /api/super-admin/billing/company/:id/adjust-invoice
     Body: { invoice_id, adjustment_amount, reason }
     Response: { updated invoice }
```

---

## Risk Mitigation

### Identified Risks & Mitigations

| **Risk** | **Severity** | **Mitigation Strategy** |
|---------|-----------|----------------------|
| Customers exploit "unlimited" tiers | HIGH | Hard limits + overage charges apply automatically |
| Pricing too high, churn increases | MEDIUM | Monitor monthly; adjust quarterly if needed |
| Coupon abuse (multiple codes) | MEDIUM | No stacking rule enforced; track per company |
| Storage/API costs spike unexpectedly | HIGH | Daily snapshots + 80% threshold alerts + caps |
| Late payment issues cascade | MEDIUM | Auto-suspend after 7 days; payment retry logic |
| Customers don't understand overages | MEDIUM | Clear dashboard gauges + educational emails at 80% |
| Tax calculation errors (GST) | MEDIUM | Built-in GST calc; quarterly reconciliation |
| Stripe sync failures | LOW | Webhook verification + manual reconciliation UI |
| Coupon code conflicts | LOW | UUID coupon IDs; unique code constraint in DB |

### Operational Safeguards

```
✅ Daily health check: compare Stripe payments to invoice totals
✅ Weekly audit: spot-check 10 random company bills
✅ Monthly reconciliation: total MRR vs. Stripe deposits
✅ Quarterly pricing review: analyze churn, upgrades, overage usage
✅ Annual audit: full financial reconciliation with accountant
```

---

## Australian Compliance Notes

### Regulatory Requirements

| **Requirement** | **Implementation** |
|-----------------|------------------|
| **GST (10%)** | Applied to invoice line items; shown separately |
| **Currency** | AUD throughout; Stripe handles conversion if needed |
| **Privacy Act** | Data retention policy in ToS; deletion upon request |
| **ACNC** (if non-profit) | Special pricing tier available on request |
| **ACL** (Australian Consumer Law) | 30-day refund policy for annual plans |

### Invoice Compliance

- ✅ ABN/ACN visible on invoices
- ✅ Invoice numbers unique & sequential
- ✅ GST shown as separate line item
- ✅ Payment terms clearly stated (due within 5 days)
- ✅ Late payment penalties (if any) disclosed upfront

---

## Implementation Roadmap

### Phase 1: Data Layer (Week 1)
- [ ] Create database migrations
- [ ] Set up company_plans table
- [ ] Set up company_usage_snapshots table
- [ ] Set up invoices table
- [ ] Set up company_coupons table
- [ ] Set up stripe_subscriptions table

**Deliverable:** Database schema ready; can seed with test data

### Phase 2: Core Services (Week 2)
- [ ] Build tierService.ts (plan definitions & validation)
- [ ] Build usageService.ts (real-time usage)
- [ ] Build invoiceService.ts (invoice generation)
- [ ] Build couponService.ts (coupon logic)
- [ ] Build billingService.ts (orchestration)

**Deliverable:** All services tested with unit tests

### Phase 3: APIs (Week 3)
- [ ] Build company admin billing endpoints
- [ ] Build super-admin billing endpoints
- [ ] Build coupon endpoints
- [ ] Add permission checks (admin-only)
- [ ] Integration tests

**Deliverable:** All APIs documented & tested

### Phase 4: Company Dashboard (Week 4)
- [ ] Build `/admin/billing` page
- [ ] Real-time usage gauges
- [ ] Estimated bill calculation
- [ ] Invoice history & download
- [ ] Plan upgrade/downgrade CTA

**Deliverable:** Company can view their billing

### Phase 5: Super-Admin Dashboards (Week 5)
- [ ] Build `/super-admin/billing` overview
- [ ] Build `/super-admin/billing/[id]` detail view
- [ ] MRR chart & trends
- [ ] Company table with sorting/filtering
- [ ] Coupon management UI

**Deliverable:** Admin can see all revenue & manage accounts

### Phase 6: Automation & Testing (Week 6)
- [ ] Cron job for daily snapshots
- [ ] Monthly invoice generation job
- [ ] Overage alert emails
- [ ] End-to-end tests
- [ ] Performance testing with sample data

**Deliverable:** System runs automatically; minimal manual intervention

### Phase 7: Documentation & Training (Week 7)
- [ ] Admin runbook (how to manage coupons, suspend accounts)
- [ ] Company-facing billing help docs
- [ ] API documentation
- [ ] Video walkthrough of dashboards
- [ ] Troubleshooting guide

**Deliverable:** All stakeholders trained

**Total Timeline:** ~7 weeks for full implementation  
**Resources Needed:** 1 backend engineer, 1 frontend engineer, 1 QA tester

---

## Appendix: Pricing Comparison Matrix

### vs. Competitors

| **Feature** | **Mervo** | **Competitor A** | **Competitor B** |
|-----------|----------|-----------------|-----------------|
| Base pricing | Tiered ($199-$2,999) | Flat $999/mo | Flat $499/mo |
| Overage charges | Yes (transparent) | Included in plan | Extra $100/mo |
| Contractor limit | Yes (with overage) | Unlimited | 50 max |
| Coupons/discounts | Yes | No | Limited |
| Real-time dashboard | Yes | No | Yes |
| Australian support | Yes (local) | No | Yes (outsourced) |
| Fair pricing for small teams | ✅ Starter at $199 | ❌ $999 min | ✅ $499 reasonable |
| Fair pricing for large teams | ✅ Enterprise at $2,999 | ✅ Fits enterprise | ❌ Cap at 50 contractors |

---

## Appendix: Glossary

| **Term** | **Definition** |
|---------|--------------|
| **MRR** | Monthly Recurring Revenue – total subscription fees expected each month |
| **Overage** | Usage exceeding plan limits; charged separately |
| **Tier** | Plan level (Starter, Professional, Enterprise) |
| **Coupon** | Discount code applying % off, $ off, or free trial |
| **Snapshot** | Daily capture of company's usage metrics |
| **SaaS** | Software-as-a-Service; subscription-based software |
| **GST** | Goods and Services Tax (Australia's VAT, 10%) |
| **Churn** | Customers cancelling their subscription |
| **ARR** | Annual Recurring Revenue; MRR × 12 |
| **LTV** | Lifetime Value; total revenue from one customer |

---

## Contact & Approval

**Document Created By:** AI Assistant  
**For:** Mervo SaaS Application (Australia)  
**Approval Status:** Awaiting stakeholder review  

**Sign-Off:**

| **Role** | **Name** | **Date** | **Signature** |
|---------|---------|---------|-------------|
| Founder/CEO | _________________ | __________ | _________________ |
| Finance/Controller | _________________ | __________ | _________________ |
| Engineering Lead | _________________ | __________ | _________________ |

---

**End of Document**

*This document is confidential and intended for internal use only.*
