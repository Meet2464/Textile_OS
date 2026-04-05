// ============================================================
// TEXTILEAPP — Complete Database TypeScript Types
// Format matches Supabase CLI v2.99 generated output
// ============================================================

// ----- Enum Types -----

export type UserRole = 'boss' | 'employee' | 'owner' | 'manager' | 'designer' | 'worker' | 'accountant'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus = 'pending' | 'in_production' | 'checking' | 'delivered' | 'cancelled'
export type OrderLineStatus = 'pending' | 'sent' | 'received' | 'done'
export type WorkerSpecialty = 'jecard' | 'butta_cutting' | 'bleach' | 'cotting' | 'position_print' | 'checking' | 'delivery' | 'multiple'
export type MachineType = 'jecard' | 'butta_cutting' | 'bleach' | 'cotting' | 'position_print' | 'checking'
export type MachineStatus = 'active' | 'idle' | 'maintenance'
export type SareeType = 'color' | 'white' | 'garment'
export type ProcessType = 'jecard' | 'butta_cutting' | 'bleach' | 'cotting' | 'position_print' | 'checking' | 'delivery'
export type ChallanStatus = 'sent' | 'partially_received' | 'fully_received'
export type ProductionStatusType = 'pending' | 'in_progress' | 'done'
export type QualityStatus = 'good' | 'damaged' | 'partial'
export type MovementType = 'stock_in' | 'challan_out' | 'return_in' | 'damage_out' | 'adjustment'
export type ReferenceType = 'challan' | 'receiving_challan' | 'manual'
export type PaymentStatus = 'unpaid' | 'partial' | 'fully_paid'
export type PaymentMethod = 'cash' | 'bank' | 'upi' | 'cheque'
export type WorkerPaymentStatus = 'unpaid' | 'paid'
export type CounterType = 'challan' | 'po_number' | 'receiving'

// ----- Table Row Types (for convenience) -----

export interface Company {
  id: string
  company_name: string
  company_id_code: string
  owner_name: string
  phone: string | null
  address: string | null
  created_at: string
  is_active: boolean
  active_machines: string[]
  active_processes: string[]
  onboarding_done: boolean
}

export interface User {
  id: string
  auth_id: string | null
  company_id: string | null
  name: string
  email: string
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  approved_by: string | null
  approved_at: string | null
}

export interface InviteToken {
  id: string
  company_id: string
  token: string
  role: UserRole
  email: string | null
  is_used: boolean
  expires_at: string
  created_by: string | null
  created_at: string
}

export interface Design {
  id: string
  company_id: string
  design_number: string
  image_url: string | null
  date_added: string
  added_by: string | null
  is_active: boolean
}

export interface Order {
  id: string
  company_id: string
  po_number: number
  party_name: string
  order_date: string
  status: OrderStatus
  created_by: string | null
  created_at: string
  updated_at: string
  total_quantity: number
  notes: string | null
}

export interface OrderLine {
  id: string
  order_id: string
  design_id: string | null
  design_number: string
  quantity: number
  line_number: number
  status: OrderLineStatus
}

export interface Worker {
  id: string
  company_id: string
  worker_name: string
  phone: string | null
  specialty: WorkerSpecialty
  address: string | null
  rate_per_piece: number
  is_active: boolean
  created_at: string
}

export interface Machine {
  id: string
  company_id: string
  machine_name: string
  machine_type: MachineType
  machine_code: string
  status: MachineStatus
  last_maintenance_date: string | null
  next_maintenance_date: string | null
  created_at: string
}

export interface Challan {
  id: string
  company_id: string
  challan_number: number
  order_id: string | null
  worker_id: string | null
  saree_type: SareeType
  process_type: ProcessType
  pieces: number
  metres: number
  with_blouse: boolean
  sent_date: string
  sent_by: string | null
  machine_id: string | null
  status: ChallanStatus
  pdf_url: string | null
  notes: string | null
  created_at: string
}

export interface ChallanLine {
  id: string
  challan_id: string
  order_line_id: string | null
  design_id: string | null
  design_number: string
  pieces_sent: number
  metres_sent: number
  pieces_received: number
  metres_received: number
}

export interface ReceivingChallan {
  id: string
  company_id: string
  challan_id: string | null
  worker_id: string | null
  challan_number: string | null
  design_id: string | null
  design_number: string | null
  pieces_received: number
  metres_received: number
  tp: number
  route: string | null
  received_date: string
  received_by: string | null
  quality_status: QualityStatus
  damage_pieces: number
  notes: string | null
  created_at: string
}

export interface ProductionStage {
  id: string
  company_id: string
  order_id: string | null
  order_line_id: string | null
  stage: ProcessType
  saree_type: SareeType
  status: ProductionStatusType
  challan_id: string | null
  pieces_in: number
  pieces_out: number
  started_at: string | null
  completed_at: string | null
  worker_id: string | null
  machine_id: string | null
  notes: string | null
}

export interface InventoryItem {
  id: string
  company_id: string
  design_id: string | null
  saree_type: SareeType
  current_pieces: number
  current_metres: number
  minimum_stock: number
  last_updated: string
}

export interface InventoryMovement {
  id: string
  company_id: string
  inventory_id: string | null
  design_id: string | null
  movement_type: MovementType
  pieces: number
  metres: number
  reference_type: ReferenceType | null
  reference_id: string | null
  movement_date: string
  done_by: string | null
  notes: string | null
  created_at: string
}

export interface OrderPayment {
  id: string
  company_id: string
  order_id: string | null
  party_name: string | null
  total_amount: number
  advance_paid: number
  balance_due: number
  payment_due_date: string | null
  payment_status: PaymentStatus
  last_payment_date: string | null
  notes: string | null
}

export interface PaymentTransaction {
  id: string
  company_id: string
  order_payment_id: string | null
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  received_by: string | null
  notes: string | null
  created_at: string
}

export interface WorkerPayment {
  id: string
  company_id: string
  worker_id: string | null
  challan_id: string | null
  pieces_completed: number
  rate_per_piece: number
  total_amount: number
  payment_status: WorkerPaymentStatus
  paid_date: string | null
  paid_by: string | null
  payment_method: PaymentMethod | null
  notes: string | null
  created_at: string
}

export interface Counter {
  id: string
  company_id: string
  counter_type: CounterType
  current_value: number
  last_updated: string
}

export interface ApprovalRequest {
  id: string
  employee_id: string
  company_id: string
  requested_company_code: string
  status: ApprovalStatus
  requested_at: string
  responded_by: string | null
  responded_at: string | null
}

// ----- Insert Types (for convenience — match what the DB Insert expects) -----

export type CompanyInsert = Omit<Company, 'id' | 'created_at'>
export type UserInsert = Omit<User, 'id' | 'created_at'>
export type InviteTokenInsert = Omit<InviteToken, 'id' | 'created_at'>
export type DesignInsert = Omit<Design, 'id' | 'date_added'>
export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>
export type OrderLineInsert = Omit<OrderLine, 'id'>
export type WorkerInsert = Omit<Worker, 'id' | 'created_at'>
export type MachineInsert = Omit<Machine, 'id' | 'created_at'>
export type ChallanInsert = Omit<Challan, 'id' | 'created_at'>
export type ChallanLineInsert = Omit<ChallanLine, 'id'>
export type ReceivingChallanInsert = Omit<ReceivingChallan, 'id' | 'created_at'>
export type ProductionStageInsert = Omit<ProductionStage, 'id'>
export type InventoryItemInsert = Omit<InventoryItem, 'id'>
export type InventoryMovementInsert = Omit<InventoryMovement, 'id' | 'created_at'>
export type OrderPaymentInsert = Omit<OrderPayment, 'id'>
export type PaymentTransactionInsert = Omit<PaymentTransaction, 'id' | 'created_at'>
export type WorkerPaymentInsert = Omit<WorkerPayment, 'id' | 'created_at'>
export type ApprovalRequestInsert = Omit<ApprovalRequest, 'id' | 'reviewed_by' | 'reviewed_at'>

// ----- Supabase Database Type (for createClient<Database>) -----
// Uses exact format compatible with supabase-js v2.99

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          company_name: string
          company_id_code: string
          owner_name: string
          phone: string | null
          address: string | null
          created_at: string
          is_active: boolean
          active_machines: string[]
          active_processes: string[]
          onboarding_done: boolean
        }
        Insert: {
          id?: string
          company_name: string
          company_id_code: string
          owner_name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          is_active?: boolean
          active_machines?: string[]
          active_processes?: string[]
          onboarding_done?: boolean
        }
        Update: {
          id?: string
          company_name?: string
          company_id_code?: string
          owner_name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          is_active?: boolean
          active_machines?: string[]
          active_processes?: string[]
          onboarding_done?: boolean
        }
        Relationships: []
      }
      stage_sequence: {
        Row: {
          id: string
          company_id: string
          stage_order: number
          stage_name: string
          stage_type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          stage_order: number
          stage_name: string
          stage_type: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          stage_order?: number
          stage_name?: string
          stage_type?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          auth_id: string | null
          company_id: string | null
          name: string
          email: string
          avatar_url: string | null
          role: string
          is_active: boolean
          created_at: string
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          company_id?: string | null
          name: string
          email: string
          avatar_url?: string | null
          role: string
          is_active?: boolean
          created_at?: string
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          company_id?: string | null
          name?: string
          email?: string
          avatar_url?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: []
      }
      invite_tokens: {
        Row: {
          id: string
          company_id: string
          token: string
          role: string
          email: string | null
          is_used: boolean
          expires_at: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          token: string
          role: string
          email?: string | null
          is_used?: boolean
          expires_at: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          token?: string
          role?: string
          email?: string | null
          is_used?: boolean
          expires_at?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      designs: {
        Row: {
          id: string
          company_id: string
          design_number: string
          image_url: string | null
          date_added: string
          added_by: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          company_id: string
          design_number: string
          image_url?: string | null
          date_added?: string
          added_by?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          company_id?: string
          design_number?: string
          image_url?: string | null
          date_added?: string
          added_by?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          company_id: string
          po_number: number
          party_name: string
          order_date: string
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
          total_quantity: number
          notes: string | null
        }
        Insert: {
          id?: string
          company_id: string
          po_number: number
          party_name: string
          order_date: string
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          total_quantity?: number
          notes?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          po_number?: number
          party_name?: string
          order_date?: string
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          total_quantity?: number
          notes?: string | null
        }
        Relationships: []
      }
      order_lines: {
        Row: {
          id: string
          order_id: string
          design_id: string | null
          design_number: string
          quantity: number
          line_number: number
          status: string
        }
        Insert: {
          id?: string
          order_id: string
          design_id?: string | null
          design_number: string
          quantity: number
          line_number: number
          status?: string
        }
        Update: {
          id?: string
          order_id?: string
          design_id?: string | null
          design_number?: string
          quantity?: number
          line_number?: number
          status?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          id: string
          company_id: string
          worker_name: string
          phone: string | null
          specialty: string
          address: string | null
          rate_per_piece: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          worker_name: string
          phone?: string | null
          specialty: string
          address?: string | null
          rate_per_piece?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          worker_name?: string
          phone?: string | null
          specialty?: string
          address?: string | null
          rate_per_piece?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      machines: {
        Row: {
          id: string
          company_id: string
          machine_name: string
          machine_type: string
          machine_code: string
          status: string
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          machine_name: string
          machine_type: string
          machine_code: string
          status?: string
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          machine_name?: string
          machine_type?: string
          machine_code?: string
          status?: string
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      challans: {
        Row: {
          id: string
          company_id: string
          challan_number: number
          order_id: string | null
          worker_id: string | null
          saree_type: string
          process_type: string
          pieces: number
          metres: number
          with_blouse: boolean
          sent_date: string
          sent_by: string | null
          machine_id: string | null
          status: string
          pdf_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          challan_number: number
          order_id?: string | null
          worker_id?: string | null
          saree_type: string
          process_type: string
          pieces?: number
          metres?: number
          with_blouse?: boolean
          sent_date: string
          sent_by?: string | null
          machine_id?: string | null
          status?: string
          pdf_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          challan_number?: number
          order_id?: string | null
          worker_id?: string | null
          saree_type?: string
          process_type?: string
          pieces?: number
          metres?: number
          with_blouse?: boolean
          sent_date?: string
          sent_by?: string | null
          machine_id?: string | null
          status?: string
          pdf_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      challan_lines: {
        Row: {
          id: string
          challan_id: string
          order_line_id: string | null
          design_id: string | null
          design_number: string
          pieces_sent: number
          metres_sent: number
          pieces_received: number
          metres_received: number
        }
        Insert: {
          id?: string
          challan_id: string
          order_line_id?: string | null
          design_id?: string | null
          design_number: string
          pieces_sent?: number
          metres_sent?: number
          pieces_received?: number
          metres_received?: number
        }
        Update: {
          id?: string
          challan_id?: string
          order_line_id?: string | null
          design_id?: string | null
          design_number?: string
          pieces_sent?: number
          metres_sent?: number
          pieces_received?: number
          metres_received?: number
        }
        Relationships: []
      }
      receiving_challans: {
        Row: {
          id: string
          company_id: string
          challan_id: string | null
          worker_id: string | null
          challan_number: string | null
          design_id: string | null
          design_number: string | null
          pieces_received: number
          metres_received: number
          tp: number
          route: string | null
          received_date: string
          received_by: string | null
          quality_status: string
          damage_pieces: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          challan_id?: string | null
          worker_id?: string | null
          challan_number?: string | null
          design_id?: string | null
          design_number?: string | null
          pieces_received?: number
          metres_received?: number
          tp?: number
          route?: string | null
          received_date: string
          received_by?: string | null
          quality_status?: string
          damage_pieces?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          challan_id?: string | null
          worker_id?: string | null
          challan_number?: string | null
          design_id?: string | null
          design_number?: string | null
          pieces_received?: number
          metres_received?: number
          tp?: number
          route?: string | null
          received_date?: string
          received_by?: string | null
          quality_status?: string
          damage_pieces?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      production_stages: {
        Row: {
          id: string
          company_id: string
          order_id: string | null
          order_line_id: string | null
          stage: string
          saree_type: string
          status: string
          challan_id: string | null
          pieces_in: number
          pieces_out: number
          started_at: string | null
          completed_at: string | null
          worker_id: string | null
          machine_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          company_id: string
          order_id?: string | null
          order_line_id?: string | null
          stage: string
          saree_type: string
          status?: string
          challan_id?: string | null
          pieces_in?: number
          pieces_out?: number
          started_at?: string | null
          completed_at?: string | null
          worker_id?: string | null
          machine_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          order_id?: string | null
          order_line_id?: string | null
          stage?: string
          saree_type?: string
          status?: string
          challan_id?: string | null
          pieces_in?: number
          pieces_out?: number
          started_at?: string | null
          completed_at?: string | null
          worker_id?: string | null
          machine_id?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          company_id: string
          design_id: string | null
          saree_type: string
          current_pieces: number
          current_metres: number
          minimum_stock: number
          last_updated: string
        }
        Insert: {
          id?: string
          company_id: string
          design_id?: string | null
          saree_type: string
          current_pieces?: number
          current_metres?: number
          minimum_stock?: number
          last_updated?: string
        }
        Update: {
          id?: string
          company_id?: string
          design_id?: string | null
          saree_type?: string
          current_pieces?: number
          current_metres?: number
          minimum_stock?: number
          last_updated?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: string
          company_id: string
          inventory_id: string | null
          design_id: string | null
          movement_type: string
          pieces: number
          metres: number
          reference_type: string | null
          reference_id: string | null
          movement_date: string
          done_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          inventory_id?: string | null
          design_id?: string | null
          movement_type: string
          pieces?: number
          metres?: number
          reference_type?: string | null
          reference_id?: string | null
          movement_date: string
          done_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          inventory_id?: string | null
          design_id?: string | null
          movement_type?: string
          pieces?: number
          metres?: number
          reference_type?: string | null
          reference_id?: string | null
          movement_date?: string
          done_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      order_payments: {
        Row: {
          id: string
          company_id: string
          order_id: string | null
          party_name: string | null
          total_amount: number
          advance_paid: number
          balance_due: number
          payment_due_date: string | null
          payment_status: string
          last_payment_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          company_id: string
          order_id?: string | null
          party_name?: string | null
          total_amount?: number
          advance_paid?: number
          balance_due?: number
          payment_due_date?: string | null
          payment_status?: string
          last_payment_date?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          order_id?: string | null
          party_name?: string | null
          total_amount?: number
          advance_paid?: number
          balance_due?: number
          payment_due_date?: string | null
          payment_status?: string
          last_payment_date?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          id: string
          company_id: string
          order_payment_id: string | null
          amount: number
          payment_date: string
          payment_method: string
          reference_number: string | null
          received_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          order_payment_id?: string | null
          amount: number
          payment_date: string
          payment_method: string
          reference_number?: string | null
          received_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          order_payment_id?: string | null
          amount?: number
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          received_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      worker_payments: {
        Row: {
          id: string
          company_id: string
          worker_id: string | null
          challan_id: string | null
          pieces_completed: number
          rate_per_piece: number
          total_amount: number
          payment_status: string
          paid_date: string | null
          paid_by: string | null
          payment_method: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          worker_id?: string | null
          challan_id?: string | null
          pieces_completed?: number
          rate_per_piece?: number
          total_amount?: number
          payment_status?: string
          paid_date?: string | null
          paid_by?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          worker_id?: string | null
          challan_id?: string | null
          pieces_completed?: number
          rate_per_piece?: number
          total_amount?: number
          payment_status?: string
          paid_date?: string | null
          paid_by?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      counters: {
        Row: {
          id: string
          company_id: string
          counter_type: string
          current_value: number
          last_updated: string
        }
        Insert: {
          id?: string
          company_id: string
          counter_type: string
          current_value?: number
          last_updated?: string
        }
        Update: {
          id?: string
          company_id?: string
          counter_type?: string
          current_value?: number
          last_updated?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          id: string
          employee_id: string
          company_id: string
          requested_company_code: string
          status: string
          requested_at: string
          responded_by: string | null
          responded_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          company_id: string
          requested_company_code: string
          status?: string
          requested_at?: string
          responded_by?: string | null
          responded_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          company_id?: string
          requested_company_code?: string
          status?: string
          requested_at?: string
          responded_by?: string | null
          responded_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_counter: {
        Args: { p_company_id: string; p_type: string }
        Returns: number
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      approval_status: ApprovalStatus
      order_status: OrderStatus
      order_line_status: OrderLineStatus
      worker_specialty: WorkerSpecialty
      machine_type: MachineType
      machine_status: MachineStatus
      saree_type: SareeType
      process_type: ProcessType
      challan_status: ChallanStatus
      production_status_type: ProductionStatusType
      quality_status: QualityStatus
      movement_type: MovementType
      reference_type: ReferenceType
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      worker_payment_status: WorkerPaymentStatus
      counter_type: CounterType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
