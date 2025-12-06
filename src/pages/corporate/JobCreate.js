import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobsService';
import ContractorSelector from '../../components/selectors/ContractorSelector';
import { validateJobPayload } from '../../services/validationService';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
export default function JobCreate() {
    const { user, activeCompanyId } = useAuth();
    const navigate = useNavigate();
    const [jobName, setJobName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignedContractorId, setAssignedContractorId] = useState(null);
    // assignment handled post-create via instances/assign flow
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const onSelectContractor = (id) => setAssignedContractorId(id);
    const onSubmit = async (e) => {
        e?.preventDefault?.();
        setError(null);
        if (!activeCompanyId || !user?.id)
            return setError('Missing company or user');
        const payload = {
            job_name: jobName,
            description,
            priority,
            recurring: false,
            created_by: user.id
        };
        const validation = validateJobPayload(payload);
        if (!validation.valid)
            return setError(validation.errors.join(', '));
        setLoading(true);
        // Optimistic UI: navigate to job list and show temporary state
        try {
            const resp = await jobsService.createJob(activeCompanyId, payload, user.id);
            if (!resp.success)
                throw new Error(resp.error || 'Failed to create job');
            navigate(`/corporate/jobs/${resp.data.id}`);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Create failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("h1", { className: "text-2xl font-bold", children: "Create Job" }) }), error && _jsx(Toast, { message: error, type: "error" }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Job name" }), _jsx(Input, { value: jobName, onChange: (e) => setJobName(e.target.value), "aria-label": "Job name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Description" }), _jsx(Input, { value: description, onChange: (e) => setDescription(e.target.value), "aria-label": "Description" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Priority" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "mt-1 block w-full border rounded px-2 py-1", children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Assign contractor (optional)" }), _jsx(ContractorSelector, { onSelect: onSelectContractor }), assignedContractorId && (_jsxs("p", { className: "text-sm text-gray-500 mt-2", children: ["Selected contractor id: ", _jsx("strong", { children: assignedContractorId })] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "submit", isLoading: loading, children: "Create" }), _jsx(Button, { type: "button", onClick: () => navigate('/corporate/jobs'), children: "Cancel" })] })] }) }) })] }));
}
