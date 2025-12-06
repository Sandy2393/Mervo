# Billing System - OpenAPI Specification

## Overview
Complete REST API documentation for Mervo's billing system with endpoints for company admins and super-admins.

---

## Company Admin Endpoints

### Base URL
```
https://api.mervo.com.au/api/billing
```

### Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer <jwt-token>
```

---

## GET /dashboard
Returns comprehensive billing overview for authenticated company.

**Response:**
```json
{
  "company": {
    "id": "comp-123",
    "name": "Acme Corp",
    "plan": "professional"
  },
  "usage": {
    "contractors": 12,
    "storageGB": 165.5,
    "apiCalls": 195000
  },
  "limits": {
    "contractors": 15,
    "storageGB": 200,
    "apiCalls": 200000
  },
  "warnings": {
    "contractors": { "percentage": 80, "level": "warning" },
    "storage": { "percentage": 83, "level": "warning" },
    "apiCalls": { "percentage": 98, "level": "critical" }
  },
  "monthlyBill": {
    "baseCost": 499,
    "overageCost": 9.75,
    "coupon": {
      "code": "SAVE20",
      "discount": 101.75
    },
    "subtotal": 407.00,
    "gst": 40.70,
    "total": 447.70,
    "estimatedNextMonth": 509
  }
}
```

---

## GET /usage
Returns detailed current usage with breakdown and trends.

**Response:**
```json
{
  "current": {
    "contractors": 12,
    "storageGB": 165.5,
    "apiCalls": 195000
  },
  "breakdown": {
    "storage": {
      "jobPhotos": {
        "gb": 95,
        "percentage": 57,
        "count": 1245
      },
      "jobReports": {
        "gb": 45,
        "percentage": 27,
        "count": 234
      },
      "timesheets": {
        "gb": 20,
        "percentage": 12,
        "count": 567
      },
      "exports": {
        "gb": 5.5,
        "percentage": 4,
        "count": 89
      }
    }
  },
  "trend": {
    "contractors": {
      "current": 12,
      "previous": 11,
      "change": 9,
      "trend": "increasing"
    },
    "storage": {
      "current": 165.5,
      "previous": 160,
      "change": 3,
      "trend": "increasing"
    },
    "apiCalls": {
      "current": 195000,
      "previous": 190000,
      "change": 3,
      "trend": "increasing"
    }
  }
}
```

---

## GET /estimated-cost
Returns estimated bill for current month based on usage to date.

**Response:**
```json
{
  "month": "2025-12",
  "daysElapsed": 6,
  "daysRemaining": 25,
  "projectedUsage": {
    "contractors": 12,
    "storageGB": 170,
    "apiCalls": 200000
  },
  "estimatedCost": {
    "baseCost": 499,
    "overages": {
      "contractors": 0,
      "storage": 15,
      "apiCalls": 10
    },
    "subtotal": 524,
    "coupon": {
      "code": "SAVE20",
      "discount": 104.8
    },
    "gst": 41.92,
    "total": 461.12
  },
  "comparisonPreviousMonth": 554.95,
  "trend": "increasing"
}
```

---

## GET /invoices
Returns paginated list of company invoices.

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 10) - Items per page
- `status` (string) - Filter: unpaid, paid, overdue
- `month` (string) - Filter by month (YYYY-MM)

**Response:**
```json
{
  "invoices": [
    {
      "id": "inv-uuid",
      "invoiceNumber": "INV-2025-12-00001",
      "month": "December 2025",
      "issuedDate": "2025-12-01",
      "dueDate": "2025-12-15",
      "amount": 554.95,
      "status": "paid",
      "paidDate": "2025-12-10",
      "daysOverdue": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

---

## GET /invoices/:id
Returns detailed invoice with line items.

**Response:**
```json
{
  "invoice": {
    "id": "inv-uuid",
    "invoiceNumber": "INV-2025-12-00001",
    "month": "December 2025",
    "issuedDate": "2025-12-01",
    "dueDate": "2025-12-15",
    "company": {
      "name": "Acme Corp",
      "abn": "12345678901",
      "email": "billing@acme.com"
    },
    "lineItems": [
      {
        "description": "Professional Plan",
        "quantity": 1,
        "unitPrice": 499,
        "amount": 499
      },
      {
        "description": "Storage Overage (15 GB @ $0.75/GB)",
        "quantity": 15,
        "unitPrice": 0.75,
        "amount": 11.25
      },
      {
        "description": "API Overage (25k calls @ $0.10 per 1k)",
        "quantity": 25,
        "unitPrice": 0.10,
        "amount": 2.50
      }
    ],
    "subtotal": 512.75,
    "coupon": {
      "code": "SAVE20",
      "discount": 102.55
    },
    "subtotalAfterDiscount": 410.20,
    "gst": 41.02,
    "total": 451.22,
    "status": "paid",
    "paidDate": "2025-12-10",
    "paymentMethod": "card-xxxx4242"
  }
}
```

---

## POST /apply-coupon
Applies a discount coupon to company account.

**Request:**
```json
{
  "couponCode": "SAVE20"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "code": "SAVE20",
    "type": "percentage",
    "discount": 20,
    "recurring": false,
    "expiresAt": "2025-12-31"
  },
  "updatedBill": {
    "previousTotal": 554.95,
    "couponDiscount": 110.99,
    "newTotal": 443.96
  }
}
```

**Errors:**
- `400` - Invalid coupon code
- `400` - Coupon expired
- `400` - Coupon usage limit reached
- `400` - Coupon not yet active
- `400` - Company already has active coupon (no stacking)

---

## DELETE /remove-coupon
Removes applied coupon from company account.

**Response:**
```json
{
  "success": true,
  "removedCoupon": "SAVE20",
  "updatedBill": {
    "previousTotal": 443.96,
    "couponDiscount": 0,
    "newTotal": 554.95
  }
}
```

---

## POST /change-plan
Upgrades or downgrades company billing plan.

**Request:**
```json
{
  "newTier": "enterprise"
}
```

**Response:**
```json
{
  "success": true,
  "upgrade": {
    "previousPlan": "professional",
    "newPlan": "enterprise",
    "previousPrice": 499,
    "newPrice": 2999
  },
  "proration": {
    "daysRemainingInCycle": 25,
    "creditApplied": 425,
    "chargeForNewPlan": 2425
  },
  "effectiveDate": "2025-12-06",
  "nextBillingDate": "2026-01-01"
}
```

**Errors:**
- `400` - Invalid tier
- `400` - Current usage exceeds new plan limits
- `400` - Plan change not allowed (too soon)

---

## Super Admin Endpoints

### Base URL
```
https://api.mervo.com.au/api/super-admin/billing
```

### Authentication
All requests require Bearer token with admin role.

---

## GET /overview
Returns system-wide billing dashboard.

**Response:**
```json
{
  "metrics": {
    "totalMRR": 125000,
    "totalARR": 1500000,
    "totalRevenue": 450000,
    "activeSubscriptions": 95,
    "companiesOverLimit": 5,
    "overdueInvoices": 2,
    "suspendedAccounts": 3
  },
  "topCompanies": [
    {
      "companyId": "comp-1",
      "name": "Company A",
      "tier": "enterprise",
      "mrr": 2999,
      "status": "active"
    }
  ],
  "revenueByTier": {
    "starter": 5000,
    "professional": 45000,
    "enterprise": 75000
  },
  "trends": {
    "mrrChange": 12.5,
    "newSubscriptions": 5,
    "churned": 1,
    "overageRevenue": 8500
  }
}
```

---

## GET /companies
Returns list of all companies with billing info.

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 20)
- `status` (string) - Filter: active, suspended, cancelled
- `tier` (string) - Filter by plan: starter, professional, enterprise
- `sort` (string) - Sort by: mrr, name, status

**Response:**
```json
{
  "companies": [
    {
      "companyId": "comp-123",
      "name": "Acme Corp",
      "tier": "professional",
      "status": "active",
      "mrr": 509,
      "basePrice": 499,
      "overages": 10,
      "overage_percent": 2,
      "currentMonthUsage": {
        "contractors": 12,
        "storageGB": 165.5,
        "apiCalls": 195000
      },
      "joinedDate": "2025-10-15",
      "lastInvoiceDate": "2025-12-01",
      "nextInvoiceDate": "2026-01-01"
    }
  ],
  "summary": {
    "totalCompanies": 95,
    "activeCount": 90,
    "suspendedCount": 3,
    "cancelledCount": 2
  }
}
```

---

## GET /companies/:companyId
Returns detailed billing info for single company.

**Response:**
```json
{
  "company": {
    "id": "comp-123",
    "name": "Acme Corp",
    "status": "active"
  },
  "subscription": {
    "tier": "professional",
    "monthlyPrice": 499,
    "startDate": "2025-10-15",
    "renewalDate": "2026-01-15",
    "status": "active"
  },
  "currentUsage": {
    "contractors": 12,
    "storageGB": 165.5,
    "apiCalls": 195000,
    "limits": { "contractors": 15, "storageGB": 200, "apiCalls": 200000 },
    "percentages": { "contractors": 80, "storage": 83, "apiCalls": 98 }
  },
  "invoices": [
    {
      "invoiceNumber": "INV-2025-12-00001",
      "month": "2025-12",
      "amount": 554.95,
      "status": "paid",
      "paidDate": "2025-12-10"
    }
  ],
  "appliedCoupon": {
    "code": "SAVE20",
    "discount": 20,
    "expiresAt": "2025-12-31"
  }
}
```

---

## GET /coupons
Returns all coupons with stats.

**Query Parameters:**
- `status` (string) - Filter: active, expired, suspended
- `sort` (string) - Sort by: usage, discount, expiresAt

**Response:**
```json
{
  "coupons": [
    {
      "id": "cp-uuid",
      "couponCode": "SAVE20",
      "discountType": "percentage",
      "discountValue": 20,
      "recurring": false,
      "activeFrom": "2025-12-01",
      "expiresAt": "2025-12-31",
      "status": "active",
      "usageCount": 15,
      "usageLimit": 100,
      "totalDiscountGiven": 1650,
      "notes": "Holiday promotion"
    }
  ],
  "stats": {
    "totalCoupons": 25,
    "activeCoupons": 20,
    "expiredCoupons": 5,
    "totalDiscountGiven": 45000,
    "topCoupon": "SAVE20"
  }
}
```

---

## POST /coupons
Creates new coupon.

**Request:**
```json
{
  "couponCode": "NEWYEAR25",
  "discountType": "percentage",
  "discountValue": 25,
  "recurring": false,
  "activeFrom": "2026-01-01",
  "expiresAt": "2026-01-31",
  "usageLimit": 200,
  "notes": "New year promotion"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": "cp-new-uuid",
    "couponCode": "NEWYEAR25",
    "status": "active",
    "usageCount": 0,
    "createdAt": "2025-12-06"
  }
}
```

---

## POST /suspend/:companyId
Suspends company account.

**Request:**
```json
{
  "reason": "Payment overdue by 10 days"
}
```

**Response:**
```json
{
  "success": true,
  "company": {
    "companyId": "comp-123",
    "previousStatus": "active",
    "newStatus": "suspended"
  },
  "suspensionDetails": {
    "effectiveImmediately": true,
    "notificationSent": true,
    "reason": "Payment overdue by 10 days"
  }
}
```

---

## POST /unsuspend/:companyId
Restores suspended company account.

**Response:**
```json
{
  "success": true,
  "company": {
    "companyId": "comp-123",
    "previousStatus": "suspended",
    "newStatus": "active"
  },
  "effectiveDate": "2025-12-06T10:30:00Z"
}
```

---

## POST /process-monthly
Manually trigger monthly invoicing job.

**Response:**
```json
{
  "success": true,
  "summary": {
    "month": "November 2025",
    "invoicesGenerated": 95,
    "totalRevenue": 125000,
    "errors": 0,
    "duration": "2.5 seconds"
  },
  "details": {
    "byTier": {
      "starter": { "count": 45, "revenue": 35000 },
      "professional": { "count": 35, "revenue": 60000 },
      "enterprise": { "count": 15, "revenue": 30000 }
    }
  }
}
```

---

## Error Responses

All errors follow standard format:

```json
{
  "error": "ErrorCode",
  "message": "Human-readable error message",
  "details": {
    "field": "error-specific-details"
  }
}
```

### Common Error Codes
- `INVALID_TIER` - Invalid billing tier
- `USAGE_EXCEEDED` - Usage exceeds plan limits
- `COUPON_EXPIRED` - Coupon is no longer valid
- `COUPON_STACKING` - Cannot stack coupons
- `PAYMENT_FAILED` - Payment processing failed
- `ACCOUNT_SUSPENDED` - Account is suspended
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Missing or invalid authorization
- `FORBIDDEN` - Insufficient permissions

---

## Rate Limiting

- Rate limit: 1000 requests per minute per API key
- Headers:
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 999`
  - `X-RateLimit-Reset: 1702020000`

---

## Webhooks

Billing system emits events to configured webhook endpoint.

### Webhook Events
- `invoice.created` - New invoice generated
- `invoice.paid` - Invoice payment received
- `invoice.overdue` - Invoice payment overdue
- `account.suspended` - Account suspended
- `account.unsuspended` - Account restored
- `plan.upgraded` - Plan upgraded
- `plan.downgraded` - Plan downgraded
- `usage.alert` - Usage alert triggered

**Example Payload:**
```json
{
  "event": "invoice.created",
  "timestamp": "2025-12-01T02:00:00Z",
  "data": {
    "invoiceNumber": "INV-2025-12-00001",
    "companyId": "comp-123",
    "amount": 554.95,
    "dueDate": "2025-12-15"
  }
}
```

---

## Implementation Notes

### SDK Support
- JavaScript/Node.js: `npm install mervo-billing-sdk`
- Python: `pip install mervo-billing-sdk`
- Go: `go get github.com/mervo/billing-sdk`

### Authentication
Use JWT tokens issued by Mervo auth service.

### Idempotency
Include `X-Idempotency-Key` header for financial operations (payments, refunds, coupons).

### Versioning
Current API version: `v1`
Future versions available at `/api/v2/billing`

---

**Last Updated**: December 6, 2025
**API Version**: 1.0.0
