/**
 * Company Billing Dashboard
 * Shows usage gauges, estimated bill, invoice history, and upgrade options
 */

import { useState, useEffect } from 'react';

interface BillingDashboardData {
  company: {
    planTier: string;
    planName: string;
    monthlyCost: number;
    status: string;
  };
  usage: {
    contractors: { current: number; limit: number; percentage: number; alertLevel: string };
    storage: { current: number; limit: number; percentage: number; alertLevel: string };
    apiCalls: { current: number; limit: number; percentage: number; alertLevel: string };
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
    recurring: boolean;
  } | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  totalDue: number;
  paidAmount: number;
  status: string;
  dueDate: string;
}

export default function BillingDashboard() {
  const [dashboard, setDashboard] = useState<BillingDashboardData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [dashboardRes, invoicesRes] = await Promise.all([
        fetch('/api/billing/dashboard'),
        fetch('/api/billing/invoices?limit=6'),
      ]);

      const dashboardData = await dashboardRes.json();
      const invoicesData = await invoicesRes.json();

      setDashboard(dashboardData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/billing/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to apply coupon');
      }

      setCouponCode('');
      await fetchBillingData();
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await fetch('/api/billing/coupon', { method: 'DELETE' });
      await fetchBillingData();
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  };

  const getAlertColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-orange-500';
      case 'exceeded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading || !dashboard) {
    return <div className="p-8">Loading billing information...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
        <p className="text-gray-600 mt-2">
          Current Plan: <span className="font-semibold">{dashboard.company.planName}</span> — {formatCurrency(dashboard.company.monthlyCost)}/month
        </p>
      </div>

      {/* Usage Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Contractors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Contractors</h3>
          <div className="flex items-end justify-between mb-2">
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.usage.contractors.current}
            </div>
            <div className="text-sm text-gray-600">
              / {dashboard.usage.contractors.limit}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${getAlertColor(dashboard.usage.contractors.alertLevel)}`}
              style={{ width: `${Math.min(dashboard.usage.contractors.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {dashboard.usage.contractors.percentage.toFixed(0)}% used
            {dashboard.usage.contractors.percentage > 100 && (
              <span className="text-red-600 font-medium ml-2">
                +{dashboard.usage.contractors.current - dashboard.usage.contractors.limit} overage
              </span>
            )}
          </p>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Storage</h3>
          <div className="flex items-end justify-between mb-2">
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.usage.storage.current.toFixed(1)} GB
            </div>
            <div className="text-sm text-gray-600">
              / {dashboard.usage.storage.limit} GB
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${getAlertColor(dashboard.usage.storage.alertLevel)}`}
              style={{ width: `${Math.min(dashboard.usage.storage.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {dashboard.usage.storage.percentage.toFixed(0)}% used
            {dashboard.usage.storage.percentage > 100 && (
              <span className="text-red-600 font-medium ml-2">
                +{(dashboard.usage.storage.current - dashboard.usage.storage.limit).toFixed(1)} GB overage
              </span>
            )}
          </p>
        </div>

        {/* API Calls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">API Calls (Month)</h3>
          <div className="flex items-end justify-between mb-2">
            <div className="text-3xl font-bold text-gray-900">
              {(dashboard.usage.apiCalls.current / 1000).toFixed(0)}k
            </div>
            <div className="text-sm text-gray-600">
              / {(dashboard.usage.apiCalls.limit / 1000).toFixed(0)}k
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${getAlertColor(dashboard.usage.apiCalls.alertLevel)}`}
              style={{ width: `${Math.min(dashboard.usage.apiCalls.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {dashboard.usage.apiCalls.percentage.toFixed(0)}% used
            {dashboard.usage.apiCalls.percentage > 100 && (
              <span className="text-red-600 font-medium ml-2">
                +{((dashboard.usage.apiCalls.current - dashboard.usage.apiCalls.limit) / 1000).toFixed(0)}k overage
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Estimated Bill */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Estimated Bill for This Month</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Base Plan ({dashboard.company.planName})</span>
            <span className="font-medium">{formatCurrency(dashboard.billing.baseCost)}</span>
          </div>
          
          {dashboard.billing.overageCost > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Usage Overages</span>
              <span className="font-medium">+{formatCurrency(dashboard.billing.overageCost)}</span>
            </div>
          )}

          {dashboard.billing.couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount ({dashboard.activeCoupon?.code})</span>
              <span className="font-medium">-{formatCurrency(dashboard.billing.couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 text-sm">
            <span>GST (10%)</span>
            <span>{formatCurrency(dashboard.billing.taxAmount)}</span>
          </div>

          <div className="pt-3 border-t border-gray-300 flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(dashboard.billing.estimatedTotal)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          * This is an estimate based on current usage. Final invoice generated at month end.
        </p>
      </div>

      {/* Coupon Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Discount Coupons</h2>
        
        {dashboard.activeCoupon ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-green-900">Active Coupon: {dashboard.activeCoupon.code}</p>
                <p className="text-sm text-green-700 mt-1">
                  {dashboard.activeCoupon.discountType === 'percentage' 
                    ? `${dashboard.activeCoupon.discountValue}% off`
                    : `${formatCurrency(dashboard.activeCoupon.discountValue)} off`}
                  {dashboard.activeCoupon.recurring && ' (recurring)'}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={applyingCoupon}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || applyingCoupon}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applyingCoupon ? 'Applying...' : 'Apply'}
            </button>
          </div>
        )}
        
        {couponError && (
          <p className="text-sm text-red-600 mt-2">{couponError}</p>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th className="pb-3">Invoice #</th>
                <th className="pb-3">Period</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No invoices yet
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="py-3 text-gray-700">
                      {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                    </td>
                    <td className="py-3 font-medium text-gray-900">
                      {formatCurrency(invoice.totalDue)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700">{formatDate(invoice.dueDate)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => window.open(`/api/billing/invoices/${invoice.id}/pdf`, '_blank')}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade CTA */}
      {dashboard.billing.overageCost > 10 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6 mt-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Upgrade Your Plan</h3>
              <p className="text-blue-700 mt-2">
                You're frequently exceeding your plan limits. Upgrading could save you money on overage charges.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/admin/billing/upgrade'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
