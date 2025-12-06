# Client Acceptance Tests (UAT)

Purpose: quick, repeatable checklist for client sign-off after deployment.

## Scope
- Admin core flows
- Contractor core flows
- Reporting and exports
- Authentication and security basics

## Preconditions
- Test users exist (admin + contractor)
- Staging base URL available
- Feature flags aligned with production

## Test Accounts
- Admin: admin.demo@mervo.app / AdminPass!234
- Contractor: contractor.lee@mervo.app / Contractor1!

## Tests

### 1) Admin Login
- [ ] Navigate to /login, login as admin.demo@mervo.app
- [ ] Verify dashboard loads and shows at least 1 job card

### 2) Create Job
- [ ] Create job "Install Router" with rate $120
- [ ] Assign category and due date
- [ ] Confirm job appears in list with status "open"

### 3) Assign Contractor
- [ ] Assign contractor "Lee" to the job
- [ ] Verify assignment appears on job detail

### 4) Contractor Accepts
- [ ] Login as contractor.lee@mervo.app
- [ ] Accept assigned job
- [ ] Verify job status = in_progress

### 5) Clock In/Out
- [ ] Start timer/clock-in
- [ ] Add a note and upload a photo (if available)
- [ ] Clock-out completes without error

### 6) Complete Job
- [ ] Submit completion report with notes
- [ ] Admin marks job completed
- [ ] Status shows completed for admin and contractor

### 7) Timesheet Review
- [ ] Admin views Timesheets page
- [ ] Export CSV succeeds (file downloads)

### 8) Ratings
- [ ] Admin submits rating for contractor
- [ ] Rating appears on contractor profile

### 9) Notifications
- [ ] Email or in-app notification sent to contractor on assignment
- [ ] Admin receives notification on job completion

### 10) Basic Security Checks
- [ ] Refresh token/session persists within expected TTL
- [ ] 2FA prompt available if enabled
- [ ] Unauthorized API call returns 401/403

## Exit Criteria
- All checks above pass
- No critical or high issues open
- Known issues documented with workarounds

## Known Issues / Notes
- TODO: Populate with any open issues before handoff
