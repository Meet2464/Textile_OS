-- ============================================================
-- TEXTILEAPP — COMPLETE DATABASE MIGRATION (All-in-one)
-- Run this ONCE in Supabase SQL Editor → New Query → Paste → Run
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('boss', 'owner', 'manager', 'designer', 'worker', 'accountant', 'employee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'in_production', 'checking', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_line_status AS ENUM ('pending', 'sent', 'received', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE worker_specialty AS ENUM ('jecard', 'butta_cutting', 'bleach', 'cotting', 'position_print', 'checking', 'delivery', 'multiple');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE machine_type AS ENUM ('jecard', 'butta_cutting', 'bleach', 'cotting', 'position_print', 'checking', 'embroidery', 'jacquard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE machine_status AS ENUM ('active', 'idle', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE saree_type AS ENUM ('color', 'white', 'garment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE process_type AS ENUM ('jecard', 'butta_cutting', 'bleach', 'cotting', 'position_print', 'checking', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE challan_status AS ENUM ('sent', 'partially_received', 'fully_received');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE production_status AS ENUM ('pending', 'in_progress', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quality_status AS ENUM ('good', 'damaged', 'partial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM ('stock_in', 'challan_out', 'return_in', 'damage_out', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reference_type AS ENUM ('challan', 'receiving_challan', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'fully_paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'bank', 'upi', 'cheque');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE worker_payment_status AS ENUM ('unpaid', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE counter_type AS ENUM ('challan', 'po_number', 'receiving');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add new enum values safely (ignore if already exists)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'designer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'worker';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE machine_type ADD VALUE IF NOT EXISTS 'embroidery';
ALTER TYPE machine_type ADD VALUE IF NOT EXISTS 'jacquard';

-- ============================================================
-- HELPER: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE 1 — COMPANIES
-- ============================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  company_id_code TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  active_machines TEXT[] DEFAULT '{}',
  active_processes TEXT[] DEFAULT '{}',
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(company_id_code);

-- ============================================================
-- TABLE 2 — USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'employee',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Safe rename: if column is still 'username', rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users RENAME COLUMN username TO name;
  END IF;
END $$;

-- ============================================================
-- TABLE 3 — INVITE TOKENS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_company ON invite_tokens(company_id);

-- ============================================================
-- TABLE 4 — DESIGNS
-- ============================================================

CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  design_number TEXT NOT NULL,
  image_url TEXT,
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(company_id, design_number)
);

CREATE INDEX IF NOT EXISTS idx_designs_company ON designs(company_id);
CREATE INDEX IF NOT EXISTS idx_designs_number ON designs(company_id, design_number);

-- ============================================================
-- TABLE 5 — ORDERS (P.O.)
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  po_number INTEGER NOT NULL,
  party_name TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status order_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_quantity INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  UNIQUE(company_id, po_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at'
  ) THEN
    CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ============================================================
-- TABLE 6 — ORDER LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  design_id UUID REFERENCES designs(id),
  design_number TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  line_number INTEGER NOT NULL,
  status order_line_status NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_order_lines_order ON order_lines(order_id);

-- ============================================================
-- TABLE 7 — WORKERS (KARIGAR)
-- ============================================================

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  phone TEXT,
  specialty worker_specialty NOT NULL DEFAULT 'jecard',
  address TEXT,
  rate_per_piece NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workers_company ON workers(company_id);

-- ============================================================
-- TABLE 8 — MACHINES
-- ============================================================

CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  machine_name TEXT NOT NULL,
  machine_type machine_type NOT NULL,
  machine_code TEXT NOT NULL UNIQUE,
  status machine_status NOT NULL DEFAULT 'active',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_machines_company ON machines(company_id);

-- ============================================================
-- TABLE 9 — CHALLANS (SEND)
-- ============================================================

CREATE TABLE IF NOT EXISTS challans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  challan_number INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id),
  worker_id UUID REFERENCES workers(id),
  saree_type saree_type NOT NULL DEFAULT 'color',
  process_type process_type NOT NULL DEFAULT 'jecard',
  pieces INTEGER NOT NULL DEFAULT 0,
  metres NUMERIC(10,2) NOT NULL DEFAULT 0,
  with_blouse BOOLEAN NOT NULL DEFAULT FALSE,
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_by UUID REFERENCES users(id),
  machine_id UUID REFERENCES machines(id),
  status challan_status NOT NULL DEFAULT 'sent',
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, challan_number)
);

CREATE INDEX IF NOT EXISTS idx_challans_company ON challans(company_id);
CREATE INDEX IF NOT EXISTS idx_challans_worker ON challans(worker_id);
CREATE INDEX IF NOT EXISTS idx_challans_order ON challans(order_id);

-- ============================================================
-- TABLE 10 — CHALLAN LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS challan_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challan_id UUID NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  order_line_id UUID REFERENCES order_lines(id),
  design_id UUID REFERENCES designs(id),
  design_number TEXT NOT NULL,
  pieces_sent INTEGER NOT NULL DEFAULT 0,
  metres_sent NUMERIC(10,2) NOT NULL DEFAULT 0,
  pieces_received INTEGER NOT NULL DEFAULT 0,
  metres_received NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_challan_lines_challan ON challan_lines(challan_id);

-- ============================================================
-- TABLE 11 — RECEIVING CHALLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS receiving_challans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  challan_id UUID REFERENCES challans(id),
  worker_id UUID REFERENCES workers(id),
  challan_number TEXT,
  design_id UUID REFERENCES designs(id),
  design_number TEXT,
  pieces_received INTEGER NOT NULL DEFAULT 0,
  metres_received NUMERIC(10,2) NOT NULL DEFAULT 0,
  tp INTEGER NOT NULL DEFAULT 0,
  route TEXT,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES users(id),
  quality_status quality_status NOT NULL DEFAULT 'good',
  damage_pieces INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receiving_company ON receiving_challans(company_id);
CREATE INDEX IF NOT EXISTS idx_receiving_challan ON receiving_challans(challan_id);

-- ============================================================
-- TABLE 12 — PRODUCTION STAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  order_line_id UUID REFERENCES order_lines(id),
  stage process_type NOT NULL,
  saree_type saree_type NOT NULL DEFAULT 'color',
  status production_status NOT NULL DEFAULT 'pending',
  challan_id UUID REFERENCES challans(id),
  pieces_in INTEGER NOT NULL DEFAULT 0,
  pieces_out INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  worker_id UUID REFERENCES workers(id),
  machine_id UUID REFERENCES machines(id),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_production_company ON production_stages(company_id);
CREATE INDEX IF NOT EXISTS idx_production_order ON production_stages(order_id);

-- ============================================================
-- TABLE 13 — STAGE SEQUENCE (Onboarding workflow config)
-- ============================================================

CREATE TABLE IF NOT EXISTS stage_sequence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stage_order INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  stage_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, stage_order)
);

CREATE INDEX IF NOT EXISTS idx_stage_sequence_company ON stage_sequence(company_id, stage_order);

-- ============================================================
-- TABLE 14 — PRODUCTION ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_line_id UUID REFERENCES order_lines(id) ON DELETE SET NULL,
  design_id UUID REFERENCES designs(id) ON DELETE SET NULL,
  total_pieces INTEGER NOT NULL DEFAULT 0,
  current_stage_order INTEGER NOT NULL DEFAULT 1,
  current_stage_name TEXT,
  current_stage_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  damage_total INTEGER NOT NULL DEFAULT 0,
  pieces_current INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_production_orders_company ON production_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);

-- ============================================================
-- TABLE 15 — MACHINE JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS machine_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  machine_type TEXT NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  pieces_in INTEGER NOT NULL DEFAULT 0,
  pieces_out INTEGER NOT NULL DEFAULT 0,
  damage_pieces INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_machine_jobs_prod_order ON machine_jobs(production_order_id);

-- ============================================================
-- TABLE 16 — OUTSOURCED JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS outsourced_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  process_type TEXT NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  challan_id UUID REFERENCES challans(id) ON DELETE SET NULL,
  pieces_sent INTEGER NOT NULL DEFAULT 0,
  metres_sent NUMERIC(10,2),
  pieces_received INTEGER,
  metres_received NUMERIC(10,2),
  damage_pieces INTEGER NOT NULL DEFAULT 0,
  sent_date DATE,
  received_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outsourced_jobs_prod_order ON outsourced_jobs(production_order_id);

-- ============================================================
-- TABLE 17 — INVENTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  design_id UUID REFERENCES designs(id),
  saree_type saree_type NOT NULL DEFAULT 'color',
  current_pieces INTEGER NOT NULL DEFAULT 0,
  current_metres NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, design_id, saree_type)
);

CREATE INDEX IF NOT EXISTS idx_inventory_company ON inventory(company_id);

-- ============================================================
-- TABLE 18 — INVENTORY MOVEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id),
  design_id UUID REFERENCES designs(id),
  movement_type movement_type NOT NULL,
  pieces INTEGER NOT NULL DEFAULT 0,
  metres NUMERIC(10,2) NOT NULL DEFAULT 0,
  reference_type reference_type,
  reference_id UUID,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  done_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_company ON inventory_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_movements_inventory ON inventory_movements(inventory_id);

-- ============================================================
-- TABLE 19 — ORDER PAYMENTS (from Party)
-- ============================================================

CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  party_name TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_due_date DATE,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  last_payment_date DATE,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_payments_company ON order_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_order ON order_payments(order_id);

-- ============================================================
-- TABLE 20 — PAYMENT TRANSACTIONS (from Party)
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_payment_id UUID REFERENCES order_payments(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  reference_number TEXT,
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_txn_company ON payment_transactions(company_id);

-- ============================================================
-- TABLE 21 — WORKER PAYMENTS (to Karigar)
-- ============================================================

CREATE TABLE IF NOT EXISTS worker_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id),
  challan_id UUID REFERENCES challans(id),
  pieces_completed INTEGER NOT NULL DEFAULT 0,
  rate_per_piece NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status worker_payment_status NOT NULL DEFAULT 'unpaid',
  paid_date DATE,
  paid_by UUID REFERENCES users(id),
  payment_method payment_method,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_payments_company ON worker_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_worker_payments_worker ON worker_payments(worker_id);

-- ============================================================
-- TABLE 22 — COUNTERS
-- ============================================================

CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  counter_type counter_type NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, counter_type)
);

CREATE INDEX IF NOT EXISTS idx_counters_company ON counters(company_id);

-- ============================================================
-- FUNCTION: Get next counter value (atomic increment)
-- ============================================================

CREATE OR REPLACE FUNCTION get_next_counter(p_company_id UUID, p_type counter_type)
RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  INSERT INTO counters (company_id, counter_type, current_value, last_updated)
  VALUES (p_company_id, p_type, 1, NOW())
  ON CONFLICT (company_id, counter_type)
  DO UPDATE SET current_value = counters.current_value + 1, last_updated = NOW()
  RETURNING current_value INTO next_val;
  
  RETURN next_val;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- HELPER: Get current user's company_id (for RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE challan_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiving_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outsourced_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Allow insert for signup" ON companies;
DROP POLICY IF EXISTS "Users can view company users" ON users;
DROP POLICY IF EXISTS "Allow user insert for signup" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view company invites" ON invite_tokens;
DROP POLICY IF EXISTS "Owners and managers can manage invites" ON invite_tokens;

-- Companies policies
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (id = get_user_company_id());

CREATE POLICY "Allow insert for signup" ON companies
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Company isolation update" ON companies 
  FOR UPDATE USING (id = get_user_company_id());

-- Users policies
CREATE POLICY "Users can view company users" ON users
  FOR SELECT USING (company_id = get_user_company_id() OR auth_id = auth.uid());

CREATE POLICY "Allow user insert for signup" ON users
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth_id = auth.uid());

-- Invite tokens policies
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

-- Generic company-scoped RLS for all other tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'designs', 'orders', 'workers', 'machines',
    'challans', 'receiving_challans', 'production_stages',
    'stage_sequence', 'production_orders', 'machine_jobs', 'outsourced_jobs',
    'inventory', 'inventory_movements', 'order_payments',
    'payment_transactions', 'worker_payments', 'counters'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Company isolation select" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Company isolation insert" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Company isolation update" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Company isolation delete" ON %I', tbl);

    EXECUTE format(
      'CREATE POLICY "Company isolation select" ON %I FOR SELECT USING (company_id = get_user_company_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Company isolation insert" ON %I FOR INSERT WITH CHECK (company_id = get_user_company_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Company isolation update" ON %I FOR UPDATE USING (company_id = get_user_company_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Company isolation delete" ON %I FOR DELETE USING (company_id = get_user_company_id())',
      tbl
    );
  END LOOP;
END $$;

-- Order lines (join-based RLS)
DROP POLICY IF EXISTS "Order lines select" ON order_lines;
DROP POLICY IF EXISTS "Order lines insert" ON order_lines;
DROP POLICY IF EXISTS "Order lines update" ON order_lines;
DROP POLICY IF EXISTS "Order lines delete" ON order_lines;

CREATE POLICY "Order lines select" ON order_lines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_lines.order_id AND orders.company_id = get_user_company_id())
  );
CREATE POLICY "Order lines insert" ON order_lines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_lines.order_id AND orders.company_id = get_user_company_id())
  );
CREATE POLICY "Order lines update" ON order_lines
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_lines.order_id AND orders.company_id = get_user_company_id())
  );
CREATE POLICY "Order lines delete" ON order_lines
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_lines.order_id AND orders.company_id = get_user_company_id())
  );

-- Challan lines (join-based RLS)
DROP POLICY IF EXISTS "Challan lines select" ON challan_lines;
DROP POLICY IF EXISTS "Challan lines insert" ON challan_lines;
DROP POLICY IF EXISTS "Challan lines update" ON challan_lines;
DROP POLICY IF EXISTS "Challan lines delete" ON challan_lines;

CREATE POLICY "Challan lines select" ON challan_lines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM challans WHERE challans.id = challan_lines.challan_id AND challans.company_id = get_user_company_id())
  );
CREATE POLICY "Challan lines insert" ON challan_lines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM challans WHERE challans.id = challan_lines.challan_id AND challans.company_id = get_user_company_id())
  );
CREATE POLICY "Challan lines update" ON challan_lines
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM challans WHERE challans.id = challan_lines.challan_id AND challans.company_id = get_user_company_id())
  );
CREATE POLICY "Challan lines delete" ON challan_lines
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM challans WHERE challans.id = challan_lines.challan_id AND challans.company_id = get_user_company_id())
  );

-- ============================================================
-- STORAGE BUCKET for design images (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true)
-- ON CONFLICT DO NOTHING;

SELECT 'TextileApp migration complete ✓' AS status;
