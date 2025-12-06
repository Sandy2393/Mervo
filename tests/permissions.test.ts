import { describe, it, expect } from 'vitest';
import { hasPermission, canPerform } from '../src/lib/permissions/index';

describe('permissions helpers', () => {
  it('hasPermission returns false for null user', () => {
    expect(hasPermission(null, 'company-x', 'view')).toBe(false);
  });

  it('hasPermission returns correct levels for job permissions', () => {
    const user = {
      id: 'u1',
      companies: [
        { company_id: 'c1', permissions: { jobs: 'edit' } },
        { company_id: 'c2', permissions: { jobs: 'view' } }
      ]
    } as any;

    expect(hasPermission(user, 'c1', 'view')).toBe(true);
    expect(hasPermission(user, 'c1', 'edit')).toBe(true);
    expect(hasPermission(user, 'c2', 'edit')).toBe(false);
  });

  it('canPerform respects numeric role levels', () => {
    const user = {
      id: 'u1',
      companies: [
        { company_id: 'c1', role_level: 50 },
        { company_id: 'c2', role_level: 100 }
      ]
    } as any;

    expect(canPerform(user, 'c1', 60)).toBe(false);
    expect(canPerform(user, 'c2', 90)).toBe(true);
  });
});
