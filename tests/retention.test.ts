import { jest } from '@jest/globals';

// Mock date and sample data for retention logic
import { } from '../scripts/retention_cleanup.js';

describe('retention cleanup logic', () => {
  test('threshold calculation', () => {
    const now = new Date('2025-12-06T00:00:00Z');
    const retentionDays = 30;
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - retentionDays);
    expect(threshold.toISOString().slice(0,10)).toBe('2025-11-06');
  });
});
