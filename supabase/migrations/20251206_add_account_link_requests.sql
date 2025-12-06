-- Create account_link_requests table for linking master accounts
-- Run this migration in your Supabase project as a standard SQL migration

CREATE TABLE IF NOT EXISTS public.account_link_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_user_id uuid NOT NULL,
  secondary_user_id uuid NOT NULL,
  verification_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookup by verification code
CREATE INDEX IF NOT EXISTS idx_account_link_requests_code ON public.account_link_requests (verification_code);
