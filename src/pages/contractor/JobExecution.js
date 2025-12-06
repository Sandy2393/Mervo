import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Job Execution Page
 * Main contractor work interface: Clock in/out, upload photos, submit report
 * Enforces geofence if job requires on-premise work
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { jobInstancesService } from '../../services/jobInstancesService';
import { timesheetService } from '../../services/timesheetService';
import { reportService } from '../../services/reportService';
import { geoService } from '../../services/geoService';
import { compressFile } from '../../lib/photo';
import { offlineJobsQueue } from '../../lib/offlineJobsQueue';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
export default function JobExecution() {
    const { instanceId } = useParams();
    const { user, activeCompanyId } = useAuth();
    const [instance, setInstance] = useState(null);
    const [timesheet, setTimesheet] = useState(null);
    const [jobStatus, setJobStatus] = useState('not-started');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Form state
    const [reportNotes, setReportNotes] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    // Geofence
    const [geoError, setGeoError] = useState(null);
    const [showGeofenceOverride, setShowGeofenceOverride] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');
    useEffect(() => {
        if (!instanceId || !activeCompanyId)
            return;
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch instance
                const { data: inst, error: instError } = await supabase
                    .from('job_instances')
                    .select(`
            *,
            job:jobs(*)
          `)
                    .eq('id', instanceId)
                    .eq('company_id', activeCompanyId)
                    .single();
                if (instError || !inst) {
                    setError('Job instance not found');
                    return;
                }
                setInstance(inst);
                // Fetch timesheet if started
                if (inst.status === 'in_progress') {
                    const { data: ts } = await supabase
                        .from('timesheets')
                        .select('*')
                        .eq('job_instance_id', instanceId)
                        .eq('user_id', user?.id)
                        .single();
                    if (ts) {
                        setTimesheet(ts);
                        setJobStatus('in-progress');
                    }
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [instanceId, activeCompanyId, user?.id]);
    const handleStartJob = async () => {
        if (!instance || !user?.id || !instanceId || !activeCompanyId)
            return;
        try {
            setGeoError(null);
            // Check geofence if required
            if (instance.job?.location) {
                const location = instance.job.location;
                const jobLat = location.lat;
                const jobLng = location.lng;
                const requiredRadius = instance.job.clock_in_radius || 100;
                // Get current position
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition((pos) => resolve(pos.coords), reject);
                });
                const isInRadius = geoService.isWithinRadius({ lat: position.latitude, lng: position.longitude }, { lat: jobLat, lng: jobLng }, requiredRadius);
                if (!isInRadius) {
                    setGeoError(`You are outside the job location (${requiredRadius}m radius). Request an override?`);
                    setShowGeofenceOverride(true);
                    return;
                }
            }
            // Clock in
            const result = await timesheetService.clockIn(instanceId, user.id, {
                lat: 0,
                lng: 0
            });
            if (result.success && result.data) {
                setTimesheet(result.data);
                setJobStatus('in-progress');
                await jobInstancesService.updateInstanceStatus(activeCompanyId, instanceId, 'in_progress', user?.id);
            }
            else {
                setError(result.error || 'Failed to clock in');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start job');
        }
    };
    const handleRequestOverride = async () => {
        if (!instanceId || !user?.id)
            return;
        try {
            const result = await geoService.handleGpsForgiveness(instanceId, user.id, overrideReason);
            if (result.success) {
                // Queue offline action
                offlineJobsQueue.queueOverrideRequest(instanceId, user.id, overrideReason);
                setOverrideReason('');
                setShowGeofenceOverride(false);
                // Note: Manager must approve before clock-in is allowed
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request override');
        }
    };
    const handlePhotoSelect = (files) => {
        setSelectedPhotos(Array.from(files));
    };
    const handleSubmitReport = async () => {
        if (!instanceId || !user?.id || !activeCompanyId)
            return;
        try {
            setSubmitting(true);
            // Compress photos
            const compressedPhotos = [];
            for (const photo of selectedPhotos) {
                const blob = await compressFile(photo);
                compressedPhotos.push(new File([blob], photo.name, { type: 'image/jpeg' }));
            }
            // Upload photos
            let photoIds = [];
            if (compressedPhotos.length > 0) {
                const photoResult = await reportService.uploadPhotos(instanceId, user.id, compressedPhotos);
                if (photoResult.success) {
                    photoIds = (photoResult.data || []).map(p => p.id);
                }
            }
            // Submit report
            const reportResult = await reportService.submitReport(instanceId, user.id, {
                notes: reportNotes,
                duration_seconds: timesheet?.duration_seconds || 0
            }, photoIds);
            if (reportResult.success) {
                setJobStatus('completed-pending-report');
                setReportNotes('');
                setSelectedPhotos([]);
            }
            else {
                setError(reportResult.error || 'Failed to submit report');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit report');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return _jsx("div", { className: "p-4", children: "Loading job details..." });
    }
    if (!instance) {
        return _jsx("div", { className: "p-4 text-red-600", children: "Job instance not found" });
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsx(Card, { className: "mb-6", children: _jsxs(CardBody, { children: [_jsx("h1", { className: "text-3xl font-bold", children: instance.job?.job_name }), _jsx("p", { className: "text-gray-600 mt-2", children: instance.job?.description }), _jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Scheduled" }), _jsx("p", { className: "font-semibold", children: new Date(instance.scheduled_for || '').toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Status" }), _jsx("p", { className: `font-semibold ${jobStatus === 'completed-pending-report' ? 'text-green-600' :
                                                    jobStatus === 'in-progress' ? 'text-blue-600' :
                                                        'text-gray-600'}`, children: jobStatus.replace('-', ' ').toUpperCase() })] })] })] }) }), error && (_jsx("div", { className: "mb-4 p-4 bg-red-100 text-red-800 rounded", children: error })), geoError && (_jsx("div", { className: "mb-4 p-4 bg-yellow-100 text-yellow-800 rounded", children: geoError })), jobStatus === 'not-started' && !showGeofenceOverride && (_jsx(Button, { onClick: handleStartJob, className: "w-full mb-4", children: "Start Job" })), showGeofenceOverride && (_jsx(Card, { className: "mb-4", children: _jsxs(CardBody, { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Request Geofence Override" }), _jsx(Input, { placeholder: "Reason for override (optional)", value: overrideReason, onChange: (e) => setOverrideReason(e.target.value), className: "mb-3" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleRequestOverride, className: "flex-1", children: "Submit Request" }), _jsx(Button, { onClick: () => setShowGeofenceOverride(false), className: "flex-1 bg-gray-500", children: "Cancel" })] })] }) })), jobStatus === 'in-progress' && (_jsx(Card, { className: "mb-4", children: _jsxs(CardBody, { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Complete Job Report" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Upload Photos" }), _jsx(Input, { type: "file", multiple: true, accept: "image/*", onChange: (e) => handlePhotoSelect(e.target.files || new FileList()), className: "mb-2" }), selectedPhotos.length > 0 && (_jsxs("p", { className: "text-sm text-gray-600", children: [selectedPhotos.length, " photo(s) selected"] }))] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Notes" }), _jsx("textarea", { placeholder: "Add any notes about the job...", value: reportNotes, onChange: (e) => setReportNotes(e.target.value), className: "w-full p-2 border rounded", rows: 4 })] }), _jsx(Button, { onClick: handleSubmitReport, disabled: submitting, className: "w-full", children: submitting ? 'Submitting...' : 'Submit Report' })] }) })), jobStatus === 'completed-pending-report' && (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl text-green-600 mb-2", children: "\u2713" }), _jsx("p", { className: "text-lg font-semibold", children: "Report Submitted" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Awaiting manager approval" })] }) }) }))] }) }));
}
