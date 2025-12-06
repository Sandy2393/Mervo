/**
 * Tier Service Unit Tests
 * Tests for pricing calculations and tier definitions
 */

import { describe, it, expect } from 'vitest';
import { tierService } from '../../../server/billing/services/tierService';

describe('tierService', () => {
  describe('getTierDefinition', () => {
    it('should return Starter tier definition', () => {
      const tier = tierService.getTierDefinition('starter');
      expect(tier.name).toBe('Starter');
      expect(tier.monthlyPrice).toBe(199);
      expect(tier.includedContractors).toBe(5);
      expect(tier.includedStorageGB).toBe(50);
      expect(tier.includedAPICalls).toBe(50000);
    });

    it('should return Professional tier definition', () => {
      const tier = tierService.getTierDefinition('professional');
      expect(tier.name).toBe('Professional');
      expect(tier.monthlyPrice).toBe(499);
      expect(tier.includedContractors).toBe(15);
      expect(tier.includedStorageGB).toBe(200);
      expect(tier.includedAPICalls).toBe(200000);
    });

    it('should return Enterprise tier definition', () => {
      const tier = tierService.getTierDefinition('enterprise');
      expect(tier.name).toBe('Enterprise');
      expect(tier.monthlyPrice).toBe(2999);
      expect(tier.includedContractors).toBe(100);
      expect(tier.includedStorageGB).toBe(1000);
      expect(tier.includedAPICalls).toBe(1000000);
    });

    it('should throw for invalid tier', () => {
      expect(() => tierService.getTierDefinition('invalid')).toThrow();
    });
  });

  describe('calculateOverageCost', () => {
    it('should calculate zero overage when within limits', () => {
      const tier = tierService.getTierDefinition('starter');
      const cost = tierService.calculateOverageCost(tier, {
        contractors: 3,
        storageGB: 40,
        apiCalls: 40000,
      });
      expect(cost).toBe(0);
    });

    it('should calculate contractor overage cost', () => {
      const tier = tierService.getTierDefinition('starter');
      // Starter includes 5 contractors, $5 each additional
      const cost = tierService.calculateOverageCost(tier, {
        contractors: 7, // 2 over limit
        storageGB: 0,
        apiCalls: 0,
      });
      expect(cost).toBe(10); // 2 * $5
    });

    it('should calculate storage overage cost', () => {
      const tier = tierService.getTierDefinition('starter');
      // Starter includes 50GB, $0.75 per GB additional
      const cost = tierService.calculateOverageCost(tier, {
        contractors: 0,
        storageGB: 60, // 10GB over
        apiCalls: 0,
      });
      expect(cost).toBe(7.5); // 10 * $0.75
    });

    it('should calculate API call overage cost', () => {
      const tier = tierService.getTierDefinition('starter');
      // Starter includes 50k calls, $0.10 per 1k calls
      const cost = tierService.calculateOverageCost(tier, {
        contractors: 0,
        storageGB: 0,
        apiCalls: 75000, // 25k over
      });
      expect(cost).toBe(2.5); // 25 * $0.10
    });

    it('should calculate combined overages', () => {
      const tier = tierService.getTierDefinition('starter');
      const cost = tierService.calculateOverageCost(tier, {
        contractors: 6, // 1 over: $5
        storageGB: 55, // 5 over: $3.75
        apiCalls: 60000, // 10k over: $1
      });
      expect(cost).toBe(9.75);
    });

    it('should calculate with decimals correctly', () => {
      const tier = tierService.getTierDefinition('professional');
      const cost = tierService.calculateOverageCost(tier, {
        contractors: 0,
        storageGB: 200.5, // 0.5 over
        apiCalls: 0,
      });
      expect(cost).toBeCloseTo(0.375, 3); // 0.5 * $0.75
    });
  });

  describe('calculateGST', () => {
    it('should calculate 10% GST', () => {
      const gst = tierService.calculateGST(100);
      expect(gst).toBe(10);
    });

    it('should handle decimal amounts', () => {
      const gst = tierService.calculateGST(123.45);
      expect(gst).toBeCloseTo(12.345, 2);
    });

    it('should return 0 for zero amount', () => {
      const gst = tierService.calculateGST(0);
      expect(gst).toBe(0);
    });
  });

  describe('validateUsageAgainstTier', () => {
    it('should validate usage within limits', () => {
      const tier = tierService.getTierDefinition('starter');
      const valid = tierService.validateUsageAgainstTier(tier, {
        contractors: 5,
        storageGB: 50,
        apiCalls: 50000,
      });
      expect(valid.isValid).toBe(true);
      expect(valid.violations).toHaveLength(0);
    });

    it('should detect contractor overages', () => {
      const tier = tierService.getTierDefinition('starter');
      const valid = tierService.validateUsageAgainstTier(tier, {
        contractors: 10,
        storageGB: 40,
        apiCalls: 40000,
      });
      expect(valid.isValid).toBe(false);
      expect(valid.violations).toContain('contractors');
    });

    it('should detect storage overages', () => {
      const tier = tierService.getTierDefinition('starter');
      const valid = tierService.validateUsageAgainstTier(tier, {
        contractors: 5,
        storageGB: 100,
        apiCalls: 40000,
      });
      expect(valid.isValid).toBe(false);
      expect(valid.violations).toContain('storage');
    });

    it('should detect API call overages', () => {
      const tier = tierService.getTierDefinition('starter');
      const valid = tierService.validateUsageAgainstTier(tier, {
        contractors: 5,
        storageGB: 40,
        apiCalls: 100000,
      });
      expect(valid.isValid).toBe(false);
      expect(valid.violations).toContain('apiCalls');
    });

    it('should detect multiple violations', () => {
      const tier = tierService.getTierDefinition('starter');
      const valid = tierService.validateUsageAgainstTier(tier, {
        contractors: 10,
        storageGB: 100,
        apiCalls: 100000,
      });
      expect(valid.isValid).toBe(false);
      expect(valid.violations).toHaveLength(3);
    });
  });

  describe('getRecommendedTier', () => {
    it('should recommend Starter for low usage', () => {
      const recommended = tierService.getRecommendedTier({
        contractors: 3,
        storageGB: 30,
        apiCalls: 30000,
      });
      expect(recommended).toBe('starter');
    });

    it('should recommend Professional for medium usage', () => {
      const recommended = tierService.getRecommendedTier({
        contractors: 10,
        storageGB: 150,
        apiCalls: 150000,
      });
      expect(recommended).toBe('professional');
    });

    it('should recommend Enterprise for high usage', () => {
      const recommended = tierService.getRecommendedTier({
        contractors: 50,
        storageGB: 600,
        apiCalls: 600000,
      });
      expect(recommended).toBe('enterprise');
    });

    it('should recommend upgrade when at tier limits', () => {
      const recommended = tierService.getRecommendedTier({
        contractors: 5,
        storageGB: 50,
        apiCalls: 50000,
      });
      // At limits, should recommend upgrade
      expect(recommended).not.toBe('starter');
    });
  });

  describe('calculateMonthlyBill', () => {
    it('should calculate bill with base cost only', () => {
      const tier = tierService.getTierDefinition('starter');
      const bill = tierService.calculateMonthlyBill(tier, {
        contractors: 3,
        storageGB: 30,
        apiCalls: 30000,
      });

      expect(bill.baseCost).toBe(199);
      expect(bill.overageCost).toBe(0);
      expect(bill.subtotal).toBe(199);
      expect(bill.gst).toBeCloseTo(19.9, 1);
      expect(bill.total).toBeCloseTo(218.9, 1);
    });

    it('should calculate bill with overages', () => {
      const tier = tierService.getTierDefinition('starter');
      const bill = tierService.calculateMonthlyBill(tier, {
        contractors: 6, // 1 over
        storageGB: 55, // 5 over
        apiCalls: 60000, // 10k over
      });

      expect(bill.baseCost).toBe(199);
      expect(bill.overageCost).toBe(9.75);
      expect(bill.subtotal).toBe(208.75);
      expect(bill.gst).toBeCloseTo(20.875, 2);
      expect(bill.total).toBeCloseTo(229.625, 2);
    });
  });
});
