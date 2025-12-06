# Release Notes Template

**Version:** REPLACE_VERSION (e.g., 1.5.0)  
**Release Date:** REPLACE_DATE (e.g., December 20, 2025)  
**Build:** REPLACE_BUILD_ID (e.g., `gcr.io/mervo/app:v1.5.0`)

---

## Executive Summary

**What's new:** Brief 1-2 sentence overview of this release

**Who should upgrade:** All users / Admin only / Recommended / Optional

**Upgrade impact:** No downtime / 5 minute downtime (02:00-02:05 UTC) / Requires user action

**Status:** Stable / Beta / Hotfix

---

## 🎉 New Features

### Feature 1: REPLACE_FEATURE_NAME
**Description:** Brief explanation of what this feature does and why users should care.

**Example use case:** "Contractors can now bulk approve multiple jobs at once, saving 30 minutes per week for managers."

**Documentation:** [Link to user guide] | Docs: [Link to admin guide]

---

## 🐛 Bug Fixes

### Critical
- **[ISSUE-123]** Fixed: Job payments not processing for contractors in specific time zones
  - **Impact:** 47 contractors affected, all payments now processing correctly
  - **Action required:** None (automatic retroactive payment processing scheduled)

### High Priority
- **[ISSUE-124]** Fixed: Export function crashes when file name contains special characters
- **[ISSUE-125]** Fixed: Dashboard doesn't load on Firefox < v100

### Medium Priority
- **[ISSUE-126]** Fixed: Typo in company settings button text
- **[ISSUE-127]** Fixed: Email notifications sometimes deliver late

---

## ⚙️ Performance Improvements

- Database queries optimized: 40% faster job listing load time (500ms → 300ms)
- Image compression: Uploaded photos now 60% smaller while maintaining quality
- Frontend bundle size: Reduced by 12% through code splitting

---

## 🔐 Security Updates

### Critical
- **CVE-2025-XXXXX:** SQL injection vulnerability in contractor search — PATCHED
  - Impact: Could allow unauthorized data access
  - Status: All production instances patched

### High
- Updated authentication library to fix MFA bypass edge case
- Improved password reset email validation

---

## 📝 Changes & Improvements

### Admin Console
- New analytics dashboard showing contractor performance metrics
- Bulk user export feature (CSV format)
- Improved job approval workflow with photo preview

### Mobile App
- Dark mode support (iOS & Android)
- Offline mode for job submissions (sync when online)
- Improved job map interface

### API
- New `/api/v2/jobs/export` endpoint for bulk job export
- Deprecation notice: `/api/v1/contractors` endpoint will be removed in v1.7.0
- Rate limit increased from 1,000 → 5,000 requests/hour for premium accounts

### Email Templates
- Redesigned job approval notifications (now includes job summary)
- New "weekly summary" email for contractors
- Improved accessibility (better color contrast, screen reader support)

---

## 🚀 Deployment Notes

### Upgrade Path

| Current Version | → | This Release | Status |
|---|---|---|---|
| v1.4.x | → | v1.5.0 | ✅ Direct upgrade safe |
| v1.3.x | → | v1.5.0 | ✅ Direct upgrade safe |
| v1.2.x | → | v1.5.0 | ⚠️ Must upgrade to v1.4.0 first |

### Database Migrations
- **Migration 12:** Add `contractor_specializations` table
- **Migration 13:** Add `payment_methods` column to users table
- All migrations run automatically on deployment

### Configuration Changes
**Required:** Update these environment variables:
```bash
FEATURE_FLAG_NEW_ANALYTICS=true  # Enable new dashboard
MAX_UPLOAD_SIZE_MB=50             # Increase from 25 to 50
STRIPE_API_VERSION=2025-01        # Update Stripe API
```

**Optional:**
```bash
ENABLE_DARK_MODE=true             # Enable dark mode (beta)
CONTRACTOR_EMAIL_DIGEST=weekly    # New email frequency option
```

### Breaking Changes
- ❌ API v1 endpoints deprecated (will be removed in v1.7.0)
  - Migrate to API v2 endpoints: `/api/v2/*`
  - [Migration guide](https://docs.mervo.app/api-v1-to-v2)

- ❌ Old photo storage bucket format no longer supported
  - Photos automatically migrated to new format
  - No action required for users

### Rollback Procedure
If you need to rollback:
```bash
gcloud run deploy mervo --image gcr.io/mervo/app:v1.4.5 --region us-central1
```
See [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) for detailed procedures.

---

## 📊 Testing & QA

### Testing Completed
- ✅ Full regression test suite (1,234 tests)
- ✅ Performance testing (load test with 10,000 concurrent users)
- ✅ Security penetration testing
- ✅ Accessibility audit (WCAG 2.1 AA compliance)
- ✅ User acceptance testing (10 beta testers, all scenarios)

### Known Issues
| Issue | Workaround | Fix ETA |
|-------|-----------|---------|
| Dark mode occasionally flickers on page reload | Refresh page | v1.5.1 |
| Contractor search slow with > 100,000 contractors | Use filters to narrow search | v1.6.0 |
| Payment export doesn't include child jobs | Export separately | v1.5.1 |

### Browser Support
| Browser | v1.5.0 Support |
|---------|---|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| IE 11 | ❌ Not supported (use Chrome, Firefox, Safari, or Edge) |

---

## 📞 Support & Resources

### Getting Help
- **Emergency issues:** [support@mervo.app](mailto:support@mervo.app) or [+1-555-MERVO-1](tel:+1-555-63786-1)
- **Bug reports:** [github.com/mervo/issues](https://github.com/mervo/issues)
- **Feature requests:** [feedback.mervo.app](https://feedback.mervo.app)
- **Documentation:** [docs.mervo.app](https://docs.mervo.app)

### Service Status
- **Before/during upgrade:** Check [status.mervo.app](https://status.mervo.app)
- **Expected downtime:** REPLACE_DOWNTIME (e.g., 5 minutes on Dec 20, 02:00-02:05 UTC)
- **Upgrade schedule:** Staged rollout (25% of users per hour to catch issues early)

---

## 📈 Metrics & Impact

### User Impact
- 15% faster page load times (average)
- 3 new features to boost productivity
- 12 bugs fixed affecting user experience

### Infrastructure Impact
- Database load reduced by 25% (more capacity for growth)
- Storage usage increased 8% (new features require more data)
- Memory usage improved by 12% (optimization work)

### Adoption Metrics
- 89% of beta testers would recommend this release
- Average time to master new features: 2.5 hours
- Customer satisfaction score: 4.7/5.0

---

## 👥 Contributors

This release was made possible by contributions from:
- Engineering team (12 developers, 2 QA engineers)
- Design team (2 designers)
- Product management (1 PM)
- Customer feedback (47 beta testers)

**Special thanks** to our beta testers for finding 34 bugs before production release!

---

## 🔄 Next Release (v1.6.0) Preview

Coming in 4 weeks (January 2026):
- Advanced search with full-text indexing
- Contractor portfolio/showcase feature
- Automated compliance reporting
- Mobile app Android redesign

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete list of all changes in this release.

---

## Questions?

Have questions about this release? 
- [Email support](mailto:support@mervo.app)
- [Join our Slack community](https://mervo.slack.com)
- [Video walkthrough](https://youtu.be/REPLACE_VIDEO_ID)
- [Release webinar](https://mervo.app/webinar/v1.5.0) - Dec 21, 2 PM EST

---

**Release manager:** REPLACE_RELEASE_MANAGER_NAME  
**QA lead:** REPLACE_QA_LEAD_NAME  
**Approved by:** REPLACE_APPROVAL_NAME

---

**Document version:** 1.0  
**Last updated:** December 2025

