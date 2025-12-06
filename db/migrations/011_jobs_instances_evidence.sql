-- Jobs, instances, evidence, and timesheets
-- Ensure prerequisite extensions (uuid-ossp or pgcrypto) are enabled.

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  schedule_rule JSONB, -- e.g., RRULE or custom structure
  location GEOGRAPHY(Point, 4326),
  geofence_radius_m INT DEFAULT 0,
  payment_cents INT,
  payment_type TEXT, -- fixed/hourly
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

CREATE TABLE IF NOT EXISTS job_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  assigned_company_user_id UUID REFERENCES company_users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, in_progress, submitted, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, scheduled_for)
);
CREATE INDEX IF NOT EXISTS idx_job_instances_company ON job_instances(company_id);
CREATE INDEX IF NOT EXISTS idx_job_instances_assigned ON job_instances(assigned_company_user_id);
CREATE INDEX IF NOT EXISTS idx_job_instances_scheduled ON job_instances(scheduled_for);

CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_instance_id UUID NOT NULL REFERENCES job_instances(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('before','after')),
  storage_path TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_photos_instance ON job_photos(job_instance_id);

CREATE TABLE IF NOT EXISTS job_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_instance_id UUID NOT NULL REFERENCES job_instances(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES users(id),
  description TEXT,
  checklist JSONB,
  answers JSONB,
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted, approved, rejected
  approver_user_id UUID REFERENCES users(id),
  approval_comment TEXT,
  approved_at TIMESTAMPTZ,
  pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_reports_instance ON job_reports(job_instance_id);
CREATE INDEX IF NOT EXISTS idx_job_reports_status ON job_reports(status);

CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_instance_id UUID NOT NULL REFERENCES job_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  clock_in_at TIMESTAMPTZ,
  clock_out_at TIMESTAMPTZ,
  clock_in_geo JSONB,
  clock_out_geo JSONB,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timesheets_user ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_instance ON timesheets(job_instance_id);

-- For bulk zip manifests
CREATE TABLE IF NOT EXISTS job_report_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  range JSONB,
  zip_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
