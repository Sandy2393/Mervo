import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Add Member
 * Form to add employee or contractor
 * Enforces username normalization and role hierarchy
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyUserService } from '../../services/companyUserService';
import { usernameUtils } from '../../lib/validation/username';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/button';
const ROLE_OPTIONS = [
    'owner_primary',
    'owner_secondary',
    'executive',
    'gm',
    'dept_head',
    'manager',
    'supervisor',
    'staff',
    'contractor'
];
export default function AddMember() {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [fullName, setFullName] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [governmentId, setGovernmentId] = useState('');
    const [taxFileNumber, setTaxFileNumber] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [role, setRole] = useState('staff');
    const [permissionsJson, setPermissionsJson] = useState('{}');
    const [companyAlias, setCompanyAlias] = useState('');
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeCompanyId)
            return;
        setError(null);
        // Normalize and validate alias
        const normAlias = usernameUtils.normalize(companyAlias);
        if (!usernameUtils.isValid(normAlias)) {
            setError('Invalid company alias');
            return;
        }
        // Enforce unique alias
        const unique = await usernameUtils.enforceUniqueCompanyAlias(normAlias, activeCompanyId);
        if (!unique.unique) {
            setError(unique.error || 'Alias already in use');
            return;
        }
        // Permissions parsing
        let permissions = {};
        try {
            permissions = JSON.parse(permissionsJson);
        }
        catch (err) {
            setError('Permissions must be valid JSON');
            return;
        }
        // Create user if not existing (TODO: call auth service to create master account)
        setSaving(true);
        try {
            // TODO: Create or link user account server-side. For now assume user exists and account_id is personalEmail
            const accountId = `${usernameUtils.normalize(personalEmail.split('@')[0])}@app_tag`;
            // Create company alias record
            const result = await companyUserService.createCompanyAlias(activeCompanyId, accountId, normAlias, role, permissions);
            if (!result.success) {
                setError(result.error || 'Failed to add member');
            }
            else {
                navigate('/workforce');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add member');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "p-6", children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Add New Member" }), error && _jsx("div", { className: "text-red-600 mb-2", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Full Name" }), _jsx(Input, { value: personalEmail, onChange: (e) => setPersonalEmail(e.target.value), placeholder: "Personal Email" }), _jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "Phone" }), _jsx(Input, { value: dob, onChange: (e) => setDob(e.target.value), type: "date", placeholder: "DOB" }), _jsx(Input, { value: emergencyContact, onChange: (e) => setEmergencyContact(e.target.value), placeholder: "Emergency Contact" }), _jsx(Input, { value: governmentId, onChange: (e) => setGovernmentId(e.target.value), placeholder: "Government ID" }), _jsx(Input, { value: taxFileNumber, onChange: (e) => setTaxFileNumber(e.target.value), placeholder: "Tax File Number" }), _jsx(Input, { value: bankDetails, onChange: (e) => setBankDetails(e.target.value), placeholder: "Bank Details JSON" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Role" }), _jsx(Select, { value: role, onChange: (e) => setRole(e.target.value), options: ROLE_OPTIONS.map(r => ({ value: r, label: r })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Company Alias" }), _jsx(Input, { value: companyAlias, onChange: (e) => setCompanyAlias(e.target.value), placeholder: "alias" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "alias will become `alias@company_tag`" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Permissions (JSON)" }), _jsx(Input, { value: permissionsJson, onChange: (e) => setPermissionsJson(e.target.value), placeholder: '{"jobs": "view"}' })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "submit", className: "bg-blue-600", disabled: saving, children: saving ? 'Saving...' : 'Add Member' }), _jsx(Button, { type: "button", className: "bg-gray-400", onClick: () => navigate('/workforce'), children: "Cancel" })] })] })] }) }) }));
}
