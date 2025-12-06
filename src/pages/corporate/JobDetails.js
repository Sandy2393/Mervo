import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobInstancesService } from '../../services/jobInstancesService';
import { jobsService } from '../../services/jobsService';
import { usersService } from '../../services/usersService';
import { auditService } from '../../services/auditService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
export default function JobDetails() {
    const { jobId } = useParams();
    const { activeCompanyId, user } = useAuth();
    const [job, setJob] = useState(null);
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Modals & form state
    const [showCreateInstance, setShowCreateInstance] = useState(false);
    const [showAssignInstance, setShowAssignInstance] = useState(false);
    const [selectedInstanceId, setSelectedInstanceId] = useState(null);
    const [newScheduledFor, setNewScheduledFor] = useState('');
    const [assignmentAlias, setAssignmentAlias] = useState('');
    const [contractors, setContractors] = useState([]);
    useEffect(() => {
        if (!jobId || !activeCompanyId)
            return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const j = await jobsService.getJobById(activeCompanyId, jobId);
                if (j.success)
                    setJob(j.data || null);
                const inst = await jobsService.listJobInstancesByJob(jobId, activeCompanyId);
                if (inst.success)
                    setInstances(inst.data || []);
                const c = await usersService.listContractors(activeCompanyId);
                if (c.success)
                    setContractors(c.data || []);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId, activeCompanyId]);
    const handleCreateInstance = async () => {
        if (!jobId || !activeCompanyId || !newScheduledFor)
            return;
        try {
            const res = await jobInstancesService.createJobInstance(activeCompanyId, jobId, newScheduledFor);
            if (res.success && res.data) {
                setInstances(prev => [...prev, res.data]);
                setNewScheduledFor('');
                setShowCreateInstance(false);
                await auditService.record(activeCompanyId, 'create_instance', res.data.id, { createdBy: user?.id });
            }
            else {
                setError(res.error || 'Failed to create instance');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown');
        }
    };
    const handleAssignInstance = async () => {
        if (!selectedInstanceId || !activeCompanyId || !assignmentAlias)
            return;
        try {
            const res = await jobInstancesService.assignJobInstance(activeCompanyId, selectedInstanceId, assignmentAlias, user?.id);
            if (res.success && res.data) {
                setInstances(prev => prev.map(i => i.id === selectedInstanceId ? res.data : i));
                setAssignmentAlias('');
                setShowAssignInstance(false);
                setSelectedInstanceId(null);
                await auditService.record(activeCompanyId, 'assign_instance', selectedInstanceId, { assignedTo: assignmentAlias, actor: user?.id });
            }
            else {
                setError(res.error || 'Failed to assign');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown');
        }
    };
    if (loading)
        return _jsx("div", { className: "p-4", children: "Loading job details..." });
    if (!job)
        return _jsx("div", { className: "p-4 text-red-600", children: "Job not found" });
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [error && _jsx(Toast, { message: error, type: "error" }), _jsx(Card, { className: "mb-6", children: _jsxs(CardBody, { children: [_jsx("h1", { className: "text-3xl font-bold", children: job.job_name }), _jsx("p", { className: "text-gray-600 mt-2", children: job.description }), _jsxs("div", { className: "mt-6 grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Priority" }), _jsx("p", { className: "font-semibold", children: job.priority || 'Normal' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Status" }), _jsx("p", { className: "font-semibold", children: job.status })] })] })] }) }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("h2", { className: "text-2xl font-bold", children: ["Job Instances (", instances.length, ")"] }), _jsx(Button, { onClick: () => setShowCreateInstance(true), children: "+ Create Instance" })] }), instances.length === 0 ? (_jsx(Card, { children: _jsx(CardBody, { children: _jsx("p", { className: "text-center text-gray-600", children: "No instances yet" }) }) })) : (_jsx("div", { className: "space-y-4", children: instances.map(instance => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["Scheduled: ", new Date(instance.scheduled_for || '').toLocaleString()] }), _jsx("p", { className: "mt-1", children: _jsx("span", { className: "inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mr-2", children: instance.status }) }), instance.assigned_to && _jsxs("p", { className: "text-sm mt-2", children: ["Assigned to: ", _jsx("strong", { children: instance.assigned_to })] })] }), !instance.assigned_to && (_jsx(Button, { onClick: () => { setSelectedInstanceId(instance.id); setShowAssignInstance(true); }, children: "Assign" }))] }) }) }, instance.id))) })), showCreateInstance && (_jsx(Modal, { isOpen: showCreateInstance, title: "Create Job Instance", onClose: () => setShowCreateInstance(false), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Scheduled Date/Time" }), _jsx(Input, { type: "datetime-local", value: newScheduledFor, onChange: (e) => setNewScheduledFor(e.target.value) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleCreateInstance, className: "flex-1", children: "Create" }), _jsx(Button, { onClick: () => setShowCreateInstance(false), className: "flex-1 bg-gray-500", children: "Cancel" })] })] }) })), showAssignInstance && (_jsx(Modal, { isOpen: showAssignInstance, title: "Assign Job Instance", onClose: () => setShowAssignInstance(false), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Contractor" }), _jsxs("select", { value: assignmentAlias, onChange: (e) => setAssignmentAlias(e.target.value), className: "w-full border rounded p-2", children: [_jsx("option", { value: "", children: "-- Select Contractor --" }), contractors.map(c => _jsx("option", { value: c.company_alias, children: c.company_alias }, c.id))] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleAssignInstance, className: "flex-1", children: "Assign" }), _jsx(Button, { onClick: () => setShowAssignInstance(false), className: "flex-1 bg-gray-500", children: "Cancel" })] })] }) }))] }) }));
}
