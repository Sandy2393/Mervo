-- Contractor Ratings Table
-- TODO: Import this schema to Supabase via SQL Editor in your dashboard

CREATE TABLE IF NOT EXISTS contractor_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contractor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE contractor_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view ratings for contractors in their company
CREATE POLICY "Users can view ratings for contractors in their company"
ON contractor_ratings
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can create ratings for contractors in their company
CREATE POLICY "Users can create ratings for contractors in their company"
ON contractor_ratings
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM company_users 
    WHERE user_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX idx_contractor_ratings_contractor_id ON contractor_ratings(contractor_id);
CREATE INDEX idx_contractor_ratings_company_id ON contractor_ratings(company_id);
CREATE INDEX idx_contractor_ratings_created_at ON contractor_ratings(created_at DESC);
