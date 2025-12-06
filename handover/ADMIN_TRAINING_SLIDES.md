# Admin Training Slides

**Presentation Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** System administrators, operations team  
**Duration:** 2 hours (8 slides with speaker notes)

---

## Slide 1: Welcome to Mervo Admin Training

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    MERVO ADMIN TRAINING                                   ║
║                                                            ║
║    Your Complete Guide to System Operations,              ║
║    Security, and Maintenance                              ║
║                                                            ║
║    👥 Who Should Take This Course?                        ║
║    ✓ System Administrators                                ║
║    ✓ Operations Team                                      ║
║    ✓ IT Support Staff                                     ║
║    ✓ Anyone managing Mervo infrastructure                ║
║                                                            ║
║    📚 What You'll Learn                                   ║
║    • Daily operational tasks                              ║
║    • System monitoring & troubleshooting                  ║
║    • Data management & backups                            ║
║    • Security protocols & incident response               ║
║    • Company & user management                            ║
║    • Advanced administration tasks                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Welcome everyone to the Mervo Admin Training course! This training is designed for anyone responsible for operating, maintaining, or securing the Mervo platform. Over the next 2 hours, we'll cover everything from day-to-day tasks to advanced security procedures.

By the end of this course, you should feel confident:
- Monitoring system health and responding to alerts
- Managing companies and user accounts
- Performing data backups and restores
- Responding to security incidents
- Accessing and interpreting logs
- Running routine maintenance tasks

The materials provided—Operation Runbook and Security Playbook—are your reference documents. Keep these handy as you work.

**Q&A:** Does anyone have questions before we start?

---

## Slide 2: Daily Operations Overview

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    DAILY OPERATIONS: THE ADMIN'S ROUTINE                  ║
║                                                            ║
║    8:00 AM ─ System Health Check                          ║
║    └─ Monitor CPU, memory, request latency               ║
║    └─ Check Cloud Run status dashboard                   ║
║    └─ Review overnight logs for errors                   ║
║                                                            ║
║    Throughout Day ─ Monitoring                           ║
║    └─ Watch for error alerts in Slack                    ║
║    └─ Review Cloud Logging in real-time                  ║
║    └─ Process incoming contractor job submissions        ║
║                                                            ║
║    12:00 PM ─ Approval Queue Check                       ║
║    └─ Review pending job approvals (2-5 min)            ║
║    └─ Check for disputes or issues                       ║
║    └─ Notify contractors of approvals                    ║
║                                                            ║
║    5:00 PM ─ End-of-Day Verification                     ║
║    └─ Confirm daily backup completed                     ║
║    └─ Review error summary                               ║
║    └─ Document any incidents                             ║
║                                                            ║
║    📊 Key Metrics to Track                               ║
║    • Error rate (target: < 1%)                           ║
║    • Response time (target: < 500ms avg)                 ║
║    • Jobs completed (baseline: varies)                   ║
║    • Active contractors (baseline: varies)               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Let's talk about what a typical day looks like for a Mervo admin.

**Morning standup (8 AM):** The first thing you do each day is check system health. This takes about 5 minutes. Open the Cloud Run console and look at the metrics graph. You're looking for:
- Are we serving traffic normally?
- Is error rate low (less than 1%)?
- Are response times acceptable (under 500ms on average)?

Check Cloud Logging for any ERROR or CRITICAL messages overnight. These will often tell you about database issues, service failures, or other problems.

**During the day:** You'll receive alerts via Slack if something goes wrong. The more serious alerts should wake you up immediately (if you're on-call). Less urgent ones can wait until business hours.

**Noon:** Take 5 minutes to scan the approval queue. Contractors complete work, and it needs approval before they get paid. Your job is to verify the work is legit and approve it. This is critical—contractors depend on timely approvals.

**End of day:** Before you leave, verify the backup completed. This literally takes 2 minutes. It's the most important thing you do all day because it's your insurance policy.

**Metrics:** Get familiar with what "normal" looks like. Check the baseline—how many jobs are typically completed per day? How many contractors are active? This helps you spot anomalies.

---

## Slide 3: System Monitoring & Alerting

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    SYSTEM MONITORING: STAY AHEAD OF PROBLEMS              ║
║                                                            ║
║    📡 Where to Monitor                                    ║
║                                                            ║
║    1. CLOUD RUN CONSOLE (Application)                     ║
║       https://console.cloud.google.com/run               ║
║       └─ CPU, memory, request count                       ║
║       └─ Error rate and latency                           ║
║       └─ Deployment history                               ║
║                                                            ║
║    2. CLOUD LOGGING (Detailed Logs)                       ║
║       https://console.cloud.google.com/logs               ║
║       └─ All application events                           ║
║       └─ Search by severity, resource, time              ║
║       └─ Export for analysis                              ║
║                                                            ║
║    3. CLOUD SQL (Database)                                ║
║       https://console.cloud.google.com/sql                ║
║       └─ Database CPU, memory usage                       ║
║       └─ Connection count                                 ║
║       └─ Query performance insights                       ║
║                                                            ║
║    4. SLACK ALERTS (Real-time Notifications)             ║
║       #status, #alerts, #errors channels                 ║
║       └─ Critical errors trigger immediate alerts         ║
║       └─ Severity: CRITICAL, HIGH, MEDIUM, LOW           ║
║                                                            ║
║    🚨 Alert Severity Levels                              ║
║    ┌─ CRITICAL (Red)    Response time: 15 min           ║
║    ├─ HIGH (Orange)     Response time: 1 hour           ║
║    ├─ MEDIUM (Yellow)   Response time: 4 hours          ║
║    └─ LOW (Blue)        Response time: 24 hours         ║
║                                                            ║
║    ✓ First Response Checklist                            ║
║    □ Acknowledge the alert (reply in Slack)             ║
║    □ Check Cloud Logging for error details              ║
║    □ Check if it's a known issue                         ║
║    □ If critical: notify engineering immediately        ║
║    □ Document in incident ticket                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Monitoring is the early warning system. It tells you about problems before users complain.

We use Google Cloud's built-in monitoring. You should have bookmarks for these four dashboards:

**Cloud Run Console:** This is your primary dashboard. You see real-time metrics here. If error rate jumps from 0% to 10%, that's a problem. If average latency goes from 100ms to 5000ms, something is slow.

**Cloud Logging:** Think of this as a detailed event log. Every request, every error, every significant operation gets logged here. You can search by error message, user, time range, etc. This is where you find root causes.

**Cloud SQL:** The database dashboard. Here you check if the database is the bottleneck. High CPU or memory usage? Lots of connections? These indicate a problem.

**Slack alerts:** We've configured automated alerts. When something bad happens, Slack notifies you immediately. Check your phone for critical alerts.

**Alert severity levels:** 
- CRITICAL (system down, data corruption): Respond within 15 minutes. Page on-call engineer.
- HIGH (degraded performance, security risk): Respond within 1 hour. Notify team.
- MEDIUM (minor issues, expected issues): Respond within 4 hours. During business hours.
- LOW (warnings, informational): Respond within 24 hours. Log for trending.

**When you get an alert:**
1. Take a breath. Not every alert is a catastrophe.
2. Acknowledge it in Slack so your teammates know someone is looking at it.
3. Go to Cloud Logging and look for the error.
4. Check the Operation Runbook—there's often a section for that specific problem.
5. Try the recommended fix. If it works, document what you did.
6. If it doesn't work, escalate to engineering with all the details.

The worst thing you can do is ignore an alert and hope it goes away. Always respond.

---

## Slide 4: User & Company Management

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    USER & COMPANY MANAGEMENT                              ║
║                                                            ║
║    👥 Company Types                                       ║
║    ┌────────────────────────────────────────┐             ║
║    │ COMPANY PROFILE                        │             ║
║    │ ├─ Name, email, phone                 │             ║
║    │ ├─ Owner (primary contact)            │             ║
║    │ ├─ Active status (true/false)         │             ║
║    │ ├─ Payment status (if billing)        │             ║
║    │ └─ Created date                       │             ║
║    └────────────────────────────────────────┘             ║
║                                                            ║
║    🔑 User Roles (Per Company)                            ║
║    ┌─────────────────────────────────────┐               ║
║    │ ROLE        │ CAN DO                │               ║
║    ├─────────────────────────────────────┤               ║
║    │ Contractor  │ Complete jobs         │               ║
║    │ Employee    │ View jobs, reports    │               ║
║    │ Manager     │ View all, manage team │               ║
║    │ Admin       │ Manage company, users │               ║
║    │ Owner       │ Everything + delete   │               ║
║    └─────────────────────────────────────┘               ║
║                                                            ║
║    ⚠️  How to Add a User                                  ║
║    Step 1: User creates account (self-signup)            ║
║    Step 2: Admin assigns company & role                  ║
║    Step 3: User logs in, sees their dashboard            ║
║                                                            ║
║    OR (If immediate access needed):                       ║
║    Step 1: Admin creates user via SQL                    ║
║    Step 2: Admin sends temp password via email           ║
║    Step 3: User logs in, changes password                ║
║                                                            ║
║    ❌ How to Remove a User                                ║
║    Option 1: Soft delete (preserve data)                 ║
║      UPDATE company_users SET active = false;            ║
║    Option 2: Hard delete (if required by law)            ║
║      DELETE FROM company_users WHERE ...;                ║
║                                                            ║
║    ⚙️  How to Change a User's Role                       ║
║    UPDATE company_users SET role = 'new_role'            ║
║    WHERE company_id = '...' AND user_id = '...';         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Every contractor and company employee is a user in the system. Your job is to maintain that user database.

**Company structure:** Each company has an owner. That owner can then add employees, contractors, etc. As an admin, you're kind of a "super-owner"—you can see and manage everything across all companies.

**Roles:** Think of roles as permission levels:
- **Contractor:** Can complete jobs. Very limited access.
- **Employee:** Can view jobs and reports. More information.
- **Manager:** Can manage their team. Broader permissions.
- **Admin:** Can configure the company, manage all users. High access.
- **Owner:** Can do everything including delete the company. Highest access.

**Common tasks:**
1. **New contractor joins:** They sign up themselves, email you, you assign them a contractor role.
2. **New employee at a company:** Company owner adds them, or you add them and notify owner.
3. **Contractor quits:** You deactivate them. Their completed jobs remain in the system.
4. **Contractor gets promoted to manager:** Update their role from contractor to manager.

**Soft delete vs. hard delete:** 
- **Soft delete** means you mark them as inactive but keep all their historical data. This is good for reporting. "How many contractors did we work with last year?"
- **Hard delete** means you completely erase them. Only do this if legally required (GDPR, right to be forgotten). Otherwise, soft delete.

Let me walk through the SQL commands in the Operation Runbook. You'll find examples for add, remove, and change role. Copy and paste them, fill in the REPLACE_ values, and run.

---

## Slide 5: Data Management & Backups

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    DATA MANAGEMENT & BACKUPS: YOUR SAFETY NET             ║
║                                                            ║
║    💾 Backup Strategy                                     ║
║    ┌──────────────────────────────────────┐               ║
║    │ Frequency: Daily (automatic)         │               ║
║    │ Retention: 30 days                   │               ║
║    │ Location: Google Cloud Storage       │               ║
║    │ Tested: Weekly restore test          │               ║
║    └──────────────────────────────────────┘               ║
║                                                            ║
║    ⏰ Backup Schedule                                     ║
║    ┌────────┬─────────┬──────────────────┐               ║
║    │ Time   │ Type    │ Notes            │               ║
║    ├────────┼─────────┼──────────────────┤               ║
║    │ 2 AM   │ Auto    │ Nightly snapshot │               ║
║    │ 6 AM   │ Auto    │ Incremental      │               ║
║    │ 10 AM  │ Auto    │ Incremental      │               ║
║    │ Before │ Manual  │ Before deploy    │               ║
║    │ Deploy │         │ or major change  │               ║
║    └────────┴─────────┴──────────────────┘               ║
║                                                            ║
║    ✓ Verify Backup Status                                ║
║    Command: gcloud sql backups list --instance mervo-db  ║
║    Look for:                                              ║
║    ✓ Latest backup is within 24 hours                    ║
║    ✓ Status is 'SUCCESSFUL'                              ║
║    ✓ File size is reasonable (varies with data)          ║
║                                                            ║
║    🔄 Restore from Backup (If Disaster)                  ║
║    Step 1: Identify the backup you want                  ║
║    Step 2: Create clone instance                         ║
║    Step 3: Test it works                                 ║
║    Step 4: Switch application to clone                   ║
║    Step 5: Delete original (keep backup)                 ║
║                                                            ║
║    ⚠️  Data Retention Policy                             ║
║    ├─ Completed jobs: 7 years (archive after 1 year)    ║
║    ├─ Audit logs: 3 years                                ║
║    ├─ Photos: 2 years (or if dispute)                    ║
║    ├─ Contractor ratings: Indefinite                     ║
║    └─ Inactive users: Delete after 2 years               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Backups are your insurance. You might never need them. But if you do—if there's a ransomware attack, hardware failure, or data corruption—a good backup is the difference between a bad day and a catastrophe.

**Our backup strategy:** Automatic daily snapshots. The system creates them at 2 AM, and incremental backups at 6 AM and 10 AM. You get 30 days of backups. That means you can recover from almost anything within the last month.

**Your job:** Verify the backup completed successfully. This takes 2 minutes every day. Go to the Cloud SQL console, click the mervo-db instance, go to Backups tab. Look at the most recent backup. Is it from today? Is the status "SUCCESSFUL"? If yes, you're good.

**If backup failed:** 
- Check if database ran out of storage space
- Check if backup job was manually cancelled
- Trigger a manual backup immediately: `gcloud sql backups create --instance mervo-db`
- Escalate to DBA if problem persists

**Restoring from backup:** Hopefully you'll never need this. But here's how:
1. You realize something went wrong—data was corrupted, deleted, or encrypted by ransomware.
2. You pick the backup from before the problem occurred.
3. You create a new database instance and restore the backup to it.
4. You test the application against the restored database.
5. If it looks good, you update the application to point to the new database.
6. The old corrupted database gets deleted (but the backup is kept for evidence).

This is why we keep multiple backups—so you have options for which point in time to restore to.

**Data retention:** Some data you keep forever (contractor ratings, payment records). Some data you delete after a time (old audit logs, photos without disputes). The table on the slide shows the policy. After your first month, you'll run a cleanup script monthly to archive/delete old data.

---

## Slide 6: Security & Incident Response

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    SECURITY: PROTECTING THE SYSTEM & DATA                 ║
║                                                            ║
║    🔐 Most Important Security Rules                       ║
║    1. Passwords ≥ 16 chars, special chars, random        ║
║    2. API keys never in code, always in secrets           ║
║    3. Never log sensitive data (passwords, PII)           ║
║    4. Always use HTTPS (automatic in Cloud Run)           ║
║    5. Enable MFA for all admin accounts                   ║
║    6. Rotate keys every 90 days                           ║
║                                                            ║
║    🚨 If You Suspect a Security Issue                     ║
║    ┌──────────────────────────────────────┐               ║
║    │ 1. Don't panic. Don't delete anything.│              ║
║    │ 2. Isolate the problem (disable       │              ║
║    │    accounts if needed).               │              ║
║    │ 3. Take a backup immediately.        │              ║
║    │ 4. Call VP Security / CTO.            │              ║
║    │ 5. Preserve all evidence (logs,       │              ║
║    │    timestamps, affected users).       │              ║
║    └──────────────────────────────────────┘               ║
║                                                            ║
║    🔑 Key Rotation (Every 90 Days)                       ║
║    ┌─────────────────────────────────────┐               ║
║    │ 1. Generate new key                 │               ║
║    │ 2. Update application environment   │               ║
║    │ 3. Test that app still works        │               ║
║    │ 4. Delete old key                   │               ║
║    │ 5. Document the change              │               ║
║    └─────────────────────────────────────┘               ║
║                                                            ║
║    🚪 Access Control Best Practice                       ║
║    ┌─────────────────────────────────────┐               ║
║    │ Principle of Least Privilege:       │               ║
║    │ Give users minimum permissions      │               ║
║    │ required to do their job.           │               ║
║    │                                     │               ║
║    │ Example:                            │               ║
║    │ - Contractor: can only view/        │               ║
║    │   complete their jobs               │               ║
║    │ - Manager: can approve jobs         │               ║
║    │ - Admin: can manage users           │               ║
║    │ - Owner: can delete company         │               ║
║    └─────────────────────────────────────┘               ║
║                                                            ║
║    📋 Security Checklist (Daily)                         ║
║    □ Review error logs                                    ║
║    □ Check for failed login attempts                      ║
║    □ Verify MFA enabled for all admins                    ║
║    □ Backup completed successfully                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Security is everyone's job, but as an admin, you have special responsibilities. You have high access and must be careful not to misuse it.

**The most important rules:**
1. **Passwords:** Long, random, hard to guess. 16+ characters including numbers, uppercase, lowercase, special chars.
2. **API keys:** Never commit them to code or paste in Slack. Always use environment variables or secrets management.
3. **Logging:** Never log a password or credit card number. If it's sensitive, log that it happened but not the details.
4. **HTTPS:** Always. If you see HTTP anywhere, that's a bug.
5. **MFA:** Two-factor authentication. Even if someone steals your password, they can't log in without your phone.
6. **Key rotation:** Old keys can leak, get compromised, etc. Rotate every 90 days so any leaked key is useless after 90 days.

**If you suspect a breach:**
- **Don't panic.** Security incidents happen. How we respond is what matters.
- **Don't delete anything.** You might destroy evidence.
- **Do isolate.** If you think a user account is compromised, disable it immediately. This stops them from doing more damage.
- **Do notify leadership.** VP Security needs to know immediately, especially if we need to notify customers.
- **Do preserve evidence.** Download logs, take screenshots, document what you found and when.

**Access control principle:** Give users the minimum permissions they need. If a contractor only needs to view their jobs, don't make them an admin. If you give everyone admin access, it's too easy for one compromised account to do massive damage.

---

## Slide 7: Common Issues & Troubleshooting

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    TROUBLESHOOTING: COMMON PROBLEMS & SOLUTIONS           ║
║                                                            ║
║    ❌ "System is slow"                                   ║
║    ├─ Check Cloud Run CPU: High? Scale up instances     ║
║    ├─ Check database CPU: High? Run ANALYZE; add index  ║
║    ├─ Check network: Latency spike? Contact ISP         ║
║    └─ Check logs: Any errors? Fix the error             ║
║                                                            ║
║    ❌ "Service is down / returns 500 error"             ║
║    ├─ Restart Cloud Run: Deploy new revision           ║
║    ├─ Check logs: What's the error message?             ║
║    ├─ Check database: Can you connect?                  ║
║    ├─ Check secrets: Are API keys correct?              ║
║    └─ Still broken? Restore from backup                 ║
║                                                            ║
║    ❌ "Can't log in"                                     ║
║    ├─ Check users table: Does user exist?               ║
║    ├─ Check password: Is it hashed correctly?           ║
║    ├─ Check MFA: Is it enabled? Can user access phone? ║
║    ├─ Reset password: Temporary password, email to user ║
║    └─ Check audit logs: Any suspicious login attempts   ║
║                                                            ║
║    ❌ "Backup failed"                                    ║
║    ├─ Check storage: Is backup storage full?            ║
║    ├─ Check permissions: Does backup account have      ║
║    │  permissions to write to backup storage?           ║
║    ├─ Try manual backup: gcloud sql backups create      ║
║    └─ Still failing? Contact Supabase/GCP support       ║
║                                                            ║
║    ❌ "User can't access their data"                     ║
║    ├─ Check permissions: What role do they have?        ║
║    ├─ Check active status: Are they soft-deleted?       ║
║    ├─ Check sessions: Are there conflicting sessions?   ║
║    ├─ Restart browser: Clear cookies, try again         ║
║    └─ Still broken? Check application logs              ║
║                                                            ║
║    ❌ "Received a security alert"                        ║
║    ├─ Don't delete anything. Preserve evidence.          ║
║    ├─ Check audit logs: What happened? When? Who?       ║
║    ├─ Notify VP Security immediately                    ║
║    ├─ Isolate affected accounts (disable if needed)     ║
║    └─ Document everything for investigation             ║
║                                                            ║
║    💡 Pro Tips                                           ║
║    • Always search the Operation Runbook first          ║
║    • Copy-paste queries, change the REPLACE_ values    ║
║    • Use --dry-run flag before running destructive ops  ║
║    • When in doubt, create a backup and ask for help    ║
║    • Never run a query you don't understand             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
You'll run into issues. That's normal. Here's how to troubleshoot systematically.

**"System is slow"** is the most common complaint. People think the system is broken, but usually it's just slow. First, check if it's your machine (network, browser cache) or the server:
- Open developer tools (F12), check network tab
- Is the request taking 2 seconds or 2 milliseconds?
- If 2 seconds, the server is slow. Check Cloud Run metrics.
- If 2 milliseconds, it's your network. Restart your WiFi.

**"Service is down"** is more serious. The application is completely unavailable:
- First, check Cloud Run console. Did the deployment fail? Is it restarting?
- Check logs. What error message do you see?
- Restart the service: deploy a new revision
- If it still fails, restore from backup

**"Can't log in"** could be a user issue or system issue:
- Is the database down? Can you query it?
- Is the user in the database? Check `SELECT * FROM users WHERE email = 'user@example.com';`
- Is their account disabled? Check the `active` flag
- Do they have MFA enabled but can't access their phone? You'll need to disable it temporarily
- Reset password to temporary value, email it to them, ask them to change it immediately

**"Backup failed"** is critical because you lose your safety net:
- Check backup storage quota: Is the bucket full?
- Manually trigger backup: `gcloud sql backups create --instance mervo-db`
- If manual fails, it's usually a storage or permission issue
- Contact Supabase or Google Cloud support if you can't figure it out
- In the meantime, keep the application running—don't deploy anything new until backups are working

**Pro tips:**
- The Operation Runbook has solutions for most common issues. Search first.
- Never run a SQL query you don't understand. Ask a teammate or engineer first.
- Use `--dry-run` flags on destructive operations (deletes, updates of many rows)
- When you fix an issue, document it in the runbook for the next person
- Create a backup before doing anything risky

---

## Slide 8: Summary & Next Steps

### Slide Content
```
╔════════════════════════════════════════════════════════════╗
║    SUMMARY: YOU ARE NOW A MERVO ADMIN                     ║
║                                                            ║
║    ✅ You've learned:                                     ║
║    ├─ Daily operational tasks & monitoring               ║
║    ├─ User & company management                          ║
║    ├─ Data backup & disaster recovery                    ║
║    ├─ Security protocols & incident response             ║
║    ├─ Common troubleshooting steps                        ║
║    └─ How to find help (runbooks, team, support)         ║
║                                                            ║
║    📚 Your Reference Documents                           ║
║    ├─ Operation Runbook (day-to-day tasks)               ║
║    ├─ Security Playbook (incidents & security)           ║
║    ├─ Cloud Run / Cloud SQL documentation                ║
║    └─ This training guide (slides + notes)               ║
║                                                            ║
║    🎯 Your First Week Actions                            ║
║    Day 1:                                                 ║
║    □ Get account access to GCP console                   ║
║    □ Get Slack access to #status, #alerts channels      ║
║    □ Set up bookmarks for Cloud Run, SQL, Logging       ║
║    □ Read Operation Runbook (1 hour)                     ║
║                                                            ║
║    Day 2-3:                                               ║
║    □ Perform a practice backup/restore                   ║
║    □ Add a test user and assign them a role              ║
║    □ Review today's logs and understand alert format    ║
║    □ Read Security Playbook incident sections            ║
║                                                            ║
║    Day 4-5:                                               ║
║    □ Shadow an experienced admin for a day               ║
║    □ Review weekly reconciliation process                ║
║    □ Run your first monthly cleanup script               ║
║    □ Create incident response procedure for your team    ║
║                                                            ║
║    🆘 Getting Help                                       ║
║    ├─ Questions on operation? → Operation Runbook        ║
║    ├─ Security question? → Security Playbook             ║
║    ├─ System is broken? → Engineering team              ║
║    ├─ Policy question? → Management                      ║
║    └─ Training question? → Instructor                    ║
║                                                            ║
║    📞 On-Call & Escalation                               ║
║    ├─ On-call engineer: [PHONE] [EMAIL]                 ║
║    ├─ VP Security: [PHONE] [EMAIL]                       ║
║    ├─ CTO: [PHONE] [EMAIL]                               ║
║    └─ Support: support@mervo.app                         ║
║                                                            ║
║    🎓 Continue Learning                                  ║
║    ├─ Monthly admin meetings (2nd Monday)                ║
║    ├─ Google Cloud training (gcloud documentation)       ║
║    ├─ SQL performance tuning course (recommended)        ║
║    └─ Advanced incident response (if interested)         ║
║                                                            ║
║                  🎉 YOU'RE READY! 🎉                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Speaker Notes
Congratulations on completing the Mervo Admin Training! You now have the knowledge to operate, maintain, and secure the Mervo platform.

**Key takeaways:**
1. **Daily tasks are simple and quick.** 15 minutes total per day for monitoring, backup verification, and approvals.
2. **You have references.** The Operation Runbook and Security Playbook are your goto documents.
3. **The system is built for reliability.** Automated backups, monitoring, and alerts mean you're not flying blind.
4. **Incidents will happen.** When they do, follow the playbook, communicate with your team, and don't panic.

**Your first week:**
- Get account access (work with IT)
- Read both runbooks (4 hours total, spread over a few days)
- Practice common tasks (adding users, restoring from backup)
- Shadow an experienced admin
- Get comfortable with the dashboards

**Resources:**
- Operation Runbook: Covers day-to-day tasks, queries, troubleshooting
- Security Playbook: Covers incidents, key rotation, access control
- Cloud Run / Cloud SQL documentation: Official guides from Google Cloud
- Your team: Ask questions anytime

**Getting help:**
- First, check the runbooks. Most issues have documented solutions.
- If not there, Slack your teammates. This is what they're for.
- For critical issues, follow the escalation path: on-call engineer → VP Security → CTO
- Never sit on a critical problem hoping it goes away.

**Continue learning:**
- We have monthly admin meetings. Attend them.
- Google Cloud releases new features. Keep an eye on the documentation.
- If you're interested in advanced topics (database optimization, advanced security), let me know. We can set up training.

Thank you for taking on this responsibility. The Mervo platform is only as reliable as our admin team. You're the backbone of our operation.

Good luck, and welcome to the team!

---

**Training Notes:**
- Slides should be presented at a comfortable pace (15-20 minutes per slide)
- Encourage questions and interactive discussion
- Participants should have access to the Operation Runbook and Security Playbook during training
- Consider practical exercises: "Add a test user," "Create a backup," "Find an error in the logs"
- Record this training for new admins joining later
- Update slides quarterly to reflect new procedures or lessons learned

**Version history:**
- v1.0 — Initial release, Dec 2025
