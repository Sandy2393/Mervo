import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Create Job Page — Form to create new job
 * TODO: Implement full form with location picker, contractor assignment
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/Select';
import { jobsService } from '../../services/jobsService';
export default function CreateJobPage() {
    const navigate = useNavigate();
    const { activeCompanyId, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        job_name: '',
        description: '',
        priority: 'medium',
        location: {},
        payment: {}
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeCompanyId)
            return;
        try {
            setLoading(true);
            setError(null);
            const result = await jobsService.createJob(activeCompanyId, {
                ...formData,
                priority: (formData.priority || 'medium'),
                created_by: user?.id ?? 'unknown',
                status: 'draft',
                publish: false,
                recurring: false
            });
            if (result.success) {
                navigate('/corporate/jobs');
            }
            else {
                setError(result.error || 'Failed to create job');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Create Job" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Create a new job assignment" })] }), _jsxs(Card, { children: [_jsx(CardBody, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Job Name", placeholder: "e.g., Installation at Main Office", value: formData.job_name, onChange: (e) => setFormData({ ...formData, job_name: e.target.value }), required: true }), _jsx(Input, { label: "Description", placeholder: "Detailed job description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }) }), _jsx(Select, { label: "Priority", value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), options: [
                                        { value: 'low', label: 'Low' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'high', label: 'High' }
                                    ] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm", children: error })), _jsx("div", { className: "bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm", children: "\u2139\uFE0F Location and contractor assignment coming soon" })] }) }), _jsxs(CardFooter, { children: [_jsx(Button, { variant: "ghost", onClick: () => navigate('/corporate/jobs'), children: "Cancel" }), _jsx(Button, { onClick: handleSubmit, isLoading: loading, children: "Create Job" })] })] })] }));
}
