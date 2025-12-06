import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Contractor Today Dashboard — Shows contractor's jobs for today
 * Main interface for contractors to see assigned work
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { jobsService } from '../../services/jobsService';
import { Link } from 'react-router-dom';
export default function ContractorTodayDashboard() {
    const { activeCompanyId, user } = useAuth();
    const [todayJobs, setTodayJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!activeCompanyId || !user)
            return;
        const fetchTodayJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await jobsService.listTodayJobInstances(activeCompanyId, user.id);
                if (result.success) {
                    setTodayJobs(result.data || []);
                }
                else {
                    setError(result.error || 'Failed to load jobs');
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
            finally {
                setLoading(false);
            }
        };
        fetchTodayJobs();
    }, [activeCompanyId, user]);
    const completedCount = todayJobs.filter(j => j.status === 'completed').length;
    const inProgressCount = todayJobs.filter(j => j.status === 'in_progress').length;
    if (loading) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-600", children: "Loading today's jobs..." }) }));
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Today's Jobs" }), _jsx("p", { className: "text-gray-600 mt-2", children: new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-blue-500", children: todayJobs.length }), _jsx("p", { className: "text-gray-600 mt-2", children: "Total Jobs" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-orange-500", children: inProgressCount }), _jsx("p", { className: "text-gray-600 mt-2", children: "In Progress" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-green-500", children: completedCount }), _jsx("p", { className: "text-gray-600 mt-2", children: "Completed" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("h2", { className: "text-xl font-semibold", children: "Assigned Jobs" }) }), _jsx(CardBody, { children: todayJobs.length === 0 ? (_jsx("p", { className: "text-gray-500 py-8", children: "No jobs assigned for today." })) : (_jsx("div", { className: "space-y-4", children: todayJobs.map(instance => (_jsx("div", { className: "border rounded-lg p-4 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg text-gray-900", children: instance.job?.job_name || 'Unnamed Job' }), instance.job?.description && (_jsx("p", { className: "text-gray-600 mt-1 text-sm", children: instance.job.description })), _jsxs("p", { className: "text-sm text-gray-500 mt-2", children: ["Scheduled: ", instance.scheduled_for
                                                            ? new Date(instance.scheduled_for).toLocaleTimeString()
                                                            : 'N/A'] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: `
                        px-3 py-1 rounded-full text-sm font-medium
                        ${instance.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${instance.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : ''}
                        ${instance.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                      `, children: instance.status }), _jsx(Link, { to: `/contractor/job/${instance.id}`, children: _jsx(Button, { size: "sm", children: instance.status === 'completed' ? 'View' : 'Start' }) })] })] }) }, instance.id))) })) })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error })), _jsxs("div", { className: "flex gap-4", children: [_jsx(Link, { to: "/contractor/earnings", children: _jsx(Button, { variant: "secondary", children: "My Earnings" }) }), _jsx(Link, { to: "/contractor/timesheets", children: _jsx(Button, { variant: "ghost", children: "Timesheets" }) })] })] }));
}
