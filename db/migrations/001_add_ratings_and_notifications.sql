-- Contractor ratings and notifications schema
-- TODO: Run in Supabase SQL editor with appropriate role

CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  contractor_id UUID NOT NULL,
  job_instance_id UUID NOT NULL,
  rater_user_id UUID NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_instance_id, rater_user_id)
);
CREATE INDEX IF NOT EXISTS idx_ratings_company_contractor ON ratings (company_id, contractor_id);
CREATE INDEX IF NOT EXISTS idx_ratings_company_created ON ratings (company_id, created_at DESC);

CREATE TABLE IF NOT EXISTS rating_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_id UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rating_flags_rating ON rating_flags (rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_flags_company_status ON rating_flags (company_id, status);

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_templates_unique ON notification_templates (company_id, type, channel);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payload JSONB,
  template_id UUID REFERENCES notification_templates(id),
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_company_created ON notifications (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_company_type ON notifications (company_id, type);

CREATE TABLE IF NOT EXISTS notification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  status TEXT NOT NULL,
  error TEXT,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_attempts_notif ON notification_attempts (notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_attempts_status ON notification_attempts (status);

-- RLS is defined separately in server/notifications/rls_policies.sql
