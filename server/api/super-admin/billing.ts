/**
 * Super Admin Billing API Routes
 * Endpoints for super admins to manage all company billing
 */

import { Router, Request, Response } from 'express';
import { billingService } from '../billing/services/billingService';
import { invoiceService } from '../billing/services/invoiceService';
import { usageService } from '../billing/services/usageService';
import { couponService } from '../billing/services/couponService';
import { tierService } from '../billing/services/tierService';

const router = Router();

/**
 * Middleware to check super-admin permissions
 */
const requireSuperAdmin = (req: Request, res: Response, next: Function) => {
  const role = (req.user as any)?.role || req.headers['x-role'];
  if (!role || !['super_admin', 'superadmin'].includes(String(role))) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

router.use(requireSuperAdmin);

/**
 * GET /api/super-admin/billing/dashboard
 * Get comprehensive billing overview for all companies
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboard = await billingService.getSuperAdminDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching super-admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

/**
 * GET /api/super-admin/billing/companies
 * Get all companies with billing info
 */
router.get('/companies', async (req: Request, res: Response) => {
  try {
    const dashboard = await billingService.getSuperAdminDashboard();
    res.json(dashboard.companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

/**
 * GET /api/super-admin/billing/company/:id
 * Get detailed billing info for specific company
 */
router.get('/company/:id', async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;

    // Get company dashboard
    const dashboard = await billingService.getCompanyDashboard(companyId);

    // Get usage trend
    const trend = await usageService.getUsageTrend(companyId, 30);

    // Get storage breakdown
    const breakdown = await usageService.getStorageBreakdown(companyId);

    // Get invoices
    const invoices = await invoiceService.getCompanyInvoices(companyId, 12);

    // Get active coupon
    const activeCoupon = await couponService.getActiveCouponForCompany(companyId);

    res.json({
      dashboard,
      trend,
      breakdown,
      invoices,
      activeCoupon,
    });
  } catch (error) {
    console.error('Error fetching company billing:', error);
    res.status(500).json({ error: 'Failed to fetch company billing details' });
  }
});

/**
 * POST /api/super-admin/billing/company/:id/suspend
 * Suspend a company for non-payment
 */
router.post('/company/:id/suspend', async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const { reason } = req.body;

    await billingService.suspendCompany(companyId, reason || 'Manual suspension by admin');

    res.json({ success: true });
  } catch (error) {
    console.error('Error suspending company:', error);
    res.status(500).json({ error: 'Failed to suspend company' });
  }
});

/**
 * POST /api/super-admin/billing/company/:id/unsuspend
 * Unsuspend a company
 */
router.post('/company/:id/unsuspend', async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;

    await billingService.unsuspendCompany(companyId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error unsuspending company:', error);
    res.status(500).json({ error: 'Failed to unsuspend company' });
  }
});

/**
 * POST /api/super-admin/billing/company/:id/change-plan
 * Manually change a company's plan
 */
router.post('/company/:id/change-plan', async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const { newTier } = req.body;

    if (!newTier || !['starter', 'professional', 'enterprise', 'custom'].includes(newTier)) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    await billingService.changePlan(companyId, newTier);

    res.json({ success: true, newTier });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ error: 'Failed to change plan' });
  }
});

/**
 * POST /api/super-admin/billing/company/:id/apply-coupon
 * Apply coupon to a company
 */
router.post('/company/:id/apply-coupon', async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    const { couponCode } = req.body;
    const adminId = req.user?.id;

    const appliedCoupon = await couponService.applyCoupon(companyId, couponCode, adminId);

    res.json({ success: true, coupon: appliedCoupon });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to apply coupon' });
  }
});

/**
 * GET /api/super-admin/billing/invoices
 * Get all invoices across all companies
 */
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    // Placeholder - would implement pagination and filtering
    const invoices = await invoiceService.getOverdueInvoices();

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * POST /api/super-admin/billing/invoice/:id/mark-paid
 * Manually mark invoice as paid
 */
router.post('/invoice/:id/mark-paid', async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const { paidAmount, notes } = req.body;

    const invoice = await invoiceService.getInvoice(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await invoiceService.markAsPaid(invoiceId, paidAmount || invoice.totalDue);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

/**
 * GET /api/super-admin/billing/coupons
 * Get all coupon definitions
 */
router.get('/coupons', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const coupons = await couponService.getAllCoupons(activeOnly);
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

/**
 * POST /api/super-admin/billing/coupons
 * Create new coupon definition
 */
router.post('/coupons', async (req: Request, res: Response) => {
  try {
    const {
      couponCode,
      discountType,
      discountValue,
      recurring,
      activeFrom,
      expiresAt,
      usageLimit,
      notes,
    } = req.body;

    const adminId = req.user?.id;

    const coupon = await couponService.createCoupon({
      couponCode,
      discountType,
      discountValue,
      recurring,
      activeFrom: activeFrom ? new Date(activeFrom) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit,
      createdBy: adminId,
      notes,
    });

    res.json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create coupon' });
  }
});

/**
 * GET /api/super-admin/billing/coupons/stats
 * Get coupon usage statistics
 */
router.get('/coupons/stats', async (req: Request, res: Response) => {
  try {
    const couponCode = req.query.couponCode as string | undefined;
    const stats = await couponService.getCouponStats(couponCode);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ error: 'Failed to fetch coupon statistics' });
  }
});

/**
 * POST /api/super-admin/billing/process-monthly
 * Manually trigger monthly billing process
 */
router.post('/process-monthly', async (req: Request, res: Response) => {
  try {
    const result = await billingService.processMonthlyBilling();
    res.json(result);
  } catch (error) {
    console.error('Error processing monthly billing:', error);
    res.status(500).json({ error: 'Failed to process monthly billing' });
  }
});

/**
 * POST /api/super-admin/billing/suspend-overdue
 * Manually trigger suspension of overdue accounts
 */
router.post('/suspend-overdue', async (req: Request, res: Response) => {
  try {
    const suspended = await billingService.suspendOverdueAccounts();
    res.json({ success: true, suspended });
  } catch (error) {
    console.error('Error suspending overdue accounts:', error);
    res.status(500).json({ error: 'Failed to suspend overdue accounts' });
  }
});

/**
 * POST /api/super-admin/billing/send-usage-alerts
 * Manually trigger usage alert emails
 */
router.post('/send-usage-alerts', async (req: Request, res: Response) => {
  try {
    const alertsSent = await billingService.sendUsageAlerts();
    res.json({ success: true, alertsSent });
  } catch (error) {
    console.error('Error sending usage alerts:', error);
    res.status(500).json({ error: 'Failed to send usage alerts' });
  }
});

/**
 * GET /api/super-admin/billing/tiers
 * Get all tier definitions (including custom)
 */
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    const tiers = tierService.getAllTiers();
    res.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ error: 'Failed to fetch tiers' });
  }
});

export default router;
