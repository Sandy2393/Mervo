import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Company Billing Detail View (Super Admin)
 * Detailed billing breakdown for a specific company
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { superAdminFetch } from '../../lib/session/companyContext';
export default function BillingCompanyDetail() {
    const { companyId } = useParams();
    const [data, setData] = useState(null);
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
            const res = await superAdminFetch(`/api/super-admin/billing/company/${companyId}`);
            const detail = await res.json();
            setData(detail);
        }
        catch (error) {
            console.error('Error fetching company detail:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSuspend = async () => {
        if (!confirm('Suspend this company? They will lose access immediately.'))
            return;
        const reason = prompt('Suspension reason:');
        if (!reason)
            return;
        try {
            await superAdminFetch(`/api/super-admin/billing/company/${companyId}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            alert('Company suspended');
            fetchCompanyDetail();
        }
        catch (error) {
            alert('Failed to suspend company');
        }
    };
    const handleUnsuspend = async () => {
        if (!confirm('Restore access for this company?'))
            return;
        try {
            await superAdminFetch(`/api/super-admin/billing/company/${companyId}/unsuspend`, {
                method: 'POST',
            });
            alert('Company unsuspended');
            fetchCompanyDetail();
        }
        catch (error) {
            alert('Failed to unsuspend company');
        }
    };
    const handleApplyCoupon = async () => {
        try {
            await superAdminFetch(`/api/super-admin/billing/company/${companyId}/apply-coupon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode }),
            });
            setShowCouponForm(false);
            setCouponCode('');
            alert('Coupon applied');
            fetchCompanyDetail();
        }
        catch (error) {
            alert('Failed to apply coupon');
        }
    };
    const handleChangePlan = async () => {
        const newTier = prompt('Enter new plan tier (starter/professional/enterprise/custom):');
        if (!newTier || !['starter', 'professional', 'enterprise', 'custom'].includes(newTier)) {
            alert('Invalid tier');
            return;
        }
        if (!confirm(`Change plan to ${newTier}?`))
            return;
        try {
            await superAdminFetch(`/api/super-admin/billing/company/${companyId}/change-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newTier }),
            });
            alert('Plan changed');
            fetchCompanyDetail();
        }
        catch (error) {
            alert('Failed to change plan');
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    if (loading || !data) {
        return _jsx("div", { className: "p-8", children: "Loading company details..." });
    }
    const { dashboard, trend, breakdown, invoices } = data;
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("button", { onClick: () => window.history.back(), className: "text-blue-600 hover:text-blue-700 mb-2 text-sm", children: "\u2190 Back to Overview" }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: dashboard.company.name }), _jsxs("p", { className: "text-gray-600 mt-2", children: [dashboard.company.planName, " Plan \u2014 ", formatCurrency(dashboard.company.monthlyCost), "/month"] })] }), _jsxs("div", { className: "flex gap-2", children: [dashboard.company.status === 'active' ? (_jsx("button", { onClick: handleSuspend, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm", children: "Suspend Account" })) : (_jsx("button", { onClick: handleUnsuspend, className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm", children: "Unsuspend Account" })), _jsx("button", { onClick: handleChangePlan, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm", children: "Change Plan" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-2", children: "Contractors" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [dashboard.usage.contractors.current, " / ", dashboard.usage.contractors.limit] }), _jsxs("div", { className: "text-sm text-gray-600 mt-1", children: [dashboard.usage.contractors.percentage.toFixed(0), "% used"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-2", children: "Storage" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [dashboard.usage.storage.current.toFixed(1), " / ", dashboard.usage.storage.limit, " GB"] }), _jsxs("div", { className: "text-sm text-gray-600 mt-1", children: [dashboard.usage.storage.percentage.toFixed(0), "% used"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-500 mb-2", children: "API Calls (Month)" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [(dashboard.usage.apiCalls.current / 1000).toFixed(0), "k / ", (dashboard.usage.apiCalls.limit / 1000).toFixed(0), "k"] }), _jsxs("div", { className: "text-sm text-gray-600 mt-1", children: [dashboard.usage.apiCalls.percentage.toFixed(0), "% used"] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Estimated Bill (This Month)" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Base Plan" }), _jsx("span", { className: "font-medium", children: formatCurrency(dashboard.billing.baseCost) })] }), dashboard.billing.overageCost > 0 && (_jsxs("div", { className: "flex justify-between text-orange-600", children: [_jsx("span", { children: "Overage Charges" }), _jsxs("span", { className: "font-medium", children: ["+", formatCurrency(dashboard.billing.overageCost)] })] })), dashboard.billing.couponDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-green-600", children: [_jsxs("span", { children: ["Discount (", dashboard.activeCoupon?.code, ")"] }), _jsxs("span", { className: "font-medium", children: ["-", formatCurrency(dashboard.billing.couponDiscount)] })] })), _jsxs("div", { className: "flex justify-between text-sm text-gray-600", children: [_jsx("span", { children: "GST (10%)" }), _jsx("span", { children: formatCurrency(dashboard.billing.taxAmount) })] }), _jsxs("div", { className: "pt-2 border-t flex justify-between text-lg font-bold", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: formatCurrency(dashboard.billing.estimatedTotal) })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Storage Breakdown" }), _jsx("div", { className: "space-y-3", children: Object.entries(breakdown).filter(([key]) => key !== 'total').map(([key, value]) => {
                            const percentage = breakdown.total > 0 ? (value / breakdown.total) * 100 : 0;
                            return (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "capitalize", children: key.replace(/([A-Z])/g, ' $1').trim() }), _jsxs("span", { children: [value.toFixed(2), " GB (", percentage.toFixed(0), "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: { width: `${percentage}%` } }) })] }, key));
                        }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Usage Trend (Last 30 Days)" }), _jsx("div", { className: "h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-500 mb-2", children: "Line chart visualization" }), _jsxs("p", { className: "text-sm text-gray-400", children: [trend.length, " data points available"] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Coupon Management" }), dashboard.activeCoupon ? (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded p-4", children: [_jsxs("p", { className: "font-medium text-green-900", children: ["Active: ", dashboard.activeCoupon.code] }), _jsx("p", { className: "text-sm text-green-700", children: dashboard.activeCoupon.discountType === 'percentage'
                                    ? `${dashboard.activeCoupon.discountValue}% off`
                                    : `${formatCurrency(dashboard.activeCoupon.discountValue)} off` })] })) : showCouponForm ? (_jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "text", placeholder: "Coupon code", value: couponCode, onChange: (e) => setCouponCode(e.target.value.toUpperCase()), className: "flex-1 px-3 py-2 border border-gray-300 rounded" }), _jsx("button", { onClick: handleApplyCoupon, className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700", children: "Apply" }), _jsx("button", { onClick: () => setShowCouponForm(false), className: "px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400", children: "Cancel" })] })) : (_jsx("button", { onClick: () => setShowCouponForm(true), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Apply Coupon" }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Invoice History" }), _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-left text-sm text-gray-600", children: [_jsx("th", { className: "pb-3", children: "Invoice #" }), _jsx("th", { className: "pb-3", children: "Period" }), _jsx("th", { className: "pb-3", children: "Amount" }), _jsx("th", { className: "pb-3", children: "Status" })] }) }), _jsx("tbody", { children: invoices.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "py-8 text-center text-gray-500", children: "No invoices" }) })) : (invoices.map((inv) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 font-medium", children: inv.invoiceNumber }), _jsxs("td", { className: "py-3", children: [formatDate(inv.periodStart), " - ", formatDate(inv.periodEnd)] }), _jsx("td", { className: "py-3", children: formatCurrency(inv.totalDue) }), _jsx("td", { className: "py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`, children: inv.status }) })] }, inv.id)))) })] })] })] }));
}
