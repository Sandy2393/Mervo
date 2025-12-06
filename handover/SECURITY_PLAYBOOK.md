# Security Playbook

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** Security team, administrators, incident response team

---

## Quick Reference: Incident Response

| Severity | Response Time | Escalation | Actions |
|----------|---------------|-----------|---------|
| **Critical** | 15 min | CTO + VP Security | See [Critical Incidents](#critical-incidents) |
| **High** | 1 hour | Security team | See [High-Priority](#high-priority-incidents) |
| **Medium** | 4 hours | Engineering | See [Medium-Priority](#medium-priority-incidents) |
| **Low** | 24 hours | Support | See [Low-Priority](#low-priority-incidents) |

---

## Critical Incidents

### Data Breach (Suspected or Confirmed)

**Immediate Actions (First 15 minutes):**

1. **Isolate the breach**
   ```bash
   # Disable affected accounts
   UPDATE users SET active = false WHERE id IN (REPLACE_AFFECTED_USER_IDS);
   
   # Log the action
   INSERT INTO audit_logs (company_id, action, target_type, details, created_at)
   VALUES (NULL, 'security_incident', 'user', 
           '{"type": "account_disabled", "reason": "breach_response"}'::jsonb, NOW());
   ```

2. **Notify executive team**
   - Send Slack message to #security-incidents
   - Contact CTO and VP Security immediately
   - Message template: "SECURITY INCIDENT: Suspected data breach affecting [COUNT] users. Containment in progress."

3. **Preserve evidence**
   ```bash
   # Export logs for forensics
   gcloud logging read "severity>=ERROR" --limit 1000 --format json > /tmp/incident_logs_$(date +%s).json
   
   # Snapshot database (for forensics)
   gcloud sql backups create --instance mervo-db --description "INCIDENT_$(date +%Y%m%d_%H%M%S)"
   ```

4. **Enable enhanced monitoring**
   ```bash
   # Increase log retention
   gcloud logging sinks update _Default --log-filter='severity >= DEBUG'
   ```

**Next 2 hours:**

5. **Investigate scope**
   ```sql
   -- Check what data was accessed
   SELECT * FROM audit_logs
   WHERE created_at >= NOW() - INTERVAL '7 days'
     AND action IN ('data_accessed', 'export', 'download')
   ORDER BY created_at DESC;
   
   -- Check for unauthorized account access
   SELECT u.email, al.created_at, al.action
   FROM users u
   LEFT JOIN audit_logs al ON u.id = al.user_id
   WHERE al.created_at >= NOW() - INTERVAL '24 hours'
     AND (al.action LIKE '%login%' OR al.action LIKE '%access%')
   ORDER BY al.created_at DESC;
   ```

6. **Determine affected data**
   - What tables were accessed?
   - What fields contain sensitive data? (See [Data Classification](#data-classification))
   - How many users/companies affected?

7. **Revoke compromised credentials**
   ```bash
   # Rotate API keys
   # 1. Generate new Supabase key at console.supabase.com
   # 2. Update Cloud Run environment: gcloud run services update mervo --set-env-vars SUPABASE_KEY=NEW_KEY
   # 3. Invalidate old key at console
   
   # Rotate GitHub token (if leaked)
   # 1. Regenerate at github.com/settings/tokens
   # 2. Update Cloud Run secret: gcloud secrets versions add github-token --data-file=-
   # 3. Restart Cloud Run
   ```

8. **Notify affected parties**
   - Within 24 hours of confirmation, notify all affected users
   - Include: what data was accessed, what we're doing, recommended actions
   - Email template in [Breach Notification Email](#breach-notification-email)

9. **Create incident ticket**
   - Title: "[SECURITY] Data Breach - [DATE] - [SCOPE]"
   - Assign to: CTO + VP Security
   - Include: timeline, affected data, response taken, remediation plan

---

### Ransomware / Encryption Attack

**Immediate Actions (First 15 minutes):**

1. **Disconnect from network (if it's a critical resource)**
   - Do NOT turn off without backup
   - This prevents spread

2. **Restore from clean backup**
   ```bash
   # List recent backups (before suspected infection)
   gcloud sql backups list --instance mervo-db --limit 10
   
   # Restore to clean state
   gcloud sql backups restore BACKUP_ID --backup-instance mervo-db
   
   # Create new Cloud Run revision
   gcloud run deploy mervo --image gcr.io/PROJECT_ID/mervo:latest
   ```

3. **Notify immediately**
   - Slack: "CRITICAL: Ransomware detected. Backup restore in progress."
   - Do NOT negotiate with attackers if ransom demanded

4. **Assess impact**
   - How much data is encrypted?
   - Which systems are affected?
   - Can we restore from backup?

5. **Inform users**
   - Be transparent: "We detected and contained a ransomware attack. Services will be restored from backup."
   - Provide ETA and status updates every 2 hours

---

### Unauthorized Access (Compromised Admin Account)

**Immediate Actions (15 minutes):**

1. **Disable the account**
   ```sql
   UPDATE users SET active = false WHERE id = 'REPLACE_ADMIN_ID';
   DELETE FROM sessions WHERE user_id = 'REPLACE_ADMIN_ID';
   ```

2. **Audit what was accessed**
   ```sql
   SELECT * FROM audit_logs
   WHERE user_id = 'REPLACE_ADMIN_ID'
     AND created_at >= NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

3. **Reset password**
   ```sql
   UPDATE users SET password_hash = crypt('REPLACE_TEMP_PASSWORD', gen_salt('bf'))
   WHERE id = 'REPLACE_ADMIN_ID';
   ```

4. **Force logout of all sessions**
   ```sql
   DELETE FROM sessions WHERE expires_at > NOW();
   ```

5. **Rotate all API keys immediately** (see [Key Rotation](#key-rotation))

6. **Enable MFA for all admin accounts**
   ```sql
   UPDATE users SET mfa_enabled = true
   WHERE id IN (SELECT user_id FROM company_users WHERE role = 'admin');
   ```

---

## High-Priority Incidents

### SQL Injection Attack Detected

**Detection:**
- Unusual SQL characters in request logs
- Error messages revealing schema
- Unauthorized data access patterns

**Response:**

1. **Identify the entry point**
   ```bash
   gcloud logging read "jsonPayload.error =~ 'SQL|syntax'" --limit 50
   ```

2. **Patch immediately**
   - Apply input sanitization / parameterized queries
   - Deploy fix within 1 hour

3. **Review affected data**
   ```sql
   SELECT * FROM audit_logs
   WHERE action = 'query_executed'
     AND created_at >= NOW() - INTERVAL '1 day'
   ORDER BY created_at DESC;
   ```

4. **Rotate database credentials**

---

### DDoS / Availability Attack

**Detection:**
- Spike in traffic volume
- Service becomes slow or unresponsive
- Error rate increases suddenly

**Response:**

1. **Enable DDoS protection** (if not already enabled)
   ```bash
   # Cloud Armor rule
   gcloud compute security-policies create ddos-protection \
     --description "Basic DDoS protection"
   
   gcloud compute security-policies rules create 100 \
     --security-policy ddos-protection \
     --action "allow" \
     --priority 100
   ```

2. **Rate limit requests**
   ```bash
   # Temporarily reduce rate limits
   gcloud run services update mervo \
     --set-env-vars RATE_LIMIT_PER_MINUTE=10
   ```

3. **Scale up resources**
   ```bash
   gcloud run services update mervo \
     --max-instances 100 \
     --min-instances 10
   ```

4. **Monitor attack**
   - Check if traffic normalizes
   - Is it coming from single IP? Block it at Cloud Armor
   - Is it distributed? May need ISP-level filtering

5. **Document attack**
   - Create incident ticket
   - Log IP addresses and patterns
   - Inform customers of status

---

### Third-Party Service Compromise

**Example:** Supabase account hacked, GitHub credentials leaked

**Response:**

1. **Identify what was compromised**
   - Which service?
   - What credentials/keys are exposed?
   - What could an attacker do with them?

2. **Revoke credentials immediately**
   ```bash
   # If Supabase is compromised:
   # 1. Go to console.supabase.com
   # 2. Project settings → API → Delete service role key
   # 3. Generate new service role key
   # 4. Update Cloud Run environment variable
   
   gcloud run services update mervo \
     --set-env-vars SUPABASE_SERVICE_ROLE_KEY=NEW_KEY
   ```

3. **Check logs for misuse**
   - Did attacker access production data?
   - Did they modify anything?
   - Did they create new accounts?

4. **Force password reset for affected users**
   ```sql
   UPDATE users SET password_reset_required = true
   WHERE email IN (REPLACE_LIST_OF_AFFECTED_EMAILS);
   ```

---

## Medium-Priority Incidents

### Unusual Activity Pattern

**Indicators:**
- Bulk export requests
- Unusual login times
- Multiple failed authentication attempts
- Mass email sent to contractors

**Response:**

1. **Review audit logs**
   ```sql
   SELECT * FROM audit_logs
   WHERE created_at >= NOW() - INTERVAL '6 hours'
   ORDER BY created_at DESC LIMIT 100;
   ```

2. **Identify the actor**
   - Is it a legitimate user?
   - Is the account compromised?
   - Is it a new threat?

3. **Take action**
   - If account: disable and contact user
   - If threat: increase monitoring, consider blocking IP

4. **Monitor for escalation**
   - Set up alerts for similar activity
   - Check if other accounts show same pattern

---

### Unauthorized Role or Permission Change

**Detection:**
- User granted admin access unexpectedly
- Permissions changed for sensitive operations
- New API key created without request

**Response:**

1. **Audit access**
   ```sql
   SELECT * FROM audit_logs
   WHERE action = 'role_change'
     AND created_at >= NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

2. **Review permission scope**
   ```sql
   SELECT user_id, role, permissions
   FROM company_users
   WHERE role IN ('admin', 'owner')
   ORDER BY created_at DESC;
   ```

3. **Revert if unauthorized**
   ```sql
   UPDATE company_users
   SET role = 'contractor', permissions = '{"jobs": "view"}'::jsonb
   WHERE user_id = 'REPLACE_USER_ID' AND NOT authorized;
   ```

4. **Notify affected user**
   - Explain why change was reverted
   - Ask if they made the request

---

## Low-Priority Incidents

### Weak Password Detected

- User has weak password (< 12 chars, no special chars)

**Response:**
1. Force password reset at next login
2. Send email with password policy requirements

### Failed Backup

- Nightly backup failed
- Database hasn't been backed up in 24+ hours

**Response:**
1. Trigger manual backup: `gcloud sql backups create --instance mervo-db`
2. Verify backup completes
3. Check backup storage quota
4. Alert DBA for investigation

---

## Key Rotation

### Quarterly Rotation Checklist

| Key | Rotation | Method | Owner |
|-----|----------|--------|-------|
| **Supabase Service Role** | Every 90 days | Supabase console | DBA |
| **GitHub Personal Token** | Every 180 days | github.com/settings | DevOps |
| **Database Password** | Every 180 days | Cloud SQL | DBA |
| **JWT Secret** | Every 90 days | Cloud Run env var | DevOps |
| **Stripe API Key** | Every 180 days | Stripe dashboard | Finance |
| **SendGrid API Key** | Every 180 days | SendGrid dashboard | DevOps |

### Rotate Supabase Service Role Key

```bash
# 1. Check current key in use
gcloud run services describe mervo --format='value(spec.template.spec.containers[0].env[?name==SUPABASE_SERVICE_ROLE_KEY].value)'

# 2. Generate new key at https://console.supabase.com
# Go to: Project Settings → API → Service Role

# 3. Update Cloud Run environment
gcloud run services update mervo \
  --set-env-vars SUPABASE_SERVICE_ROLE_KEY=REPLACE_NEW_KEY \
  --region us-central1

# 4. Verify deployment
gcloud run services describe mervo --format='value(status.latestReadyRevisionName)'

# 5. Test that API calls work
curl -H "Authorization: Bearer REPLACE_NEW_KEY" \
  https://REPLACE_SUPABASE_URL/rest/v1/jobs?limit=1

# 6. Delete old key at console.supabase.com (after 24-hour verification)
```

### Rotate Database Password

```bash
# 1. Generate strong password
openssl rand -base64 32

# 2. Set new password (requires postgres user)
gcloud sql connect mervo-db --user=postgres
ALTER USER postgres WITH PASSWORD 'REPLACE_NEW_PASSWORD';
\q

# 3. Update connection string in Cloud Run
gcloud run services update mervo \
  --set-env-vars DATABASE_URL="postgresql://postgres:REPLACE_NEW_PASSWORD@REPLACE_HOST:5432/postgres"

# 4. Verify connection
gcloud run services describe mervo

# 5. Test application
curl https://your-domain.com/health
```

### Rotate GitHub Token

```bash
# 1. Generate new personal access token
# Go to: github.com/settings/tokens → Generate new token (classic)
# Scopes: repo (full), workflow, read:org

# 2. Update Cloud Run secret
echo -n "REPLACE_NEW_GITHUB_TOKEN" | gcloud secrets create github-token \
  --replication-policy="automatic" --data-file=-

# 3. Update Cloud Run to use new secret
gcloud run services update mervo \
  --set-env-vars GITHUB_TOKEN=REPLACE_NEW_GITHUB_TOKEN

# 4. Delete old token at github.com/settings/tokens
```

---

## Data Classification & Handling

### Data Sensitivity Levels

| Level | Examples | Retention | Encryption | Access |
|-------|----------|-----------|-----------|--------|
| **Public** | Job titles, company names | Indefinite | Not required | Public |
| **Internal** | User emails, phone numbers | 2 years | At rest | Authenticated users |
| **Confidential** | Payment info, personal data | 3 years | At rest + in transit | Admin only |
| **Restricted** | Passwords, API keys, tokens | Manual delete | At rest + in transit + memory | Specific role |

### Handling Sensitive Data

**Before storage:**
```python
# Hash passwords
from bcrypt import hashpw, gensalt
hashed = hashpw(password.encode(), gensalt())

# Encrypt API keys
from cryptography.fernet import Fernet
cipher_suite = Fernet(ENCRYPTION_KEY)
encrypted = cipher_suite.encrypt(api_key.encode())

# Tokenize payment info (don't store raw card numbers)
# Use Stripe tokenization: tok_xxx
```

**Before logging:**
```python
# NEVER log sensitive data
# Bad: logger.info(f"User password: {password}")
# Good: logger.info("User password reset requested")

# Bad: logger.error(f"DB error: {query}")
# Good: logger.error("Database query failed", error_code=500)
```

**Before transmission:**
```bash
# Always use HTTPS (automatic on Cloud Run)
# Always use TLS 1.2+ (configured at Cloud Run)

# For APIs, use API key + HTTPS
curl -H "Authorization: Bearer TOKEN" https://api.mervo.app/...
```

---

## Access Control & Permissions

### Role-Based Access Control (RBAC)

| Role | Jobs | Contractors | Reports | Admin | Delete |
|------|------|-------------|---------|-------|--------|
| **Contractor** | View own | View own | — | — | — |
| **Employee** | View all | View all | View | — | — |
| **Manager** | View all | View all | View all | — | — |
| **Admin** | View all | Manage | View all | Yes | Soft delete |
| **Owner** | View all | Manage | View all | Yes | Hard delete |

### Grant Admin Access

```sql
-- Grant admin role
UPDATE company_users
SET role = 'admin', permissions = '{"jobs": "manage", "contractors": "manage", "reports": "view", "admin": true}'::jsonb
WHERE company_id = 'REPLACE_COMPANY_ID' AND user_id = 'REPLACE_USER_ID';

-- Log the action
INSERT INTO audit_logs (company_id, action, target_type, target_id, details)
VALUES (
  'REPLACE_COMPANY_ID',
  'role_change',
  'company_user',
  'REPLACE_USER_ID',
  '{"new_role": "admin", "reason": "REPLACE_REASON"}'::jsonb
);
```

### Revoke Admin Access

```sql
-- Revoke admin role
UPDATE company_users
SET role = 'employee'
WHERE company_id = 'REPLACE_COMPANY_ID' AND user_id = 'REPLACE_USER_ID';

-- Disable all sessions
DELETE FROM sessions WHERE user_id = 'REPLACE_USER_ID';

-- Log the action
INSERT INTO audit_logs (company_id, action, target_type, target_id, details)
VALUES (
  'REPLACE_COMPANY_ID',
  'role_revoked',
  'company_user',
  'REPLACE_USER_ID',
  '{"previous_role": "admin", "reason": "REPLACE_REASON"}'::jsonb
);
```

### Remove User Access Entirely

```sql
-- Soft delete (preserve data)
UPDATE company_users SET active = false
WHERE company_id = 'REPLACE_COMPANY_ID' AND user_id = 'REPLACE_USER_ID';

-- Or hard delete (if GDPR right to be forgotten)
DELETE FROM company_users
WHERE company_id = 'REPLACE_COMPANY_ID' AND user_id = 'REPLACE_USER_ID';

-- Disable all sessions
DELETE FROM sessions WHERE user_id = 'REPLACE_USER_ID';
```

---

## Multi-Factor Authentication (MFA)

### Enable MFA for All Admins

```sql
-- Require MFA for all admin users
UPDATE users
SET mfa_enabled = true, mfa_required_by = NOW() + INTERVAL '7 days'
WHERE id IN (
  SELECT user_id FROM company_users WHERE role = 'admin'
);

-- Send notification email
-- (See [MFA Setup Email](#mfa-setup-email))
```

### MFA Setup Email

```
Subject: Please set up Multi-Factor Authentication

Hi [NAME],

For security reasons, we're requiring all administrators to enable Multi-Factor Authentication (MFA).

How to set up MFA:
1. Log in to your account
2. Go to Settings → Security
3. Click "Enable MFA"
4. Scan the QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator)
5. Enter the 6-digit code to confirm

Deadline: [DATE_7_DAYS_FROM_NOW]

Questions? Contact support@mervo.app

— Mervo Security Team
```

---

## Breach Notification Email

**Template (required by law in most jurisdictions):**

```
Subject: Security Notice: We've notified you of a data security incident

Dear [CUSTOMER_NAME],

We're writing to inform you of a data security incident that may have affected your personal information.

WHAT HAPPENED:
On [DATE], we detected unauthorized access to our systems. An investigation confirmed that [DESCRIPTION_OF_BREACH].

WHAT INFORMATION WAS AFFECTED:
[LIST: emails, phone numbers, payment info, etc.]

WHAT WE'RE DOING:
- We've contained the breach and secured all systems
- We've revoked all compromised credentials
- We've enhanced monitoring and security measures
- We've notified law enforcement and regulatory bodies

WHAT YOU SHOULD DO:
- Monitor your accounts for suspicious activity
- Change your password immediately
- Enable two-factor authentication (Settings → Security → MFA)
- Consider a credit freeze if payment information was affected

NEXT STEPS:
We'll provide updates every 48 hours at https://status.mervo.app
Contact our security team: security@mervo.app
Regulatory filings: [LINK_TO_REGULATORY_NOTICE]

We sincerely regret this incident and appreciate your patience as we work to prevent future breaches.

— Mervo Security & Legal Team
```

---

## Audit Logging

### What to Log

Every action that modifies data should be logged:

```sql
INSERT INTO audit_logs (
  company_id,
  user_id,
  action,
  target_type,
  target_id,
  details,
  ip_address,
  user_agent,
  created_at
) VALUES (
  'REPLACE_COMPANY_ID',
  'REPLACE_USER_ID',
  'job_created',  -- Action name
  'job',          -- Type
  'REPLACE_JOB_ID',
  '{"job_name": "...", "assigned_to": "..."}'::jsonb,
  '192.168.1.1',
  'Mozilla/5.0...',
  NOW()
);
```

### Regular Audit Review

**Daily:** Check for errors and failed access attempts
```sql
SELECT * FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '1 day'
  AND action IN ('access_denied', 'login_failed', 'error')
ORDER BY created_at DESC;
```

**Weekly:** Check for permission changes
```sql
SELECT * FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND action IN ('role_change', 'permission_updated')
ORDER BY created_at DESC;
```

**Monthly:** Check for data deletions and exports
```sql
SELECT * FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND action IN ('delete', 'export', 'download', 'data_accessed')
ORDER BY created_at DESC;
```

---

## Security Checklist

### Daily
- [ ] Review error logs (severity >= ERROR)
- [ ] Check for failed login attempts
- [ ] Verify backups completed
- [ ] Check system health monitoring

### Weekly
- [ ] Review audit logs for permission changes
- [ ] Check for inactive admin accounts
- [ ] Verify MFA is enabled for all admins
- [ ] Review API key usage

### Monthly
- [ ] Review all data exports/downloads
- [ ] Check for unauthorized access patterns
- [ ] Verify all secrets are encrypted
- [ ] Audit database user access

### Quarterly
- [ ] Rotate all API keys and passwords
- [ ] Review access control roles
- [ ] Penetration test (if budget allows)
- [ ] Security training for team
- [ ] Update incident response playbook

---

## Contact & Escalation

| Issue | Severity | First Contact | Escalation | Response Time |
|-------|----------|---------------|-----------|--------------|
| Account locked | High | DBA | VP Security | 15 min |
| Suspected breach | Critical | VP Security | CTO + Legal | 5 min |
| Key compromised | Critical | DevOps | VP Security + CTO | 15 min |
| Unusual activity | Medium | Security Team | Engineering | 1 hour |
| Failed backup | Low | DBA | Engineering | 2 hours |

---

**Version history:**
- v1.0 — Initial release, Dec 2025
