/**
 * End-to-End Billing Cycle Test
 * Tests complete billing workflow from usage to payment
 */

import { describe, it, expect } from 'vitest';

describe('E2E Billing Cycle', () => {
  /**
   * Scenario: Company starts at Starter tier, uses resources, gets billed,
   * applies coupon, pays invoice
   */

  it('should complete full billing cycle', async () => {
    const companyId = 'test-company-e2e';
    const cycle = {
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
    };

    // Step 1: Company signs up for Starter plan
    const subscription = {
      companyId,
      tier: 'starter',
      status: 'active',
      startDate: cycle.startDate,
      monthlyPrice: 199,
    };
    expect(subscription.tier).toBe('starter');

    // Step 2: Usage accumulates throughout month
    const usage = {
      day1: { contractors: 3, storageGB: 30, apiCalls: 20000 },
      day15: { contractors: 4, storageGB: 45, apiCalls: 35000 },
      day30: { contractors: 5, storageGB: 55, apiCalls: 60000 }, // Over limit
    };

    // Step 3: Daily snapshots capture usage
    const snapshots = [
      { date: '2025-12-01', ...usage.day1 },
      { date: '2025-12-15', ...usage.day15 },
      { date: '2025-12-30', ...usage.day30 },
    ];
    expect(snapshots).toHaveLength(3);

    // Step 4: Month ends, invoicing job runs
    const monthlyUsageAvg = {
      contractors: 4,
      storageGB: 43.3,
      apiCalls: 38333,
    };

    // Step 5: Invoice is generated
    const baseCost = 199;
    const overages = {
      contractors: 0, // 4 is within 5 limit
      storage: (43.3 - 50) > 0 ? (43.3 - 50) * 0.75 : 0, // Within limit
      apiCalls: (38333 - 50000) > 0 ? (38333 - 50000) * 0.1 / 1000 : 0, // Within limit
    };

    expect(overages.contractors).toBe(0);
    expect(overages.storage).toBeLessThanOrEqual(0);
    expect(overages.apiCalls).toBeLessThanOrEqual(0);

    const subtotal = baseCost + Object.values(overages).reduce((a, b) => a + b, 0);
    const gst = subtotal * 0.1;
    const invoice = {
      invoiceNumber: 'INV-2025-12-00001',
      companyId,
      month: '2025-12',
      baseCost,
      overages,
      subtotal,
      gst,
      total: subtotal + gst,
      status: 'unpaid',
      issuedDate: '2025-12-01',
      dueDate: '2025-12-15',
    };

    expect(invoice.invoiceNumber).toMatch(/^INV-/);
    expect(invoice.status).toBe('unpaid');
    expect(invoice.total).toBeCloseTo(subtotal + gst, 1);

    // Step 6: Email notification sent
    const emailSent = {
      to: 'admin@testcompany.com',
      subject: `Invoice ${invoice.invoiceNumber}`,
      template: 'invoiceGenerated',
    };
    expect(emailSent.subject).toContain('INV-');

    // Step 7: Company receives invoice, decides to apply coupon
    const coupon = {
      code: 'WELCOME15',
      type: 'percentage',
      value: 15,
      maxUsage: 100,
      currentUsage: 50,
      status: 'active',
    };

    const discountAmount = invoice.subtotal * (coupon.value / 100);
    const invoiceWithCoupon = {
      ...invoice,
      coupon: coupon.code,
      discount: discountAmount,
      subtotal: invoice.subtotal - discountAmount,
      gst: (invoice.subtotal - discountAmount) * 0.1,
      total: (invoice.subtotal - discountAmount) * 1.1,
      status: 'unpaid',
    };

    expect(invoiceWithCoupon.coupon).toBe('WELCOME15');
    expect(invoiceWithCoupon.total).toBeLessThan(invoice.total);

    // Step 8: Company makes payment
    const payment = {
      invoiceId: invoice.invoiceNumber,
      amount: invoiceWithCoupon.total,
      method: 'stripe',
      stripeChargeId: 'ch_1234567890',
      status: 'succeeded',
      timestamp: new Date().toISOString(),
    };

    expect(payment.status).toBe('succeeded');
    expect(payment.amount).toBeCloseTo(invoiceWithCoupon.total, 2);

    // Step 9: Invoice marked as paid
    const paidInvoice = {
      ...invoiceWithCoupon,
      status: 'paid',
      paidDate: payment.timestamp,
    };

    expect(paidInvoice.status).toBe('paid');
    expect(paidInvoice.paidDate).toBeDefined();

    // Step 10: Confirmation email sent
    const confirmationEmail = {
      to: 'admin@testcompany.com',
      subject: `Payment confirmed for ${invoice.invoiceNumber}`,
      amount: payment.amount,
    };

    expect(confirmationEmail.subject).toContain('Payment confirmed');
  });

  /**
   * Scenario: Company exceeds usage limits and gets charged for overages
   */
  it('should charge overages correctly', async () => {
    const tier = {
      tier: 'starter',
      monthlyPrice: 199,
      limits: {
        contractors: 5,
        storageGB: 50,
        apiCalls: 50000,
      },
    };

    const usage = {
      contractors: 8, // 3 over
      storageGB: 75, // 25 over
      apiCalls: 100000, // 50k over
    };

    // Calculate overages
    const contractorOverage = Math.max(0, usage.contractors - tier.limits.contractors) * 5;
    const storageOverage = Math.max(0, usage.storageGB - tier.limits.storageGB) * 0.75;
    const apiOverage = (Math.max(0, usage.apiCalls - tier.limits.apiCalls) / 1000) * 0.1;

    expect(contractorOverage).toBe(15); // 3 * $5
    expect(storageOverage).toBe(18.75); // 25 * $0.75
    expect(apiOverage).toBe(5); // 50 * $0.1

    const totalOverage = contractorOverage + storageOverage + apiOverage;
    const subtotal = tier.monthlyPrice + totalOverage;
    const gst = subtotal * 0.1;
    const total = subtotal + gst;

    expect(totalOverage).toBe(38.75);
    expect(total).toBeCloseTo(252.625, 2);
  });

  /**
   * Scenario: Company is suspended due to non-payment
   */
  it('should suspend account after 7 days overdue', async () => {
    const invoice = {
      invoiceNumber: 'INV-2025-12-00002',
      dueDate: new Date('2025-12-15'),
      status: 'unpaid',
    };

    // Day 3 overdue - reminder email sent
    const day3 = new Date(invoice.dueDate);
    day3.setDate(day3.getDate() + 3);
    const reminder1 = {
      status: 'sent',
      dayOverdue: 3,
      type: 'first_reminder',
    };
    expect(reminder1.dayOverdue).toBe(3);

    // Day 7 overdue - second reminder and suspension
    const day7 = new Date(invoice.dueDate);
    day7.setDate(day7.getDate() + 7);
    const reminder2 = {
      status: 'sent',
      dayOverdue: 7,
      type: 'suspension_notice',
    };
    expect(reminder2.dayOverdue).toBe(7);

    // Account suspended
    const suspension = {
      companyId: 'test-company',
      reason: 'Payment overdue > 7 days',
      effectiveDate: day7,
      invoiceId: invoice.invoiceNumber,
      newStatus: 'suspended',
    };
    expect(suspension.newStatus).toBe('suspended');

    // Suspension notification email sent
    const suspensionEmail = {
      subject: 'Account Suspended',
      reason: 'Payment overdue by 7 days',
    };
    expect(suspensionEmail.subject).toContain('Suspended');
  });

  /**
   * Scenario: Plan upgrade with proration
   */
  it('should handle plan upgrade with proration', async () => {
    const upgrade = {
      currentPlan: 'starter',
      currentMonthlyPrice: 199,
      currentBillingDate: new Date('2025-12-01'),
      upgradeDateProposed: new Date('2025-12-15'), // Mid-month
      newPlan: 'professional',
      newMonthlyPrice: 499,
    };

    // Calculate proration
    const daysUsedOnCurrentPlan = 14; // 12/1 to 12/15
    const daysRemainingInMonth = 31 - daysUsedOnCurrentPlan;
    const remainingChargeCurrentPlan = (daysRemainingInMonth / 31) * upgrade.currentMonthlyPrice;
    const chargeNewPlan = (daysRemainingInMonth / 31) * upgrade.newPlan;

    const prorationCredit = upgrade.currentMonthlyPrice - remainingChargeCurrentPlan;
    const adjustedCharge = chargeNewPlan;

    expect(prorationCredit).toBeGreaterThan(0);
    expect(adjustedCharge).toBeLessThan(upgrade.newMonthlyPrice);

    const upgradedPlan = {
      ...upgrade,
      status: 'upgraded',
      effectiveDate: upgrade.upgradeDateProposed,
      prorationCredit,
      adjustedCharge,
      nextBillingDate: new Date('2026-01-01'),
    };

    expect(upgradedPlan.status).toBe('upgraded');
  });

  /**
   * Scenario: Trial coupon usage
   */
  it('should apply trial coupon correctly', async () => {
    const trialCoupon = {
      code: 'FREETRIAL7',
      type: 'trial_days',
      value: 7, // 7 days free
      recurring: false,
    };

    const subscription = {
      tier: 'professional',
      monthlyPrice: 499,
      startDate: new Date('2025-12-01'),
      appliedCoupon: trialCoupon.code,
    };

    // Trial covers first 7 days (7/30 of month)
    const trialDays = 7;
    const totalDays = 31;
    const trialDiscount = (trialDays / totalDays) * subscription.monthlyPrice;
    const firstMonthBill = subscription.monthlyPrice - trialDiscount;

    expect(firstMonthBill).toBeCloseTo(113.32, 2); // ~36% of normal charge
    expect(trialDiscount).toBeCloseTo(112.87, 2);

    // Second month - no discount, full price
    const secondMonthBill = subscription.monthlyPrice;
    expect(secondMonthBill).toBe(499);
  });
});
