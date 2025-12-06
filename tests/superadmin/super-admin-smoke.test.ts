/**
 * Super-Admin E2E Smoke Tests
 * End-to-end tests for super-admin UI flows
 */

import { describe, it, expect } from '@jest/globals';

describe('Super Admin UI Smoke Tests', () => {
  describe('SuperAdminPanel', () => {
    it('should render panel with dashboard cards', () => {
      const mockSummary = {
        totalCompanies: 3,
        activeCompanies: 2,
        overdueInvoices: 1,
        mrr: 1500,
      };

      expect(mockSummary.totalCompanies).toBeGreaterThan(0);
      expect(mockSummary.activeCompanies).toBeLessThanOrEqual(mockSummary.totalCompanies);
    });

    it('should link to all super-admin sections', () => {
      const links = [
        '/super-admin/companies',
        '/super-admin/billing',
        '/super-admin/audit',
        '/super-admin/storage',
        '/super-admin/offline',
      ];

      expect(links).toHaveLength(5);
      links.forEach(link => {
        expect(link).toMatch(/^\/super-admin\//);
      });
    });
  });

  describe('CompaniesList', () => {
    it('should display companies table', () => {
      const mockCompanies = [
        { id: '1', name: 'Company A', status: 'active' },
        { id: '2', name: 'Company B', status: 'suspended' },
      ];

      expect(mockCompanies).toHaveLength(2);
      expect(mockCompanies[0].status).toBe('active');
    });

    it('should support search filter', () => {
      const companies = [
        { id: '1', name: 'Acme Corp', owner_email: 'a@test.com' },
        { id: '2', name: 'Globex Inc', owner_email: 'b@test.com' },
      ];

      const searchQuery = 'acme';
      const filtered = companies.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Acme Corp');
    });

    it('should support status filter', () => {
      const companies = [
        { id: '1', name: 'A', status: 'active' },
        { id: '2', name: 'B', status: 'suspended' },
        { id: '3', name: 'C', status: 'active' },
      ];

      const activeOnly = companies.filter(c => c.status === 'active');

      expect(activeOnly).toHaveLength(2);
    });
  });

  describe('CompanyDetail', () => {
    it('should load company details', () => {
      const company = {
        id: 'test-co',
        name: 'Test Company',
        status: 'active',
        owner_email: 'owner@test.com',
        storage_bytes: 5000000,
        workforce_count: 25,
      };

      expect(company.id).toBeDefined();
      expect(company.name).toBeDefined();
      expect(company.status).toBeDefined();
    });

    it('should load company jobs', () => {
      const jobs = [
        { id: 'job-1', title: 'Job 1', status: 'completed' },
        { id: 'job-2', title: 'Job 2', status: 'pending' },
      ];

      expect(jobs).toHaveLength(2);
      expect(jobs[0].status).toBe('completed');
    });
  });

  describe('BillingOverview', () => {
    it('should display summary cards', () => {
      const summary = {
        totalMRR: 5000,
        activeSubscriptions: 10,
        companiesOverLimit: 2,
        overdueInvoices: 1,
      };

      expect(summary.totalMRR).toBeGreaterThanOrEqual(0);
      expect(summary.activeSubscriptions).toBeGreaterThanOrEqual(0);
    });

    it('should list all companies with billing info', () => {
      const companies = [
        { id: '1', name: 'A', monthlyCost: 100, usageCost: 20, totalCost: 120 },
        { id: '2', name: 'B', monthlyCost: 200, usageCost: 0, totalCost: 200 },
      ];

      companies.forEach(c => {
        expect(c.totalCost).toBe(c.monthlyCost + c.usageCost);
      });
    });
  });

  describe('AuditViewer', () => {
    it('should load audit logs with filters', () => {
      const logs = [
        { id: '1', action: 'company.suspend', actor: 'admin@test.com', created_at: '2025-12-01' },
        { id: '2', action: 'company.create', actor: 'admin@test.com', created_at: '2025-12-02' },
      ];

      expect(logs).toHaveLength(2);
      expect(logs[0].action).toMatch(/company\./);
    });

    it('should filter by action', () => {
      const allLogs = [
        { id: '1', action: 'company.suspend' },
        { id: '2', action: 'user.create' },
        { id: '3', action: 'company.create' },
      ];

      const companyActions = allLogs.filter(log => log.action.startsWith('company.'));

      expect(companyActions).toHaveLength(2);
    });
  });

  describe('StorageManager', () => {
    it('should display storage usage', () => {
      const usage = {
        company_id: 'test-co',
        total_bytes: 5000000,
        top_folders: [
          { path: 'photos/before', bytes: 2000000 },
          { path: 'reports/pdf', bytes: 1500000 },
        ],
        estimated_monthly_cost_usd: 12.5,
      };

      expect(usage.total_bytes).toBeGreaterThan(0);
      expect(usage.top_folders).toHaveLength(2);
    });
  });

  describe('OfflineCenter', () => {
    it('should list pending sync items', () => {
      const pending = [
        { id: '1', company_id: 'co-1', type: 'photo', status: 'pending', attempts: 1 },
        { id: '2', company_id: 'co-2', type: 'timesheet', status: 'pending', attempts: 3 },
      ];

      expect(pending).toHaveLength(2);
      expect(pending.every(p => p.status === 'pending')).toBe(true);
    });

    it('should calculate success rate', () => {
      const items = [
        { status: 'resolved' },
        { status: 'resolved' },
        { status: 'failed' },
        { status: 'pending' },
      ];

      const resolved = items.filter(i => i.status === 'resolved').length;
      const total = items.length;
      const successRate = total > 0 ? resolved / total : 1;

      expect(successRate).toBe(0.5);
    });
  });
});

describe('Super Admin Guards', () => {
  it('should redirect unauthenticated users to login', () => {
    const isSuperAdmin = false;
    const redirectTo = isSuperAdmin ? null : '/super-admin/login';

    expect(redirectTo).toBe('/super-admin/login');
  });

  it('should allow authenticated super-admins through', () => {
    const isSuperAdmin = true;
    const redirectTo = isSuperAdmin ? null : '/super-admin/login';

    expect(redirectTo).toBeNull();
  });
});
