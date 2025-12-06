# Client Handover Guide

**Document Version:** 1.0  
**Date:** December 2025  
**Status:** Ready for Production Transfer

## Executive Summary

This guide documents the complete handover of the Mervo field operations platform to your team. All source code, infrastructure, documentation, and operational procedures are included. Follow each section in order to ensure a smooth transition.

**Estimated handover time:** 2–4 hours (with IT/DevOps team)  
**Key contacts for questions:** See section "Support & Escalation"

---

## 1. Access & Accounts Checklist

Before starting, ensure your team has access to:

- [ ] **GitHub Repository** — Clone URL: `https://github.com/REPLACE_ORG/mervo-frontend`
- [ ] **Supabase Project** — URL: `https://REPLACE_PROJECT_ID.supabase.co`
- [ ] **Cloud Run / Vercel** — Deployment account (see deployment guide)
- [ ] **Google Cloud Console** — For service accounts, secrets manager
- [ ] **Domain & DNS Management** — For production domain setup
- [ ] **Billing Account** — Credit card / invoice setup
- [ ] **Email Account** — For support replies and alerts

**Access grant checklist:**
- [ ] IT: Create GitHub accounts for all developers
- [ ] IT: Invite team to GitHub organization
- [ ] Admin: Create Supabase organization account
- [ ] Admin: Transfer Supabase project to organization
- [ ] Admin: Set up billing on cloud provider (GCP/Vercel)
- [ ] Admin: Delegate IAM roles (Editor, Viewer, Billing)

---

## 2. Environment Variables & Secrets

### Required Secrets (DO NOT commit to Git)

All secrets are stored in `.env.local` (development) or cloud provider secret manager (production).

| Variable | Purpose | Source | Rotate Frequency |
|----------|---------|--------|------------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Settings → API | N/A |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key | Supabase Settings → API | Every 90 days |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (DO NOT expose) | Supabase Settings → API | Every 90 days |
| `GITHUB_TOKEN` (CI/CD) | GitHub Actions deployment | GitHub → Settings → Developer | Every 180 days |
| `GCP_SERVICE_ACCOUNT_KEY` | Cloud Run deployment (JSON) | GCP Console → Service Accounts | Every 90 days |
| `ANALYTICS_ID` | Analytics service key | Segment / Mixpanel / GA4 | Per provider |
| `PAYMENT_PROVIDER_SECRET` | Stripe / PayPal secret key | Stripe Dashboard | Every 90 days |

### Where to Find Secrets

1. **Supabase Keys:**
   - Log in to Supabase
   - Project Settings → API
   - Copy `Project URL` and `anon public key`
   - Copy `service_role key` (keep private)

2. **GitHub Token:**
   - Settings → Developer settings → Personal access tokens
   - Create token with `repo`, `workflow`, `write:packages` scopes
   - Store in GCP Secret Manager as `github-token`

3. **GCP Service Account:**
   - GCP Console → Service Accounts
   - Create service account for Cloud Run
   - Generate JSON key
   - Store in Secret Manager or GitHub Actions secrets

4. **Payment Keys:**
   - Stripe Dashboard → Developers → API Keys
   - Copy **Secret Key** (starts with `sk_live_`)

---

## 3. Infrastructure Transfer Checklist

### Supabase Project

- [ ] **Create Organization** (optional but recommended)
- [ ] **Transfer Project Ownership** — Supabase Settings → Organization
- [ ] **Create Database Backups** — Supabase → Backups → Manual backup
- [ ] **Import Schema** — Run `supabase_schema.sql` in SQL Editor (if not already done)
- [ ] **Import Demo Data** (optional) — Run `demo/seed_data.sql` for testing
- [ ] **Enable Row Level Security (RLS)** — Verify all tables have RLS enabled
- [ ] **Test RLS Policies** — Use `test_auth_user` to verify permissions
- [ ] **Set Up Database Replication** (optional) — For disaster recovery
- [ ] **Configure Backups** — Enable daily automatic backups in project settings

### Cloud Deployment (Cloud Run or Vercel)

**Option A: Google Cloud Run**

- [ ] Create GCP project
- [ ] Enable Cloud Run API
- [ ] Build and push Docker image to Artifact Registry
- [ ] Deploy via `gcloud run deploy` or CI/CD pipeline
- [ ] Configure custom domain
- [ ] Set environment variables in Cloud Run service
- [ ] Enable Cloud Armor for DDoS protection

**Option B: Vercel**

- [ ] Create Vercel account
- [ ] Link GitHub repository
- [ ] Configure environment variables in Vercel dashboard
- [ ] Enable automatic deployments on main branch
- [ ] Add custom domain
- [ ] Configure preview deployments for PRs

### DNS & Domain

- [ ] Register domain (GoDaddy, Route 53, Namecheap, etc.)
- [ ] Point DNS nameservers to your DNS provider
- [ ] Add DNS records for deployment platform
- [ ] Enable HTTPS/SSL certificate (auto-configured by Cloud Run or Vercel)
- [ ] Test domain in browser

### GitHub Repository

- [ ] **Transfer Ownership** — Contact GitHub Support or use `gh` CLI
  ```bash
  gh repo transfer CURRENT_OWNER/mervo-frontend NEW_ORG/mervo-frontend
  ```
- [ ] **Add Branch Protection** — Settings → Branches → Add rule for `main`
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date
- [ ] **Set Up Secrets** — Settings → Secrets and variables → Actions
  - `GITHUB_TOKEN`
  - `GCP_SERVICE_ACCOUNT_KEY`
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] **Enable Code Scanning** — Security → Code security and analysis
- [ ] **Enable Secret Scanning** — Check for leaked secrets in commits

---

## 4. Deployment Steps

### Initial Production Deployment

```bash
# 1. Clone the repository
git clone https://github.com/REPLACE_ORG/mervo-frontend.git
cd mervo-frontend

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Test build locally
npm run preview

# 5. Deploy to Cloud Run (or Vercel)
gcloud run deploy mervo --source . --platform managed --region us-central1

# 6. Configure domain
gcloud run services update-traffic mervo --to-revisions LATEST=100
```

### Verify Deployment

- [ ] Health check: `curl https://your-domain.com/health` (if endpoint exists)
- [ ] Load homepage: `https://your-domain.com`
- [ ] Login flow: Create test account and log in
- [ ] Submit test job: Create a test company and job
- [ ] Check audit logs: Verify events are recorded

---

## 5. Data Migration (if migrating from legacy system)

If migrating data from a previous system:

1. **Export legacy data** to CSV (companies, users, jobs, timesheets)
2. **Transform & validate** — Ensure data matches new schema
3. **Create backup** — Backup Supabase database before import
4. **Import data** — Use SQL script or admin UI
5. **Verify integrity** — Count records, spot-check data
6. **Notify users** — Send email about data migration completion

See `handover/OPERATION_RUNBOOK.md` for detailed data import steps.

---

## 6. Final Verification Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database schema imported and verified
- [ ] RLS policies enabled and tested
- [ ] Demo data imported (optional)
- [ ] Application builds without errors
- [ ] Application deployed to production
- [ ] Domain points to live deployment
- [ ] HTTPS certificate is valid
- [ ] Login flow works (test account created)
- [ ] Admin dashboard loads
- [ ] Can create and assign a job
- [ ] Contractor can accept job
- [ ] Audit logs are recording events
- [ ] Backups are configured and tested
- [ ] Monitoring / alerts are set up
- [ ] Support contact info is visible in app

---

## 7. Key Contacts & Escalation

| Role | Name | Email | Phone | Availability |
|------|------|-------|-------|--------------|
| Primary Tech Support | REPLACE_NAME | REPLACE_EMAIL | REPLACE_PHONE | Business hours |
| On-Call Engineer | REPLACE_NAME | REPLACE_EMAIL | REPLACE_PHONE | 24/7 for critical |
| Billing & Contracts | REPLACE_NAME | REPLACE_EMAIL | N/A | Business hours |
| Escalation (VP Eng) | REPLACE_NAME | REPLACE_EMAIL | REPLACE_PHONE | Business hours |

**Support SLA:**
- **Critical (system down):** Response within 1 hour
- **High (feature broken):** Response within 4 hours
- **Medium (workaround exists):** Response within 24 hours
- **Low (docs/questions):** Response within 72 hours

---

## 8. Handover Acceptance Criteria

Handover is complete when:

1. ✅ All environment variables configured and tested
2. ✅ Database schema imported and RLS verified
3. ✅ Application deployed and accessible
4. ✅ Admin user can log in and access dashboard
5. ✅ At least one test company created
6. ✅ At least one test job created and assigned
7. ✅ Test contractor can accept job and view assignment
8. ✅ Backups are configured and tested
9. ✅ Monitoring / alerting is active
10. ✅ Support contacts documented
11. ✅ Team training completed (see `ADMIN_TRAINING_SLIDES.md`)
12. ✅ All documentation reviewed and understood

---

## 9. Post-Handover Support

### First 30 Days (Transition Period)

- Daily check-ins (email or Slack) to address issues
- On-demand technical support via email/phone
- Bug fixes prioritized immediately
- Performance monitoring and optimization

### Months 2–12 (Maintenance Period)

- Monthly status check-in calls
- Routine maintenance windows (announced in advance)
- Feature enhancements (if under support plan)
- Security updates and patches (immediate deployment)

### Year 2+ (Ongoing Support)

- Quarterly business reviews
- Annual security audit
- Feature roadmap planning
- Technology stack upgrades

See `support/SUPPORT_PLAN.md` for detailed SLA and pricing.

---

## Next Steps

1. **Read** `handover/OPERATION_RUNBOOK.md` (day-to-day operations)
2. **Read** `handover/SECURITY_PLAYBOOK.md` (security procedures)
3. **Review** `handover/ADMIN_TRAINING_SLIDES.md` (admin training)
4. **Follow** infrastructure transfer checklist above
5. **Run** smoke test: `bash qa/SMOKE_TEST_SCRIPT.sh`
6. **Contact** primary tech support with any questions

---

**Document signed by:** REPLACE_NAME, REPLACE_COMPANY  
**Date:** REPLACE_DATE  
**Version:** 1.0
