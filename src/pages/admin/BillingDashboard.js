import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Company Billing Dashboard
 * Shows usage gauges, estimated bill, invoice history, and upgrade options
 */
import { useState, useEffect } from 'react';
export default function BillingDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [invoices, setInvoices] = useState([]);
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
        }
        catch (error) {
            console.error('Error fetching billing data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleApplyCoupon = async () => {
        if (!couponCode.trim())
            return;
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
        }
        catch (error) {
            setCouponError(error instanceof Error ? error.message : 'Failed to apply coupon');
        }
        finally {
            setApplyingCoupon(false);
        }
    };
    const handleRemoveCoupon = async () => {
        try {
            await fetch('/api/billing/coupon', { method: 'DELETE' });
            await fetchBillingData();
        }
        catch (error) {
            console.error('Error removing coupon:', error);
        }
    };
    const getAlertColor = (alertLevel) => {
        switch (alertLevel) {
            case 'normal': return 'bg-green-500';
            case 'warning': return 'bg-yellow-500';
            case 'critical': return 'bg-orange-500';
            case 'exceeded': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    if (loading || !dashboard) {
        return _jsx("div", { className: "p-8", children: "Loading billing information..." });
    }
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Billing & Usage" }), _jsxs("p", { className: "text-gray-600 mt-2", children: ["Current Plan: ", _jsx("span", { className: "font-semibold", children: dashboard.company.planName }), " \u2014 ", formatCurrency(dashboard.company.monthlyCost), "/month"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-4", children: "Contractors" }), _jsxs("div", { className: "flex items-end justify-between mb-2", children: [_jsx("div", { className: "text-3xl font-bold text-gray-900", children: dashboard.usage.contractors.current }), _jsxs("div", { className: "text-sm text-gray-600", children: ["/ ", dashboard.usage.contractors.limit] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3 mb-2", children: _jsx("div", { className: `h-3 rounded-full transition-all ${getAlertColor(dashboard.usage.contractors.alertLevel)}`, style: { width: `${Math.min(dashboard.usage.contractors.percentage, 100)}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500", children: [dashboard.usage.contractors.percentage.toFixed(0), "% used", dashboard.usage.contractors.percentage > 100 && (_jsxs("span", { className: "text-red-600 font-medium ml-2", children: ["+", dashboard.usage.contractors.current - dashboard.usage.contractors.limit, " overage"] }))] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-4", children: "Storage" }), _jsxs("div", { className: "flex items-end justify-between mb-2", children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900", children: [dashboard.usage.storage.current.toFixed(1), " GB"] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["/ ", dashboard.usage.storage.limit, " GB"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3 mb-2", children: _jsx("div", { className: `h-3 rounded-full transition-all ${getAlertColor(dashboard.usage.storage.alertLevel)}`, style: { width: `${Math.min(dashboard.usage.storage.percentage, 100)}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500", children: [dashboard.usage.storage.percentage.toFixed(0), "% used", dashboard.usage.storage.percentage > 100 && (_jsxs("span", { className: "text-red-600 font-medium ml-2", children: ["+", (dashboard.usage.storage.current - dashboard.usage.storage.limit).toFixed(1), " GB overage"] }))] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-4", children: "API Calls (Month)" }), _jsxs("div", { className: "flex items-end justify-between mb-2", children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900", children: [(dashboard.usage.apiCalls.current / 1000).toFixed(0), "k"] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["/ ", (dashboard.usage.apiCalls.limit / 1000).toFixed(0), "k"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3 mb-2", children: _jsx("div", { className: `h-3 rounded-full transition-all ${getAlertColor(dashboard.usage.apiCalls.alertLevel)}`, style: { width: `${Math.min(dashboard.usage.apiCalls.percentage, 100)}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500", children: [dashboard.usage.apiCalls.percentage.toFixed(0), "% used", dashboard.usage.apiCalls.percentage > 100 && (_jsxs("span", { className: "text-red-600 font-medium ml-2", children: ["+", ((dashboard.usage.apiCalls.current - dashboard.usage.apiCalls.limit) / 1000).toFixed(0), "k overage"] }))] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Estimated Bill for This Month" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-gray-700", children: [_jsxs("span", { children: ["Base Plan (", dashboard.company.planName, ")"] }), _jsx("span", { className: "font-medium", children: formatCurrency(dashboard.billing.baseCost) })] }), dashboard.billing.overageCost > 0 && (_jsxs("div", { className: "flex justify-between text-orange-600", children: [_jsx("span", { children: "Usage Overages" }), _jsxs("span", { className: "font-medium", children: ["+", formatCurrency(dashboard.billing.overageCost)] })] })), dashboard.billing.couponDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-green-600", children: [_jsxs("span", { children: ["Coupon Discount (", dashboard.activeCoupon?.code, ")"] }), _jsxs("span", { className: "font-medium", children: ["-", formatCurrency(dashboard.billing.couponDiscount)] })] })), _jsxs("div", { className: "flex justify-between text-gray-600 text-sm", children: [_jsx("span", { children: "GST (10%)" }), _jsx("span", { children: formatCurrency(dashboard.billing.taxAmount) })] }), _jsxs("div", { className: "pt-3 border-t border-gray-300 flex justify-between text-lg font-bold text-gray-900", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: formatCurrency(dashboard.billing.estimatedTotal) })] })] }), _jsx("p", { className: "text-xs text-gray-500 mt-4", children: "* This is an estimate based on current usage. Final invoice generated at month end." })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Discount Coupons" }), dashboard.activeCoupon ? (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-green-900", children: ["Active Coupon: ", dashboard.activeCoupon.code] }), _jsxs("p", { className: "text-sm text-green-700 mt-1", children: [dashboard.activeCoupon.discountType === 'percentage'
                                                    ? `${dashboard.activeCoupon.discountValue}% off`
                                                    : `${formatCurrency(dashboard.activeCoupon.discountValue)} off`, dashboard.activeCoupon.recurring && ' (recurring)'] })] }), _jsx("button", { onClick: handleRemoveCoupon, className: "px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50", children: "Remove" })] }) })) : (_jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "text", placeholder: "Enter coupon code", value: couponCode, onChange: (e) => setCouponCode(e.target.value.toUpperCase()), disabled: applyingCoupon, className: "flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }), _jsx("button", { onClick: handleApplyCoupon, disabled: !couponCode.trim() || applyingCoupon, className: "px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: applyingCoupon ? 'Applying...' : 'Apply' })] })), couponError && (_jsx("p", { className: "text-sm text-red-600 mt-2", children: couponError }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Invoice History" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 text-left text-sm text-gray-600", children: [_jsx("th", { className: "pb-3", children: "Invoice #" }), _jsx("th", { className: "pb-3", children: "Period" }), _jsx("th", { className: "pb-3", children: "Amount" }), _jsx("th", { className: "pb-3", children: "Status" }), _jsx("th", { className: "pb-3", children: "Due Date" }), _jsx("th", { className: "pb-3" })] }) }), _jsx("tbody", { children: invoices.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-8 text-center text-gray-500", children: "No invoices yet" }) })) : (invoices.map((invoice) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 font-medium text-gray-900", children: invoice.invoiceNumber }), _jsxs("td", { className: "py-3 text-gray-700", children: [formatDate(invoice.periodStart), " - ", formatDate(invoice.periodEnd)] }), _jsx("td", { className: "py-3 font-medium text-gray-900", children: formatCurrency(invoice.totalDue) }), _jsx("td", { className: "py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`, children: invoice.status }) }), _jsx("td", { className: "py-3 text-gray-700", children: formatDate(invoice.dueDate) }), _jsx("td", { className: "py-3", children: _jsx("button", { onClick: () => window.open(`/api/billing/invoices/${invoice.id}/pdf`, '_blank'), className: "px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700", children: "Download" }) })] }, invoice.id)))) })] }) })] }), dashboard.billing.overageCost > 10 && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg shadow p-6 mt-8", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-blue-900", children: "Upgrade Your Plan" }), _jsx("p", { className: "text-blue-700 mt-2", children: "You're frequently exceeding your plan limits. Upgrading could save you money on overage charges." })] }), _jsx("button", { onClick: () => window.location.href = '/admin/billing/upgrade', className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "View Plans" })] }) }))] }));
}
