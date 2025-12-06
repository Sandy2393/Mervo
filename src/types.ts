/**
 * TypeScript Interfaces for Mervo OPS
 * Matches extended Supabase schema with multi-tenant, RBAC, and offline support
 */

// ============================================================
// AUTH & USERS
// ============================================================

export interface AuthUser {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  company_alias: string;
  role: string;
  role_level: number;
  permissions: Record<string, 'view' | 'edit' | 'none'>;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface CompanyOwner {
  id: string;
  company_id: string;
  user_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface User {
  id: string;
  company_id: string;
  username: string;
  master_alias: string;
  role: 'owner' | 'employee' | 'contractor';
  full_name?: string;
  created_at: string;
}

// ============================================================
// COMPANIES
// ============================================================

export interface Company {
  id: string;
  name: string;
  company_tag: string;
  settings?: Record<string, unknown>;
  retention_days?: number;
  storage_bytes?: number;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
}

// ============================================================
// JOBS
// ============================================================

export interface Job {
  id: string;
  company_id: string;
  job_name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  recurring: boolean;
  schedule?: Record<string, unknown>;
  location?: Record<string, unknown>;
  payment?: Record<string, unknown>;
  publish: boolean;
  created_by?: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
}

export interface JobInstance {
  id: string;
  job_id: string;
  company_id: string;
  scheduled_for?: string;
  assigned_to?: string;
  assigned_company_user_id?: string;
  status: 'unassigned' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

// ============================================================
// PHOTOS & SIGNATURES
// ============================================================

export interface JobPhoto {
  id: string;
  job_instance_id?: string;
  company_id?: string;
  uploader_id?: string;
  storage_path?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Signature {
  id: string;
  job_instance_id?: string;
  user_id?: string;
  svg?: Record<string, unknown>;
  png_path?: string;
  device_meta?: Record<string, unknown>;
  audit_hash?: string;
  created_at: string;
}

// ============================================================
// TIMESHEETS
// ============================================================

export interface Timesheet {
  id: string;
  job_instance_id?: string;
  user_id?: string;
  clock_in?: string;
  clock_out?: string;
  clock_in_geo?: Record<string, number>;
  clock_out_geo?: Record<string, number>;
  device_meta?: Record<string, unknown>;
  duration_seconds?: number;
  created_at: string;
}

// ============================================================
// AUDIT & ROLES
// ============================================================

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  action: string;
  target?: Record<string, unknown>;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface Role {
  name: string;
  level: number;
}

// ============================================================
// CONTEXT & STATE
// ============================================================

export interface AuthContextType {
  user: AuthUser | null;
  companyUser: CompanyUser | null;
  companies: Company[];
  activeCompanyId: string | null;
  rolesForActiveCompany?: string[] | null;
  loading: boolean;
  error: string | null;
  login: (master_alias: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchCompany: (companyId: string) => void;
}

// ============================================================
// SERVICE RESPONSE TYPES
// ============================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// OFFLINE QUEUE
// ============================================================

export type QueueActionType = 'CLOCK_IN' | 'CLOCK_OUT' | 'UPLOAD_PHOTO' | 'SUBMIT_REPORT' | 'CREATE_SIGNATURE' | 'REQUEST_OVERRIDE';


export interface QueuedAction {
  id: string;
  type: QueueActionType;
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
  status: 'pending' | 'synced' | 'failed';
}

// ============================================================
// JOBS ENGINE
// ============================================================

export interface JobReport {
  id: string;
  job_instance_id: string;
  user_id: string;
  submitted_at: string;
  answers?: Record<string, unknown>;
  duration_seconds?: number;
  notes?: string;
  photo_ids?: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface GeofenceOverride {
  id: string;
  job_instance_id: string;
  user_id: string;
  requested_at: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;
  end_date?: string;
  days_of_week?: number[];
  custom_cron?: string;
}

// ============================================================
// FINANCE / BILLING
// ============================================================

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'failed';

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unit_price_cents: number; // stored in cents to avoid float errors
  amount_cents: number;
}

export interface Invoice {
  id: string; // uuid
  company_id: string;
  invoice_number: string;
  period_start?: string;
  period_end?: string;
  line_items: InvoiceLineItem[];
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  created_at: string;
  status: InvoiceStatus;
  payment_history?: any[];
}

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface Payout {
  id: string;
  company_id: string;
  contractor_alias: string;
  amount_cents: number;
  currency: string;
  status: PayoutStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  paid_at?: string;
}

export interface PaymentBatchResult {
  batchId: string;
  results: { payoutId: string; status: PayoutStatus; error?: string }[];
}

// ============================================================
// IDENTITY & ACCOUNT LINKING
// ============================================================

export interface MasterAccount {
  id: string;
  account_id: string; // username@app_tag
  username: string;
  email?: string;
  status?: 'active' | 'suspended' | 'locked' | 'merged' | 'deleted';
  created_at?: string;
}

export interface CompanyAlias {
  id: string;
  company_id: string;
  user_id: string;
  company_alias: string; // username@company_tag
  role: string;
  created_at?: string;
}

export interface LinkedAccountRequest {
  id: string;
  primary_user_id: string;
  secondary_user_id: string;
  verification_code: string;
  expires_at: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  created_at: string;
}

export interface UserProfile extends AuthUser {
  account_id: string;
  username: string;
  companies: Array<{ company_id: string; company_tag?: string; role: string; permissions?: Record<string, 'view' | 'edit' | 'none'> }>;
  primaryRole?: string | null;
}

