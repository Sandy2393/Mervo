import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobsService';
import { jobInstancesService } from '../../services/jobInstancesService';
import { financeService } from '../../services/financeService';
import { companyUserService } from '../../services/companyUserService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import PermissionsAwareButton from '../../components/PermissionsAwareButton';
import CompanySelector from '../../components/selectors/CompanySelector';
import Toast from '../../components/ui/Toast';
export default function JobsOverview() {
    const { activeCompanyId } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [instances, setInstances] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [contractorsCount, setContractorsCount] = useState(0);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(() => localStorage.getItem('jobs_filter') || 'all');
    useEffect(() => {
        if (!activeCompanyId)
            return;
        (async () => {
            try {
                const jobsRes = await jobsService.listJobsByCompany(activeCompanyId);
                if (jobsRes.success)
                    setJobs(jobsRes.data || []);
                const instancesRes = await jobInstancesService.listInstancesFiltered(activeCompanyId, { start_date: new Date().toISOString(), recurring_only: false });
                if (instancesRes.success)
                    setInstances(instancesRes.data || []);
                const rev = await financeService.getRevenue(activeCompanyId, 'week');
                if (rev.success)
                    setRevenue(Math.round((rev.data?.total_revenue_cents || 0) / 100));
                const contractors = await companyUserService.listCompanyUsers(activeCompanyId, { role: 'contractor', status: 'active' });
                if (contractors.success)
                    setContractorsCount(contractors.data?.length || 0);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load jobs');
            }
        })();
    }, [activeCompanyId]);
    const activeJobsToday = useMemo(() => instances.filter(i => new Date(i.scheduled_for).toDateString() === new Date().toDateString()).length, [instances]);
    const upcomingJobs = useMemo(() => instances.filter(i => new Date(i.scheduled_for) > new Date()).length, [instances]);
    const overdueJobs = useMemo(() => instances.filter(i => new Date(i.scheduled_for) < new Date() && i.status !== 'completed').length, [instances]);
    const saveFilter = (f) => {
        localStorage.setItem('jobs_filter', f);
        setFilter(f);
    };
    if (!activeCompanyId)
        return _jsx("div", { className: "p-4", children: "Select a company" });
    return (_jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(CompanySelector, {}), _jsx("h1", { className: "text-2xl font-bold", children: "Jobs Overview" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(PermissionsAwareButton, { onClick: () => window.location.assign('/corporate/jobs/create'), children: "Create Job" }) })] }), error && _jsx(Toast, { message: error, type: "error" }), _jsxs("div", { className: "grid grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Active Jobs Today" }), _jsx("div", { className: "text-2xl font-semibold", children: activeJobsToday })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Upcoming Jobs" }), _jsx("div", { className: "text-2xl font-semibold", children: upcomingJobs })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Overdue Jobs" }), _jsx("div", { className: "text-2xl font-semibold", children: overdueJobs })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Contractors Active" }), _jsx("div", { className: "text-2xl font-semibold", children: contractorsCount }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: ["Revenue (week): $", revenue ?? '—'] })] }) })] }), _jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx(Button, { onClick: () => saveFilter('all'), className: filter === 'all' ? 'font-semibold' : '', children: "All" }), _jsx(Button, { onClick: () => saveFilter('active'), className: filter === 'active' ? 'font-semibold' : '', children: "Active" }), _jsx(Button, { onClick: () => saveFilter('upcoming'), className: filter === 'upcoming' ? 'font-semibold' : '', children: "Upcoming" }), _jsx(Button, { onClick: () => saveFilter('overdue'), className: filter === 'overdue' ? 'font-semibold' : '', children: "Overdue" })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Jobs" }), _jsx("div", { className: "space-y-3", children: jobs.filter(j => {
                            if (filter === 'all')
                                return true;
                            if (filter === 'active')
                                return j.status === 'active';
                            if (filter === 'upcoming')
                                return j.status === 'active' && j.recurring === true;
                            if (filter === 'overdue')
                                return false; // overdue logic uses instances
                            return true;
                        }).map(j => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: j.job_name }), _jsx("div", { className: "text-sm text-gray-500", children: j.description })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm", children: j.priority }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx(Button, { onClick: () => window.location.assign(`/corporate/jobs/${j.id}`), children: "View" }), _jsx(PermissionsAwareButton, { onClick: () => window.location.assign(`/corporate/jobs/${j.id}/edit`), children: "Edit" })] })] })] }) }) }, j.id))) })] })] }));
}
