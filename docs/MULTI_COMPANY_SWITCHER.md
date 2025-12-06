# Multi-Company Switcher

Master accounts can pivot between multiple companies without logging out. The switcher issues a short-lived session hint that includes `company_id` so all subsequent API calls are scoped correctly.

## UX
- Surface the switcher in the header via `src/components/ui/CompanySwitcher.tsx`.
- Show linked companies with logo/tag and a "Manage links" CTA to `/profile/linked-companies`.
- Remember last selection in localStorage; sessionStorage override keeps the active context for the tab.
- Prompt re-auth/2FA when switching into high-sensitivity companies (TODO for production).

## Security notes
- Server endpoint `/api/switch-company` verifies the master-company link then issues a scoped session hint (placeholder string today).
- Add an audit log entry for every switch (console log in the stub).
- Removing a link should require email + 2FA verification; the UI includes a verification code field but backend enforcement is TODO.
- When changing companies, invalidate cached data and refresh the UI to prevent leakage across tenants.

## Data model
- `master_accounts_companies(master_user_id, company_id, linked_at)` stores links.
- Permissions: `switch.company` governs who may switch; grant only to master users.
- RLS: see `server/settings/rls_and_permissions_examples.sql` for enabling RLS on link tables.
