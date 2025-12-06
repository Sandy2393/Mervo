/**
 * Company Billing API Routes
 * Endpoints for company admins to view their billing info
 */

import { Router, Request, Response } from 'express';
import { billingService } from '../services/billingService';
import { invoiceService } from '../services/invoiceService';
import { usageService } from '../services/usageService';
import { couponService } from '../services/couponService';
import { tierService } from '../services/tierService';

const router = Router();

/**
 * GET /api/billing/dashboard
 * Get comprehensive billing dashboard for current company
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dashboard = await billingService.getCompanyDashboard(companyId);
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching billing dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch billing dashboard' });
  }
});

/**
 * GET /api/billing/usage
 * Get current usage metrics
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usage = await usageService.getCurrentPeriodUsage(companyId);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage metrics' });
  }
});

/**
 * GET /api/billing/usage/trend
 * Get usage trend over time
 */
router.get('/usage/trend', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const trend = await usageService.getUsageTrend(companyId, days);
    res.json(trend);
  } catch (error) {
    console.error('Error fetching usage trend:', error);
    res.status(500).json({ error: 'Failed to fetch usage trend' });
  }
});

/**
 * GET /api/billing/usage/breakdown
 * Get storage usage breakdown
 */
router.get('/usage/breakdown', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const breakdown = await usageService.getStorageBreakdown(companyId);
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching usage breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch usage breakdown' });
  }
});

/**
 * GET /api/billing/estimated-cost
 * Get estimated cost for current billing period
 */
router.get('/estimated-cost', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const estimate = await invoiceService.getEstimatedInvoice(companyId);
    res.json(estimate);
  } catch (error) {
    console.error('Error calculating estimated cost:', error);
    res.status(500).json({ error: 'Failed to calculate estimated cost' });
  }
});

/**
 * GET /api/billing/invoices
 * Get invoice history for current company
 */
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 12;
    const invoices = await invoiceService.getCompanyInvoices(companyId, limit);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * GET /api/billing/invoices/:id
 * Get specific invoice details
 */
router.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const invoice = await invoiceService.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Verify invoice belongs to this company
    if (invoice.companyId !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

/**
 * GET /api/billing/plan
 * Get current plan details
 */
router.get('/plan', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dashboard = await billingService.getCompanyDashboard(companyId);
    res.json({
      tier: dashboard.company.planTier,
      name: dashboard.company.planName,
      monthlyCost: dashboard.company.monthlyCost,
      status: dashboard.company.status,
      limits: tierService.getTierLimits(dashboard.company.planTier),
      features: tierService.getTierDefinition(dashboard.company.planTier).features,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan details' });
  }
});

/**
 * GET /api/billing/tiers
 * Get all available tiers
 */
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    const tiers = tierService.getPublicTiers();
    res.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ error: 'Failed to fetch tiers' });
  }
});

/**
 * POST /api/billing/apply-coupon
 * Apply a coupon code to company
 */
router.post('/apply-coupon', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    if (!companyId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { couponCode } = req.body;
    if (!couponCode) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    // Validate coupon
    const validation = await couponService.validateCoupon(couponCode, companyId);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    // Apply coupon
    const appliedCoupon = await couponService.applyCoupon(companyId, couponCode, userId);

    // Get updated estimated cost
    const estimate = await invoiceService.getEstimatedInvoice(companyId);

    res.json({
      success: true,
      coupon: appliedCoupon,
      estimatedCost: estimate,
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to apply coupon' });
  }
});

/**
 * DELETE /api/billing/coupon
 * Remove active coupon from company
 */
router.delete('/coupon', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;
    if (!companyId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await couponService.removeCoupon(companyId, userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing coupon:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to remove coupon' });
  }
});

/**
 * POST /api/billing/change-plan
 * Request plan upgrade/downgrade
 */
router.post('/change-plan', async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { newTier } = req.body;
    if (!newTier || !['starter', 'professional', 'enterprise'].includes(newTier)) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    await billingService.changePlan(companyId, newTier);

    res.json({ success: true, newTier });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to change plan' });
  }
});

export default router;
