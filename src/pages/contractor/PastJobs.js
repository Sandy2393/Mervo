import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Past Jobs Page
 * Contractor view: Completed jobs, weekly/fortnightly view, PDF download
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { exportsService } from '../../services/exportsService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
export default function PastJobs() {
    const { user, activeCompanyId } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewPeriod, setViewPeriod] = useState('week');
    const [downloading, setDownloading] = useState(null);
    useEffect(() => {
        if (!user?.id || !activeCompanyId)
            return;
        const fetchPastJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                // Calculate date range based on period
                const endDate = new Date();
                const startDate = new Date();
                if (viewPeriod === 'week') {
                    startDate.setDate(startDate.getDate() - 7);
                }
                else {
                    startDate.setDate(startDate.getDate() - 14);
                }
                const result = await jobInstancesService.listInstancesForUser(user.id, {
                    company_id: activeCompanyId,
                    status: 'completed',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString()
                });
                if (result.success) {
                    setJobs(result.data || []);
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
        fetchPastJobs();
    }, [user?.id, activeCompanyId, viewPeriod]);
    const handleDownloadPDF = async (instanceId) => {
        try {
            setDownloading(instanceId);
            const result = await exportsService.generateInstancePDF(instanceId, activeCompanyId || '');
            if (result.success) {
                // In real implementation, trigger download
                // For now, show URL
                console.log('Download URL:', result.data?.dataUrl);
                alert(`PDF ready: ${result.data?.fileName}`);
            }
            else {
                alert(`Error: ${result.error}`);
            }
        }
        catch (err) {
            alert(err instanceof Error ? err.message : 'Download failed');
        }
        finally {
            setDownloading(null);
        }
    };
    if (loading) {
        return _jsx("div", { className: "p-4", children: "Loading past jobs..." });
    }
    if (error) {
        return _jsxs("div", { className: "p-4 text-red-600", children: ["Error: ", error] });
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Past Jobs" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setViewPeriod('week'), className: viewPeriod === 'week' ? '' : 'bg-gray-500', children: "This Week" }), _jsx(Button, { onClick: () => setViewPeriod('fortnight'), className: viewPeriod === 'fortnight' ? '' : 'bg-gray-500', children: "Fortnight" })] })] }), jobs.length === 0 ? (_jsx(Card, { children: _jsx(CardBody, { children: _jsx("p", { className: "text-center text-gray-600", children: "No completed jobs in this period" }) }) })) : (_jsx("div", { className: "space-y-4", children: jobs.map(instance => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold", children: instance.job?.job_name }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Completed: ", new Date(instance.completed_at || '').toLocaleDateString()] }), _jsx("span", { className: "inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium", children: "Completed" })] }), _jsx(Button, { onClick: () => handleDownloadPDF(instance.id), disabled: downloading === instance.id, className: "ml-4", children: downloading === instance.id ? 'Generating...' : 'Download PDF' })] }) }) }, instance.id))) }))] }) }));
}
