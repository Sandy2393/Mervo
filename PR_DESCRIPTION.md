# Super Admin Feature - Pull Request

## Overview
This PR implements the complete super-admin wiring for the Mervo platform, providing system administrators with comprehensive access to billing, companies, audit logs, storage, and offline resilience management.

## Changes

### Backend
- **API Endpoints**
  - `GET /api/auth/me` - Returns user context with `is_super_admin` flag
  - `GET /api/super-admin/companies` - List companies with search, status filters, pagination
  - `GET/POST /api/super-admin/company/:id` - Company details and actions (suspend, reactivate, temp_password)
  - `GET /api/super-admin/company/:id/jobs` - List company jobs
  - `GET /api/super-admin/audit/search` - Search audit logs with filters
  - Enhanced `/api/super-admin/billing/*` routes with header-based auth
  - Gated `/api/offline/pending` behind super-admin role

- **Services**
  - Seeded demo companies in `superAdminService` for dev/demo
  - Added `listCompanyJobs` placeholder method
  - Created stub `supabaseClient.ts` for backend billing services
  - Tightened super-admin guards to require explicit role header or user context

### Frontend
- **Routes & Guard**
  - Added `RequireSuperAdmin` guard component (checks `/api/auth/me`)
  - Wired all super-admin routes under `/super-admin/*` with guard + MainLayout
  - Routes: panel, dashboard, companies, company detail, billing overview/detail, coupons, audit, storage, offline, prelaunch

- **Components**
  - **SuperAdminPanel**: Dynamic dashboard showing company count, active count, MRR, links to all sections
  - **CompaniesList**: Search by name/email, filter by status, suspend/reactivate actions, pagination-ready
  - **CompanyDetail**: Display company info, recent jobs, storage/workforce metrics, suspend/reactivate buttons
  - **BillingOverview**: MRR summary, revenue trends, all companies with billing, quick actions (process monthly, suspend overdue, send alerts)
  - **BillingCompanyDetail**: Company billing breakdown, usage meters, invoice history, suspend/unsuspend, change plan, apply coupon
  - **CouponManager**: Create/list coupons, usage stats, discount tracking
  - **AuditViewer**: Search audit logs with filters (company, actor, action), export CSV
  - **StorageManager**: Company storage usage, top folders, cleanup preview/archive triggers
  - **OfflineCenter**: List pending sync items, reprocess/resolve actions, success rate metrics

- **Utilities**
  - Added `superAdminFetch` helper to inject `x-role/x-user` headers from stored super-admin session
  - Updated `withCompanyHeaders` to auto-inject super-admin context when present
  - All super-admin pages now use `superAdminFetch` instead of plain `fetch`

### Tests
- Created `tests/superadmin/super-admin.test.ts` with access control, guard, companies API, dashboard, and action tests
- Created `tests/superadmin/super-admin-smoke.test.ts` with UI smoke tests for all super-admin components

## Key Features
- ✅ Full super-admin guard on all routes
- ✅ Dynamic panel with real-time KPIs
- ✅ Companies list with search, filters, and actions
- ✅ Company detail with jobs, storage, and management actions
- ✅ Billing overview with MRR, revenue, and bulk operations
- ✅ Billing company detail with usage tracking and plan management
- ✅ Coupon creation and management
- ✅ Audit log search with filters and export
- ✅ Storage management with cleanup tools
- ✅ Offline resilience center with retry/resolve actions
- ✅ Integration and smoke tests

## Testing
Run super-admin tests:
```bash
npm test tests/superadmin
```

Access super-admin UI:
1. Navigate to `/super-admin/login?key=<VITE_SUPER_ADMIN_KEY>`
2. Login with super-admin credentials
3. Access panel at `/super-admin`

## Notes
- No database schema changes
- Corporate and contractor flows unchanged
- All super-admin APIs require `x-role: super_admin` or `x-role: superadmin` header
- Demo companies seeded for development/testing
- Billing service uses stub Supabase client (real integration pending)

## Related Issues
Closes #<issue-number>

## Screenshots
_Add screenshots of super-admin panel, companies list, billing overview, etc._
