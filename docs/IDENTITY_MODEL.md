# Identity Model — Master Account, Company Alias & Multi-Company Flow

This document explains Mervo's identity model and the new multi-company login and account-linking flows implemented in Prompt J.

Key concepts
- Master account (account_id): username@APP_TAG — the single global login for a human. Stored lowercased.
- Username: a–z, 0–9, '.', '_' — case-insensitive, cannot contain '@'.
- Company alias (company_alias): username@company_tag — created when a user is added to a company and used only inside company_users.

Role exclusivity
- A user cannot be both corporate (owner/admin/manager/staff) and contractor at the same time. This is enforced at login and during company_user creation.

Login flow
1. User enters username (no @) and password.
2. Client normalizes this to username@APP_TAG.
3. If login succeeds, we fetch company_users for the user.
   - If user only has contractor roles → route to contractor app
   - If user has corporate roles → route to corporate app
   - If both (invalid) → block login and show an error
4. If user belongs to multiple companies → show a Select Company screen after login.

Multi-company switching
- Owners and users with multi-company affiliations can switch active companies via the Select Company screen or the user menu.
- The app stores active company_id in localStorage via key `mervo_active_company_id` and in the AuthContext.
- All queries should be scoped to the selected company_id using `getScopedClient(companyId)` from `src/lib/db/companyScoped.ts`.

Account linking (merge flow)
- ``requestLink()`` creates an `account_link_requests` row with a short verification code sent to the second account (server-side email required).
- ``confirmLink()`` verifies the code and merges company_users rows into the primary account, deactivates the secondary account, and records audit logs.
- The linking flow uses a dedicated table `account_link_requests` to store pending verification requests.

Security caveats
- The verification code and email sending MUST be performed by server-side code (Edge Functions / Cloud Run) using server-only keys. Client-only email delivery is insecure and therefore stubbed out.
- Migrations that update multiple rows (account merges) should be performed inside server functions with transaction support for safety.

Files touched
- src/lib/identity/
- src/services/auth/
- src/services/accountLinking/
- src/context/AuthContext.tsx
- src/lib/db/companyScoped.ts
- supabase/migrations/20251206_add_account_link_requests.sql

If you'd like, I can next add a small Settings page UI showing linked accounts and a mock verification dialog (no real email sending) — tell me which screen you'd prefer me to implement next.
