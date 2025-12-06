/**
 * Invoice Service
 * Generates and manages monthly invoices
 */

import { supabase } from '../../db/supabaseClient';
import { tierService, type PlanTier } from './tierService';
import { usageService } from './usageService';
import { couponService } from './couponService';
import { GST_RATE } from './tierService';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  periodStart: string;
  periodEnd: string;
  baseCost: number;
  storageOverageGb: number;
  storageOverageCost: number;
  apiOverageCalls: number;
  apiOverageCost: number;
  contractorOverageCount: number;
  contractorOverageCost: number;
  subtotal: number;
  couponDiscount: number;
  taxAmount: number;
  totalDue: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate: string | null;
  stripeInvoiceId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

class InvoiceService {
  /**
   * Generate invoice for a company for a specific period
   */
  async generateInvoice(
    companyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<Invoice> {
    // Get company's plan
    const plan = await this.getCompanyPlan(companyId);
    if (!plan) {
      throw new Error('Company does not have an active plan');
    }

    // Get usage for the period
    const usage = await usageService.getCurrentPeriodUsage(companyId);

    // Calculate costs
    const tierDef = tierService.getTierDefinition(plan.tier);
    const baseCost = tierDef.monthlyPrice;
    const overage = tierService.calculateOverageCost(usage, plan.tier);

    // Get active coupon
    const activeCoupon = await couponService.getActiveCouponForCompany(companyId);
    
    // Calculate subtotal
    const subtotal = baseCost + overage.totalOverageCost;
    
    // Apply coupon discount
    const { discountAmount } = couponService.calculateDiscount(subtotal, activeCoupon);
    const couponDiscount = discountAmount;
    
    // Calculate tax (GST)
    const subtotalAfterDiscount = subtotal - couponDiscount;
    const taxAmount = parseFloat((subtotalAfterDiscount * GST_RATE).toFixed(2));
    
    // Calculate total
    const totalDue = parseFloat((subtotalAfterDiscount + taxAmount).toFixed(2));

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(periodStart);

    // Calculate due date (5 days after period end)
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 5);

    // Create invoice
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        company_id: companyId,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        base_cost: baseCost,
        storage_overage_gb: overage.storageOverageGB,
        storage_overage_cost: overage.storageOverageCost,
        api_overage_calls: overage.apiOverageCalls,
        api_overage_cost: overage.apiOverageCost,
        contractor_overage_count: overage.contractorOverageCount,
        contractor_overage_cost: overage.contractorOverageCost,
        subtotal,
        coupon_discount: couponDiscount,
        tax_amount: taxAmount,
        total_due: totalDue,
        paid_amount: 0,
        status: 'draft',
        due_date: dueDate.toISOString().split('T')[0],
        notes: activeCoupon ? `Coupon applied: ${activeCoupon.couponCode}` : null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log billing event
    await this.logBillingEvent(companyId, 'invoice_generated', {
      invoiceId: data.id,
      invoiceNumber,
      totalDue,
    });

    return this.mapInvoice(data);
  }

  /**
   * Generate invoice number (format: INV-YYYY-MM-XXXXX)
   */
  private async generateInvoiceNumber(periodStart: Date): Promise<string> {
    const year = periodStart.getFullYear();
    const month = String(periodStart.getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices for this month
    const periodStartStr = `${year}-${month}-01`;
    const periodEndStr = `${year}-${month}-31`;
    
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('period_start', periodStartStr)
      .lte('period_start', periodEndStr);
    
    const sequence = String((count || 0) + 1).padStart(5, '0');
    
    return `INV-${year}-${month}-${sequence}`;
  }

  /**
   * Get company's active plan
   */
  private async getCompanyPlan(companyId: string): Promise<{ tier: PlanTier; monthlyCost: number } | null> {
    const { data, error } = await supabase
      .from('company_plans')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .is('active_to', null)
      .single();

    if (error || !data) return null;

    return {
      tier: data.plan_tier as PlanTier,
      monthlyCost: parseFloat(data.monthly_cost),
    };
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !data) return null;
    return this.mapInvoice(data);
  }

  /**
   * Get invoice by number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();

    if (error || !data) return null;
    return this.mapInvoice(data);
  }

  /**
   * Get all invoices for a company
   */
  async getCompanyInvoices(companyId: string, limit: number = 12): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .order('period_start', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(this.mapInvoice);
  }

  /**
   * Mark invoice as sent
   */
  async markAsSent(invoiceId: string): Promise<void> {
    await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceId);

    const invoice = await this.getInvoice(invoiceId);
    if (invoice) {
      await this.logBillingEvent(invoice.companyId, 'invoice_sent', {
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
      });
    }
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    invoiceId: string,
    paidAmount: number,
    stripePaymentIntentId?: string
  ): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_amount: paidAmount,
        paid_date: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    // Record payment history
    await supabase.from('payment_history').insert({
      invoice_id: invoiceId,
      company_id: invoice.companyId,
      amount: paidAmount,
      payment_method: 'stripe',
      stripe_payment_intent_id: stripePaymentIntentId || null,
      status: 'succeeded',
    });

    await this.logBillingEvent(invoice.companyId, 'invoice_paid', {
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: paidAmount,
    });

    // Mark one-time coupons as used
    const activeCoupon = await couponService.getActiveCouponForCompany(invoice.companyId);
    if (activeCoupon && !activeCoupon.recurring) {
      await couponService.removeCoupon(invoice.companyId, 'system');
    }
  }

  /**
   * Mark invoice as overdue
   */
  async markAsOverdue(invoiceId: string): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return;

    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('id', invoiceId);

    await this.logBillingEvent(invoice.companyId, 'invoice_overdue', {
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      daysOverdue: this.getDaysOverdue(invoice.dueDate),
    });
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .in('status', ['sent', 'overdue'])
      .lt('due_date', today);

    if (error || !data) return [];
    return data.map(this.mapInvoice);
  }

  /**
   * Get invoice line items (for display/PDF)
   */
  getInvoiceLineItems(invoice: Invoice, planTier: PlanTier): InvoiceLineItem[] {
    const items: InvoiceLineItem[] = [];
    const tierDef = tierService.getTierDefinition(planTier);

    // Base plan
    items.push({
      description: `${tierDef.name} Plan (${invoice.periodStart} to ${invoice.periodEnd})`,
      quantity: 1,
      unitPrice: invoice.baseCost,
      amount: invoice.baseCost,
    });

    // Storage overage
    if (invoice.storageOverageGb > 0) {
      items.push({
        description: 'Storage Overage',
        quantity: invoice.storageOverageGb,
        unitPrice: invoice.storageOverageCost / invoice.storageOverageGb,
        amount: invoice.storageOverageCost,
      });
    }

    // API calls overage
    if (invoice.apiOverageCalls > 0) {
      items.push({
        description: 'API Calls Overage',
        quantity: invoice.apiOverageCalls,
        unitPrice: invoice.apiOverageCost / invoice.apiOverageCalls,
        amount: invoice.apiOverageCost,
      });
    }

    // Contractor overage
    if (invoice.contractorOverageCount > 0) {
      items.push({
        description: 'Extra Contractor Seats',
        quantity: invoice.contractorOverageCount,
        unitPrice: invoice.contractorOverageCost / invoice.contractorOverageCount,
        amount: invoice.contractorOverageCost,
      });
    }

    return items;
  }

  /**
   * Calculate estimated invoice for current period
   */
  async getEstimatedInvoice(companyId: string): Promise<{
    baseCost: number;
    overageCost: number;
    couponDiscount: number;
    taxAmount: number;
    totalDue: number;
  }> {
    const plan = await this.getCompanyPlan(companyId);
    if (!plan) {
      throw new Error('Company does not have an active plan');
    }

    const usage = await usageService.getCurrentPeriodUsage(companyId);
    const activeCoupon = await couponService.getActiveCouponForCompany(companyId);

    const cost = tierService.calculateTotalMonthlyCost(plan.tier, usage, activeCoupon?.discountValue || 0);

    return {
      baseCost: cost.baseCost,
      overageCost: cost.overageCost,
      couponDiscount: cost.discount,
      taxAmount: cost.gst,
      totalDue: cost.total,
    };
  }

  /**
   * Generate invoices for all companies (monthly cron job)
   */
  async generateAllInvoices(periodStart: Date, periodEnd: Date): Promise<{
    success: number;
    failed: number;
    errors: Array<{ companyId: string; error: string }>;
  }> {
    const { data: companies, error } = await supabase
      .from('company_plans')
      .select('company_id')
      .eq('status', 'active')
      .is('active_to', null);

    if (error || !companies) {
      throw new Error('Failed to fetch companies for invoice generation');
    }

    let success = 0;
    let failed = 0;
    const errors: Array<{ companyId: string; error: string }> = [];

    for (const company of companies) {
      try {
        await this.generateInvoice(company.company_id, periodStart, periodEnd);
        success++;
      } catch (err) {
        console.error(`Failed to generate invoice for company ${company.company_id}:`, err);
        failed++;
        errors.push({
          companyId: company.company_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return { success, failed, errors };
  }

  /**
   * Get days overdue
   */
  private getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * Map database row to Invoice
   */
  private mapInvoice(data: any): Invoice {
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      companyId: data.company_id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      baseCost: parseFloat(data.base_cost),
      storageOverageGb: parseFloat(data.storage_overage_gb),
      storageOverageCost: parseFloat(data.storage_overage_cost),
      apiOverageCalls: data.api_overage_calls,
      apiOverageCost: parseFloat(data.api_overage_cost),
      contractorOverageCount: data.contractor_overage_count,
      contractorOverageCost: parseFloat(data.contractor_overage_cost),
      subtotal: parseFloat(data.subtotal),
      couponDiscount: parseFloat(data.coupon_discount),
      taxAmount: parseFloat(data.tax_amount),
      totalDue: parseFloat(data.total_due),
      paidAmount: parseFloat(data.paid_amount),
      status: data.status,
      dueDate: data.due_date,
      paidDate: data.paid_date,
      stripeInvoiceId: data.stripe_invoice_id,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Log billing event
   */
  private async logBillingEvent(companyId: string, eventType: string, eventData: any): Promise<void> {
    await supabase.from('billing_events').insert({
      company_id: companyId,
      event_type: eventType,
      event_data: eventData,
    });
  }
}

export const invoiceService = new InvoiceService();
