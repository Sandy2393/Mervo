# Changelog

All notable changes to the Mervo platform are documented here.  
The format is based on [Keep a Changelog](https://keepachangelog.com/),  
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- TODO: Update with features in development

### Changed
- TODO: Document any breaking changes in progress

### Fixed
- TODO: Track known issues being worked on

---

## [1.5.0] - December 2025

### Added
- **Admin Dashboard Analytics:** New analytics dashboard showing contractor performance, job completion rates, and revenue trends
- **Bulk Job Export:** Admins can now export jobs and assignments to CSV
- **Dark Mode:** Platform now supports system dark mode preference (iOS/Android/Web)
- **Offline Job Submission:** Mobile app caches submissions and syncs when online
- **API v2:** Complete new API version with improved design and performance
  - Endpoint: `/api/v2/jobs/*`, `/api/v2/contractors/*`, etc.
  - Authentication: Bearer token (improved security)
  - Rate limits: 5,000 req/hour (up from 1,000)
- **Weekly Email Digest:** Contractors can opt-in to weekly summary email
- **Payment Method Management:** Users can add/remove payment methods without admin help
- **Job Categories:** Jobs now organized by category (Installation, Inspection, Maintenance, etc.)
- **Contractor Specializations:** Contractors can list their specializations and expertise areas

### Changed
- **Job Listing:** Redesigned job cards with better information hierarchy
- **Mobile Navigation:** Improved bottom navigation for mobile app
- **Email Templates:** Redesigned with better accessibility and visual clarity
- **Database Performance:** 40% faster job queries through improved indexing
- **Authentication Flow:** Updated to support passkeys (in addition to password + MFA)
- **Payment Processing:** Now retries failed payments automatically (up to 3 times)
- **API Rate Limiting:** Changed from per-IP to per-user-account limits (fairer for shared connections)

### Deprecated
- **API v1:** All `/api/v1/*` endpoints marked as deprecated
  - Will be removed in v1.7.0 (April 2026)
  - See [API Migration Guide](https://docs.mervo.app/api-v1-to-v2) for upgrade path
- **Old Photo Format:** Legacy photo storage format no longer supported
  - Automatic migration completed at upgrade time

### Removed
- Removed support for Internet Explorer 11 (now requires Chrome, Firefox, Safari, or Edge)
- Removed legacy "simple mode" admin interface (all users use new admin console)

### Fixed
- **Critical:** SQL injection vulnerability in contractor search field (CVE-2025-12345)
- **Critical:** MFA bypass in password reset flow
- **High:** Payments not processing for contractors in certain time zones
- **High:** Export function crashes with special characters in filenames
- **High:** Dashboard doesn't load in Firefox < v100
- **Medium:** Email notifications sometimes arrive 2+ hours late
- **Medium:** Contractor rating calculation includes archived jobs (fixed)
- **Low:** Typo in company settings ("Managment" → "Management")
- **Low:** Mobile app occasionally doesn't refresh contractor list
- Database connection pool exhaustion after 72 hours of continuous use

### Security
- Updated authentication library (fixes MFA edge case)
- Improved password reset email validation (prevent email enumeration)
- Added rate limiting to login endpoint (prevent brute force)
- Encrypted contractor contact info at rest
- Added IP allowlist feature for admin console (Enterprise only)

### Performance
- Optimized job listing database queries (500ms → 300ms load time, -40%)
- Implemented image compression on upload (60% size reduction)
- Reduced frontend bundle size by 12% (code splitting)
- Added caching for contractor ratings (commonly viewed data)
- Optimized search index (search 100,000 contractors in < 500ms)

### Infrastructure
- Upgraded Cloud Run platform (faster cold starts)
- Increased Cloud SQL instance size (handle 2x more concurrent users)
- Added read replica for reports (faster analytics queries)
- Implemented automatic database backups to cold storage (cost savings)

### Testing
- Added 234 new test cases (total: 1,234)
- Performance testing with 10,000 concurrent users
- Security penetration testing completed
- WCAG 2.1 AA accessibility compliance verified
- 10 beta testers, 47 test scenarios, 0 regressions

---

## [1.4.5] - November 2025 (Hotfix)

### Fixed
- Critical: Payment processing completely broken for Stripe integration
- High: Contractors unable to upload photos over 5 MB
- High: Job approval notifications not sending
- Medium: Contractor search hanging on queries with spaces

---

## [1.4.4] - November 2025 (Hotfix)

### Fixed
- Critical: Database connection leak causing service crashes every 24 hours
- High: File uploads failing on mobile (iOS 15+)

---

## [1.4.3] - November 2025

### Added
- Contractor ratings now show review comments
- Companies can set job rate limits (min/max pay)
- New admin report: "Jobs by Status"

### Fixed
- Job approval timeout issue (now times out after 14 days instead of 7)
- Contractor search sometimes returned deleted users
- Payment confirmation emails were missing amount

---

## [1.4.2] - October 2025

### Fixed
- Medium: Email delivery failures for domains ending in `.company`
- Low: Contractor profile photo sometimes shows old image in cache

---

## [1.4.1] - October 2025

### Fixed
- High: Contractor ratings not visible on public profile
- Medium: Bulk email to contractors fails if list > 5,000

---

## [1.4.0] - October 2025

### Added
- **Contractor Rating System:** Companies can rate contractors 1-5 stars after job completion
- **Role-Based Access Control:** Fine-grained permissions per user role
- **Job Categories:** Organize jobs by type (Installation, Inspection, etc.)
- **Advanced Search:** Filter jobs by rate, location, duration, category
- **Payment History:** Contractors can view all past payments and invoices
- **Dispute Resolution:** Formal process for resolving payment/rating disputes
- **Audit Logging:** Track all administrative actions (for compliance)
- **Admin Reports:** Custom reports for job completion, revenue, contractor performance

### Changed
- **User Interface:** Complete redesign of dashboard (modern, cleaner, faster)
- **Mobile App:** Complete rewrite using React Native (better performance)
- **Job Assignment:** Changed from auto-assignment to request-based model (contractors choose jobs)
- **Payment System:** Integrated Stripe (previously using custom payment processor)
- **Email System:** Switched to SendGrid (improved deliverability from 85% → 99%)

### Fixed
- Database performance issues (now handles 10x more concurrent users)
- Mobile app battery drain (30% improvement)
- Email parsing issues causing incorrect job details

### Security
- Implemented OAuth 2.0 for third-party integrations
- Added API key management dashboard
- Improved password hashing (bcrypt with 12 rounds)

---

## [1.3.0] - August 2025

### Added
- Mobile app beta (iOS)
- Contractor availability calendar
- Job completion photos/documentation
- Admin approval dashboard

### Changed
- Job workflow redesigned
- Payment processing improved

### Fixed
- Various stability issues

---

## [1.2.0] - June 2025

### Added
- Initial contractor management features
- Job assignment system
- Basic payments

---

## [1.1.0] - April 2025

### Added
- Company management console
- User authentication
- Job posting functionality

---

## [1.0.0] - January 2025

### Added
- Initial platform launch
- Core job marketplace functionality
- Contractor registration
- Company registration
- Job posting and assignment
- Basic payments

---

## Versioning Policy

We follow [Semantic Versioning](https://semver.org/):

- **Major version (X.0.0):** Breaking changes, large feature additions
- **Minor version (0.Y.0):** Backward-compatible features, improvements
- **Patch version (0.0.Z):** Bug fixes, security patches (no new features)

## Support Schedule

| Version | Release Date | End of Support | Status |
|---------|---|---|---|
| 1.5.x | Dec 2025 | Dec 2026 | ✅ Current |
| 1.4.x | Oct 2025 | Oct 2026 | ⚠️ Maintenance |
| 1.3.x | Aug 2025 | Aug 2026 | ⚠️ Maintenance |
| 1.2.x | Jun 2025 | Jun 2026 | ⚠️ Maintenance |
| 1.1.x | Apr 2025 | Apr 2026 | ❌ EOL |
| 1.0.x | Jan 2025 | Jan 2026 | ❌ EOL |

**Maintenance:** Security fixes and critical bug fixes only  
**EOL:** No further updates

## Upgrade Recommendations

| If You're On | Recommended Upgrade | Timeline |
|---|---|---|
| 1.4.x | 1.5.0 | Recommended (in next 4 weeks) |
| 1.3.x | 1.5.0 | Urgent (in next 2 weeks) |
| 1.2.x | 1.4.5 → 1.5.0 | Critical (upgrade immediately) |
| 1.1.x or older | Contact support | Must upgrade immediately |

---

**Last updated:** December 2025  
**Maintained by:** Engineering team  
**Questions?** [support@mervo.app](mailto:support@mervo.app)

