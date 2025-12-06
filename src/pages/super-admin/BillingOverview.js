import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Super Admin Billing Overview
 * Shows MRR, revenue trends, all companies, and system-wide billing metrics
 */
import { useState, useEffect } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';
export default function BillingOverview() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState('totalCost');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('all');
    useEffect(() => {
        fetchDashboard();
    }, []);
    const fetchDashboard = async () => {
        try {
            const res = await superAdminFetch('/api/super-admin/billing/dashboard');
            const data = await res.json();
            setDashboard(data);
        }
        catch (error) {
            console.error('Error fetching dashboard:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
    };
    const getTierBadgeColor = (tier) => {
        switch (tier.toLowerCase()) {
            case 'starter': return 'bg-blue-100 text-blue-800';
            case 'professional': return 'bg-purple-100 text-purple-800';
            case 'enterprise': return 'bg-orange-100 text-orange-800';
            case 'custom': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
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
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }) || [];
    if (loading || !dashboard) {
        return _jsx("div", { className: "p-8", children: "Loading billing overview..." });
    }
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Billing Overview" }), _jsx("p", { className: "text-gray-600 mt-2", children: "System-wide billing metrics and revenue tracking" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Monthly Recurring Revenue" }), _jsx("div", { className: "text-3xl font-bold text-gray-900", children: formatCurrency(dashboard.summary.totalMRR) }), _jsxs("div", { className: "text-xs text-gray-500 mt-2", children: [dashboard.summary.activeSubscriptions, " active subscriptions"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Revenue This Month" }), _jsx("div", { className: "text-3xl font-bold text-gray-900", children: formatCurrency(dashboard.revenue.thisMonth) }), _jsxs("div", { className: `text-xs mt-2 ${dashboard.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [dashboard.revenue.growth >= 0 ? '↑' : '↓', " ", Math.abs(dashboard.revenue.growth).toFixed(1), "% vs last month"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Over Usage Limit" }), _jsx("div", { className: "text-3xl font-bold text-orange-600", children: dashboard.summary.companiesOverLimit }), _jsx("div", { className: "text-xs text-gray-500 mt-2", children: "Companies exceeding limits" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-sm font-medium text-gray-500 mb-2", children: "Overdue Invoices" }), _jsx("div", { className: "text-3xl font-bold text-red-600", children: dashboard.summary.overdueInvoices }), _jsx("div", { className: "text-xs text-gray-500 mt-2", children: "Require attention" })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Revenue Trend (Last 6 Months)" }), _jsx("div", { className: "h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-500 mb-2", children: "Chart visualization" }), _jsx("p", { className: "text-sm text-gray-400", children: "Integrate Chart.js or Recharts for line chart" })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "All Companies" }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "px-3 py-2 border border-gray-300 rounded text-sm", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "suspended", children: "Suspended" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] }), _jsx("button", { onClick: () => window.location.href = '/super-admin/billing/coupons', className: "px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm", children: "Manage Coupons" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 text-left text-sm text-gray-600", children: [_jsxs("th", { className: "pb-3 cursor-pointer hover:text-gray-900", onClick: () => handleSort('name'), children: ["Company ", sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')] }), _jsx("th", { className: "pb-3", children: "Plan" }), _jsx("th", { className: "pb-3 text-right", children: "Base Cost" }), _jsx("th", { className: "pb-3 text-right", children: "Overage" }), _jsxs("th", { className: "pb-3 text-right cursor-pointer hover:text-gray-900", onClick: () => handleSort('totalCost'), children: ["Total ", sortField === 'totalCost' && (sortDirection === 'asc' ? '↑' : '↓')] }), _jsx("th", { className: "pb-3", children: "Status" }), _jsx("th", { className: "pb-3" })] }) }), _jsx("tbody", { children: filteredAndSortedCompanies.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-gray-500", children: "No companies found" }) })) : (filteredAndSortedCompanies.map((company) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "py-3 font-medium text-gray-900", children: company.name }), _jsx("td", { className: "py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${getTierBadgeColor(company.planTier)}`, children: company.planTier }) }), _jsx("td", { className: "py-3 text-right text-gray-700", children: formatCurrency(company.monthlyCost) }), _jsx("td", { className: "py-3 text-right", children: company.usageCost > 0 ? (_jsxs("span", { className: "text-orange-600 font-medium", children: ["+", formatCurrency(company.usageCost)] })) : (_jsx("span", { className: "text-gray-400", children: "-" })) }), _jsx("td", { className: "py-3 text-right font-bold text-gray-900", children: formatCurrency(company.totalCost) }), _jsx("td", { className: "py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${company.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        company.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'}`, children: company.status }) }), _jsx("td", { className: "py-3 text-right", children: _jsx("button", { onClick: () => window.location.href = `/super-admin/billing/company/${company.id}`, className: "px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700", children: "View Details" }) })] }, company.id)))) })] }) }), _jsxs("div", { className: "mt-4 text-sm text-gray-500", children: ["Showing ", filteredAndSortedCompanies.length, " of ", dashboard.companies.length, " companies"] })] }), _jsxs("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("button", { onClick: async () => {
                            if (confirm('Generate invoices for all companies for the previous month?')) {
                                await superAdminFetch('/api/super-admin/billing/process-monthly', { method: 'POST' });
                                alert('Monthly billing processed');
                                fetchDashboard();
                            }
                        }, className: "px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium", children: "Process Monthly Billing" }), _jsx("button", { onClick: async () => {
                            if (confirm('Suspend all companies with invoices 7+ days overdue?')) {
                                const res = await superAdminFetch('/api/super-admin/billing/suspend-overdue', { method: 'POST' });
                                const data = await res.json();
                                alert(`Suspended ${data.suspended} companies`);
                                fetchDashboard();
                            }
                        }, className: "px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium", children: "Suspend Overdue Accounts" }), _jsx("button", { onClick: async () => {
                            const res = await superAdminFetch('/api/super-admin/billing/send-usage-alerts', { method: 'POST' });
                            const data = await res.json();
                            alert(`Sent ${data.alertsSent} usage alerts`);
                        }, className: "px-4 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium", children: "Send Usage Alerts" })] })] }));
}
