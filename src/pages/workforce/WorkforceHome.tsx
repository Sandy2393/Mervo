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
  const [activeTab, setActiveTab] = useState<'employees' | 'contractors'>('employees');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workforce Management</h1>
        <Button onClick={() => navigate('/workforce/add-member')} className="bg-blue-600">
          Add New Member
        </Button>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'employees'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('contractors')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'contractors'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Contractors
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && <EmployeeList />}
      {activeTab === 'contractors' && <ContractorList />}
    </div>
  );
}
