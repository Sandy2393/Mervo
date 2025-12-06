/**
 * Coupon Service Unit Tests
 * Tests for coupon validation, application, and discount calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { couponService } from '../../../server/billing/services/couponService';

describe('couponService', () => {
  describe('validateCoupon', () => {
    const validCoupon = {
      id: 'cp1',
      couponCode: 'SAVE20',
      discountType: 'percentage' as const,
      discountValue: 20,
      recurring: false,
      activeFrom: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      usageLimit: 100,
      usageCount: 5,
      status: 'active',
      notes: null,
      createdAt: new Date().toISOString(),
    };

    it('should validate active coupon', async () => {
      const result = await couponService.validateCoupon(validCoupon);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject expired coupon', async () => {
      const expired = {
        ...validCoupon,
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      };
      const result = await couponService.validateCoupon(expired);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Coupon has expired');
    });

    it('should reject inactive coupon', async () => {
      const inactive = {
        ...validCoupon,
        status: 'suspended',
      };
      const result = await couponService.validateCoupon(inactive);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Coupon is not active');
    });

    it('should reject coupon exceeding usage limit', async () => {
      const exceeded = {
        ...validCoupon,
        usageCount: 100,
        usageLimit: 100,
      };
      const result = await couponService.validateCoupon(exceeded);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Usage limit reached');
    });

    it('should reject not-yet-active coupon', async () => {
      const future = {
        ...validCoupon,
        activeFrom: new Date(Date.now() + 86400000).toISOString(),
      };
      const result = await couponService.validateCoupon(future);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Coupon is not yet active');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount', () => {
      const discount = couponService.calculateDiscount(
        {
          discountType: 'percentage',
          discountValue: 20,
        } as any,
        1000
      );
      expect(discount).toBe(200);
    });

    it('should calculate fixed amount discount', () => {
      const discount = couponService.calculateDiscount(
        {
          discountType: 'fixed_amount',
          discountValue: 50,
        } as any,
        1000
      );
      expect(discount).toBe(50);
    });

    it('should cap fixed discount at amount', () => {
      const discount = couponService.calculateDiscount(
        {
          discountType: 'fixed_amount',
          discountValue: 500,
        } as any,
        100 // Amount less than discount
      );
      expect(discount).toBe(100);
    });

    it('should handle trial days discount (not applicable)', () => {
      const discount = couponService.calculateDiscount(
        {
          discountType: 'trial_days',
          discountValue: 7,
        } as any,
        1000
      );
      expect(discount).toBe(0); // Trial days don't reduce current charge
    });

    it('should handle 100% discount', () => {
      const discount = couponService.calculateDiscount(
        {
          discountType: 'percentage',
          discountValue: 100,
        } as any,
        1000
      );
      expect(discount).toBe(1000);
    });

    it('should handle decimal amounts', () => {
      const discount = couponService.calculateDiscount(
        {
          discountType: 'percentage',
          discountValue: 15,
        } as any,
        123.45
      );
      expect(discount).toBeCloseTo(18.5175, 3);
    });
  });

  describe('canApplyCoupon', () => {
    it('should allow first coupon application', async () => {
      const companyId = 'test-company-1';
      const couponCode = 'SAVE20';
      
      const can = await couponService.canApplyCoupon(companyId, couponCode);
      expect(can.allowed).toBe(true);
    });

    it('should prevent coupon stacking', async () => {
      const companyId = 'test-company-2';
      
      // Apply first coupon (mocked as successful)
      await couponService.applyCoupon(companyId, 'SAVE20');
      
      // Try to apply second coupon
      const can = await couponService.canApplyCoupon(companyId, 'EXTRA10');
      expect(can.allowed).toBe(false);
      expect(can.reason).toContain('No coupon stacking');
    });

    it('should allow recurring coupon replacement', async () => {
      const companyId = 'test-company-3';
      const existingCoupon = {
        id: 'cp1',
        couponCode: 'RECURRING',
        recurring: true,
      };
      
      // Mock existing recurring coupon
      const can = await couponService.canApplyCoupon(companyId, 'NEW_RECURRING', existingCoupon);
      expect(can.allowed).toBe(true);
    });
  });

  describe('parseCouponCode', () => {
    it('should parse valid coupon code', () => {
      const parsed = couponService.parseCouponCode('SAVE-20-PERCENT');
      expect(parsed.code).toBe('SAVE-20-PERCENT');
      expect(parsed.valid).toBe(true);
    });

    it('should reject empty code', () => {
      const parsed = couponService.parseCouponCode('');
      expect(parsed.valid).toBe(false);
    });

    it('should normalize code to uppercase', () => {
      const parsed = couponService.parseCouponCode('save20');
      expect(parsed.code).toBe('SAVE20');
    });

    it('should reject code with invalid characters', () => {
      const parsed = couponService.parseCouponCode('SAVE@20!');
      expect(parsed.valid).toBe(false);
    });

    it('should enforce max length', () => {
      const longCode = 'A'.repeat(51);
      const parsed = couponService.parseCouponCode(longCode);
      expect(parsed.valid).toBe(false);
    });
  });

  describe('getDiscountSummary', () => {
    it('should summarize percentage coupon', () => {
      const summary = couponService.getDiscountSummary({
        discountType: 'percentage',
        discountValue: 20,
        recurring: false,
      } as any);

      expect(summary.display).toBe('20% off');
      expect(summary.frequency).toBe('one-time');
    });

    it('should summarize fixed amount coupon', () => {
      const summary = couponService.getDiscountSummary({
        discountType: 'fixed_amount',
        discountValue: 50,
        recurring: true,
      } as any);

      expect(summary.display).toBe('$50 off');
      expect(summary.frequency).toBe('every month');
    });

    it('should summarize trial days coupon', () => {
      const summary = couponService.getDiscountSummary({
        discountType: 'trial_days',
        discountValue: 7,
        recurring: false,
      } as any);

      expect(summary.display).toBe('7 days free');
      expect(summary.frequency).toBe('one-time');
    });
  });
});
