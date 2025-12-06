/**
 * Billing Service
 * Orchestrates all billing operations and workflows
 */

import { supabase } from '../../db/supabaseClient';
import { tierService, type PlanTier } from './tierService';
import { usageService } from './usageService';
import { invoiceService } from './invoiceService';
import { couponService } from './couponService';

export interface BillingDashboard {
  company: {
    id: string;
    name: string;
    planTier: PlanTier;
    planName: string;
    monthlyCost: number;
    status: string;
  };
  usage: {
    contractors: {
      current: number;
      limit: number;
      percentage: number;
      alertLevel: string;
    };
    storage: {
      current: number;
      limit: number;
      percentage: number;
      alertLevel: string;
    };
    apiCalls: {
      current: number;
      limit: number;
      percentage: number;
      alertLevel: string;
    };
  };
  billing: {
    baseCost: number;
    overageCost: number;
    couponDiscount: number;
    taxAmount: number;
    estimatedTotal: number;
  };
  activeCoupon: {
    code: string;
    discountType: string;
    discountValue: number;
    recurring: boolean;
  } | null;
}

export interface SuperAdminDashboard {
  summary: {
    totalMRR: number;
    activeSubscriptions: number;
    companiesOverLimit: number;
    overdueInvoices: number;
  };
  companies: Array<{
    id: string;
    name: string;
    planTier: string;
    monthlyCost: number;
    usageCost: number;
    totalCost: number;
    status: string;
  }>;
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

class BillingService {
  /**
   * Get company billing dashboard data
   */
  async getCompanyDashboard(companyId: string): Promise<BillingDashboard> {
    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (!company) throw new Error('Company not found');

    // Get plan
    const { data: plan } = await supabase
      .from('company_plans')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .is('active_to', null)
      .single();

    if (!plan) throw new Error('No active plan found');

    const planTier = plan.plan_tier as PlanTier;
    const tierDef = tierService.getTierDefinition(planTier);
    const limits = tierService.getTierLimits(planTier);

    // Get current usage
    const usage = await usageService.getCurrentPeriodUsage(companyId);

    // Calculate usage percentages and alert levels
    const contractorsPercentage = tierService.getUsagePercentage(usage.contractors, limits.contractors);
    const storagePercentage = tierService.getUsagePercentage(usage.storageGB, limits.storageGB);
    const apiCallsPercentage = tierService.getUsagePercentage(usage.apiCalls, limits.apiCallsPerMonth);

    // Get estimated billing
    const estimatedInvoice = await invoiceService.getEstimatedInvoice(companyId);

    // Get active coupon
    const activeCoupon = await couponService.getActiveCouponForCompany(companyId);

    return {
      company: {
        id: company.id,
        name: company.name,
        planTier,
        planName: tierDef.name,
        monthlyCost: tierDef.monthlyPrice,
        status: plan.status,
      },
      usage: {
        contractors: {
          current: usage.contractors,
          limit: limits.contractors,
          percentage: contractorsPercentage,
          alertLevel: tierService.getUsageAlertLevel(contractorsPercentage),
        },
        storage: {
          current: usage.storageGB,
          limit: limits.storageGB,
          percentage: storagePercentage,
          alertLevel: tierService.getUsageAlertLevel(storagePercentage),
        },
        apiCalls: {
          current: usage.apiCalls,
          limit: limits.apiCallsPerMonth,
          percentage: apiCallsPercentage,
          alertLevel: tierService.getUsageAlertLevel(apiCallsPercentage),
        },
      },
      billing: {
        baseCost: estimatedInvoice.baseCost,
        overageCost: estimatedInvoice.overageCost,
        couponDiscount: estimatedInvoice.couponDiscount,
        taxAmount: estimatedInvoice.taxAmount,
        estimatedTotal: estimatedInvoice.totalDue,
      },
      activeCoupon: activeCoupon ? {
        code: activeCoupon.couponCode,
        discountType: activeCoupon.discountType,
        discountValue: activeCoupon.discountValue,
        recurring: activeCoupon.recurring,
      } : null,
    };
  }

  /**
   * Get super-admin billing dashboard
   */
  async getSuperAdminDashboard(): Promise<SuperAdminDashboard> {
    // Get all active companies
    const { data: companies } = await supabase
      .from('company_plans')
      .select(`
        company_id,
        plan_tier,
        monthly_cost,
        status,
        companies (
          id,
          name
        )
      `)
      .eq('status', 'active')
      .is('active_to', null);

    if (!companies) {
      return this.getEmptyDashboard();
    }

    // Calculate MRR
    const totalMRR = companies.reduce((sum, c) => sum + parseFloat(c.monthly_cost), 0);

    // Get companies over limit
    let companiesOverLimit = 0;
    const companyList = [];

    for (const company of companies) {
      const companyData: any = Array.isArray(company.companies) 
        ? company.companies[0] 
        : company.companies;
      
      if (!companyData) continue;

      const usage = await usageService.getCurrentPeriodUsage(company.company_id);
      const overage = tierService.calculateOverageCost(usage, company.plan_tier as PlanTier);
      const usageCost = overage.totalOverageCost;

      if (usageCost > 0) companiesOverLimit++;

      companyList.push({
        id: companyData.id,
        name: companyData.name,
        planTier: company.plan_tier,
        monthlyCost: parseFloat(company.monthly_cost),
        usageCost,
        totalCost: parseFloat(company.monthly_cost) + usageCost,
        status: company.status,
      });
    }

    // Get overdue invoices count
    const overdueInvoices = await invoiceService.getOverdueInvoices();

    // Calculate revenue (this month vs last month)
    const thisMonth = await this.getMonthRevenue(new Date());
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = await this.getMonthRevenue(lastMonthDate);
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      summary: {
        totalMRR: parseFloat(totalMRR.toFixed(2)),
        activeSubscriptions: companies.length,
        companiesOverLimit,
        overdueInvoices: overdueInvoices.length,
      },
      companies: companyList.sort((a, b) => b.totalCost - a.totalCost),
      revenue: {
        thisMonth: parseFloat(thisMonth.toFixed(2)),
        lastMonth: parseFloat(lastMonth.toFixed(2)),
        growth: parseFloat(growth.toFixed(2)),
      },
    };
  }

  /**
   * Get revenue for a specific month
   */
  private async getMonthRevenue(date: Date): Promise<number> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_due, paid_amount')
      .eq('status', 'paid')
      .gte('period_start', startDate)
      .lte('period_start', endDate);

    if (!invoices) return 0;

    return invoices.reduce((sum, inv) => sum + parseFloat(inv.paid_amount), 0);
  }

  /**
   * Create new company plan
   */
  async createCompanyPlan(
    companyId: string,
    planTier: PlanTier,
    stripeSubscriptionId?: string
  ): Promise<void> {
    const tierDef = tierService.getTierDefinition(planTier);

    // Deactivate any existing plans
    await supabase
      .from('company_plans')
      .update({ active_to: new Date().toISOString(), status: 'cancelled' })
      .eq('company_id', companyId)
      .eq('status', 'active');

    // Create new plan
    await supabase.from('company_plans').insert({
      company_id: companyId,
      plan_tier: planTier,
      monthly_cost: tierDef.monthlyPrice,
      active_from: new Date().toISOString(),
      status: 'active',
    });

    // Create Stripe subscription record if provided
    if (stripeSubscriptionId) {
      await this.syncStripeSubscription(companyId, stripeSubscriptionId, planTier);
    }

    // Log event
    await this.logBillingEvent(companyId, 'plan_created', {
      planTier,
      monthlyCost: tierDef.monthlyPrice,
    });
  }

  /**
   * Upgrade/downgrade company plan
   */
  async changePlan(companyId: string, newPlanTier: PlanTier): Promise<void> {
    const currentPlan = await this.getCompanyPlan(companyId);
    if (!currentPlan) throw new Error('No active plan found');

    if (currentPlan.tier === newPlanTier) {
      throw new Error('Company is already on this plan');
    }

    await this.createCompanyPlan(companyId, newPlanTier);

    // Log event
    await this.logBillingEvent(companyId, 'plan_changed', {
      oldTier: currentPlan.tier,
      newTier: newPlanTier,
    });
  }

  /**
   * Suspend company for non-payment
   */
  async suspendCompany(companyId: string, reason: string): Promise<void> {
    await supabase
      .from('company_plans')
      .update({ status: 'suspended' })
      .eq('company_id', companyId)
      .eq('status', 'active');

    await this.logBillingEvent(companyId, 'company_suspended', { reason });
  }

  /**
   * Unsuspend company
   */
  async unsuspendCompany(companyId: string): Promise<void> {
    await supabase
      .from('company_plans')
      .update({ status: 'active' })
      .eq('company_id', companyId)
      .eq('status', 'suspended');

    await this.logBillingEvent(companyId, 'company_unsuspended', {});
  }

  /**
   * Process monthly billing cycle (cron job)
   */
  async processMonthlyBilling(): Promise<{
    invoicesGenerated: number;
    snapshotsCaptured: number;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Calculate period dates (previous month)
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1); // First day of previous month

    // Capture final snapshots for all companies
    const snapshotResult = await usageService.captureAllSnapshots();

    // Generate invoices for all companies
    const invoiceResult = await invoiceService.generateAllInvoices(periodStart, periodEnd);

    if (invoiceResult.errors.length > 0) {
      errors.push(...invoiceResult.errors.map(e => `${e.companyId}: ${e.error}`));
    }

    return {
      invoicesGenerated: invoiceResult.success,
      snapshotsCaptured: snapshotResult.success,
      errors,
    };
  }

  /**
   * Check and suspend overdue accounts (daily job)
   */
  async suspendOverdueAccounts(): Promise<number> {
    const overdueInvoices = await invoiceService.getOverdueInvoices();
    let suspended = 0;

    for (const invoice of overdueInvoices) {
      const daysOverdue = this.getDaysOverdue(invoice.dueDate);

      // Suspend after 7 days
      if (daysOverdue >= 7) {
        await this.suspendCompany(invoice.companyId, `Invoice ${invoice.invoiceNumber} overdue by ${daysOverdue} days`);
        suspended++;
      }

      // Mark as overdue if not already
      if (invoice.status !== 'overdue') {
        await invoiceService.markAsOverdue(invoice.id);
      }
    }

    return suspended;
  }

  /**
   * Send usage alerts (daily job)
   */
  async sendUsageAlerts(): Promise<number> {
    const { data: companies } = await supabase
      .from('company_plans')
      .select('company_id, plan_tier')
      .eq('status', 'active');

    if (!companies) return 0;

    let alertsSent = 0;

    for (const company of companies) {
      const usage = await usageService.getCurrentPeriodUsage(company.company_id);
      const limits = tierService.getTierLimits(company.plan_tier as PlanTier);

      // Check each metric
      const storagePercentage = tierService.getUsagePercentage(usage.storageGB, limits.storageGB);
      const apiCallsPercentage = tierService.getUsagePercentage(usage.apiCalls, limits.apiCallsPerMonth);
      const contractorsPercentage = tierService.getUsagePercentage(usage.contractors, limits.contractors);

      // Send alerts for critical usage (75%+)
      if (storagePercentage >= 75 || apiCallsPercentage >= 75 || contractorsPercentage >= 75) {
        // TODO: Send email alert
        console.log(`Alert for company ${company.company_id}: High usage detected`);
        alertsSent++;
      }
    }

    return alertsSent;
  }

  /**
   * Get company plan
   */
  private async getCompanyPlan(companyId: string): Promise<{ tier: PlanTier; monthlyCost: number } | null> {
    const { data } = await supabase
      .from('company_plans')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .is('active_to', null)
      .single();

    if (!data) return null;

    return {
      tier: data.plan_tier as PlanTier,
      monthlyCost: parseFloat(data.monthly_cost),
    };
  }

  /**
   * Sync Stripe subscription
   */
  private async syncStripeSubscription(
    companyId: string,
    stripeSubscriptionId: string,
    planTier: PlanTier
  ): Promise<void> {
    // This would integrate with actual Stripe API
    // For now, just store the subscription ID
    await supabase.from('stripe_subscriptions').upsert({
      company_id: companyId,
      stripe_customer_id: 'placeholder', // Would get from Stripe
      stripe_subscription_id: stripeSubscriptionId,
      plan_tier: planTier,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date().toISOString(),
    });
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
   * Log billing event
   */
  private async logBillingEvent(companyId: string, eventType: string, eventData: any): Promise<void> {
    await supabase.from('billing_events').insert({
      company_id: companyId,
      event_type: eventType,
      event_data: eventData,
    });
  }

  /**
   * Get empty dashboard
   */
  private getEmptyDashboard(): SuperAdminDashboard {
    return {
      summary: {
        totalMRR: 0,
        activeSubscriptions: 0,
        companiesOverLimit: 0,
        overdueInvoices: 0,
      },
      companies: [],
      revenue: {
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
      },
    };
  }
}

export const billingService = new BillingService();
