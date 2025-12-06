/**
 * Invoice Service Unit Tests
 * Tests for invoice generation, tracking, and calculations
 */

import { describe, it, expect } from 'vitest';
import { invoiceService } from '../../../server/billing/services/invoiceService';

describe('invoiceService', () => {
  describe('generateInvoiceNumber', () => {
    it('should generate properly formatted invoice number', () => {
      const invoiceNum = invoiceService.generateInvoiceNumber();
      expect(invoiceNum).toMatch(/^INV-\d{4}-\d{2}-\d{5}$/);
    });

    it('should include current month and year', () => {
      const invoiceNum = invoiceService.generateInvoiceNumber();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      expect(invoiceNum).toContain(`INV-${year}-${month}`);
    });

    it('should generate unique sequential numbers', () => {
      const num1 = invoiceService.generateInvoiceNumber();
      const num2 = invoiceService.generateInvoiceNumber();
      
      // Extract sequence numbers
      const seq1 = parseInt(num1.split('-')[3]);
      const seq2 = parseInt(num2.split('-')[3]);
      
      expect(seq2).toBeGreaterThan(seq1);
    });
  });

  describe('calculateInvoiceTotal', () => {
    const lineItems = [
      { description: 'Base subscription', amount: 499 },
      { description: 'Storage overage (10GB)', amount: 7.5 },
      { description: 'API overage (5k calls)', amount: 0.5 },
    ];

    it('should calculate subtotal correctly', () => {
      const total = invoiceService.calculateInvoiceTotal(lineItems, null);
      expect(total.subtotal).toBe(507);
    });

    it('should apply percentage coupon', () => {
      const total = invoiceService.calculateInvoiceTotal(lineItems, {
        discountType: 'percentage',
        discountValue: 10,
      } as any);

      expect(total.discountAmount).toBe(50.7);
      expect(total.subtotal).toBe(456.3);
    });

    it('should apply fixed amount coupon', () => {
      const total = invoiceService.calculateInvoiceTotal(lineItems, {
        discountType: 'fixed_amount',
        discountValue: 50,
      } as any);

      expect(total.discountAmount).toBe(50);
      expect(total.subtotal).toBe(457);
    });

    it('should cap coupon at invoice amount', () => {
      const total = invoiceService.calculateInvoiceTotal(lineItems, {
        discountType: 'fixed_amount',
        discountValue: 1000,
      } as any);

      expect(total.discountAmount).toBe(507);
      expect(total.subtotal).toBe(0);
    });

    it('should calculate GST (10%) on subtotal', () => {
      const total = invoiceService.calculateInvoiceTotal(lineItems, null);
      expect(total.gst).toBeCloseTo(50.7, 1);
    });

    it('should calculate final total', () => {
      const total = invoiceService.calculateInvoiceTotal(lineItems, null);
      expect(total.total).toBeCloseTo(557.7, 1);
    });

    it('should handle zero invoice', () => {
      const total = invoiceService.calculateInvoiceTotal([], null);
      expect(total.subtotal).toBe(0);
      expect(total.gst).toBe(0);
      expect(total.total).toBe(0);
    });
  });

  describe('calculateDueDate', () => {
    it('should calculate 14 days from invoice date', () => {
      const invoiceDate = new Date('2025-12-01');
      const dueDate = invoiceService.calculateDueDate(invoiceDate);
      
      const expected = new Date('2025-12-15');
      expect(dueDate.getTime()).toBe(expected.getTime());
    });

    it('should use today if no date provided', () => {
      const dueDate = invoiceService.calculateDueDate();
      const expected = new Date();
      expected.setDate(expected.getDate() + 14);
      
      // Allow 1 second tolerance
      expect(Math.abs(dueDate.getTime() - expected.getTime())).toBeLessThan(1000);
    });

    it('should preserve time zone', () => {
      const invoiceDate = new Date('2025-12-01T15:30:00Z');
      const dueDate = invoiceService.calculateDueDate(invoiceDate);
      
      expect(dueDate.getUTCHours()).toBe(15);
      expect(dueDate.getUTCMinutes()).toBe(30);
    });
  });

  describe('isInvoiceOverdue', () => {
    it('should detect overdue invoice', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 5); // 5 days ago
      
      const overdue = invoiceService.isInvoiceOverdue(dueDate);
      expect(overdue).toBe(true);
    });

    it('should not flag upcoming due date as overdue', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5); // 5 days from now
      
      const overdue = invoiceService.isInvoiceOverdue(dueDate);
      expect(overdue).toBe(false);
    });

    it('should not flag today as overdue', () => {
      const dueDate = new Date();
      
      const overdue = invoiceService.isInvoiceOverdue(dueDate);
      expect(overdue).toBe(false);
    });
  });

  describe('getDaysOverdue', () => {
    it('should calculate days overdue', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 5); // 5 days ago
      
      const days = invoiceService.getDaysOverdue(dueDate);
      expect(days).toBe(5);
    });

    it('should return 0 if not overdue', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5); // 5 days from now
      
      const days = invoiceService.getDaysOverdue(dueDate);
      expect(days).toBe(0);
    });

    it('should handle exact due date', () => {
      const dueDate = new Date();
      
      const days = invoiceService.getDaysOverdue(dueDate);
      expect(days).toBe(0);
    });
  });

  describe('formatInvoiceForDisplay', () => {
    const invoice = {
      invoiceNumber: 'INV-2025-12-00001',
      companyName: 'Acme Corp',
      baseCost: 499,
      overageCost: 7.5,
      couponDiscount: 50,
      gst: 45.65,
      total: 502.15,
      status: 'paid' as const,
      dueDate: new Date('2025-12-15').toISOString(),
    };

    it('should format invoice for display', () => {
      const formatted = invoiceService.formatInvoiceForDisplay(invoice);
      
      expect(formatted).toHaveProperty('invoiceNumber', 'INV-2025-12-00001');
      expect(formatted).toHaveProperty('company', 'Acme Corp');
      expect(formatted).toHaveProperty('baseCost', '$499.00');
      expect(formatted).toHaveProperty('total', '$502.15');
    });

    it('should format currency with 2 decimals', () => {
      const formatted = invoiceService.formatInvoiceForDisplay(invoice);
      expect(formatted.gst).toMatch(/^\$\d+\.\d{2}$/);
    });

    it('should format status with proper casing', () => {
      const formatted = invoiceService.formatInvoiceForDisplay({
        ...invoice,
        status: 'unpaid' as const,
      });
      expect(formatted.status).toBe('Unpaid');
    });
  });

  describe('getInvoiceLineItems', () => {
    const usage = {
      contractors: 7,
      storageGB: 55,
      apiCalls: 75000,
    };

    const tier = {
      monthlyPrice: 199,
      includedContractors: 5,
      includedStorageGB: 50,
      includedAPICalls: 50000,
    };

    it('should create line item for base cost', () => {
      const items = invoiceService.getInvoiceLineItems(usage, tier, null);
      
      expect(items).toContainEqual(
        expect.objectContaining({
          description: expect.stringContaining('Base subscription'),
          amount: 199,
        })
      );
    });

    it('should create line item for contractor overage', () => {
      const items = invoiceService.getInvoiceLineItems(usage, tier, null);
      
      expect(items).toContainEqual(
        expect.objectContaining({
          description: expect.stringContaining('Contractor'),
          amount: 10, // 2 contractors * $5
        })
      );
    });

    it('should create line item for storage overage', () => {
      const items = invoiceService.getInvoiceLineItems(usage, tier, null);
      
      expect(items).toContainEqual(
        expect.objectContaining({
          description: expect.stringContaining('Storage'),
          amount: 3.75, // 5GB * $0.75
        })
      );
    });

    it('should create line item for API overage', () => {
      const items = invoiceService.getInvoiceLineItems(usage, tier, null);
      
      expect(items).toContainEqual(
        expect.objectContaining({
          description: expect.stringContaining('API'),
          amount: 2.5, // 25k calls * $0.10 per 1k
        })
      );
    });

    it('should not create overage line items when within limits', () => {
      const lowUsage = {
        contractors: 3,
        storageGB: 40,
        apiCalls: 40000,
      };

      const items = invoiceService.getInvoiceLineItems(lowUsage, tier, null);
      expect(items).toHaveLength(1); // Only base cost
    });
  });
});
