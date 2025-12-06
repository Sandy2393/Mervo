import { describe, it, expect, vi } from 'vitest';

// Mock the supabase client so tests can drive behavior
vi.mock('../src/lib/supabase', () => {
  return {
    supabase: {
      from: (table: string) => {
        // permission check path -> company_users lookup
        if (table === 'company_users') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null })
                })
              })
            })
          };
        }

        // jobs insert path
        if (table === 'jobs') {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({ data: { id: 'job-1', job_name: 'Test' }, error: null })
              })
            })
          };
        }

        // fallback chainable mock
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          maybeSingle: async () => ({ data: null }),
          order: async () => ({ data: [], error: null }),
          insert: async () => ({ data: null, error: null })
        };

        return chain;
      }
    }
  };
});

import { jobsService } from '../src/services/jobsService';

describe('jobsService', () => {
  it('returns PERMISSION_DENIED when actor lacks company permissions', async () => {
    const payload = {
      job_name: 'x',
      description: 'y',
      priority: 'medium',
      recurring: false,
      created_by: 'actor' // actor will be checked
    } as any;

    const res = await jobsService.createJob('company-1', payload, 'actor');
    expect(res.success).toBe(false);
    expect(res.code).toBe('PERMISSION_DENIED');
  });

  it('creates job when actor not provided (no permission check)', async () => {
    const payload = {
      job_name: 'Test create',
      description: 'desc',
      priority: 'low',
      recurring: false,
      created_by: 'system'
    } as any;

    const res = await jobsService.createJob('company-1', payload);
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('job-1');
  });
});
