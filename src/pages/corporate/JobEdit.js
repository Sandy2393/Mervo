import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobsService';
import { auditService } from '../../services/auditService';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import Toast from '../../components/ui/Toast';
export default function JobEdit() {
    const { jobId } = useParams();
    const { activeCompanyId, user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!jobId || !activeCompanyId)
            return;
        (async () => {
            setLoading(true);
            const resp = await jobsService.getJobById(activeCompanyId, jobId);
            if (resp.success)
                setJob(resp.data);
            else
                setError(resp.error || 'Failed to load job');
            setLoading(false);
        })();
    }, [jobId, activeCompanyId]);
    const onSave = async () => {
        if (!job || !activeCompanyId || !user)
            return setError('Missing context');
        setSaving(true);
        setError(null);
        // optimistic snapshot
        const snapshot = { ...job };
        try {
            const resp = await jobsService.updateJob(activeCompanyId, job.id, { job_name: job.job_name, description: job.description }, user.id);
            if (!resp.success)
                throw new Error(resp.error || 'Update failed');
            // record audit
            await auditService.record(activeCompanyId, 'update_job', job.id, { updatedBy: user.id });
            navigate(`/corporate/jobs/${job.id}`);
        }
        catch (err) {
            setJob(snapshot); // rollback
            setError(err instanceof Error ? err.message : 'Update failed');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-4", children: "Loading..." });
    if (!job)
        return _jsx("div", { className: "p-4 text-red-600", children: "Job not found" });
    return (_jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Edit Job" }), _jsxs("div", { children: [_jsx(Button, { onClick: () => navigate(`/corporate/jobs/${job.id}`), children: "Cancel" }), _jsx(Button, { onClick: onSave, isLoading: saving, className: "ml-2", children: "Save" })] })] }), error && _jsx(Toast, { message: error, type: "error" }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Job name" }), _jsx(Input, { value: job.job_name, onChange: (e) => setJob({ ...job, job_name: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Description" }), _jsx(Input, { value: job.description || '', onChange: (e) => setJob({ ...job, description: e.target.value }) })] })] }) }) })] }));
}
