# Repository Handoff Checklist

Complete checklist for transferring GitHub repository ownership and management rights to the client.

---

## Pre-Handoff (1 week before)

- [ ] Audit all repository secrets (personal tokens, API keys, credentials)
- [ ] Remove any hardcoded secrets from code and commit history (use `git-filter-repo` if needed)
- [ ] Enable secret scanning on GitHub: Settings > Code Security > Enable "Secret Scanning"
- [ ] Review branch protection rules; ensure main/master requires reviews
- [ ] Check for any private forks or mirrors that need to be transferred
- [ ] Export all GitHub Actions workflows and document custom configurations
- [ ] Verify all CI/CD pipelines use org-level secrets, not user-level secrets
- [ ] Document all GitHub App integrations (Dependabot, CodeQL, etc.)
- [ ] Create a "Handoff Contacts" file with GitHub usernames and roles
- [ ] Schedule a 30-minute walkthrough call with client's tech lead

---

## Ownership & Permissions Transfer

### Step 1: GitHub Organization / Repository Ownership

**If Mervo owns the repository:**
1. [ ] Invite client's primary admin to the repository as **Owner** or **Admin**
2. Go to: Repository Settings > Collaborators and Teams
3. Add user(s) with **Admin** role
4. Wait for acceptance (GitHub sends invitation)

**If client will own the repository:**
1. [ ] Client creates their own GitHub organization (or uses existing)
2. [ ] Client creates deploy key for Mervo to maintain temporarily (if needed)
3. [ ] Mervo creates a GitHub Personal Access Token (PAT) for client:
   - Go to: GitHub Settings > Developer Settings > Personal Access Tokens
   - Scopes needed: `repo`, `workflow`, `admin:repo_hook`
   - Set expiration to 90 days
   - [ ] Share token securely (1Password, email with auto-delete, or during call)
4. [ ] Client transfers repository to their GitHub organization using GitHub UI:
   - Repository Settings > Danger Zone > Transfer Ownership
   - Confirm transfer

- [ ] Verify new owner has **Owner** access to repository
- [ ] Remove Mervo's access (if transitioning to full client ownership)
- [ ] Test: New owner can push, merge, and trigger deployments

---

### Step 2: Branch Protection Rules

Verify/configure main branch protection:

- [ ] Branch: `main` (or `master`)
- [ ] Require pull request reviews before merging: **Yes**
  - Dismiss stale pull request approvals: **Yes**
  - Require review from code owners: **Yes** (if CODEOWNERS file exists)
- [ ] Require status checks to pass before merging: **Yes**
  - Required check: `build`, `test`, `lint`
- [ ] Require branches to be up to date before merging: **Yes**
- [ ] Allow force pushes: **No**
- [ ] Restrict who can push to matching branches: **Admins only** (optional)

**Files to verify:**
- `.github/CODEOWNERS` — lists code owners for review requirements
- `.github/workflows/` — CI/CD workflows must be in main
- `eslint.config.js`, `tsconfig.json` — linting & build configs

---

### Step 3: Deploy Keys & Authentication

#### Remove Mervo's Deploy Keys
1. [ ] Go to Repository Settings > Deploy Keys
2. [ ] Delete all Mervo-owned deploy keys (e.g., "mervo-ci-deploy", "mervo-staging")
3. [ ] Note: Client's CI/CD (GitHub Actions) uses PAT or GITHUB_TOKEN (built-in)

#### Create Client's Deploy Key (if needed for external deployments)
If client deploys to Vercel, AWS, or other platforms:
1. [ ] Generate new SSH key pair locally:
   ```bash
   ssh-keygen -t ed25519 -C "mervo-deploy@[CLIENT_DOMAIN]" -f deploy_key
   ```
2. [ ] Add public key to repository: Settings > Deploy Keys
   - Title: `Mervo Handoff Deploy Key`
   - Allow write access: **No** (read-only)
   - Mark as read-only
3. [ ] Client stores private key securely in deployment platform secrets
4. [ ] Test deployment with new key

---

### Step 4: GitHub Actions & Secrets

#### Audit All Secrets
1. [ ] Go to Repository Settings > Secrets and Variables > Actions
2. [ ] List all secrets:
   - [ ] `SUPABASE_URL` — verify this is non-prod (dev/staging)
   - [ ] `SUPABASE_ANON_KEY` — verify this is non-prod
   - [ ] `GH_TOKEN` — personal access token for releases
   - [ ] Any third-party API keys (Stripe, SendGrid, etc.)

#### Rotate Secrets
1. [ ] Request new Supabase keys from your Supabase project:
   - Go to Supabase Dashboard > Project Settings > API
   - Copy new **Public (ANON)** key and **URL**
2. [ ] Update secrets in GitHub:
   - Delete old secrets
   - Add new `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. [ ] Delete `GH_TOKEN` if Mervo created it (client should create their own for releases)
4. [ ] Document any third-party secrets client needs to provide:
   - Stripe keys (if payments enabled)
   - SendGrid API key (if custom emails)
   - Analytics token (if applicable)

#### Verify GitHub Actions Workflows
1. [ ] Check all workflows in `.github/workflows/`:
   - `test.yml` — runs tests on PR and main
   - `deploy.yml` — deploys to production
   - `lint.yml` — linting and formatting checks
2. [ ] Verify workflows use `secrets.*` for sensitive values (not hardcoded)
3. [ ] Test workflow manually: Push to main branch, check Actions tab for success

---

### Step 5: Third-Party Integrations

#### Dependabot (Automated Dependency Updates)
- [ ] Settings > Code Security & Analysis > Enable "Dependabot alerts"
- [ ] Settings > Code Security & Analysis > Enable "Dependabot updates"
- [ ] Update `.github/dependabot.yml` if custom configuration needed:
  ```yaml
  version: 2
  updates:
    - package-ecosystem: "npm"
      directory: "/"
      schedule:
        interval: "weekly"
        day: "monday"
        time: "03:00"
```

#### CodeQL (Automated Security Scanning)
- [ ] Settings > Code Security & Analysis > Enable "CodeQL analysis"
- [ ] Verify `.github/workflows/codeql.yml` exists
- [ ] Check Security > Code Scanning tab for any existing alerts
- [ ] Resolve any high-severity alerts before handoff

#### Branch Protection Rules (GitHub Enterprise)
- [ ] If using GitHub Enterprise: Settings > Rulesets > Enable required rulesets
- [ ] Ensure protection rules are at organization level (not just repo level)

---

### Step 6: Documentation & Handoff Files

Verify these files exist in repository root:

- [ ] `README.md` — project overview, setup instructions, contributing guidelines
- [ ] `CONTRIBUTING.md` — contribution guidelines and PR process
- [ ] `CODE_OF_CONDUCT.md` — community standards
- [ ] `.gitignore` — excludes node_modules, .env, build artifacts
- [ ] `.env.example` — template for environment variables (no real secrets)
- [ ] `LICENSE` — MIT or client's preferred license
- [ ] `SECURITY.md` — security policy and vulnerability reporting
- [ ] `.github/CODEOWNERS` — code ownership rules

**Missing files?** Create them before handoff:
```bash
# From repository root
touch README.md CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md
echo "REACT_APP_SUPABASE_URL=https://..." > .env.example
echo "# Mervo - Client Handoff\n\n..." >> README.md
```

---

### Step 7: Audit Commit History

Ensure no secrets are in commit history:

1. [ ] Run secret scanning tool:
   ```bash
   # Using git-secrets (install: brew install git-secrets)
   git secrets --scan-history
   
   # OR using detect-secrets
   detect-secrets scan --baseline .secrets.baseline
   ```

2. [ ] If secrets found, remove from history:
   ```bash
   # Remove file: git-filter-repo --invert-paths --path <FILE>
   # Remove pattern: git-filter-repo --replace-text <(echo 'PATTERN==>***')
   
   # Then push with --force-with-lease (DANGEROUS—coordinate with team)
   git push origin main --force-with-lease
   ```

3. [ ] Regenerate any exposed secrets (API keys, tokens, passwords)

---

### Step 8: Webhook & CI/CD Verification

#### GitHub Webhooks
1. [ ] Go to Repository Settings > Webhooks
2. [ ] Review all active webhooks:
   - [ ] GitHub Actions (built-in, cannot disable)
   - [ ] Any third-party integrations (Slack, Jira, etc.)
3. [ ] Delete any Mervo-owned webhooks
4. [ ] Verify delivery log shows recent successful deliveries

#### External Deployment Platforms
If deploying to Vercel, Netlify, AWS, or other platforms:

- [ ] Verify GitHub connection is client-owned (not Mervo's account)
- [ ] Check environment variables in deployment platform:
  - [ ] Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` to production values
  - [ ] Any custom API keys or tokens
- [ ] Test full deployment pipeline:
  ```bash
  git checkout -b test-deployment
  echo "# Test deploy" >> README.md
  git add README.md && git commit -m "test: verify deployment pipeline"
  git push origin test-deployment
  
  # Create PR, merge to main, verify deployment succeeds
  ```
- [ ] Delete test branch after verification

---

### Step 9: Access Revocation (If Mervo is Exiting)

After client confirms all systems working:

- [ ] Remove all Mervo GitHub accounts from repository (Settings > Collaborators)
- [ ] Remove all Mervo GitHub accounts from organization (if applicable)
- [ ] Delete any Mervo-created personal access tokens
- [ ] Verify Mervo cannot access repository:
  ```bash
  # Attempt should fail or show "access denied"
  git clone https://github.com/[CLIENT_ORG]/mervo
  ```

---

## Handoff Call (30 minutes)

**Attendees:** Client tech lead, Mervo tech lead  
**Recording:** Optional but recommended

### Agenda

1. **Welcome & Overview** (2 min)
   - What client is inheriting and why
   - High-level architecture overview

2. **Repository Structure** (5 min)
   - Walk through directory structure: `/src`, `/public`, `/docs`, etc.
   - Key files: `package.json`, `.github/workflows`, `.env.example`
   - Explain build/deploy pipeline

3. **GitHub & Permissions** (5 min)
   - Confirm client has Owner access
   - Show branch protection rules
   - Explain secret rotation (when, how often)
   - Demo: How to merge a PR and trigger deployment

4. **CI/CD & Deployments** (10 min)
   - Walk through GitHub Actions workflows
   - Show how to manually trigger workflows (if needed)
   - Explain environment secrets (dev/staging/prod)
   - Show deployment logs and rollback process (if needed)

5. **Monitoring & Support** (5 min)
   - Where to find error logs (GitHub Actions, Vercel/Netlify, etc.)
   - How to report issues: support@mervo.app
   - Share emergency escalation contact
   - Explain Mervo's post-handoff support tier

6. **Q&A** (3 min)
   - Open floor for questions
   - Collect contact info for follow-ups

---

## Handoff Sign-Off

**Client Tech Lead Name:** ____________________________  
**GitHub Username:** ____________________________  
**Confirmation:** I confirm I have full access to the repository and can:
- [ ] Push to main branch (after review)
- [ ] Merge pull requests
- [ ] View and update secrets
- [ ] Manage collaborators
- [ ] Trigger deployments

**Date Confirmed:** ____________________________

---

## Post-Handoff Checklist (First Week)

1. [ ] Client has successfully pushed at least one commit to main
2. [ ] Client has run full test & build pipeline locally:
   ```bash
   npm install
   npm run lint
   npm run test
   npm run build
   ```
3. [ ] Client has deployed successfully to their environment (staging/prod)
4. [ ] Client has verified Mervo no longer has repository access
5. [ ] Client has backed up all source code to their own storage
6. [ ] Client has documented any custom scripts or processes
7. [ ] Client has scheduled first maintenance window (if applicable)

---

## TODO Items

- TODO: Update GitHub org name and repository URL in this document before handoff
- TODO: Confirm all third-party API keys have been rotated
- TODO: Schedule handoff call with client tech lead
- TODO: Create repository archive (optional): `git bundle create mervo-backup.bundle --all`
- TODO: Export all GitHub Actions logs for record-keeping
- TODO: Set up billing notification to alert when repository billing transfers
