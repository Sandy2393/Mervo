import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Job Execution Page — Contractor interface during job
 * Clock in/out, photo upload, notes, signature
 * TODO: Implement offline sync with Dexie
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { jobsService } from '../../services/jobsService';
import { timesheetService } from '../../services/timesheetService';
export default function JobExecutionPage() {
    const { jobInstanceId } = useParams();
    const navigate = useNavigate();
    const { activeCompanyId, user } = useAuth();
    const [jobInstance, setJobInstance] = useState(null);
    const [timesheet, setTimesheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clockedIn, setClockedIn] = useState(false);
    useEffect(() => {
        if (!activeCompanyId || !jobInstanceId)
            return;
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch job instance
                const jobResult = await jobsService.getJobInstanceById(jobInstanceId, activeCompanyId);
                if (jobResult.success && jobResult.data) {
                    setJobInstance(jobResult.data);
                }
                // Fetch timesheet
                const timesheetResult = await timesheetService.getTimesheetByJobInstance(jobInstanceId);
                if (timesheetResult.success && timesheetResult.data) {
                    setTimesheet(timesheetResult.data);
                    setClockedIn(!!timesheetResult.data.clock_in && !timesheetResult.data.clock_out);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load job');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeCompanyId, jobInstanceId]);
    const handleClockIn = async () => {
        if (!jobInstanceId || !user)
            return;
        try {
            setLoading(true);
            // Get current location if available
            let geoData;
            if (navigator.geolocation) {
                geoData = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        resolve({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        });
                    }, () => resolve(undefined));
                });
            }
            const result = await timesheetService.clockIn(jobInstanceId, user.id, geoData);
            if (result.success && result.data) {
                setTimesheet(result.data);
                setClockedIn(true);
            }
            else {
                setError(result.error || 'Failed to clock in');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    const handleClockOut = async () => {
        if (!jobInstanceId || !user)
            return;
        try {
            setLoading(true);
            let geoData;
            if (navigator.geolocation) {
                geoData = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        resolve({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        });
                    }, () => resolve(undefined));
                });
            }
            const result = await timesheetService.clockOut(jobInstanceId, user.id, geoData);
            if (result.success && result.data) {
                setTimesheet(result.data);
                setClockedIn(false);
            }
            else {
                setError(result.error || 'Failed to clock out');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading && !jobInstance) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-600", children: "Loading job..." }) }));
    }
    if (!jobInstance) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-red-600", children: "Job not found" }), _jsx(Button, { onClick: () => navigate('/contractor'), children: "Back to Jobs" })] }));
    }
    const formatTime = (isoTime) => {
        if (!isoTime)
            return '-';
        return new Date(isoTime).toLocaleTimeString();
    };
    const duration = timesheet?.duration_seconds
        ? `${Math.floor(timesheet.duration_seconds / 3600)}h ${Math.floor((timesheet.duration_seconds % 3600) / 60)}m`
        : '-';
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: jobInstance.job?.job_name || 'Job Execution' }), jobInstance.job?.description && (_jsx("p", { className: "text-gray-600 mt-2", children: jobInstance.job.description }))] }), _jsx(Card, { children: _jsxs(CardBody, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Clocked In" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatTime(timesheet?.clock_in) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Clocked Out" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatTime(timesheet?.clock_out) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Duration" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: duration })] })] }), _jsx("div", { className: "flex gap-4 justify-center", children: !clockedIn ? (_jsx(Button, { onClick: handleClockIn, isLoading: loading, className: "px-8", children: "Clock In" })) : (_jsx(Button, { onClick: handleClockOut, isLoading: loading, variant: "danger", className: "px-8", children: "Clock Out" })) })] }) }), _jsx(Card, { children: _jsxs(CardBody, { className: "space-y-4", children: [_jsx("h2", { className: "font-semibold text-lg", children: "Job Details" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Status" }), _jsx("p", { className: "font-medium capitalize", children: jobInstance.status })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Scheduled For" }), _jsx("p", { className: "font-medium", children: jobInstance.scheduled_for
                                                ? new Date(jobInstance.scheduled_for).toLocaleString()
                                                : 'N/A' })] })] })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("h2", { className: "font-semibold text-lg mb-4", children: "Photos" }), _jsx("div", { className: "bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded", children: "\uD83D\uDCF8 Photo upload coming soon" })] }) }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error })), _jsxs("div", { className: "flex gap-4", children: [_jsx(Button, { variant: "ghost", onClick: () => navigate('/contractor'), children: "Back to Jobs" }), _jsx(Button, { children: "Save Notes (TODO)" })] })] }));
}
