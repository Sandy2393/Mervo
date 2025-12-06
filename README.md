# Mervo Ops — Phase 1 Frontend Scaffold

Minimal React + Vite + TypeScript scaffold for Mervo field operations platform.

## Quick Start

### 1. Set Up Environment Variables

The scaffold includes placeholder values in `src/config/env.ts`. You **must** replace them before deploying:

```typescript
// src/config/env.ts
export const ENV = {
  SUPABASE_URL: 'REPLACE_ME_WITH_YOUR_SUPABASE_PROJECT_URL',
  SUPABASE_ANON_KEY: 'REPLACE_ME_WITH_YOUR_SUPABASE_ANON_KEY',
  // ...
};
```

**Safe ways to inject real values (DO NOT hardcode in source):**

- **GitHub Actions:** Store secrets in Settings → Secrets and variables → Actions → New repository secret, then inject into build env
- **Vercel/Netlify:** Use the Environment Variables dashboard in your project settings
- **Supabase Cloud:** Find your project URL and anon key in Settings → API
- **Cloud Run/Docker:** Pass as build args or runtime environment variables
- **Local Development:** Create a `.env.local` file (listed in `.gitignore`) and configure your build tool to read it

### 2. Import Database Schema

1. Go to your Supabase project
2. Open SQL Editor
3. Copy the entire contents of `supabase_schema.sql`
4. Paste into Supabase SQL Editor and run

This creates all tables, indexes, triggers, and RLS policies.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Runs on `http://localhost:5173`.

### 5. Build for Production

```bash
npm run build
```

### 6. Run Tests & Accessibility Checks

```bash
npm run test                # Run all unit & integration tests
npm run test:a11y          # Run accessibility checks with axe-core
npm run type-check         # Run TypeScript type checking
```

## Design System & Theming

The app supports light and dark mode via design tokens and Tailwind CSS.

### Theme Toggle

Users can toggle between light and dark mode via the `ThemeToggle` component:

```tsx
import ThemeToggle from './components/ui/ThemeToggle';

<ThemeToggle />
```

Theme preference is persisted in localStorage.

### Design Tokens

All colors, spacing, typography, and elevation are centralized in `src/styles/design-tokens.ts`:

```tsx
import { colors, spacing, typography } from '../styles/design-tokens';
```

See `docs/DESIGN_SYSTEM.md` for comprehensive guidelines.

## Internationalization (i18n)

### Supported Locales

- **en-AU** (default) — Australian English
- **en-US** — US English

### Using Translations

```tsx
import { useTranslation } from '../i18n/i18n';

const { t, locale, changeLocale } = useTranslation();
<h1>{t('common.appName')}</h1>
```

### Adding a New Locale

1. Create `src/i18n/locales/xx-XX.json` with translated strings
2. Update `src/i18n/i18n.ts` to load the new locale
3. Add locale to `SUPPORTED_LOCALES` in `src/hooks/useLocale.ts`

See `docs/UX_MICROCOPY.md` for microcopy guidelines.

## Accessibility (a11y)

Mervo is built with **WCAG 2.1 AA** accessibility in mind.

### Run Accessibility Tests

```bash
npm run test:a11y
```

This runs automated checks with axe-core on key pages.

### Features

- **Semantic HTML:** Proper heading hierarchy, labels, ARIA attributes
- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **Focus Management:** Focus is always visible with a clear outline
- **Screen Reader Support:** Live regions and ARIA labels for dynamic content
- **Motion Preferences:** Animations respect `prefers-reduced-motion`
- **Color Contrast:** Minimum 4.5:1 for body text

## Analytics & Privacy

### Opt-in Analytics

Users can enable/disable analytics via `PrivacyToggle`:

```tsx
import PrivacyToggle from './components/ui/PrivacyToggle';

<PrivacyToggle />
```

Analytics are **disabled by default** and require explicit user consent.

### Track Events

```tsx
import useAnalytics from '../hooks/useAnalytics';

const { trackEvent } = useAnalytics();
trackEvent('job_created', { jobType: 'standard' });
```

**TODO:** Replace `ANALYTICS_ID` placeholder in `src/lib/analytics/tracker.ts` with actual analytics credentials and implement server-side ingestion.

## Onboarding & Help

### First-Run Modal

New users see a welcome modal on first login:

```tsx
<FirstRunModal onStartTour={() => {}} onSkip={() => {}} />
```

### Guided Tour

Step-by-step tour for feature discovery:

```tsx
<GuidedTour steps={tourSteps} onComplete={() => {}} onSkip={() => {}} />
```

### Tooltips

Contextual help:

```tsx
<Tooltip text="Helpful hint" position="top">
  <button>Hover me</button>
</Tooltip>
```

### Help Center

Visit `/help` for FAQs, search, and support contact.

## Contractor Ratings

### Rate a Contractor

```tsx
<RatingStars value={rating} onChange={setRating} />
```

### Submit Rating

```tsx
const res = await ratingsService.submitRating(
  companyId,
  contractorId,
  5,
  'Excellent work!'
);
```

**TODO:** Create `contractor_ratings` table in Supabase (see `supabase_schema_addons.sql`).

- `src/types.ts` — TypeScript interfaces matching the Supabase schema
- `src/config/env.ts` — Environment variable placeholder object (DO NOT add secrets here)
- `src/lib/supabase.ts` — Supabase client initialization
- `src/pages/ContractorDashboard.tsx` — Example contractor dashboard component
- `supabase_schema.sql` — Complete database schema

## Important Notes

### RLS (Row Level Security)

All tables have RLS policies enabled. The Supabase client will automatically filter data based on the authenticated user's ID (`auth.uid()`). You must:

1. Set up Supabase Auth (email/password, OAuth, etc.)
2. Ensure user records exist in the `users` table with matching `id` from `auth.uid()`
3. Never bypass RLS in client code

### Testing in AI Studio

**WARNING:** Do NOT share this code or your environment variables in Google AI Studio, ChatGPT, or any LLM tool. If you need help debugging:

1. Remove all environment variable values and real data
2. Share only the code structure and types
3. Describe the problem without exposing secrets

### Schema is Read-Only

The schema file (`supabase_schema.sql`) is loaded from Phase 1 baseline. Do not modify table names or column names without coordinating schema migrations.

## Next Steps

- Set up Supabase Auth
- Create admin/owner onboarding flow
- Build job assignment UI
- Add timesheet clock-in/out functionality
- Implement photo upload for job instances

### Finance & Billing

- Accounts & Invoicing pages have been added under `src/pages/corporate/Accounts.tsx` and `src/pages/corporate/InvoicesList.tsx`.
- Required server-only environment variables for payment webhooks and bulk payouts:
  - `SUPABASE_SERVICE_ROLE_KEY` (server only) — required for admin DB operations and webhooks
  - `PAYMENT_PROVIDER_SECRET` (server only) — your payment provider's secret (Stripe, PayPal, etc.)
  - All provider keys must be kept on the server and never embedded in client bundles.

  ### Other DevOps & PWA

  - CI/CD workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy-cloudrun.yml`, `.github/workflows/deploy-vercel.yml` are included as templates.
  - PWA support and service worker: `public/manifest.webmanifest`, `src/registerServiceWorker.ts`, and `src/lib/pwa/sw.js` (service worker stub) are available.
  - Background sync & offline queue (Dexie) sync worker: `src/lib/dexie/syncWorker.ts` implements retry/backoff; wire Dexie DB for production.

  See `docs/DEPLOYMENT.md` and `docs/PWA.md` for operational details on deployments, secrets and offline testing.

---

**Scaffold generated:** Replace all placeholders in `src/config/env.ts` and import `supabase_schema.sql` into your Supabase project before running.
