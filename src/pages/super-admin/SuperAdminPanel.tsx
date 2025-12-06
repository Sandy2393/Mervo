/**
 * Super Admin Panel — Stub for super admin features
 * TODO: Implement with proper RLS and audit logging
 */


import { Card, CardBody } from '../../components/ui/Card';
import { useEffect, useState } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';

type Summary = {
  totalCompanies: number;
  activeCompanies: number;
  overdueInvoices: number;
  mrr: number;
};

export default function SuperAdminPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [billingRes, companiesRes] = await Promise.all([
          superAdminFetch('/api/super-admin/billing/dashboard'),
          superAdminFetch('/api/super-admin/companies?limit=5'),
        ]);
        const billing = billingRes.ok ? await billingRes.json() : null;
        const companies = companiesRes.ok ? await companiesRes.json() : { items: [] };
        setSummary({
          totalCompanies: companies.items?.length || 0,
          activeCompanies: (companies.items || []).filter((c: any) => c.status === 'active').length,
          overdueInvoices: billing?.summary?.overdueInvoices || 0,
          mrr: billing?.summary?.totalMRR || 0,
        });
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-600 mt-2">System administration and company management</p>
        </div>
        <div className="text-sm text-gray-600">{summary ? `${summary.totalCompanies} companies` : 'Loading...'}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Companies</h2>
                <p className="text-sm text-gray-600">Active: {summary?.activeCompanies ?? '—'}</p>
              </div>
              <a className="text-blue-600 text-sm" href="/super-admin/companies">Open</a>
            </div>
            <div className="text-sm text-gray-700 mt-3">List, suspend, activate companies</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Billing</h2>
                <p className="text-sm text-gray-600">MRR: {summary ? `$${summary.mrr}` : '—'}</p>
              </div>
              <a className="text-blue-600 text-sm" href="/super-admin/billing">Open</a>
            </div>
            <div className="text-sm text-gray-700 mt-3">Invoices, MRR, coupons</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Audit Logs</h2>
                <p className="text-sm text-gray-600">Search and export</p>
              </div>
              <a className="text-blue-600 text-sm" href="/super-admin/audit">Open</a>
            </div>
            <div className="text-sm text-gray-700 mt-3">View system audit trail</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Storage & Offline</h2>
                <p className="text-sm text-gray-600">Health & retries</p>
              </div>
              <div className="space-x-3 text-sm">
                <a className="text-blue-600" href="/super-admin/storage">Storage</a>
                <a className="text-blue-600" href="/super-admin/offline">Offline</a>
              </div>
            </div>
            <div className="text-sm text-gray-700 mt-3">Manage storage and sync retries</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
