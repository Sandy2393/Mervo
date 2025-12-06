import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Today Jobs Page
 * Contractor view: Shows today's assigned jobs with quick actions
 * Sorted by scheduled time, earliest first
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
export default function TodayJobs() {
    const { user, activeCompanyId } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user?.id || !activeCompanyId)
            return;
        const fetchTodayJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await jobInstancesService.listInstancesForUser(user.id, {
                    company_id: activeCompanyId,
                    status: 'assigned'
                });
                if (result.success) {
                    // Filter to today only
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const todayJobs = (result.data || []).filter(j => {
                        const scheduled = new Date(j.scheduled_for || '');
                        return scheduled >= today && scheduled < tomorrow;
                    });
                    setJobs(todayJobs);
                }
                else {
                    setError(result.error || 'Failed to load jobs');
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchTodayJobs();
    }, [user?.id, activeCompanyId]);
    if (loading) {
        return _jsx("div", { className: "p-4", children: "Loading today's jobs..." });
    }
    if (error) {
        return _jsxs("div", { className: "p-4 text-red-600", children: ["Error: ", error] });
    }
    if (jobs.length === 0) {
        return (_jsx("div", { className: "p-6", children: _jsx(Card, { children: _jsx(CardBody, { children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-gray-600", children: "No jobs assigned for today" }) }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Today's Jobs" }), _jsx("div", { className: "space-y-4", children: jobs.map(instance => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardBody, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-semibold", children: instance.job?.job_name || 'Unknown Job' }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Scheduled: ", new Date(instance.scheduled_for || '').toLocaleTimeString()] }), instance.job?.location && (_jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Location: ", typeof instance.job.location === 'object'
                                                        ? instance.job.location.address || 'See details'
                                                        : 'See details'] })), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx("span", { className: "inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium", children: instance.status || 'assigned' }), instance.job?.priority && (_jsxs("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-medium ${instance.job.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                            instance.job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'}`, children: [instance.job.priority, " priority"] }))] })] }), _jsx(Link, { to: `/job/${instance.id}`, children: _jsx(Button, { className: "ml-4", children: "Start Job" }) })] }) }) }, instance.id))) })] }) }));
}
