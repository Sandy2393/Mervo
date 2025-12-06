/**
 * Coupon Manager (Super Admin)
 * Create, view, and manage discount coupons
 */

import { useState, useEffect } from 'react';

interface CouponDefinition {
  id: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed_amount' | 'trial_days';
  discountValue: number;
  recurring: boolean;
  activeFrom: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  topCoupons: Array<{
    code: string;
    usage: number;
    discount: number;
  }>;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<CouponDefinition[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    couponCode: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount' | 'trial_days',
    discountValue: 0,
    recurring: false,
    expiresAt: '',
    usageLimit: '',
    notes: '',
  });

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/super-admin/billing/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/super-admin/billing/coupons/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.couponCode || formData.discountValue <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await fetch('/api/super-admin/billing/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: formData.couponCode,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          recurring: formData.recurring,
          expiresAt: formData.expiresAt || null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          notes: formData.notes || null,
        }),
      });

      alert('Coupon created successfully');
      setShowCreateForm(false);
      setFormData({
        couponCode: '',
        discountType: 'percentage',
        discountValue: 0,
        recurring: false,
        expiresAt: '',
        usageLimit: '',
        notes: '',
      });
      fetchCoupons();
      fetchStats();
    } catch (error) {
      alert('Failed to create coupon');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    filterStatus === 'all' || c.status === filterStatus
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  if (loading) {
    return <div className="p-8">Loading coupons...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Coupons</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCoupons}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Active Coupons</div>
            <div className="text-3xl font-bold text-green-600">{stats.activeCoupons}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Usage</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsage}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Discount Given</div>
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalDiscountGiven)}</div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Coupon</h2>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed_amount">Fixed Amount Off</option>
                  <option value="trial_days">Free Trial Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discountType === 'percentage' && '% off'}
                  {formData.discountType === 'fixed_amount' && 'AUD'}
                  {formData.discountType === 'trial_days' && 'days'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Max companies that can use this</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring (applies every month)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this coupon..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Coupon
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Coupons</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th className="pb-3">Code</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Usage</th>
                <th className="pb-3">Expires</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No coupons found
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-100">
                    <td className="py-3 font-mono font-bold text-gray-900">{coupon.couponCode}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                        {coupon.discountType}
                      </span>
                      {coupon.recurring && (
                        <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                          recurring
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-medium">
                      {coupon.discountType === 'percentage' && `${coupon.discountValue}%`}
                      {coupon.discountType === 'fixed_amount' && formatCurrency(coupon.discountValue)}
                      {coupon.discountType === 'trial_days' && `${coupon.discountValue} days`}
                    </td>
                    <td className="py-3">
                      {coupon.usageCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        coupon.status === 'active' ? 'bg-green-100 text-green-800' :
                        coupon.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 max-w-xs truncate">
                      {coupon.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </div>
      </div>
    </div>
  );
}
