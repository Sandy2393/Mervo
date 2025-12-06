import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Workforce Home
 * Tab interface for viewing and managing employees and contractors
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import EmployeeList from './EmployeeList';
import ContractorList from './ContractorList';
export default function WorkforceHome() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('employees');
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Workforce Management" }), _jsx(Button, { onClick: () => navigate('/workforce/add-member'), className: "bg-blue-600", children: "Add New Member" })] }), _jsxs("div", { className: "flex gap-4 border-b", children: [_jsx("button", { onClick: () => setActiveTab('employees'), className: `px-4 py-2 font-medium ${activeTab === 'employees'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'}`, children: "Employees" }), _jsx("button", { onClick: () => setActiveTab('contractors'), className: `px-4 py-2 font-medium ${activeTab === 'contractors'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600'}`, children: "Contractors" })] }), activeTab === 'employees' && _jsx(EmployeeList, {}), activeTab === 'contractors' && _jsx(ContractorList, {})] }));
}
