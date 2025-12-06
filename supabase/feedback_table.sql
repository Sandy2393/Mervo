-- Feedback table definition (placeholder). TODO: Import into Supabase.
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('bug', 'idea', 'praise', 'other')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_by uuid,
  resolved_at timestamptz
);

-- TODO: Add foreign keys to companies/users tables when schema is available.
-- TODO: Add RLS policies per company_id.
