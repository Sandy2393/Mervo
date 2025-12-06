# Access Review Policy

## Frequency
- Quarterly access reviews for all users and admins.

## Scope
- Tables: company_users, roles, permissions, external accounts.
- Verify: role appropriateness, last login, active status, MFA/SSO use.

## Procedure
1) Export user list with roles and last_login.
2) Managers attest per user; mark Reviewed/Changes Needed.
3) Revoke or downgrade unused/high-risk roles.
4) Document exceptions with expiry dates.
5) Recertify and log results in audit_logs.

## Report Template
- Columns: user_account_id, email, company_id, role, last_login, active, reviewer, decision, notes, reviewed_at.
- Output: `reports/access_review_<date>.csv` (see script).

## Recertification Flow
- Trigger from admin UI (AccessReview page) → mark recertified.
- Require two-person review for admin roles.

## TODO
- TODO: Automate exports via API with filtering by company_id.
- TODO: Add reminders and escalation for overdue reviews.
