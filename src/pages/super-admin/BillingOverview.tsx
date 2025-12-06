/**
 * Super Admin Billing Overview
 * Shows MRR, revenue trends, all companies, and system-wide billing metrics
 */

import { useState, useEffect } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';

interface SuperAdminDashboard {
  summary: {
    totalMRR: number;
    activeSubscriptions: number;
    companiesOverLimit: number;
    overdueInvoices: number;
  };
  companies: Array<{
    id: string;
    name: string;
    planTier: string;
    monthlyCost: number;
    usageCost: number;
    totalCost: number;
    status: string;
  }>;
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export default function BillingOverview() {
  const [dashboard, setDashboard] = useState<SuperAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'name' | 'totalCost'>('totalCost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await superAdminFetch('/api/super-admin/billing/dashboard');
      const data = await res.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field: 'name' | 'totalCost') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCompanies = dashboard?.companies
    ?.filter(c => filterStatus === 'all' || c.status === filterStatus)
    ?.sort((a, b) => {
      const aVal = sortField === 'name' ? a.name : a.totalCost;
      const bVal = sortField === 'name' ? b.name : b.totalCost;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }) || [];

  if (loading || !dashboard) {
    return <div className="p-8">Loading billing overview...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing Overview</h1>
        <p className="text-gray-600 mt-2">System-wide billing metrics and revenue tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Monthly Recurring Revenue</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(dashboard.summary.totalMRR)}</div>
          <div className="text-xs text-gray-500 mt-2">
            {dashboard.summary.activeSubscriptions} active subscriptions
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Revenue This Month</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(dashboard.revenue.thisMonth)}</div>
          <div className={`text-xs mt-2 ${dashboard.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboard.revenue.growth >= 0 ? '↑' : '↓'} {Math.abs(dashboard.revenue.growth).toFixed(1)}% vs last month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Over Usage Limit</div>
          <div className="text-3xl font-bold text-orange-600">{dashboard.summary.companiesOverLimit}</div>
          <div className="text-xs text-gray-500 mt-2">Companies exceeding limits</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Overdue Invoices</div>
          <div className="text-3xl font-bold text-red-600">{dashboard.summary.overdueInvoices}</div>
          <div className="text-xs text-gray-500 mt-2">Require attention</div>
        </div>
      </div>

      {/* Revenue Trend Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Chart visualization</p>
            <p className="text-sm text-gray-400">Integrate Chart.js or Recharts for line chart</p>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Companies</h2>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => window.location.href = '/super-admin/billing/coupons'}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Manage Coupons
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th 
                  className="pb-3 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('name')}
                >
                  Company {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="pb-3">Plan</th>
                <th className="pb-3 text-right">Base Cost</th>
                <th className="pb-3 text-right">Overage</th>
                <th 
                  className="pb-3 text-right cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('totalCost')}
                >
                  Total {sortField === 'totalCost' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                filteredAndSortedCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{company.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTierBadgeColor(company.planTier)}`}>
                        {company.planTier}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(company.monthlyCost)}</td>
                    <td className="py-3 text-right">
                      {company.usageCost > 0 ? (
                        <span className="text-orange-600 font-medium">+{formatCurrency(company.usageCost)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(company.totalCost)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        company.status === 'active' ? 'bg-green-100 text-green-800' :
                        company.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => window.location.href = `/super-admin/billing/company/${company.id}`}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredAndSortedCompanies.length} of {dashboard.companies.length} companies
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={async () => {
            if (confirm('Generate invoices for all companies for the previous month?')) {
              await superAdminFetch('/api/super-admin/billing/process-monthly', { method: 'POST' });
              alert('Monthly billing processed');
              fetchDashboard();
            }
          }}
          className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Process Monthly Billing
        </button>
        
        <button
          onClick={async () => {
            if (confirm('Suspend all companies with invoices 7+ days overdue?')) {
              const res = await superAdminFetch('/api/super-admin/billing/suspend-overdue', { method: 'POST' });
              const data = await res.json();
              alert(`Suspended ${data.suspended} companies`);
              fetchDashboard();
            }
          }}
          className="px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Suspend Overdue Accounts
        </button>
        
        <button
          onClick={async () => {
            const res = await superAdminFetch('/api/super-admin/billing/send-usage-alerts', { method: 'POST' });
            const data = await res.json();
            alert(`Sent ${data.alertsSent} usage alerts`);
          }}
          className="px-4 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
        >
          Send Usage Alerts
        </button>
      </div>
    </div>
  );
}
