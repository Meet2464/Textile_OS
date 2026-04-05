-- ============================================================
-- TEXTILEAPP — PRODUCTION MODULE MIGRATION
-- Run in TWO STEPS (same as invite_migration pattern)
-- ============================================================

-- ============================================================
-- STEP 1: Add enum values first (run separately, then commit)
-- ============================================================

ALTER TYPE machine_type ADD VALUE IF NOT EXISTS 'embroidery';
ALTER TYPE machine_type ADD VALUE IF NOT EXISTS 'jacquard';
ALTER TYPE machine_type ADD VALUE IF NOT EXISTS 'position_print';

-- ============================================================
-- STEP 2: Run this AFTER Step 1 in a new query
-- ============================================================

-- 1. Add production columns to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS active_machines   TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS active_processes  TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_done   BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Stage sequence — the ordered workflow each company configures
CREATE TABLE IF NOT EXISTS stage_sequence (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stage_order  INTEGER NOT NULL,
  stage_name   TEXT NOT NULL,   -- e.g. 'embroidery', 'bleach', 'checking'
  stage_type   TEXT NOT NULL,   -- 'machine' | 'outsourced' | 'checking' | 'delivery'
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, stage_order)
);

-- 3. Production orders — one per order_line going through the pipeline
CREATE TABLE IF NOT EXISTS production_orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_line_id       UUID REFERENCES order_lines(id) ON DELETE SET NULL,
  design_id           UUID REFERENCES designs(id) ON DELETE SET NULL,
  total_pieces        INTEGER NOT NULL DEFAULT 0,
  current_stage_order INTEGER NOT NULL DEFAULT 1,
  current_stage_name  TEXT,
  current_stage_type  TEXT,   -- 'machine' | 'outsourced' | 'checking' | 'delivery'
  status              TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'completed' | 'hold'
  damage_total        INTEGER NOT NULL DEFAULT 0,
  pieces_current      INTEGER NOT NULL DEFAULT 0,  -- remaining after damage
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

-- 4. Machine jobs — tracks in-house machine stage work
CREATE TABLE IF NOT EXISTS machine_jobs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  production_order_id   UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  machine_type          TEXT NOT NULL,   -- 'embroidery' | 'jacquard' | 'position_print'
  machine_id            UUID REFERENCES machines(id) ON DELETE SET NULL,
  operator_id           UUID REFERENCES workers(id) ON DELETE SET NULL,
  pieces_in             INTEGER NOT NULL DEFAULT 0,
  pieces_out            INTEGER NOT NULL DEFAULT 0,
  damage_pieces         INTEGER NOT NULL DEFAULT 0,
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'running' | 'done'
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Outsourced jobs — tracks karigar jobs with challan link
CREATE TABLE IF NOT EXISTS outsourced_jobs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  production_order_id   UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  process_type          TEXT NOT NULL,  -- 'bleach' | 'cotting' | 'butta_cutting' | 'finishing'
  worker_id             UUID REFERENCES workers(id) ON DELETE SET NULL,
  challan_id            UUID REFERENCES challans(id) ON DELETE SET NULL,
  pieces_sent           INTEGER NOT NULL DEFAULT 0,
  metres_sent           NUMERIC(10,2),
  pieces_received       INTEGER,
  metres_received       NUMERIC(10,2),
  damage_pieces         INTEGER NOT NULL DEFAULT 0,
  sent_date             DATE,
  received_date         DATE,
  status                TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'sent' | 'received' | 'done'
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_production_orders_company   ON production_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status    ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_machine_jobs_prod_order     ON machine_jobs(production_order_id);
CREATE INDEX IF NOT EXISTS idx_outsourced_jobs_prod_order  ON outsourced_jobs(production_order_id);
CREATE INDEX IF NOT EXISTS idx_stage_sequence_company      ON stage_sequence(company_id, stage_order);

-- 7. RLS Policies
ALTER TABLE stage_sequence    ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE outsourced_jobs   ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe to re-run)
DROP POLICY IF EXISTS "Company users see their production"   ON production_orders;
DROP POLICY IF EXISTS "Company users see their machine jobs" ON machine_jobs;
DROP POLICY IF EXISTS "Company users see their outsourced jobs" ON outsourced_jobs;
DROP POLICY IF EXISTS "Company users see their stage sequence"  ON stage_sequence;

-- Users can only see their own company's data
CREATE POLICY "Company users see their production" ON production_orders
  FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company users see their machine jobs" ON machine_jobs
  FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company users see their outsourced jobs" ON outsourced_jobs
  FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Company users see their stage sequence" ON stage_sequence
  FOR ALL USING (company_id = get_user_company_id());

SELECT 'Production migration complete ✓' AS status;
