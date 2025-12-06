# Support Plan

Define service levels, response times, and pricing for ongoing support and maintenance of the Mervo platform.

## Support Tiers

### Tier 1: Basic Support
**Ideal for:** Small teams, internal use, early adopters

**Included:**
- Email support only (response within 48 business hours)
- Access to documentation and help center
- Monthly bug fix releases
- Community forum access

**Monthly Cost:** $0 (included with base license)

**SLA:**
- Critical (total outage): 48-hour response
- High (significant degradation): 5-day response
- Medium (workaround available): 10-day response
- Low (cosmetic): best effort

---

### Tier 2: Standard Support
**Ideal for:** Growing teams, revenue-generating operations

**Included:**
- Priority email + Slack channel support
- 24-hour response on critical issues
- 8-hour response on high-priority issues
- Monthly releases with new features
- Custom report exports
- Basic configuration assistance
- Quarterly business reviews

**Monthly Cost:** $499–$999 (depending on user count)

**SLA:**
- Critical (total outage): 4-hour response, 8-hour resolution target
- High (significant degradation): 8-hour response, 24-hour resolution target
- Medium (workaround available): 24-hour response
- Low (cosmetic): 5-day response

---

### Tier 3: Premium Support
**Ideal for:** Enterprise, mission-critical operations

**Included:**
- 24/7 phone + email + Slack support
- 1-hour response on all issues
- Dedicated account manager
- Custom features and integrations
- Priority deployment windows
- On-premises or dedicated infrastructure option
- Monthly strategic planning sessions
- Annual security audit included

**Monthly Cost:** $2,999–$9,999+ (custom pricing)

**SLA:**
- Critical (total outage): 30-minute response, 4-hour resolution target
- High: 2-hour response, 12-hour resolution target
- Medium: 8-hour response, 48-hour resolution target
- Low: 24-hour response

---

## Add-On Services

### On-Call Escalation
- **Cost:** +$1,999/month
- **Includes:** On-call engineer available 24/7 for critical incidents
- **Response:** 15 minutes for pages during on-call hours

### Custom Development
- **Cost:** $150–$300/hour (depending on complexity)
- **Examples:** Custom integrations, feature development, API extensions
- **Minimum:** 20-hour blocks

### Data Migration & Setup
- **Cost:** $2,000–$5,000 (fixed)
- **Includes:** Data import, user onboarding, initial configuration

### Training & Workshops
- **Cost:** $500–$2,000 per session (1–4 hours)
- **Examples:** Admin training, contractor training, advanced features

---

## Support Process

### Severity Levels

| Level | Definition | Example |
|-------|-----------|---------|
| **Critical** | Service completely unavailable; customers cannot work | Platform down, authentication broken, data loss |
| **High** | Major functionality impaired; significant workaround required | Jobs cannot be assigned, timesheets disabled |
| **Medium** | Some functionality limited but users can work around it | Reports slow to generate, UI lag on job creation |
| **Low** | Cosmetic or minor issue; no impact on workflows | Typo, icon misalignment, sidebar styling |

### Incident Lifecycle

1. **Report**
   - Support ticket created via email or Slack
   - Severity assigned by support team
   - Acknowledgement sent within SLA response time

2. **Initial Diagnosis**
   - Engineer reviews logs and system state
   - Identifies root cause if obvious
   - Communicates next steps to client

3. **Resolution Attempts**
   - Try workaround if available
   - Apply fix if in development team's scope
   - Escalate to engineering if complex

4. **Verification**
   - Client confirms fix resolves issue
   - Run smoke tests to ensure no regressions
   - Document issue and solution

5. **Follow-Up**
   - Post-incident review for critical issues
   - Root cause analysis
   - Preventive measures identified

---

## Escalation Path

**Tier 1 (Basic Support):** Email-only, no escalation

**Tier 2 (Standard Support):**
1. Support Engineer (first contact)
2. Engineering Lead (if technical issue after 24 hours)
3. VP Engineering (if critical issue unresolved after 48 hours)

**Tier 3 (Premium Support):**
1. Dedicated Account Manager (first contact)
2. On-Call Engineer (if critical)
3. VP Engineering (if critical unresolved after 2 hours)

---

## Pricing Assumptions & Notes

**Assumption 1: Team Size**
- Support costs scale with number of active users
- Standard Tier: $499 for 1–5 users, +$150 per additional user group (5 users)
- Premium Tier: Starts at $2,999 regardless of team size, but may increase with exceptional load

**Assumption 2: Feature Development**
- Custom features estimated at 20–40 hours of engineering time
- Typical project: $3,000–$12,000 depending on scope
- Monthly retainer for continuous development: $4,999–$15,000

**Assumption 3: Infrastructure & Hosting**
- Included in base license for Standard tier
- Premium tier may require dedicated database or on-premises: +$999–$4,999/month

**Assumption 4: Data Retention**
- 1 year of operational data retained by default
- Extended retention available: +$199/month per additional year

---

## Optional Add-Ons Summary

| Add-On | Cost | Best For |
|--------|------|----------|
| On-Call Escalation | $1,999/mo | Mission-critical operations |
| Custom Development (hourly) | $150–$300/hr | One-off features, integrations |
| Data Migration | $2,000–$5,000 (one-time) | Initial setup or data import |
| Training & Workshops | $500–$2,000/session | Team onboarding, advanced topics |
| Extended Data Retention | $199/mo per year | Compliance, long-term audits |
| Dedicated Infrastructure | $999–$4,999/mo | Enterprise, high-volume operations |

---

## Annual Commitment Discount

- **3-year commitment:** 15% discount on monthly costs
- **1-year commitment:** 10% discount on monthly costs

---

## Example Monthly Bill

**Standard Support Customer with 15 Employees:**

```
Base License (Standard Tier, 15 users)      $749/month
Custom Report Exports (included)             —
Add-On: Training Sessions (2x per year)      ~$167/month average
Add-On: Custom Development (10 hrs/month)    ~$2,000/month average

Total Estimate: ~$2,916/month (~$35,000/year)

With 1-year commitment (10% discount):       ~$2,624/month (~$31,500/year)
```

---

## Support Contact Information

| Channel | Details | Response Time |
|---------|---------|---|
| Email | support@mervo.app | Per SLA |
| Slack | #mervo-support (Standard/Premium only) | Per SLA |
| Phone | +61 2 3456 7890 (Premium only) | Per SLA |
| Portal | https://support.mervo.app | Web-based tickets |

---

## Annual Review & Adjustment

Support pricing and SLAs are reviewed annually in Q4. Adjustments take effect January 1st of the following year. Existing customers on multi-year contracts are grandfathered at current rates.

---

## Assumptions & TODO Items

- TODO: Confirm on-call coverage model (in-house vs. outsourced)
- TODO: Finalize response time commitments with engineering team
- TODO: Set up status page (e.g., statuspage.io) for public updates
- TODO: Create incident response runbook with escalation contacts
- TODO: Define SLA credits/refunds policy if SLA breached
