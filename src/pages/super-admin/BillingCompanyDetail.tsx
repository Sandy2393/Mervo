/**
 * Company Billing Detail View (Super Admin)
 * Detailed billing breakdown for a specific company
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface CompanyBillingDetail {
  dashboard: {
    company: {
      id: string;
      name: string;
      planTier: string;
      planName: string;
      monthlyCost: number;
      status: string;
    };
    usage: {
      contractors: { current: number; limit: number; percentage: number };
      storage: { current: number; limit: number; percentage: number };
      apiCalls: { current: number; limit: number; percentage: number };
    };
    billing: {
      baseCost: number;
      overageCost: number;
      couponDiscount: number;
      taxAmount: number;
      estimatedTotal: number;
    };
    activeCoupon: {
      code: string;
      discountType: string;
      discountValue: number;
    } | null;
  };
  trend: Array<{
    date: string;
    storageGb: number;
    apiCalls: number;
    contractors: number;
  }>;
  breakdown: {
    jobPhotos: number;
    jobReports: number;
    timesheets: number;
    exports: number;
    total: number;
  };
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    periodStart: string;
    periodEnd: string;
    totalDue: number;
    status: string;
  }>;
}

export default function BillingCompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const [data, setData] = useState<CompanyBillingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetail();
    }
  }, [companyId]);

  const fetchCompanyDetail = async () => {
    try {
      const res = await fetch(`/api/super-admin/billing/company/${companyId}`);
      const detail = await res.json();
      setData(detail);
    } catch (error) {
      console.error('Error fetching company detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Suspend this company? They will lose access immediately.')) return;
    
    const reason = prompt('Suspension reason:');
    if (!reason) return;

    try {
      await fetch(`/api/super-admin/billing/company/${companyId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      alert('Company suspended');
      fetchCompanyDetail();
    } catch (error) {
      alert('Failed to suspend company');
    }
  };

  const handleUnsuspend = async () => {
    if (!confirm('Restore access for this company?')) return;

    try {
      await fetch(`/api/super-admin/billing/company/${companyId}/unsuspend`, {
        method: 'POST',
      });
      alert('Company unsuspended');
      fetchCompanyDetail();
    } catch (error) {
      alert('Failed to unsuspend company');
    }
  };

  const handleApplyCoupon = async () => {
    try {
      await fetch(`/api/super-admin/billing/company/${companyId}/apply-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
      });
      setShowCouponForm(false);
      setCouponCode('');
      alert('Coupon applied');
      fetchCompanyDetail();
    } catch (error) {
      alert('Failed to apply coupon');
    }
  };

  const handleChangePlan = async () => {
    const newTier = prompt('Enter new plan tier (starter/professional/enterprise/custom):');
    if (!newTier || !['starter', 'professional', 'enterprise', 'custom'].includes(newTier)) {
      alert('Invalid tier');
      return;
    }

    if (!confirm(`Change plan to ${newTier}?`)) return;

    try {
      await fetch(`/api/super-admin/billing/company/${companyId}/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTier }),
      });
      alert('Plan changed');
      fetchCompanyDetail();
    } catch (error) {
      alert('Failed to change plan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading || !data) {
    return <div className="p-8">Loading company details...</div>;
  }

  const { dashboard, trend, breakdown, invoices } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700 mb-2 text-sm"
          >
            ← Back to Overview
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{dashboard.company.name}</h1>
          <p className="text-gray-600 mt-2">
            {dashboard.company.planName} Plan — {formatCurrency(dashboard.company.monthlyCost)}/month
          </p>
        </div>
        <div className="flex gap-2">
          {dashboard.company.status === 'active' ? (
            <button
              onClick={handleSuspend}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Suspend Account
            </button>
          ) : (
            <button
              onClick={handleUnsuspend}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Unsuspend Account
            </button>
          )}
          <button
            onClick={handleChangePlan}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Change Plan
          </button>
        </div>
      </div>

      {/* Current Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Contractors</h3>
          <div className="text-2xl font-bold text-gray-900">
            {dashboard.usage.contractors.current} / {dashboard.usage.contractors.limit}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {dashboard.usage.contractors.percentage.toFixed(0)}% used
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Storage</h3>
          <div className="text-2xl font-bold text-gray-900">
            {dashboard.usage.storage.current.toFixed(1)} / {dashboard.usage.storage.limit} GB
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {dashboard.usage.storage.percentage.toFixed(0)}% used
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">API Calls (Month)</h3>
          <div className="text-2xl font-bold text-gray-900">
            {(dashboard.usage.apiCalls.current / 1000).toFixed(0)}k / {(dashboard.usage.apiCalls.limit / 1000).toFixed(0)}k
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {dashboard.usage.apiCalls.percentage.toFixed(0)}% used
          </div>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Estimated Bill (This Month)</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Plan</span>
            <span className="font-medium">{formatCurrency(dashboard.billing.baseCost)}</span>
          </div>
          {dashboard.billing.overageCost > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Overage Charges</span>
              <span className="font-medium">+{formatCurrency(dashboard.billing.overageCost)}</span>
            </div>
          )}
          {dashboard.billing.couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({dashboard.activeCoupon?.code})</span>
              <span className="font-medium">-{formatCurrency(dashboard.billing.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST (10%)</span>
            <span>{formatCurrency(dashboard.billing.taxAmount)}</span>
          </div>
          <div className="pt-2 border-t flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(dashboard.billing.estimatedTotal)}</span>
          </div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Storage Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(breakdown).filter(([key]) => key !== 'total').map(([key, value]) => {
            const percentage = breakdown.total > 0 ? (value / breakdown.total) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{value.toFixed(2)} GB ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Usage Trend (Last 30 Days)</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Line chart visualization</p>
            <p className="text-sm text-gray-400">
              {trend.length} data points available
            </p>
          </div>
        </div>
      </div>

      {/* Coupon Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coupon Management</h2>
        {dashboard.activeCoupon ? (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-medium text-green-900">Active: {dashboard.activeCoupon.code}</p>
            <p className="text-sm text-green-700">
              {dashboard.activeCoupon.discountType === 'percentage'
                ? `${dashboard.activeCoupon.discountValue}% off`
                : `${formatCurrency(dashboard.activeCoupon.discountValue)} off`}
            </p>
          </div>
        ) : showCouponForm ? (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Apply
            </button>
            <button
              onClick={() => setShowCouponForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCouponForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Coupon
          </button>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice History</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-600">
              <th className="pb-3">Invoice #</th>
              <th className="pb-3">Period</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">No invoices</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100">
                  <td className="py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="py-3">{formatDate(inv.periodStart)} - {formatDate(inv.periodEnd)}</td>
                  <td className="py-3">{formatCurrency(inv.totalDue)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                      inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
