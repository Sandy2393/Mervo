/**
 * Contractor List Page — Manage company contractors
 * TODO: Implement contractor creation, editing, deactivation
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CompanyUser } from '../../types';
import { usersService } from '../../services/usersService';

export default function ContractorListPage() {
  const { activeCompanyId } = useAuth();
  const [contractors, setContractors] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompanyId) return;

    const fetchContractors = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await usersService.listContractors(activeCompanyId);

        if (result.success) {
          setContractors(result.data || []);
        } else {
          setError(result.error || 'Failed to load contractors');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, [activeCompanyId]);

  const filteredContractors = contractors.filter(c =>
    c.company_alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading contractors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-2">{contractors.length} active contractors</p>
        </div>
        <Button>Add Contractor</Button>
      </div>

      <Input
        placeholder="Search contractors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Card>
        <CardBody>
          {filteredContractors.length === 0 ? (
            <p className="text-gray-500 py-8">No contractors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContractors.map(contractor => (
                    <tr key={contractor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{contractor.company_alias}</td>
                      <td className="py-3 px-4 capitalize text-gray-600">{contractor.role}</td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${contractor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {contractor.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        <button className="text-blue-500 hover:underline text-sm">Edit</button>
                        <button className="text-red-500 hover:underline text-sm">Deactivate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
