import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Corporate Dashboard
 * KPIs, activity log, financial snapshot, company switcher
 * Auto-refreshes every 30 seconds
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { auditService } from '../../services/auditService';
import { financeService } from '../../services/financeService';
import { Card, CardBody } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/currency';
export default function Dashboard() {
    const { activeCompanyId } = useAuth();
    // KPI state
    const [activeJobsCount, setActiveJobsCount] = useState(0);
    const [jobsNeedingAssignment, setJobsNeedingAssignment] = useState(0);
    const [jobsLate, setJobsLate] = useState(0);
    const [contractorsClocked, setContractorsClocked] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Activity log
    const [activityLog, setActivityLog] = useState([]);
    // Finance
    const [weekRevenue, setWeekRevenue] = useState(null);
    const [monthRevenue, setMonthRevenue] = useState(null);
    const [pendingPayments, setPendingPayments] = useState([]);
    // Refresh interval
    useEffect(() => {
        if (!activeCompanyId)
            return;
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Load instances
                const instResult = await jobInstancesService.listInstancesFiltered(activeCompanyId, {});
                if (instResult.success && instResult.data) {
                    const instances = instResult.data;
                    // Active jobs today
                    const now = new Date();
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const todayEnd = new Date(todayStart);
                    todayEnd.setDate(todayEnd.getDate() + 1);
                    const activeToday = instances.filter((inst) => inst.status === 'in_progress' &&
                        new Date(inst.scheduled_for || '') >= todayStart &&
                        new Date(inst.scheduled_for || '') < todayEnd);
                    setActiveJobsCount(activeToday.length);
                    // Jobs needing assignment
                    const needAssignment = instances.filter((inst) => inst.status === 'upcoming' && !inst.assigned_to);
                    setJobsNeedingAssignment(needAssignment.length);
                    // Jobs running late (completed_at > scheduled_for + 1 day)
                    const late = instances.filter((inst) => {
                        if (inst.status !== 'completed' || !inst.completed_at || !inst.scheduled_for) {
                            return false;
                        }
                        const scheduled = new Date(inst.scheduled_for);
                        const completed = new Date(inst.completed_at);
                        const oneDay = 24 * 60 * 60 * 1000;
                        return completed.getTime() - scheduled.getTime() > oneDay;
                    });
                    setJobsLate(late.length);
                    // Count unique contractors clocked in
                    const clockedIn = new Set();
                    instances.forEach((inst) => {
                        if (inst.status === 'in_progress' && inst.assigned_to) {
                            clockedIn.add(inst.assigned_to);
                        }
                    });
                    setContractorsClocked(clockedIn.size);
                }
                // Activity log
                const auditResult = await auditService.listRecent(activeCompanyId, 20);
                if (auditResult.success && auditResult.data) {
                    setActivityLog(auditResult.data);
                }
                // Financial data
                const weekRevenueResult = await financeService.getRevenue(activeCompanyId, 'week');
                if (weekRevenueResult.success && weekRevenueResult.data) {
                    setWeekRevenue(weekRevenueResult.data);
                }
                const monthRevenueResult = await financeService.getRevenue(activeCompanyId, 'month');
                if (monthRevenueResult.success && monthRevenueResult.data) {
                    setMonthRevenue(monthRevenueResult.data);
                }
                const paymentsResult = await financeService.getPendingPayments(activeCompanyId);
                if (paymentsResult.success && paymentsResult.data) {
                    setPendingPayments(paymentsResult.data);
                }
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
                setError(msg);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [activeCompanyId]);
    if (loading) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "text-gray-500", children: "Loading dashboard..." }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h1", { className: "text-3xl font-bold", children: "Dashboard" }) }), error && (_jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded", children: error })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "Active Jobs Today" }), _jsx("div", { className: "text-3xl font-bold mt-2", children: activeJobsCount })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "Needing Assignment" }), _jsx("div", { className: "text-3xl font-bold text-yellow-600 mt-2", children: jobsNeedingAssignment })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "Running Late" }), _jsx("div", { className: "text-3xl font-bold text-red-600 mt-2", children: jobsLate })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "Clocked In Now" }), _jsx("div", { className: "text-3xl font-bold text-green-600 mt-2", children: contractorsClocked })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Card, { children: _jsxs(CardBody, { className: "space-y-3", children: [_jsx("h3", { className: "font-bold text-lg", children: "This Week" }), weekRevenue && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Revenue:" }), _jsx("span", { className: "font-semibold", children: formatCurrency((weekRevenue.total_revenue_cents || 0) / 100) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Jobs Completed:" }), _jsx("span", { className: "font-semibold", children: weekRevenue.job_count })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Average per Job:" }), _jsx("span", { className: "font-semibold", children: formatCurrency((weekRevenue.average_per_job_cents || 0) / 100) })] })] }))] }) }), _jsx(Card, { children: _jsxs(CardBody, { className: "space-y-3", children: [_jsx("h3", { className: "font-bold text-lg", children: "This Month" }), monthRevenue && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Revenue:" }), _jsx("span", { className: "font-semibold", children: formatCurrency((monthRevenue.total_revenue_cents || 0) / 100) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Jobs Completed:" }), _jsx("span", { className: "font-semibold", children: monthRevenue.job_count })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Average per Job:" }), _jsx("span", { className: "font-semibold", children: formatCurrency((monthRevenue.average_per_job_cents || 0) / 100) })] })] }))] }) })] }), _jsx(Card, { children: _jsxs(CardBody, { className: "space-y-3", children: [_jsx("h3", { className: "font-bold text-lg", children: "Recent Activity" }), _jsx("div", { className: "max-h-64 overflow-y-auto space-y-2", children: activityLog.length === 0 ? (_jsx("div", { className: "text-gray-500 text-sm", children: "No recent activity" })) : (activityLog.map(log => (_jsxs("div", { className: "flex justify-between items-start text-sm py-2 border-b", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: log.action }), _jsx("div", { className: "text-gray-600 text-xs", children: String(log.target) })] }), _jsx("div", { className: "text-gray-500 text-xs", children: new Date(log.created_at).toLocaleString() })] })))) })] }) }), pendingPayments.length > 0 && (_jsx(Card, { children: _jsxs(CardBody, { className: "space-y-3", children: [_jsx("h3", { className: "font-bold text-lg", children: "Pending Contractor Payments" }), _jsx("div", { className: "space-y-2", children: pendingPayments.map(payment => (_jsxs("div", { className: "flex justify-between items-center text-sm py-2 border-b", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: payment.contractor_alias }), _jsxs("div", { className: "text-gray-600 text-xs", children: [payment.job_count, " job(s)"] })] }), _jsx("div", { className: "font-semibold", children: formatCurrency((payment.amount_cents || 0) / 100) })] }, payment.contractor_alias))) })] }) }))] }));
}
