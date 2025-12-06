import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Coupon Manager (Super Admin)
 * Create, view, and manage discount coupons
 */
import { useState, useEffect } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';
export default function CouponManager() {
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    // Form state
    const [formData, setFormData] = useState({
        couponCode: '',
        discountType: 'percentage',
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
            const res = await superAdminFetch('/api/super-admin/billing/coupons');
            const data = await res.json();
            setCoupons(data);
        }
        catch (error) {
            console.error('Error fetching coupons:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchStats = async () => {
        try {
            const res = await superAdminFetch('/api/super-admin/billing/coupons/stats');
            const data = await res.json();
            setStats(data);
        }
        catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!formData.couponCode || formData.discountValue <= 0) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            await superAdminFetch('/api/super-admin/billing/coupons', {
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
        }
        catch (error) {
            alert('Failed to create coupon');
        }
    };
    const filteredCoupons = coupons.filter(c => filterStatus === 'all' || c.status === filterStatus);
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
    };
    if (loading) {
        return _jsx("div", { className: "p-8", children: "Loading coupons..." });
    }
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Coupon Manager" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Create and manage discount codes" })] }), _jsx("button", { onClick: () => setShowCreateForm(!showCreateForm), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: showCreateForm ? 'Cancel' : 'Create Coupon' })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Total Coupons" }), _jsx("div", { className: "text-3xl font-bold text-gray-900", children: stats.totalCoupons })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Active Coupons" }), _jsx("div", { className: "text-3xl font-bold text-green-600", children: stats.activeCoupons })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Total Usage" }), _jsx("div", { className: "text-3xl font-bold text-blue-600", children: stats.totalUsage })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Discount Given" }), _jsx("div", { className: "text-3xl font-bold text-purple-600", children: formatCurrency(stats.totalDiscountGiven) })] })] })), showCreateForm && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Create New Coupon" }), _jsxs("form", { onSubmit: handleCreateCoupon, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Coupon Code *" }), _jsx("input", { type: "text", value: formData.couponCode, onChange: (e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() }), placeholder: "SAVE20", className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Discount Type *" }), _jsxs("select", { value: formData.discountType, onChange: (e) => setFormData({ ...formData, discountType: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "percentage", children: "Percentage Off" }), _jsx("option", { value: "fixed_amount", children: "Fixed Amount Off" }), _jsx("option", { value: "trial_days", children: "Free Trial Days" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Discount Value *" }), _jsx("input", { type: "number", value: formData.discountValue, onChange: (e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) }), placeholder: formData.discountType === 'percentage' ? '20' : '50', className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", required: true, min: "0", step: "0.01" }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [formData.discountType === 'percentage' && '% off', formData.discountType === 'fixed_amount' && 'AUD', formData.discountType === 'trial_days' && 'days'] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Expires At (Optional)" }), _jsx("input", { type: "date", value: formData.expiresAt, onChange: (e) => setFormData({ ...formData, expiresAt: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Usage Limit (Optional)" }), _jsx("input", { type: "number", value: formData.usageLimit, onChange: (e) => setFormData({ ...formData, usageLimit: e.target.value }), placeholder: "100", className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", min: "1" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Max companies that can use this" })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: formData.recurring, onChange: (e) => setFormData({ ...formData, recurring: e.target.checked }), className: "mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "Recurring (applies every month)" })] }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes (Optional)" }), _jsx("textarea", { value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), placeholder: "Internal notes about this coupon...", rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", className: "px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700", children: "Create Coupon" }), _jsx("button", { type: "button", onClick: () => setShowCreateForm(false), className: "px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400", children: "Cancel" })] })] })] })), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "All Coupons" }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "px-3 py-2 border border-gray-300 rounded text-sm", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "expired", children: "Expired" }), _jsx("option", { value: "suspended", children: "Suspended" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 text-left text-sm text-gray-600", children: [_jsx("th", { className: "pb-3", children: "Code" }), _jsx("th", { className: "pb-3", children: "Type" }), _jsx("th", { className: "pb-3", children: "Value" }), _jsx("th", { className: "pb-3", children: "Usage" }), _jsx("th", { className: "pb-3", children: "Expires" }), _jsx("th", { className: "pb-3", children: "Status" }), _jsx("th", { className: "pb-3", children: "Notes" })] }) }), _jsx("tbody", { children: filteredCoupons.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-gray-500", children: "No coupons found" }) })) : (filteredCoupons.map((coupon) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 font-mono font-bold text-gray-900", children: coupon.couponCode }), _jsxs("td", { className: "py-3", children: [_jsx("span", { className: "px-2 py-1 text-xs rounded bg-gray-100 text-gray-700", children: coupon.discountType }), coupon.recurring && (_jsx("span", { className: "ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700", children: "recurring" }))] }), _jsxs("td", { className: "py-3 font-medium", children: [coupon.discountType === 'percentage' && `${coupon.discountValue}%`, coupon.discountType === 'fixed_amount' && formatCurrency(coupon.discountValue), coupon.discountType === 'trial_days' && `${coupon.discountValue} days`] }), _jsxs("td", { className: "py-3", children: [coupon.usageCount, coupon.usageLimit && ` / ${coupon.usageLimit}`] }), _jsx("td", { className: "py-3 text-sm text-gray-600", children: coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never' }), _jsx("td", { className: "py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${coupon.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        coupon.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800'}`, children: coupon.status }) }), _jsx("td", { className: "py-3 text-sm text-gray-600 max-w-xs truncate", children: coupon.notes || '-' })] }, coupon.id)))) })] }) }), _jsxs("div", { className: "mt-4 text-sm text-gray-500", children: ["Showing ", filteredCoupons.length, " of ", coupons.length, " coupons"] })] })] }));
}
