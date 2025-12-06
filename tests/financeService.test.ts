import { financeService } from '../src/services/financeService';

// Mock supabase client used inside financeService
jest.mock('../src/lib/supabase', () => {
  return {
    supabase: {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis()
    }
  };
});

describe('financeService basic calculations', () => {
  test('forecastRevenue returns daily array length nextNdays', async () => {
    const resp = await financeService.forecastRevenue('company_123', 3);
    expect(resp.success).toBe(true);
    expect(resp.data).toBeDefined();
    expect(Array.isArray(resp.data!.dailyCents)).toBe(true);
    expect(resp.data!.dailyCents.length).toBe(3);
  });

  test('calculateProfit returns expected structure for missing instance', async () => {
    // With mocked supabase that returns nothing, expect error
    const resp = await financeService.calculateProfit('company_123', 'inst_1');
    expect(resp.success).toBe(false);
  });
});
