-- Table for external IdP account links
CREATE TABLE IF NOT EXISTS user_external_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id uuid NOT NULL,
  provider text NOT NULL, -- e.g., google, microsoft, saml
  provider_user_id text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TODO: Add foreign key to users(user_account_id) and indexes on provider/provider_user_id
-- TODO: Add RLS to ensure company scoping and deny cross-tenant access
