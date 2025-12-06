import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Corporate Dashboard — Main dashboard for owners/managers
 * Shows job stats, recent jobs, contractor activity
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { jobsService } from '../../services/jobsService';
import { Link } from 'react-router-dom';
export default function CorporateDashboard() {
    const { activeCompanyId, companyUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!activeCompanyId)
            return;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch active jobs
                const jobsResult = await jobsService.listJobsByCompany(activeCompanyId, {
                    status: 'active'
                });
                if (jobsResult.success) {
                    setJobs(jobsResult.data || []);
                }
                // Fetch recent job instances
                // TODO: Implement service method for recent instances
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeCompanyId]);
    if (loading) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-600", children: "Loading dashboard..." }) }));
    }
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const draftJobs = jobs.filter(j => j.status === 'draft').length;
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Dashboard" }), _jsxs("p", { className: "text-gray-600 mt-2", children: ["Welcome back, ", companyUser?.company_alias] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-orange-500", children: activeJobs }), _jsx("p", { className: "text-gray-600 mt-2", children: "Active Jobs" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-blue-500", children: draftJobs }), _jsx("p", { className: "text-gray-600 mt-2", children: "Draft Jobs" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-green-500", children: jobs.length }), _jsx("p", { className: "text-gray-600 mt-2", children: "Total Jobs" })] }) })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Link, { to: "/corporate/jobs/create", children: _jsx(Button, { children: "Create Job" }) }), _jsx(Link, { to: "/corporate/contractors", children: _jsx(Button, { variant: "secondary", children: "Manage Contractors" }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-semibold", children: "Recent Jobs" }) }), _jsx(CardBody, { children: jobs.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No jobs yet. Create your first job to get started." })) : (_jsx("div", { className: "space-y-3", children: jobs.slice(0, 5).map(job => (_jsxs("div", { className: "border-l-4 border-orange-500 pl-4 py-2", children: [_jsx("h3", { className: "font-medium text-gray-900", children: job.job_name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Status: ", _jsx("span", { className: "font-semibold", children: job.status })] }), job.description && (_jsx("p", { className: "text-sm text-gray-600 mt-1", children: job.description }))] }, job.id))) })) })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error }))] }));
}
