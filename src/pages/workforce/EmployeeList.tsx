/**
 * Employee List
 * Display company employees with search and filtering
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import type { CompanyUser } from '../../types';

export default function EmployeeList() {
  const { activeCompanyId } = useAuth();
  const [employees, setEmployees] = useState<(CompanyUser & { full_name?: string; phone?: string })[]>([]);
  const [filtered, setFiltered] = useState<(CompanyUser & { full_name?: string; phone?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!activeCompanyId) return;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('company_users')
          .select('*, user:users(*)')
          .eq('company_id', activeCompanyId)
          .neq('role', 'contractor');

        if (error) {
          console.error('Failed to load employees:', error);
          return;
        }

        const emps = (data || []).map((cu: any) => ({
          ...cu,
          full_name: cu.user?.full_name,
          phone: cu.user?.phone
        }));

        setEmployees(emps);
        setFiltered(emps);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [activeCompanyId]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const results = employees.filter(
      emp =>
        emp.full_name?.toLowerCase().includes(query) ||
        emp.company_alias?.toLowerCase().includes(query) ||
        (emp as any).phone?.toLowerCase().includes(query)
    );
    setFiltered(results);
  }, [searchQuery, employees]);

  if (loading) {
    return <div className="text-gray-500">Loading employees...</div>;
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <Input
          type="text"
          placeholder="Search by name, alias, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No employees found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Alias</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Phone</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{emp.full_name || '—'}</td>
                    <td className="px-4 py-2 text-blue-600">{emp.company_alias}</td>
                    <td className="px-4 py-2 capitalize">{emp.role}</td>
                    <td className="px-4 py-2">{emp.phone || '—'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          emp.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {emp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
