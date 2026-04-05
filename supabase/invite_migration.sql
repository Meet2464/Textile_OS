-- ============================================================
-- TEXTILEAPP — QR INVITE SYSTEM MIGRATION
-- ⚠️  RUN IN TWO SEPARATE STEPS (see instructions below)
-- ============================================================

-- ============================================================
-- STEP 1: Run ONLY these lines first, then click Run
-- (Enum values must be committed before they can be used)
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'designer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'worker';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';

-- ============================================================
-- After Step 1 succeeds, clear the editor and run STEP 2 below
-- ============================================================


-- ============================================================
-- STEP 2: Run ONLY these lines (in a new query)
-- ============================================================

-- Rename column
ALTER TABLE users RENAME COLUMN username TO name;

-- Remove old approval requests table
DROP TABLE IF EXISTS approval_requests;

-- Create invite tokens table
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  role user_role NOT NULL,
  email TEXT,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_company ON invite_tokens(company_id);

-- RLS
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company invites" ON invite_tokens
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Owners and managers can manage invites" ON invite_tokens
  FOR ALL USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('owner', 'manager', 'boss')
    )
  );

SELECT 'Migration Step 2 complete ✓' AS status;
